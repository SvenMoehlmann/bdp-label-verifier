import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Settings } from '../settings';

@Component({
  selector: 'app-settings-editor',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './settings-editor.html',
  styleUrl: './settings-editor.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsEditor {
  readonly settings = inject(Settings);
}
