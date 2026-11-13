// Writing music down on a stave: spelling pitches, choosing a key signature for them and
// setting them out bar by bar, with the beams, tuplets, rests and accidentals a score
// needs to be read.
//
// Only the treble clef is drawn, and only the rhythms the scale patterns are played in:
// one note to every slot of an even division of the beat, which is a crotchet.

import {
  Note,
  Scale,
  ScaleType,
  scaleDegree,
  scaleFromIonianRoot,
  semiTonesBetweenNotesUpwards,
} from "./chord_anthology"

// the letters notes are named with, from C up; a letter is referred to by its index here
export const letterNames = ["C", "D", "E", "F", "G", "A", "B"]

// the semitones each natural letter sits above C
const letterSemiTones = [0, 2, 4, 5, 7, 9, 11]

// SpelledNote is a note named as it is written: a letter, raised or lowered by some
// number of semitones (1 for a sharp, -1 for a flat, 2 for a double sharp and so on).
export interface SpelledNote {
  letter: number
  accidental: number
}

// Pitch is a spelled note in a particular octave. Octaves are numbered so that middle C
// is C4, and an octave runs from C to B by letter, whatever the accidental - so C♭4
// sounds a semitone below middle C.
export interface Pitch extends SpelledNote {
  octave: number
}

export function accidentalSymbol(accidental: number): string {
  switch(accidental) {
    case -2: return "𝄫"
    case -1: return "♭"
    case 0: return ""
    case 1: return "♯"
    case 2: return "𝄪"
    default: throw RangeError("cannot write an accidental of " + accidental + " semitones")
  }
}

export function spelledNoteName(n: SpelledNote): string {
  return letterNames[n.letter] + accidentalSymbol(n.accidental)
}

// spellNote names a note as the Note enum does: by a letter, flattened or not.
export function spellNote(n: Note): SpelledNote {
  return {
    letter: letterNames.indexOf(n[0]),
    accidental: n.length > 1 ? -1 : 0,
  }
}

// diatonicNumber counts the letters from C0 up to the pitch.
export function diatonicNumber(p: Pitch): number {
  return p.octave * letterNames.length + p.letter
}

export function midiNumber(p: Pitch): number {
  return 12 * (p.octave + 1) + letterSemiTones[p.letter] + p.accidental
}

// the bottom line of the treble stave is E4
const trebleBottomLine = diatonicNumber({letter: 2, accidental: 0, octave: 4})

// trebleStavePosition places the pitch on the treble stave, counting lines and spaces
// up from its bottom line: 0 for the bottom line, 1 for the space above it, 8 for the
// top line, and below 0 or above 8 for the ledger lines.
export function trebleStavePosition(p: Pitch): number {
  return diatonicNumber(p) - trebleBottomLine
}

// KeySignature is written as a number of sharps (positive) or flats (negative).
export type KeySignature = number

// the key signature of each natural letter's major key, from C up
const naturalMajorKeySignatures = [0, 2, 4, -1, 1, 3, 5]

// majorKeySignature is the key signature of the major key with the given tonic. Sharpening
// the tonic adds seven sharps (G major has one, G♯ major eight); flattening it adds seven
// flats.
export function majorKeySignature(tonic: SpelledNote): KeySignature {
  return naturalMajorKeySignatures[tonic.letter] + 7 * tonic.accidental
}

// spellFrom names the notes of a scale from the given spelling of its first degree, so
// that each letter is used once.
function spellFrom(root: SpelledNote, scale: Scale): SpelledNote[] {
  return scale.intervals.map((_, i) => {
    const letter = (root.letter + i) % letterNames.length
    const semiTones = semiTonesBetweenNotesUpwards(Note.C, scaleDegree(scale, i+1))
    return {
      letter: letter,
      // the accidental is however far the note is from its letter, taken the shorter
      // way round the octave
      accidental: (semiTones - letterSemiTones[letter] + 18) % 12 - 6,
    }
  })
}

// ScaleSpelling is how a scale is written: the names of its notes, and the key signature
// it is written under.
export interface ScaleSpelling {
  notes: SpelledNote[]
  keySignature: KeySignature
}

