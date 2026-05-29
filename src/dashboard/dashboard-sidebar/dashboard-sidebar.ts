import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, model, output, signal, viewChildren } from '@angular/core';
import { SettingsEditor } from '../../settings/settings-editor/settings-editor';
import { AppAudioContext } from '../app-audio-context';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabelAnalyzer } from '../label-analyzer';
import { SuspiciousLabel } from '../suspicious-label';
import { AudioLabel } from '../../parser/audio-label';

@Component({
  selector: 'app-dashboard-sidebar',
  imports: [SettingsEditor, CommonModule, FormsModule],
  templateUrl: './dashboard-sidebar.html',
  styleUrl: './dashboard-sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown.ArrowUp)': 'moveSelection(-1)',
    '(window:keydown.ArrowDown)': 'moveSelection(1)',
  }
})
export class DashboardSidebar {
  readonly activeTab = signal<'groups' | 'analysis'>('groups');
  private readonly audioContext = inject(AppAudioContext);

  readonly labelGroups = this.audioContext.labelGroups;
  readonly selectedLabelCode = model<string>();

  readonly labelCodes = computed(() => Array.from(this.labelGroups().keys()));


  readonly suspectedLabels = signal<SuspiciousLabel[] | undefined>(undefined);

  private readonly labelAnalyzer = inject(LabelAnalyzer);
  readonly selectedSuspiciousLabel = signal<SuspiciousLabel | undefined>(undefined);

  readonly selectedSpecificLabel = output<AudioLabel>();

  readonly labelGroupRefs = viewChildren<ElementRef<HTMLButtonElement>>('labelGroup');
  readonly suspectRefs = viewChildren<ElementRef<HTMLButtonElement>>('suspect');

  constructor() {
    effect(() => {
      const selectedSuspect = this.selectedSuspiciousLabel();
      if(selectedSuspect) {
        this.selectedSpecificLabel.emit(selectedSuspect.label);
      }
    })

    effect(() => {
      if(this.activeTab() === 'groups') return;

      const suspectedLabels = this.suspectedLabels();
      if(!suspectedLabels || suspectedLabels.length === 0) return;

      const selected = this.selectedSuspiciousLabel();
      if(!selected) return;

      const selectedIndex = suspectedLabels.indexOf(selected);
      if(selectedIndex < 0 || selectedIndex >= suspectedLabels.length){
        return;
      }

      const selectedElement = this.suspectRefs()[selectedIndex]
      if(selectedElement) {
        selectedElement.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    });

    effect(() => {
      if(this.activeTab() === 'analysis') return;

      const labelCodes = this.labelCodes();
      if(!labelCodes) return;

      const selected = this.selectedLabelCode();
      if(!selected) return;

      const selectedIndex = labelCodes.indexOf(selected);
      if(selectedIndex < 0 || selectedIndex >= labelCodes.length){
        return;
      }

      const selectedElement = this.labelGroupRefs()[selectedIndex]
      if(selectedElement) {
        selectedElement.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    });
  }

  analyzeLabels() {
    const suspiciousLabels = this.labelAnalyzer.getSuspiciousLabels();
    this.suspectedLabels.set(suspiciousLabels);
    if(suspiciousLabels.length > 0) {
      this.selectedSuspiciousLabel.set(suspiciousLabels[0]);
    }
  }

  moveSelection(step: number, event?: Event) {
    if (document.activeElement instanceof HTMLSelectElement) {
      return;
    }

    if(event) {
      event.preventDefault();
    }

    if(this.activeTab() === 'groups') {
      const selectedLabel = this.selectedLabelCode();

      if(!selectedLabel) {
        this.selectedLabelCode.set(this.labelCodes()[0])
        return;
      }

      const curLabelIndex = this.labelCodes().indexOf(selectedLabel);
      const newIndex = curLabelIndex + step;
      if (newIndex< 0  || newIndex > this.labelCodes().length - 1) {
        return;
      }

      this.selectedLabelCode.set(this.labelCodes()[newIndex]);
    }
    else {
      const suspectedLabels = this.suspectedLabels();
      const selectedSuspect = this.selectedSuspiciousLabel();
      if(!suspectedLabels || suspectedLabels.length === 0) return;

      if(!selectedSuspect) {
        this.selectedSuspiciousLabel.set(suspectedLabels[0])
        return;
      }

      const curLabelIndex = suspectedLabels.indexOf(selectedSuspect);
      const newIndex = curLabelIndex + step;
      if (newIndex< 0  || newIndex > suspectedLabels.length - 1) {
        return;
      }

      this.selectedSuspiciousLabel.set(suspectedLabels[newIndex]);
    }
  }
}
