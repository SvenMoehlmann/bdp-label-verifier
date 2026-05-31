import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { Classification, sourceClassifications } from './classification-map';


interface ClassificationResult {
  code: string,
  classChain: Classification[]
}
@Injectable({
  providedIn: 'root',
})
export class Classifier {
  private readonly classifications: WritableSignal<Map<string, Classification[]>>;

  readonly legitCodes = computed(() => Array.from(this.classifications().keys()));

  constructor() {
    const classifcationResults = Array.from(sourceClassifications.entries()).flatMap(classification => this.classify(classification[0], [classification[1]]));
    const classMap = new Map<string, Classification[]>();
    for(const classResult of classifcationResults) {
      classMap.set(classResult.code, classResult.classChain);
    }
    this.classifications = signal(classMap);
  }

  private classify(currentCode: string, classChain: Classification[]) : ClassificationResult[] {
    const currentClass = classChain.at(-1);
    if(!currentClass) return [];

    const nextLevel = currentClass.underClassification;
    if(!nextLevel) return [{
      code: currentCode.padEnd(3, '0'),
      classChain: classChain
    }];

    return Array.from(nextLevel.entries()).flatMap(classification => this.classify(`${currentCode}${classification[0]}`, [...classChain, classification[1]]))
  }

  getTitleForClassCode(code: string, defaultValue: string) {
    return this.classifications().get(code)?.map(classification => classification.title).join(' -> ') ?? defaultValue;
  }

  isValidClassCode(code: string) {
    return this.legitCodes().includes(code);
  }
}
