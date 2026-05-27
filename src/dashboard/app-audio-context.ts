import { Injectable, signal } from '@angular/core';
import { AudioLabel } from '../parser/audio-label';

@Injectable({
  providedIn: 'root',
})
export class AppAudioContext {
    private readonly _labelGroups = signal<Map<string, AudioLabel[]>>(new Map<string, AudioLabel[]>());
    readonly labelGroups = this._labelGroups.asReadonly();

    private readonly _audioBuffer = signal<AudioBuffer | undefined>(undefined);
    readonly audioBuffer = this._audioBuffer.asReadonly();

    set(buffer: AudioBuffer, groups: Map<string, AudioLabel[]>) {
      if(this._labelGroups().size > 0 || this._audioBuffer() !== undefined) {
        throw new Error('Context is already set. In order to set them again you need to first reset them via audioContext.reset()!');
      }
      this._audioBuffer.set(buffer);
      this._labelGroups.set(new Map([...groups.entries()].sort()));
    }

    reset() {
      this._audioBuffer.set(undefined);
      this._labelGroups.set(new Map<string, AudioLabel[]>());
    }
}
