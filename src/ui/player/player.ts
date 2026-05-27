import {
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  signal,
  viewChild,
  afterNextRender,
  untracked,
  computed,
} from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import { AudioLabel } from '../../parser/audio-label';
import { LabelPipe } from '../label-pipe';

@Component({
  selector: 'app-player',
  standalone: true,
  templateUrl: './player.html',
  imports: [
    LabelPipe
  ],
  host: {
    '(window:keydown.space)': 'togglePlayer($event)',
  },
})
export class Player implements OnDestroy {
  url = input.required<string>();
  label = input.required<AudioLabel>();
  autoPlay = input<boolean>(false);
  contextPadding = input<number>(0);
  visualScale = input<number>(1);
  showHighlight = input<boolean>(false);
  otherLabelsInSnippet = input<AudioLabel[]>([]);
  spectrogramContrast = input<number>(1);

  labelDuration = computed(() => this.label().end - this.label().start);
  startingTimeOfSnippet = computed(() => Math.max(0, this.label().start - this.contextPadding()));

  wrapperRef = viewChild.required<ElementRef<HTMLDivElement>>('wrapperRef');
  containerRef = viewChild<ElementRef<HTMLDivElement>>('containerRef');
  spectogramRef = viewChild<ElementRef<HTMLDivElement>>('spectogramRef');
  timelineRef = viewChild<ElementRef<HTMLDivElement>>('timelineRef');

  isPlaying = signal(false);
  totalAudioDuration = signal(0);
  dimensions = signal<{ wave: number; spec: number } | null>(null);
  ws = signal<WaveSurfer | null>(null);

  spectrogramFilter = computed(() => {
    const contrast = this.spectrogramContrast();
    const brightness = contrast > 1 ? 1.0 - (contrast - 1) * 0.1 : 1;
    return `contrast(${contrast}) brightness(${brightness})`;
  });

  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    // Calculating size and setting up resizer
    effect((onCleanup) => {
      const wrapper = this.wrapperRef().nativeElement;

      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          this.calculateDimensions(entry.contentRect.height);
        }
      });

      this.resizeObserver.observe(wrapper);

      // const rect = wrapper.getBoundingClientRect();
      // this.calculateDimensions(rect.height)

      onCleanup(() => {
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
      });
    });

    // Setup wavesurfer.js
    effect(() => {
      const dims = this.dimensions();
      const cRef = this.containerRef();
      const sRef = this.spectogramRef();
      const tRef = this.timelineRef();
      const startTime = this.startingTimeOfSnippet();
      const currentUrl = this.url();

      if (dims && cRef && sRef && tRef) {
        untracked(() => {
          this.initWaveSurfer(
            cRef.nativeElement,
            sRef.nativeElement,
            tRef.nativeElement,
            dims,
            startTime,
            currentUrl
          );
        });
      }
    });

    // Setup scaling
    effect(() => {
      const scale = this.visualScale();
      const instance = this.ws();

      if (instance) {
        untracked(() => instance.setOptions({ barHeight: scale }));
      }
    });
  }

  private calculateDimensions(height: number) {
    if (height > 0) {
      const available = Math.max(100, height - 20);
      const newWave = Math.floor(available * 0.4);
      const newSpec = available - newWave;

      const current = this.dimensions();

      if (!current || current.wave !== newWave || current.spec !== newSpec) {
        this.dimensions.set({
          wave: newWave,
          spec: newSpec,
        });
      }
    }
  }

  private initWaveSurfer(
    container: HTMLElement,
    specContainer: HTMLElement,
    timelineContainer: HTMLElement,
    dims: { wave: number; spec: number },
    startTime: number,
    url: string
  ): void {
    this.destroyWaveSurfer();
    specContainer.innerHTML = '';
    timelineContainer.innerHTML = '';

    const wavesurfer = WaveSurfer.create({
      container: container,
      waveColor: 'rgba(6, 182, 212, 0.2)',
      progressColor: 'rgba(6, 182, 212, 0.8)',
      cursorColor: '#22d3ee',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: dims.wave,
      barHeight: this.visualScale(),
      plugins: [
        Spectrogram.create({
          container: specContainer,
          labels: true,
          height: dims.spec,
          splitChannels: false,
        }),
        Timeline.create({
          container: timelineContainer,
          timeInterval: 0.5,
          primaryLabelInterval: 1,
          formatTimeCallback: (sec) => {
            const actual = sec + startTime;
            const h = Math.floor(actual / 60 / 60);
            const m = Math.floor(actual / 60) % 60;
            const s = (actual % 60).toFixed(1);
            const minutePart = `${m}:${s.padStart(4, '0')}`;

            return h > 0 ? `${h}:${minutePart}` : minutePart;
          },
        }),
      ],
    });

    wavesurfer.on('play', () => this.isPlaying.set(true));
    wavesurfer.on('pause', () => this.isPlaying.set(false));

    wavesurfer.on('ready', () => {
      this.totalAudioDuration.set(wavesurfer.getDuration());
      if (this.autoPlay()) {
        wavesurfer.play();
      }
    });

    this.ws.set(wavesurfer);

    wavesurfer.load(url).catch((err) => {
      if (err.name !== 'AbortError') console.warn('WaveSurfer load error:', err);
    });
  }

  togglePlayer(event: Event): void {
    if (this.ws()) {
      event.preventDefault();
      this.togglePlay();
    }
  }

  togglePlay(): void {
    this.ws()?.playPause();
  }

  private destroyWaveSurfer(): void {
    const currentWs = this.ws();
    if (currentWs) {
      currentWs.destroy();
      this.ws.set(null);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.destroyWaveSurfer();
  }
}
