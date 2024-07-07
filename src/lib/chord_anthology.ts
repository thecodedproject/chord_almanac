import {isEqual} from "lodash"


export enum Note {
  C = "C",
  Db = "Db",
  D = "D",
  Eb = "Eb",
  E = "E",
  F = "F",
  Gb = "Gb",
  G = "G",
  Ab = "Ab",
  A = "A",
  Bb = "Bb",
  B = "B",
}

export enum Interval {
  Unison = "Unison",
  MinorSecond = "MinorSecond",
  MajorSecond = "MajorSecond",
  MinorThird = "MinorThird",
  MajorThird = "MajorThird",
  Fourth = "Fourth",
  DiminishedFifth = "DiminishedFifth",
  PerfectFifth = "PerfectFifth",
  AugmentedFifth = "AugmentedFifth",
  Sixth = "Sixth",
  MinorSeven = "MinorSeven",
  MajorSeven = "MajorSeven",
}

export enum DiatonicInterval {
  Unison = "Unison",
  Second = "Second",
  Third = "Third",
  Fourth = "Fourth",
  Fifth = "Fifth",
  Sixth = "Sixth",
  Seventh = "Seventh",
}

export enum Mode {
  Ionian = "Ionian",
  Dorian = "Dorian",
  Phrygian = "Phrygian",
  Lydian = "Lydian",
  Mixolydian = "Mixolydian",
  Aeolian = "Aeolian",
  Locrian = "Locrian",
}

export interface Scale {
  root: Note
  intervals: Interval[]
}

export interface VoiceLeadingChord {
  scale: Scale
  tones: number[]
}

export function majorScaleIntervals(mode: Mode): Interval[] {

  const ionianMajorScaleIntervals = [
    Interval.MajorSecond,
    Interval.MajorSecond,
    Interval.MinorSecond,
    Interval.MajorSecond,
    Interval.MajorSecond,
    Interval.MajorSecond,
    Interval.MinorSecond,
  ]

  let numShifts = (() => {
    switch(mode) {
      case Mode.Ionian: return 0
      case Mode.Dorian: return 1
      case Mode.Phrygian: return 2
      case Mode.Lydian: return 3
      case Mode.Mixolydian: return 4
      case Mode.Aeolian: return 5
      case Mode.Locrian: return 6
      default: throw RangeError("cannot convert unknown mode to number of shifts:" + mode)
    }
  })()

  return shiftIntervals(ionianMajorScaleIntervals, numShifts)
}


function noteAsNumber(n: Note): number {
  switch(n) {
    case Note.C: return 0
    case Note.Db: return 1
    case Note.D: return 2
    case Note.Eb: return 3
    case Note.E: return 4
    case Note.F: return 5
    case Note.Gb: return 6
    case Note.G: return 7
    case Note.Ab: return 8
    case Note.A: return 9
    case Note.Bb: return 10
    case Note.B: return 11
    default: throw RangeError("cannot convert unknown note to number:" + n)
  }
}

export function semiTonesBetweenNotesUpwards(lowerNote: Note, upperNote: Note): number {

  if (lowerNote === upperNote) {
    return 0
  }

  // Due to our choice of note _values_ the result of the subtraction opperation
  // should be between 0 and 12 (i.e. `|mod(12)|`). Since we know the most negative
  // _absolute value_ we can get between a pair of notes is -11 (i.e. from B to C)
  // we can shift absolute value up by 12 and take the modulo.
  return (noteAsNumber(upperNote) - noteAsNumber(lowerNote) + 12)%12;
}

export function intervalBetweenNotesUpwards(lowerNote: Note, upperNote: Note): Interval {

  const noteDistance = semiTonesBetweenNotesUpwards(lowerNote, upperNote)

  switch (noteDistance) {
    case 0: return Interval.Unison
    case 1: return Interval.MinorSecond
    case 2: return Interval.MajorSecond
    case 3: return Interval.MinorThird
    case 4: return Interval.MajorThird
    case 5: return Interval.Fourth
    case 6: return Interval.DiminishedFifth
    case 7: return Interval.PerfectFifth
    case 8: return Interval.AugmentedFifth
    case 9: return Interval.Sixth
    case 10: return Interval.MinorSeven
    case 11: return Interval.MajorSeven
    default: throw RangeError("cannot convert unknown note distance to interval; lowerNote:" + lowerNote + " upperNote:" + upperNote + " noteDistance:" + noteDistance)
  }
}

function shiftIntervals(intervals: readonly Interval[], numShifts: number): Interval[] {

  const retVal = [...intervals]
  for (let i=0; i < numShifts; i++) {
    const e = retVal.shift()
    if (e == undefined) {
      throw new RangeError("got undefined element whilst shifting intervals")
    }
    retVal.push(e)
  }

  return retVal
}