// spellIonianScale writes a scale from its Ionian root (as ScaleSelector picks one) as is
// conventional:
//
//  - the modes of the major scale take the key signature of the major scale;
//  - melodic and harmonic minor take the key signature of the minor key they are
//    variants of, with accidentals for the notes they raise. Melodic minor from C is
//    written with C minor's three flats, and naturals on its A and B;
//  - harmonic major takes the key signature of the major key it is a variant of, with
//    an accidental for its flattened sixth.
//
// A root written with a flat can also be written with a sharp (D♭ as C♯), and the scale is
// written from whichever spelling gives the fewer sharps or flats - so melodic minor
// from D♭ is written as C♯ melodic minor, under C♯ minor's four sharps, rather than under
// the eight flats D♭ minor would need.
function spellIonianScale(ionianRoot: Note, scaleType: ScaleType): ScaleSpelling {

  const ionianScale = scaleFromIonianRoot(ionianRoot, scaleType, 1)

  const asWritten = spellNote(ionianRoot)
  const roots = [asWritten]
  if (asWritten.accidental == -1) {
    roots.push({letter: (asWritten.letter + 6) % letterNames.length, accidental: 1})
  }

  let best: ScaleSpelling | undefined = undefined
  for (const root of roots) {
    const notes = spellFrom(root, ionianScale)
    // melodic minor's Ionian root is the tonic of the minor key it varies, so its key
    // signature is that of the minor key's relative major, a minor third up. Harmonic
    // minor's Ionian root is already the relative major of the minor key it varies.
    const keyTonic = scaleType == ScaleType.MelodicMinor ? notes[2] : notes[0]
    const keySignature = majorKeySignature(keyTonic)
    if (best == undefined || Math.abs(keySignature) < Math.abs(best.keySignature)) {
      best = {notes: notes, keySignature: keySignature}
    }
  }
  return best!
}

// spellScale writes the scale starting from the given degree of the scale picked out by
// its Ionian root. Every mode of a scale is written as the scale is, so takes the same
// spelling and key signature.
export function spellScale(
  ionianRoot: Note,
  scaleType: ScaleType,
  startingScaleDegree: number,
): ScaleSpelling {

  const ionian = spellIonianScale(ionianRoot, scaleType)
  return {
    notes: [
      ...ionian.notes.slice(startingScaleDegree - 1),
      ...ionian.notes.slice(0, startingScaleDegree - 1),
    ],
    keySignature: ionian.keySignature,
  }
}

// scaleDegreePitch finds the pitch of a degree of a spelled scale, whose first degree is
// in the given octave. Degrees carry on past the seventh into the octaves above (the
// eighth is the first an octave up), and below the first into the octaves below (zero
// is the seventh an octave down).
export function scaleDegreePitch(
  scale: SpelledNote[],
  degree: number,
  tonicOctave: number,
): Pitch {

  const numNotes = scale.length
  const steps = degree - 1
  const note = scale[((steps % numNotes) + numNotes) % numNotes]

  return {
    ...note,
    octave: tonicOctave + Math.floor((scale[0].letter + steps) / letterNames.length),
  }
}

// trebleOctave picks the octave to put the first degree of a scale in so that the given
// degrees of it sit on the treble stave with as few ledger lines as they can, and as near
// its middle as they can.
export function trebleOctave(scale: SpelledNote[], degrees: number[]): number {

  const cost = (octave: number) => {
    const positions = degrees.map((d) => trebleStavePosition(scaleDegreePitch(scale, d, octave)))
    // the stave and a ledger line either side of it are comfortable to read
    const ledgers = positions.reduce(
      (sum, p) => sum + Math.max(0, -2 - p) + Math.max(0, p - 10), 0,
    )
    const mean = positions.reduce((sum, p) => sum + p, 0) / positions.length
    return [ledgers, Math.abs(mean - 4)]
  }

  let best = 4
  for (const octave of [2, 3, 5, 6]) {
    const [ledgers, offset] = cost(octave)
    const [bestLedgers, bestOffset] = cost(best)
    if (ledgers < bestLedgers || (ledgers == bestLedgers && offset < bestOffset)) {
      best = octave
    }
  }
  return best
}

// the letters a key signature sharpens, in the order it sharpens them: F C G D A E B
const sharpOrder = [3, 0, 4, 1, 5, 2, 6]

// the letters a key signature flattens, in the order it flattens them: B E A D G C F
const flatOrder = [...sharpOrder].reverse()

