import { computed, Injectable, signal } from '@angular/core';
import { AudioLabel } from '../parser/audio-label';

@Injectable({
  providedIn: 'root',
})
export class AppAudioContext {
  private readonly _labelGroups = signal<Map<string, AudioLabel[]>>(
    new Map<string, AudioLabel[]>(),
  );
  readonly labelGroups = this._labelGroups.asReadonly();
  readonly existingCodes = computed(() => Array.from(this.labelGroups().keys()));
  readonly existingLabels = computed(() =>
    Array.from(this.labelGroups().values()).flatMap((l) => l),
  );

  private readonly _audioBuffer = signal<AudioBuffer | undefined>(undefined);
  readonly audioBuffer = this._audioBuffer.asReadonly();

  private readonly _audioFileName = signal<string>('');
  readonly audioFileName = this._audioFileName.asReadonly();
  private readonly _labelFileName = signal<string>('');
  readonly labelFileName = this._labelFileName.asReadonly();

  set(buffer: AudioBuffer, groups: Map<string, AudioLabel[]>, audioFilename: string, labelFilename: string) {
    if (this._labelGroups().size > 0 || this._audioBuffer() !== undefined) {
      throw new Error(
        'Context is already set. In order to set them again you need to first reset them via audioContext.reset()!',
      );
    }
    this._audioBuffer.set(buffer);
    this._labelGroups.set(new Map([...groups.entries()].sort()));
    this._audioFileName.set(audioFilename);
    this._labelFileName.set(labelFilename);
  }

  reset() {
    this._audioBuffer.set(undefined);
    this._labelGroups.set(new Map<string, AudioLabel[]>());
    this._audioFileName.set('');
    this._labelFileName.set('');
  }
}
