import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AudioLabel } from '../parser/audio-label';
import { AppAudioContext } from '../dashboard/app-audio-context';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor() {}
}
