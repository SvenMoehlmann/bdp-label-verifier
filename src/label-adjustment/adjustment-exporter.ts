import { inject, Injectable } from '@angular/core';
import { LabelAdjuster } from './label-adjuster';
import { AppAudioContext } from '../dashboard/app-audio-context';
import { AudioLabel } from '../parser/audio-label';
import { FileOutput } from '../ui/file-output';

@Injectable({
  providedIn: 'root',
})
export class AdjustmentExporter {
  private readonly labelAdjuster = inject(LabelAdjuster);
  private readonly appAudioContext = inject(AppAudioContext);

  private readonly fileOutput = inject(FileOutput);

  exportOriginalWithReplacements() {
    const labels = [...this.appAudioContext.existingLabels()];
    for(const [id, newCode] of this.labelAdjuster.labelReplacements()) {
      const replaceLabel = labels.find(label => label.id === id);
      if(!replaceLabel) continue;
      replaceLabel.code = newCode;
    }

    this.createAudibleExportFile(labels, `${this.appAudioContext.labelFileName()}_replaced.txt`);
  }

  exportLabelsToFix() {
    const labelsToFix = this.appAudioContext.existingLabels().filter(label => this.labelAdjuster.labelsToFix().has(label.id)).map(label => {
      return {
        ...label,
        code: ''
      }
    });
    this.createAudibleExportFile(labelsToFix, `${this.appAudioContext.labelFileName()}_markedToFix.txt`);
  }

  private createAudibleExportFile(labels: AudioLabel[], filename: string) {
    const textContent = [...labels].sort((a,b) => a.start - b.start).map(label => this.convertAudioLabelToAudacityLabel(label)).join('\n');
    this.fileOutput.exportTextFile(textContent, filename);
  }

  private convertAudioLabelToAudacityLabel(label: AudioLabel) {
    return `${label.start.toFixed(6)}\t${label.end.toFixed(6)}\t${label.code}`;
  }
}
