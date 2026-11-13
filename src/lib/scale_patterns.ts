// Scale patterns: a short figure of scale degrees played from every degree of a scale
// in turn, climbing (or falling) a degree each time, and timed to land on the tonic
// halfway through the last bar, leaving the rest of the bar to breathe before the next
// key.

import {
  Interval,
  Note,
  ScaleType,
  shiftNote,
} from "./chord_anthology"

import {
  GridNote,
  KeySignature,
  Measure,
  scaleDegreePitch,
  scoreFromGrid,
  spellScale,
  trebleOctave,
} from "./notation"

// the rhythms a pattern can be played in, each dividing the beat evenly
export enum Rhythm {
  Quavers = "Quavers",
  Triplets = "Triplets",
  Semiquavers = "Semiquavers",
}

export function notesPerBeat(r: Rhythm): number {
  switch(r) {
    case Rhythm.Quavers: return 2
    case Rhythm.Triplets: return 3
    case Rhythm.Semiquavers: return 4
    default: throw RangeError("cannot divide the beat for an unknown rhythm: " + r)
  }
}

// the rhythm a pattern of each length falls naturally into, one pattern to the beat
export function rhythmForPatternLength(length: number): Rhythm {
  switch(length) {
    case 2: return Rhythm.Quavers
    case 3: return Rhythm.Triplets
    default: return Rhythm.Semiquavers
  }
}

export enum Direction {
  Ascending = "Ascending",
  Descending = "Descending",
}

export interface ScalePattern {
  // the scale degrees of the figure, as played from the tonic
  degrees: number[]
  rhythm: Rhythm
  direction: Direction
}

// the bars a run is played across
export const runBars = 4

// finalBeat is the beat of the last bar (counting from 0) the run ends on: the third beat
// of a bar of four, leaving the rest of the bar to breathe before the next time round.
export function finalBeat(beatsPerBar: number): number {
  return Math.floor(beatsPerBar / 2)
}

// RunNote is a scale degree played in a run: from a slot (counted from the start of the
// run), for some number of slots. Degree 1 is the tonic; degrees below 1 and above 7 are
// in the octaves below and above.
export interface RunNote {
  degree: number
  slot: number
  length: number
}

// patternRun lists the notes played as the pattern is taken through the scale.
//
// The pattern is played as many times as fit before the final beat of the run, then
// the run ends there on the tonic, held for the beat. The tonic is played as the first
// note of the next time through the pattern would be, so the pattern starts on
// whichever degree brings it round to the tonic then: for 1-2-3 climbing through C
// major, the run ends A-B-C, B-C-D, C.
export function patternRun(pattern: ScalePattern, beatsPerBar: number): RunNote[] {

  const length = pattern.degrees.length
  const slotsPerBeat = notesPerBeat(pattern.rhythm)
  const finalSlot = ((runBars - 1) * beatsPerBar + finalBeat(beatsPerBar)) * slotsPerBeat
  const repeats = Math.floor(finalSlot / length)
  const step = pattern.direction == Direction.Ascending ? 1 : -1

  // the degree the first time through is played from, as the first degree of the
  // pattern is played from the tonic
  const firstStart = 2 - pattern.degrees[0] - repeats * step

  const notes: RunNote[] = []
  for (let r = 0; r < repeats; r++) {
    pattern.degrees.forEach((d, i) => {
      notes.push({degree: firstStart + r * step + d - 1, slot: r * length + i, length: 1})
    })
  }
  notes.push({degree: 1, slot: finalSlot, length: slotsPerBeat})
  return notes
}

// nextKey is the key a fourth up from the given one - the next key round the cycle of
// fourths, which the exercise is conventionally taken through.
export function nextKey(n: Note): Note {
  return shiftNote(n, Interval.Fourth)
}

// keyAfter takes the key `count` steps round the cycle of fourths.
export function keyAfter(n: Note, count: number): Note {
  let key = n
  for (let i = 0; i < count; i++) {
    key = nextKey(key)
  }
  return key
}

export interface ScaleChoice {
  ionianRoot: Note
  type: ScaleType
  // the degree of the scale the mode starts from
  pos: number
}

export interface WrittenPattern {
  keySignature: KeySignature
  // each note's pitch, and when it is played, in the order they are played
  notes: GridNote[]
  measures: Measure[]
}

// writeNotes works out the pitches of a run (or of the pattern on its own) in the given
// scale, and writes them out in bars.
function writeNotes(
  scale: ScaleChoice,
  runNotes: RunNote[],
  slotsPerBeat: number,
  beatsPerBar: number,
  numBars: number,
  fillWithRests: boolean,
): WrittenPattern {

  const {notes: spelled, keySignature} = spellScale(scale.ionianRoot, scale.type, scale.pos)
  const octave = trebleOctave(spelled, runNotes.map((n) => n.degree))

  const notes: GridNote[] = runNotes.map((n) => ({
    slot: n.slot,
    pitch: scaleDegreePitch(spelled, n.degree, octave),
    length: n.length,
  }))

  return {
    keySignature: keySignature,
    notes: notes,
    measures: scoreFromGrid(notes, {
      slotsPerBeat: slotsPerBeat,
      beatsPerBar: beatsPerBar,
      numBars: numBars,
      keySignature: keySignature,
      fillWithRests: fillWithRests,
    }),
  }
}

// writeRun writes out the whole run of a pattern through a scale, rests and all.
export function writeRun(
  scale: ScaleChoice,
  pattern: ScalePattern,
  beatsPerBar: number,
): WrittenPattern {
  return writeNotes(
    scale,
    patternRun(pattern, beatsPerBar),
    notesPerBeat(pattern.rhythm),
    beatsPerBar,
    runBars,
    true,
  )
}

// writeBasePattern writes out the pattern once, from the tonic.
export function writeBasePattern(
  scale: ScaleChoice,
  pattern: ScalePattern,
  beatsPerBar: number,
): WrittenPattern {
  return writeNotes(
    scale,
    pattern.degrees.map((d, i) => ({degree: d, slot: i, length: 1})),
    notesPerBeat(pattern.rhythm),
    beatsPerBar,
    1,
    false,
  )
}
