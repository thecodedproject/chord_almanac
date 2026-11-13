// Voicing a run of chords to be played: each in close position in the middle of the
// keyboard, moving to whichever inversion of the next is nearest, so that the changes
// are heard as voices moving smoothly rather than whole chords jumping about - with the
// root (or the note under the slash) below in the bass.

import {
  ParsedChord,
  pitchClass,
} from "./chord_parser"

export interface ChordVoicing {
  bass: number
  // the midi numbers of the notes of the chord above the bass, from the lowest up
  voices: number[]
}

// the range the lowest voice of a chord is kept in, F3 to F4, which keeps the chords
// from drifting up or down the keyboard however long they go on moving to the nearest
const lowestVoiceRange = [53, 65]

// where the first chord is centred, around E4
const startingCentre = 64

// the bass is played between E2 and E♭3
const lowestBass = 40

// closeVoicings lists every close position voicing of the chord with its lowest voice in
// range: each inversion, in each octave that fits.
function closeVoicings(chord: ParsedChord): number[][] {
  const root = pitchClass(chord.root)
  const classes = [0, ...chord.semitones].map((s) => (root + s) % 12)

  const voicings: number[][] = []
  for (let inversion = 0; inversion < classes.length; inversion++) {
    const order = [...classes.slice(inversion), ...classes.slice(0, inversion)]
    for (let lowest = lowestVoiceRange[0]; lowest <= lowestVoiceRange[1]; lowest++) {
      if (lowest % 12 != order[0]) {
        continue
      }
      // each voice the next of the chord's notes up from the one below
      const voices = [lowest]
      for (const pc of order.slice(1)) {
        const below = voices[voices.length - 1]
        voices.push(below + ((pc - below) % 12 + 12) % 12)
      }
      voicings.push(voices)
    }
  }
  return voicings
}

const mean = (notes: number[]) => notes.reduce((a, b) => a + b, 0) / notes.length

// movement measures how far the voices have to move to get from one chord to the next.
// Chords with the same number of notes move voice by voice; otherwise each note moves
// from whichever of the last chord's notes is nearest it.
function movement(from: number[], to: number[]): number {
  if (from.length == to.length) {
    return to.reduce((sum, n, i) => sum + Math.abs(n - from[i]), 0)
  }
  return to.reduce((sum, n) => sum + Math.min(...from.map((f) => Math.abs(n - f))), 0)
}

// voiceChord voices one chord, as near as it can be to the one before it (or, if it is
// the first, in the middle of the range).
export function voiceChord(chord: ParsedChord, previous?: number[]): ChordVoicing {
  const candidates = closeVoicings(chord)
  const cost = (v: number[]) => previous == undefined
    ? Math.abs(mean(v) - startingCentre)
    // ties between moves of the same size go to the one nearer the middle
    : movement(previous, v) + Math.abs(mean(v) - startingCentre) / 100

  let best = candidates[0]
  for (const v of candidates) {
    if (cost(v) < cost(best)) {
      best = v
    }
  }

  const bassClass = pitchClass(chord.bass ?? chord.root)
  return {
    bass: lowestBass + ((bassClass - lowestBass) % 12 + 12) % 12,
    voices: best,
  }
}

// voiceProgression voices a run of chords, each moving as little as it can from the
// last. A gap in the run (undefined) is voiced as nothing, and the chord after it moves
// on from the chord before the gap.
export function voiceProgression(chords: (ParsedChord | undefined)[]): (ChordVoicing | undefined)[] {
  let previous: number[] | undefined = undefined
  return chords.map((chord) => {
    if (chord == undefined) {
      return undefined
    }
    const voicing = voiceChord(chord, previous)
    previous = voicing.voices
    return voicing
  })
}
