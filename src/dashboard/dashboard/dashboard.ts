import { ChangeDetectionStrategy, Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { DashboardSidebar } from "../dashboard-sidebar/dashboard-sidebar";
import { AppAudioContext } from '../app-audio-context';
import { AudioLabel } from '../../parser/audio-label';
import { SnippetPlayer } from '../snippet-player/snippet-player';
import { LabelPipe } from '../../ui/label-pipe';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TimestampPipe } from '../../ui/timestamp-pipe';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardSidebar, SnippetPlayer, LabelPipe, FormsModule, TimestampPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly audioContext = inject(AppAudioContext);
  private readonly router = inject(Router);
  readonly selectedLabelCode = signal<string>(this.audioContext.labelGroups().keys().next().value ?? '');

  readonly selectedLabelGroup = computed(() => this.audioContext.labelGroups().get(this.selectedLabelCode()))
  readonly selectedLabelId = linkedSignal<number>(() => this.selectedLabelGroup()![0].id);
  readonly selectedLabel = linkedSignal(() => this.selectedLabelGroup()!.find(label => label.id === Number(this.selectedLabelId()))!)


  constructor() {
    effect(() => {
      if(!this.selectedLabel() || this.selectedLabelId() === this.selectedLabel().id) return;
      this.selectedLabelId.set(this.selectedLabel().id);

      console.log('selectedLabelId changed to ', this.selectedLabelId());
    })
  }

  setLabelToPlay(label: AudioLabel) {
    this.selectedLabelCode.set(label.code);
    this.selectedLabel.set(label);
  }

  reset() {
    this.audioContext.reset();

    this.router.navigateByUrl('/');
  }
}
