import { inject, Pipe, type PipeTransform } from '@angular/core';
import { AudioLabel } from '../parser/audio-label';
import { Classifier } from '../parser/classifier';

@Pipe({
  name: 'appLabel',
})
export class LabelPipe implements PipeTransform {
  private readonly classifier = inject(Classifier);

  transform(value: AudioLabel | string, ...args: unknown[]): string {
    const code = typeof value === 'object' ? value.code : value;

    return this.classifier.getTitleForClassCode(code, 'INVALID');
  }
}
