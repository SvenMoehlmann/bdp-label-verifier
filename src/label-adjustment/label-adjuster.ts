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

    this._labelsToFix.update(l => {
      const newSet = new Set(l);
      newSet.add(label.id);
      return newSet;
    });
  }

  removeFromToFix(labelOrId: AudioLabel | number) {
    const labelId = typeof labelOrId === 'number' ? labelOrId : labelOrId.id;

    this._labelsToFix.update(l => {
      const newSet = new Set(l);
      newSet.delete(labelId);
      return newSet;
    });
  }

  replaceLabel(labelOrId: AudioLabel | number, newCode: string) {
    const label = typeof labelOrId === 'number' ? this.appAudioContext.existingLabels().find(l => l.id === labelOrId) : labelOrId;
    if(!label) {
      throw new Error(`Unexpected Audiolabel. Label with id ${labelOrId} cannot be found in AudioContext`);
    }

    if(!this.classifier.isValidClassCode(newCode)) {
      throw new Error(`Unexpected new Code. Code "${newCode}" was not found in classification map`);
    }

    this._labelReplacements.update(lr => {
      const newSet = new Map(lr);
      newSet.set(label.id, newCode);
      return newSet;
    });
  }

  removeReplacement(labelOrId: AudioLabel | number) {
    const labelId = typeof labelOrId === 'number' ? labelOrId : labelOrId.id;
    this._labelReplacements.update(lr => {
      const newSet = new Map(lr);
      newSet.delete(labelId);
      return newSet;
    });
  }

  reset() {
    this._labelReplacements.set(new Map());
    this._labelsToFix.set(new Set());
  }
}
