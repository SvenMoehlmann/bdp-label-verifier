import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Settings {
  readonly contextPadding = signal<number>(Number(localStorage.getItem('lv_contextPadding') ?? 0));
  readonly autoPlay = signal<boolean>(localStorage.getItem('lv_autoPlay') === 'true');
  readonly audioGain = signal<number>(Number(localStorage.getItem('lv_audioGain') ?? 1));
  readonly visualScale = signal<number>(Number(localStorage.getItem('lv_visualScale') ?? 1));
  readonly spectrogramContrast = signal<number>(Number(localStorage.getItem('lv_spectrogramContrast') ?? 1));

  constructor() {
    effect(() => localStorage.setItem('lv_contextPadding', String(this.contextPadding())));
    effect(() => localStorage.setItem('lv_autoPlay', String(this.autoPlay())));
    effect(() => localStorage.setItem('lv_audioGain', String(this.audioGain())));
    effect(() => localStorage.setItem('lv_visualScale', String(this.visualScale())));
    effect(() => localStorage.setItem('lv_spectrogramContrast', String(this.spectrogramContrast())));
  }
}
