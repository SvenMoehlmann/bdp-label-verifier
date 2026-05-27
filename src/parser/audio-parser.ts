import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioParser {
  async decodeAudioFile(file: File): Promise<AudioBuffer> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      return buffer;
    } finally {
      if (audioContext.state !== 'closed') {
        await audioContext.close();
      }
    }
  }

  extractAudioSnippet(
    buffer: AudioBuffer | undefined,
    startSec: number,
    endSec: number,
    gain: number = 1.0,
  ): Blob {
    if(buffer === undefined)
      return new Blob([]);

    const sampleRate = buffer.sampleRate;

    startSec = Math.max(0, startSec);
    endSec = Math.min(buffer.duration, endSec);

    const startSample = Math.floor(startSec * sampleRate);
    const endSample = Math.floor(endSec * sampleRate);
    const sampleCount = endSample - startSample;

    if (sampleCount <= 0) {
      return new Blob([]);
    }

    const wavBuffer = this.createWavAudioSnippet(buffer, startSample, endSample, gain);

    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  private createWavAudioSnippet(buffer: AudioBuffer, startSample: number, endSample: number, gain: number) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;

    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const sampleCount = endSample - startSample;

    const wavBuffer = new ArrayBuffer(44 + sampleCount * blockAlign);
    const view = new DataView(wavBuffer);

    this.writeWavHeader(view, sampleCount, blockAlign, numChannels, sampleRate)

    const offset = 44;
    let pos = offset;

    const channels = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i).subarray(startSample, endSample));
    }

    for (let i = 0; i < sampleCount; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        let sample = channels[channel][i];
        if (gain !== 1.0) {
          sample *= gain;
        }
        sample = Math.max(-1, Math.min(1, sample));
        sample = sample < 0 ? sample * 32768 : sample * 32767;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
    }
    return wavBuffer;
  }

  private writeWavHeader(view: DataView, sampleCount: number, blockAlign: number, numChannels: number, sampleRate: number) {
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + sampleCount * blockAlign, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, sampleCount * blockAlign, true);
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
}
