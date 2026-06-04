import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { AudioLabel } from '../../parser/audio-label';
import { LabelAdjuster } from '../label-adjuster';
import { AdjustmentExporter } from '../adjustment-exporter';

@Component({
  selector: 'app-label-adjustment-menu',
  imports: [],
  templateUrl: './label-adjustment-menu.html',
  styleUrl: './label-adjustment-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown.F)': 'toogleToFix($event)',
  }
})
export class LabelAdjustmentMenu {
  private readonly adjuster = inject(LabelAdjuster);
  private readonly exporter = inject(AdjustmentExporter);

  currentLabel = input.required<AudioLabel>();
  isMarkedFixable = computed(() => this.currentLabel() && this.adjuster.labelsToFix().has(this.currentLabel().id));
  isMarkedForReplacement = computed(() => this.currentLabel() && this.adjuster.labelReplacements().has(this.currentLabel().id));

  itemCountMarkedAsToFix = computed(() => this.adjuster.labelsToFix().size);
  isExportable = computed(() => this.adjuster.labelReplacements().size > 0 || this.adjuster.labelsToFix().size > 0);

  toogleToFix(ev?: Event) {
    if(ev) {
      ev.preventDefault();
    }

    if(this.isMarkedFixable()) {
      this.adjuster.removeFromToFix(this.currentLabel());
    }else {
      this.adjuster.markAsToFix(this.currentLabel());
    }
  }

  export() {
    this.exporter.exportLabelsToFix();
  }
}
