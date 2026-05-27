import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  viewChildren,
} from '@angular/core';
import { AudioLabel } from '../../parser/audio-label';
import { FormsModule } from '@angular/forms';
import { AudioParser } from '../../parser/audio-parser';
import { AppAudioContext } from '../app-audio-context';
import { Settings } from '../../settings/settings';
import { Player } from '../../ui/player/player';

@Component({
  selector: 'app-snippet-player',
  imports: [FormsModule, Player],
  templateUrl: './snippet-player.html',
  styleUrl: './snippet-player.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown.ArrowLeft)': 'moveSelection(-1, $event)',
    '(window:keydown.ArrowRight)': 'moveSelection(1, $event)',
  },
})
export class SnippetPlayer {
  readonly audioLabels = input.required<AudioLabel[]>();
  readonly activeLabel = computed(() => this.selectedLabel() ?? this.audioLabels()[0])
  readonly selectedLabel = model<AudioLabel>();

  readonly audioParser = inject(AudioParser);
  readonly audioContext = inject(AppAudioContext);
  readonly settings = inject(Settings);
  readonly audioSnippetUrl = signal<string | undefined>(undefined);
  private readonly currentIndex = computed(() => this.audioLabels().indexOf(this.activeLabel()));

  readonly snippetItems = viewChildren<ElementRef<HTMLDivElement>>('snippetItem');


  readonly snippetStart = computed(() =>
    Math.max(0, this.activeLabel().start - this.settings.contextPadding()),
  );
  readonly snippetEnd = computed(() =>
    Math.min(
      this.audioContext.audioBuffer()?.duration ?? 0,
      this.activeLabel().end + this.settings.contextPadding(),
    ),
  );

  readonly otherLabelsInSnippet = computed(() => {
    const nearbyLabels: AudioLabel[] = [];
    if (this.settings.contextPadding() === 0 || !this.activeLabel()) return nearbyLabels;
    for (const labelsGroup of this.audioContext.labelGroups().values()) {
      for (const label of labelsGroup) {
        if (label.id === this.activeLabel().id) {
          continue;
        }

        if (label.start < this.snippetEnd() && label.end > this.snippetStart()) {
          nearbyLabels.push(label);
        }
      }
    }

    return nearbyLabels;
  });

  constructor() {
    effect((onCleanup) => {
      const buffer = this.audioContext.audioBuffer();
      const start = this.snippetStart();
      const end = this.snippetEnd();
      const gain = this.settings.audioGain();

      if (!buffer) {
        this.audioSnippetUrl.set(undefined);
        return;
      }

      const blob = this.audioParser.extractAudioSnippet(buffer, start, end, gain);
      const newUrl = URL.createObjectURL(blob);

      this.audioSnippetUrl.set(newUrl);

      onCleanup(() => {
        setTimeout(() => URL.revokeObjectURL(newUrl), 1000);
      })
    });

    effect(() => {
      const selected = this.activeLabel();

      if(!selected || this.snippetItems().length === 0 || this.currentIndex() < 0 || this.currentIndex() >= this.snippetItems().length){
        return;
      }

      const selectedElement = this.snippetItems()[this.currentIndex()]
      if(selectedElement) {
        selectedElement.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    })
  }

  moveSelection(step: number, event?: Event) {
    if(event) {
      event.preventDefault();
    }
    const newIndex = this.currentIndex() + step;
    if (newIndex < 0 || newIndex > this.audioLabels().length - 1) {
      return;
    }

    const newLabel = this.audioLabels()[newIndex];
    console.log('Setting:', newLabel)

    this.selectedLabel.set(newLabel);
  }
}