// keySignatureLetters lists the letters a key signature alters, in the order they are
// written.
export function keySignatureLetters(k: KeySignature): number[] {
  return k >= 0 ? sharpOrder.slice(0, k) : flatOrder.slice(0, -k)
}

// keySignatureAccidental is the accidental the key signature gives a letter.
export function keySignatureAccidental(k: KeySignature, letter: number): number {
  return keySignatureLetters(k).includes(letter) ? Math.sign(k) : 0
}

export enum Duration {
  Whole = "Whole",
  Half = "Half",
  Quarter = "Quarter",
  Eighth = "Eighth",
  Sixteenth = "Sixteenth",
}

// beamsForDuration counts the beams (or flags) a duration is written with.
export function beamsForDuration(d: Duration): number {
  switch(d) {
    case Duration.Eighth: return 1
    case Duration.Sixteenth: return 2
    default: return 0
  }
}

// ScoreEvent is a note or rest in a bar.
export interface ScoreEvent {
  // how far into the bar it starts, in beats
  start: number
  duration: Duration
  // left out for a rest
  pitch?: Pitch
  // the accidental to write before the note, if it needs one (0 for a natural)
  accidental?: number
  // what the note is known by outside the score - so that it can be picked out
  id?: number
}

// Tuplet groups the events from `first` to `last` of a bar (by index) as a triplet.
export interface Tuplet {
  first: number
  last: number
}

export interface Measure {
  // how many beats the bar is laid out across
  numBeats: number
  events: ScoreEvent[]
  // each group of events beamed together, by their indices
  beams: number[][]
  tuplets: Tuplet[]
}

// the note written for a slot, in each division of the beat
function slotDuration(slotsPerBeat: number): Duration {
  switch(slotsPerBeat) {
    case 1: return Duration.Quarter
    case 2: return Duration.Eighth
    // a triplet quaver
    case 3: return Duration.Eighth
    case 4: return Duration.Sixteenth
    default: throw RangeError("cannot write a beat divided into " + slotsPerBeat + " slots")
  }
}

// GridNote is a note played in a slot of a grid dividing every beat evenly. It lasts the
// one slot, or else the whole of a beat it starts at the beginning of - which is written
// as a crotchet.
export interface GridNote {
  slot: number
  pitch: Pitch
  // how many slots it lasts
  length?: number
}

export interface GridLayout {
  slotsPerBeat: number
  beatsPerBar: number
  numBars: number
  keySignature: KeySignature
  // whether the slots with no note are written as rests. Without, the score stops after
  // its last note - which suits a fragment of music shown on its own.
  fillWithRests?: boolean
}

// restsForBeats writes the rests for the empty beats of a bar from `from` up to `to`. A
// bar of 4/4 has its half bars written as minims, and a bar with nothing in it a
// semibreve, as is conventional.
function restsForBeats(from: number, to: number, beatsPerBar: number): ScoreEvent[] {

  if (from == 0 && to == beatsPerBar) {
    return [{start: 0, duration: Duration.Whole}]
  }

  const rests: ScoreEvent[] = []
  let beat = from
  while (beat < to) {
    if (beatsPerBar == 4 && beat % 2 == 0 && beat + 2 <= to) {
      rests.push({start: beat, duration: Duration.Half})
      beat += 2
    } else {
      rests.push({start: beat, duration: Duration.Quarter})
      beat += 1
    }
  }
  return rests
}

// restsForSlots writes the rests for the empty slots of a beat, from slot `from` of it
// to the end of it. Semiquaver rests pair up into a quaver rest where they fill the half
// of a beat.
function restsForSlots(beat: number, from: number, slotsPerBeat: number): ScoreEvent[] {

  const rests: ScoreEvent[] = []
  let slot = from
  while (slot < slotsPerBeat) {
    if (slotsPerBeat == 4 && slot % 2 == 0) {
      rests.push({start: beat + slot / slotsPerBeat, duration: Duration.Eighth})
      slot += 2
    } else {
      rests.push({start: beat + slot / slotsPerBeat, duration: slotDuration(slotsPerBeat)})
      slot += 1
    }
  }
  return rests
}

