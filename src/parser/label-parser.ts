import { Injectable, signal } from '@angular/core';
import { AudioLabel } from './audio-label';

@Injectable({
  providedIn: 'root',
})
export class LabelParser {
  async parseLabels(file: File): Promise<Map<string, AudioLabel[]>> {
    const text = await file.text();
    const lines = text.split('\n');
    const labels: AudioLabel[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(/\s+/);
      if (parts.length >= 3) {
        labels.push({
          id: i,
          start: parseFloat(parts[0]),
          end: parseFloat(parts[1]),
          code: parts.slice(2).join(' '),
        });
      }
    }

    return labels.reduce((acc: Map<string, AudioLabel[]>, label) => {
      const curLabelGroup = acc.get(label.code) ?? [];
      curLabelGroup.push(label);
      acc.set(label.code, curLabelGroup);
      return acc;
    }, new Map<string, AudioLabel[]>());
  }
}
