import { inject, Injectable, output } from '@angular/core';
import { AppAudioContext } from './app-audio-context';
import { signal } from 'wavesurfer.js/dist/reactive/store.js';
import { AudioLabel } from '../parser/audio-label';
import { SuspiciousLabel } from './suspicious-label';
import { getClassification } from '../parser/classification';
import { LabelPipe } from '../ui/label-pipe';

@Injectable({
  providedIn: 'root',
})
export class LabelAnalyzer {
  private readonly appAudioContext = inject(AppAudioContext);
  private readonly labelPipe = new LabelPipe();

  getSuspiciousLabels(): SuspiciousLabel[] {
    const suspicious: SuspiciousLabel[] = [];
    const buffer = this.appAudioContext.audioBuffer()!;
    const labels = this.appAudioContext.labelGroups();
    const channelData = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;

    for (const [code, labelList] of labels.entries()) {
      if(getClassification(code) === undefined) {
        suspicious.push(...labelList.map<SuspiciousLabel>((l, index) => {
          return {
            label: l,
            index,
            reason: 'INVALID LABEL'
          }
        }));
        continue;
      }

      const featuresList: { index: number; label: AudioLabel; rms: number; zcr: number; duration: number }[] = [];

      for (let index = 0; index < labelList.length; index++) {
        const lbl = labelList[index];
        const startSample = Math.max(0, Math.floor(lbl.start * sampleRate));
        const endSample = Math.min(channelData.length, Math.floor(lbl.end * sampleRate));
        const numSamples = endSample - startSample;

        if (numSamples <= 0) continue;

        let sumSquares = 0;
        let zeroCrossings = 0;
        let prevSign = channelData[startSample] >= 0 ? 1 : -1;

        for (let i = startSample; i < endSample; i++) {
          const val = channelData[i];
          sumSquares += val * val;
          const sign = val >= 0 ? 1 : -1;
          if (sign !== prevSign) {
            zeroCrossings++;
            prevSign = sign;
          }
        }

        const rms = Math.sqrt(sumSquares / numSamples);
        const zcr = zeroCrossings / numSamples;
        const duration = lbl.end - lbl.start;

        featuresList.push({ index, label: lbl, rms, zcr, duration });

        // Apply Heuristics based on categorical Acoustic Patterns
        // 1. Mouse Clicks (32x)
        if (code.startsWith('32') && duration > 1.5) {
          suspicious.push({ label: lbl, index, reason: `Mouse click label is unusually long (${duration.toFixed(1)}s). Typical duration is < 0.5s.` });
        }

        // 2. Keyboard (31x)
        if (code.startsWith('31') && duration > 3.0) {
          suspicious.push({ label: lbl, index, reason: `Keyboard typing label is unusually long (${duration.toFixed(1)}s).` });
        }

        // 4. Whistling (4xx) - High Tonal Resonance (Low ZCR expected)
        if (code.startsWith('4') && zcr > 0.25) {
          suspicious.push({ label: lbl, index, reason: `Whistling should be very tonal, but stream contains broadband noise (ZCR: ${zcr.toFixed(3)}). Might be static or wind.` });
        }

        // 5. Static (33x) - High Noise (High ZCR expected)
        if (code.startsWith('33') && zcr < 0.05) {
          suspicious.push({ label: lbl, index, reason: `Static should be noisy, but stream is highly tonal (ZCR: ${zcr.toFixed(3)}). Verification required.` });
        }

        // 6. Thuds (34x) - Transients
        if (code.startsWith('34') && duration > 2.0) {
          suspicious.push({ label: lbl, index, reason: `Thud duration is unexpectedly long (${duration.toFixed(1)}s). Mislabeled sustained noise?` });
        }

        // 7. General Extreme Bounds
        if (duration > 30) {
          suspicious.push({ label: lbl, index, reason: `Label boundary is excessively wide (${duration.toFixed(1)}s). Likely captures multiple events.` });
        }

        // 8. General Extreme Silence
        if (rms < 0.0001 && duration > 1.0) {
          suspicious.push({ label: lbl, index, reason: `Marked region is almost completely silent. Missing audio data or wrong offset.` });
        }
      }

      // Intra-group outlier detection
      if (featuresList.length >= 5) {
        const getMean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const getStdDev = (arr: number[], mean: number) => Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / arr.length);

        const durations = featuresList.map(f => f.duration);
        const rmsValues = featuresList.map(f => f.rms);
        const zcrValues = featuresList.map(f => f.zcr);

        const durMean = getMean(durations);
        const durStd = getStdDev(durations, durMean);

        const rmsMean = getMean(rmsValues);
        const rmsStd = getStdDev(rmsValues, rmsMean);

        const zcrMean = getMean(zcrValues);
        const zcrStd = getStdDev(zcrValues, zcrMean);

        // Z-score threshold for outlier detection
        const THRESHOLD = 2.5;

        for (const feat of featuresList) {
            const durZ = durStd > 0 ? Math.abs(feat.duration - durMean) / durStd : 0;
            const rmsZ = rmsStd > 0 ? Math.abs(feat.rms - rmsMean) / rmsStd : 0;
            const zcrZ = zcrStd > 0 ? Math.abs(feat.zcr - zcrMean) / zcrStd : 0;

            if (durZ > THRESHOLD) {
              suspicious.push({ label: feat.label, index: feat.index, reason: `Duration outlier for group ${this.labelPipe.transform(code)}: ${feat.duration.toFixed(1)}s differs significantly from group avg (${durMean.toFixed(1)}s).` });
            }
            if (rmsZ > THRESHOLD && rmsStd > 0.005) {
              suspicious.push({ label: feat.label, index: feat.index, reason: `Amplitude (RMS) outlier for group ${this.labelPipe.transform(code)}: Sound intensity differs significantly from group average.` });
            }
            if (zcrZ > THRESHOLD && zcrStd > 0.02) {
              suspicious.push({ label: feat.label, index: feat.index, reason: `Timbre (ZCR) outlier for group ${this.labelPipe.transform(code)}: Frequency content (ZCR: ${feat.zcr.toFixed(2)}) differs significantly from group avg (${zcrMean.toFixed(2)}).` });
            }
        }
      }
    }

    return suspicious;
  }
}