export function majorScale(root: Note, mode: Mode): Scale {
  return {
    root: root,
    intervals: majorScaleIntervals(mode),
  }
}

export function shiftNote(n: Note, i: Interval): Note {

  let noteVal = noteAsNumber(n)

  let intervalVal = (() => {
    switch(i) {
      case Interval.Unison: return 0
      case Interval.MinorSecond: return 1
      case Interval.MajorSecond: return 2
      case Interval.MinorThird: return 3
      case Interval.MajorThird: return 4
      case Interval.Fourth: return 5
      case Interval.DiminishedFifth: return 6
      case Interval.PerfectFifth: return 7
      case Interval.AugmentedFifth: return 8
      case Interval.Sixth: return 9
      case Interval.MinorSeven: return 10
      case Interval.MajorSeven: return 11
      default: throw RangeError("cannot convert unknown interval to number:" + i)
    }
  })()

  noteVal = (noteVal + intervalVal)%12

  return (() => {
    switch(noteVal) {
      case 0: return Note.C
      case 1: return Note.Db
      case 2: return Note.D
      case 3: return Note.Eb
      case 4: return Note.E
      case 5: return Note.F
      case 6: return Note.Gb
      case 7: return Note.G
      case 8: return Note.Ab
      case 9: return Note.A
      case 10: return Note.Bb
      case 11: return Note.B
      default: throw RangeError("cannot convert number to note (out of range):" + noteVal)
    }
  })()
}

export function scaleDegree(scale: Scale, degree: number): Note {
  let note = scale.root
  let iDegree = 0
  while(iDegree < (degree-1)) {
    const i = iDegree%scale.intervals.length
    note = shiftNote(note, scale.intervals[i])
    iDegree++
  }
  return note
}

export function vlChordNotes(c: VoiceLeadingChord): Note[] {

  let chordNotes: Note[] = []
  for (let t of c.tones) {
    chordNotes.push(
      scaleDegree(c.scale, t),
    )
  }
  return chordNotes
}

// shiftChordScaleDiatonically
export function shiftScaleDiatonically(s: Scale, diatonicInterval: DiatonicInterval): Scale {

  const scaleDegreeOfNewRoot = (() => {
    switch(diatonicInterval) {
      case DiatonicInterval.Unison: return 1
      case DiatonicInterval.Second: return 2
      case DiatonicInterval.Third: return 3
      case DiatonicInterval.Fourth: return 4
      case DiatonicInterval.Fifth: return 5
      case DiatonicInterval.Sixth: return 6
      case DiatonicInterval.Seventh: return 7
      default: throw RangeError("cannot convert unknown diatonic interval to scale degree:" + diatonicInterval)
    }
  })()

  const numIntervalShifts = scaleDegreeOfNewRoot - 1

  const retVal = { ...s }
  retVal.root = scaleDegree(s, scaleDegreeOfNewRoot)
  retVal.intervals = shiftIntervals(s.intervals, numIntervalShifts)
  return retVal
}

// shiftChordTonesByMap changes the tones of a chord based on a mapping - it does not change the chord scale
//
// i.e. the chord tones [1,3,5] shifted with a map {1:3, 5:4, 3:7} will result in chord tones [3,7,4]
//
// -  The map must contain a key entry for every chord tone - if not an error is thrown
// -  The ordering of the map has not affect on the resulting chord tones; i.e. the ordering of the original tones
//    is preserved once the map is applied
export function shiftChordTonesByMap(chordTones: readonly number[], mapping: Map<number, number>): number[] {

  if (chordTones.length != mapping.size) {
    throw new RangeError("empty inversion map")
  }

  const retVal: number[] = []
  for(let i=0; i < chordTones.length; i++) {
    const newTone = mapping.get(chordTones[i])
    if (newTone == undefined) {
      throw RangeError("cannot shift chord tone; mapping does not contain all chords tones. Tones:" + chordTones + " Mapping:" + mapping)
    }
    retVal.push(newTone)
  }

  return retVal
}

export function createCycle(
  startingChord: VoiceLeadingChord,
  intervalShift: DiatonicInterval,
  chordToneMapping: Map<number, number>,
  maxChords: number = 30,
): VoiceLeadingChord[] {

  let cycle: VoiceLeadingChord[] = []

  cycle.push(startingChord)

  let next = {...startingChord}
  for (let i=0; i < maxChords-1; i++) {
    next.scale = shiftScaleDiatonically(next.scale, intervalShift)
    next.tones = shiftChordTonesByMap(next.tones, chordToneMapping)

    if (isEqual(next, startingChord)) {
      break
    }

    cycle.push({...next})
  }

  return cycle
}
