import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appTimestamp',
})
export class TimestampPipe implements PipeTransform {
  transform(value: number, ...args: unknown[]): string {
    const h = Math.floor(value / 60 / 60);
    const m = Math.floor(value / 60) % 60;
    const s = (value % 60).toFixed(1);
    const minutePart = `${m}:${s.padStart(4, '0')}`;

    return h > 0 ? `${h}:${minutePart}` : minutePart;
  }
}