// scoreFromGrid writes notes played on a grid of slots out as bars of music. Notes are
// beamed a beat at a time, and when the beat is divided in three each beat is written as
// a triplet.
export function scoreFromGrid(notes: GridNote[], layout: GridLayout): Measure[] {

  const {slotsPerBeat, beatsPerBar, numBars, keySignature} = layout
  const fillWithRests = layout.fillWithRests ?? true
  const slotsPerBar = slotsPerBeat * beatsPerBar

  for (const n of notes) {
    const length = n.length ?? 1
    if (length != 1 && (length != slotsPerBeat || n.slot % slotsPerBeat != 0)) {
      throw RangeError("cannot write a note of " + length + " slots starting at slot " + n.slot)
    }
  }

  const lastSlot = Math.max(-1, ...notes.map((n) => n.slot + (n.length ?? 1) - 1))
  const slotNotes = new Map(notes.map((n) => [n.slot, n]))

  const measures: Measure[] = []
  for (let bar = 0; bar < numBars; bar++) {

    const firstSlot = bar * slotsPerBar
    if (!fillWithRests && firstSlot > lastSlot) {
      break
    }

    const measure: Measure = {
      numBeats: fillWithRests
        ? beatsPerBar
        : Math.min(beatsPerBar, Math.ceil((lastSlot + 1 - firstSlot) / slotsPerBeat)),
      events: [],
      beams: [],
      tuplets: [],
    }

    // the accidental each letter carries so far in the bar, in each octave
    const carried = new Map<string, number>()

    // beats with no notes in them, waiting to be written as rests together
    let firstEmptyBeat: number | undefined = undefined
    const writeEmptyBeats = (upTo: number) => {
      if (firstEmptyBeat != undefined) {
        measure.events.push(...restsForBeats(firstEmptyBeat, upTo, beatsPerBar))
        firstEmptyBeat = undefined
      }
    }

    for (let beat = 0; beat < measure.numBeats; beat++) {

      const beatSlot = firstSlot + beat * slotsPerBeat
      const beatNotes = [...Array(slotsPerBeat)].map((_, i) => slotNotes.get(beatSlot + i))

      if (beatNotes.every((n) => n == undefined)) {
        if (fillWithRests) {
          firstEmptyBeat = firstEmptyBeat ?? beat
        }
        continue
      }
      writeEmptyBeats(beat)

      // noteEvent writes a note, with an accidental if the key signature and the bar so
      // far leave it needing one
      const noteEvent = (n: GridNote, start: number, duration: Duration): ScoreEvent => {
        const key = n.pitch.letter + "/" + n.pitch.octave
        const current = carried.get(key) ?? keySignatureAccidental(keySignature, n.pitch.letter)
        carried.set(key, n.pitch.accidental)
        return {
          start: start,
          duration: duration,
          pitch: n.pitch,
          accidental: current == n.pitch.accidental ? undefined : n.pitch.accidental,
          id: n.slot,
        }
      }

      // a note held for the whole beat
      const first = beatNotes[0]
      if (first != undefined && (first.length ?? 1) == slotsPerBeat) {
        measure.events.push(noteEvent(first, beat, Duration.Quarter))
        continue
      }

      const beatEvents: ScoreEvent[] = []
      const noteEvents: number[] = []
      for (let i = 0; i < slotsPerBeat; i++) {
        const n = beatNotes[i]

        if (n == undefined) {
          // a slot left empty after the beat's last note is a rest only if it is filled
          const restOfBeatIsEmpty = beatNotes.slice(i).every((m) => m == undefined)
          if (restOfBeatIsEmpty) {
            if (fillWithRests) {
              beatEvents.push(...restsForSlots(beat, i, slotsPerBeat))
            }
            break
          }
          beatEvents.push({start: beat + i / slotsPerBeat, duration: slotDuration(slotsPerBeat)})
          continue
        }

        noteEvents.push(measure.events.length + beatEvents.length)
        beatEvents.push(noteEvent(n, beat + i / slotsPerBeat, slotDuration(slotsPerBeat)))
      }

      if (noteEvents.length > 1) {
        measure.beams.push(noteEvents)
      }
      if (slotsPerBeat == 3) {
        measure.tuplets.push({
          first: measure.events.length,
          last: measure.events.length + beatEvents.length - 1,
        })
      }
      measure.events.push(...beatEvents)
    }
    writeEmptyBeats(measure.numBeats)

    measures.push(measure)
  }

  return measures
}

