import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, model  } from '@angular/core';
import { FormsModule, ValueChangeEvent } from '@angular/forms';

@Component({
  selector: 'app-file-input',
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './file-input.html',
  styleUrl: './file-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileInput {
  readonly accept = input<string>("");
  readonly fileSizelimit = input<number>(0);
  readonly selectedFile = model<File | undefined>();

  selectFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    this.selectedFile.set(input.files[0]);
  }
}
