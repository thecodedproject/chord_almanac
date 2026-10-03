import {
  DiatonicInterval,
  Note,
  TetradVoicing,
  VoiceLeadingChord,
  numTetradVoices,
  shiftScaleDiatonically,
  tetradVoicing,
} from './chord_anthology'

import {
  TabNote,
  defaultTuning,
  tabNotesForVoicingCompact,
} from './guitar_notation'

// How comfortably the hand can finger a chord, judged by how far it has to stretch.
export enum Playability {
  Playable = "Playable",
  PossiblyPlayable = "PossiblyPlayable",
  Unplayable = "Unplayable",
}

// the widest stretch, in frets, of a chord that is comfortably playable - see fretSpan
export const maxPlayableFretSpan = 4

// the widest stretch, in frets, of a chord that a hand may or may not manage
export const maxPossiblyPlayableFretSpan = 5

// fretSpan is how far the hand has to stretch to finger the given notes: the number of
// frets from the lowest it frets to the highest, so a chord fretted at the 10th and the
// 14th spans 4. Open strings need no finger, so they play no part in it, and a chord with
// no fretted notes spans nothing.
export function fretSpan(tabNotes: TabNote[]): number {

  const frets = tabNotes.map((n) => n.fret).filter((f) => f > 0)

  if (frets.length == 0) {
    return 0
  }

  return Math.max(...frets) - Math.min(...frets)
}

// chordPlayability judges how playable a chord is from how far its fingering stretches.
export function chordPlayability(tabNotes: TabNote[]): Playability {

  const span = fretSpan(tabNotes)

  if (span <= maxPlayableFretSpan) {
    return Playability.Playable
  }
  if (span <= maxPossiblyPlayableFretSpan) {
    return Playability.PossiblyPlayable
  }
  return Playability.Unplayable
}

// combinedPlayability judges a group of chords as a whole: it is only playable if every
// one of them is, and only unplayable if every one of them is.
export function combinedPlayability(playabilities: Playability[]): Playability {

  if (playabilities.every((p) => p == Playability.Playable)) {
    return Playability.Playable
  }
  if (playabilities.every((p) => p == Playability.Unplayable)) {
    return Playability.Unplayable
  }
  return Playability.PossiblyPlayable
}

// tetradVoicingPlayability judges how playable a voicing of a tetrad is on the given
// strings, taking in every inversion of it on every mode of its scale - which is every
// chord a table of the tetrad cycling through the modes draws, whichever cycle it takes.
//
// A voicing that does not fit on the strings at all is unplayable.
export function tetradVoicingPlayability(
  chord: VoiceLeadingChord,
  voicing: TetradVoicing,
  strings: number[],
  tuning: Note[] = defaultTuning,
): Playability {

  const playabilities: Playability[] = []

  let scale = chord.scale
  for (let iMode = 0; iMode < chord.scale.intervals.length; iMode++) {

    for (let inversion = 0; inversion < numTetradVoices; inversion++) {

      const voicedChord = tetradVoicing({...chord, scale: scale}, voicing, inversion)

      try {
        playabilities.push(chordPlayability(
          tabNotesForVoicingCompact(voicedChord, {strings: strings, tuning: tuning}),
        ))
      } catch (e) {
        if (!(e instanceof RangeError)) {
          throw e
        }
        playabilities.push(Playability.Unplayable)
      }
    }

    scale = shiftScaleDiatonically(scale, DiatonicInterval.Second)
  }

  return combinedPlayability(playabilities)
}
