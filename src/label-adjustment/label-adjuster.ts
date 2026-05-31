import { inject, Injectable, signal } from '@angular/core';
import { AudioLabel } from '../parser/audio-label';
import { AppAudioContext } from '../dashboard/app-audio-context';
import { Classifier } from '../parser/classifier';

@Injectable({
  providedIn: 'root',
})
export class LabelAdjuster {
  private readonly _labelsToFix = signal<Set<number>>(new Set<number>());
  readonly labelsToFix = this._labelsToFix.asReadonly();

  private readonly _labelReplacements = signal<Map<number, string>>(new Map<number, string>());
  readonly labelReplacements = this._labelReplacements.asReadonly();

  private readonly appAudioContext = inject(AppAudioContext);
  private readonly classifier = inject(Classifier);

  markAsToFix(labelOrId: AudioLabel | number) {
    const label = typeof labelOrId === 'number' ? this.appAudioContext.existingLabels().find(l => l.id === labelOrId) : labelOrId;
    if(!label) {
      throw new Error(`Unexpected Audiolabel. Label with id ${labelOrId} cannot be found in AudioContext`);
    }

    this._labelsToFix.update(l => l.add(label.id));
  }

  replaceLabel(labelOrId: AudioLabel | number, newCode: string) {
    const label = typeof labelOrId === 'number' ? this.appAudioContext.existingLabels().find(l => l.id === labelOrId) : labelOrId;
    if(!label) {
      throw new Error(`Unexpected Audiolabel. Label with id ${labelOrId} cannot be found in AudioContext`);
    }

    if(!this.classifier.isValidClassCode(newCode)) {
      throw new Error(`Unexpected new Code. Code "${newCode}" was not found in classification map`);
    }

    this._labelReplacements.update(lr => lr.set(label.id, newCode));
  }
}
