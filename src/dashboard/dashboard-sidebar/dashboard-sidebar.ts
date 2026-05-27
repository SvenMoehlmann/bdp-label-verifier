import { ChangeDetectionStrategy, Component, computed, effect, inject, model, signal } from '@angular/core';
import { SettingsEditor } from '../../settings/settings-editor/settings-editor';
import { AppAudioContext } from '../app-audio-context';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  moveSelection(step: number, event?: Event) {
    if (document.activeElement instanceof HTMLSelectElement) {
      return;
    }

    if(event) {
      event.preventDefault();
    }

    if(this.selectedLabelCode() === undefined) {
      this.selectedLabelCode.set(this.labelCodes()[0])
      return;
    }

    const curLabelIndex = this.labelCodes().indexOf(this.selectedLabelCode()!);
    const newIndex = curLabelIndex + step;
    if (newIndex< 0  || newIndex > this.labelCodes().length - 1) {
      return;
    }

    this.selectedLabelCode.set(this.labelCodes()[newIndex]);
  }
}
