import { AudioLabel } from "../parser/audio-label";

export interface SuspiciousLabel {
  label: AudioLabel,
  index: number,
  reason: string
}
