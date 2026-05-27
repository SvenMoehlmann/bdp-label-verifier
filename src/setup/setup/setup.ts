import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileInput } from '../../ui/file-input/file-input';
import { AudioParser } from '../../parser/audio-parser';
import { LabelParser } from '../../parser/label-parser';
import { AppAudioContext } from '../../dashboard/app-audio-context';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup',
  imports: [
    CommonModule,
    FormsModule,
    FileInput
],
  templateUrl: './setup.html',
  styleUrl: './setup.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Setup {
  readonly isProcessing = signal<boolean>(false);

  readonly textFile = signal<File|undefined>(undefined);
  readonly audioFile = signal<File|undefined>(undefined);

  readonly error = signal<string>('');

  readonly disableButton = computed(() => !this.audioFile() || !this.textFile() || this.isProcessing());

  readonly audioParser = inject(AudioParser);
  readonly labelParser = inject(LabelParser);
  readonly audioContext = inject(AppAudioContext);

  readonly router = inject(Router);

  async processAudio() {
    if(!this.textFile() || !this.audioFile()) {
      return;
    }

    this.isProcessing.set(true);
    this.error.set('');

    try {
      const labels = await this.labelParser.parseLabels(this.textFile()!);
      const buffer = await this.audioParser.decodeAudioFile(this.audioFile()!);

      this.audioContext.set(buffer, labels);
      this.router.navigateByUrl('dashboard');
    } catch (err: any) {
      console.error(err);
      this.error.set(err.message || 'An error occurred during processing.');
    } finally {
      this.isProcessing.set(false);
    }
  }
}
