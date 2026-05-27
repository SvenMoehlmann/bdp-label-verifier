import { Pipe, type PipeTransform } from '@angular/core';
import { getClassification } from '../parser/classification';
import { AudioLabel } from '../parser/audio-label';

@Pipe({
  name: 'appLabel',
})
export class LabelPipe implements PipeTransform {
  transform(value: AudioLabel | string, ...args: unknown[]): string {
    const code = typeof value === 'object' ? value.code : value;

    const classPath = getClassification(code);
    if(classPath) {
      return classPath.map(classification => classification.title).join(' -> ');
    }

    return 'Invalid';
  }
}
