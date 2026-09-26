import {
  Note,
  Scale,
  VoiceLeadingChord,
  scaleDegree,
  semiTonesBetweenNotesUpwards,
  semiTonesBetweenScaleDegreesUpwards,
} from './chord_anthology'

export interface TabNote {
  string: number
  fret: number
}

export enum TabNotesDirection {
  Ascending = "ascending",
  Descending = "descending",
}

export interface TabNotesForVoicingOptions {
  // the strings to voice the chord on, from the lowest sounding voice up. They need not
  // neighbour each other - skipping a string gives a voicing more room to spread out.
  strings?: number[]
  maxFret?: number
  tuning?: Note[]
}

export interface TabNotesNPerStringOptions {
  notesPerString?: number
  startingString?: number
  trimExcess?: boolean
  tuning?: Note[]
}

export interface TabScalePositionOptions {
  notesPerString?: number
  startingString?: number
  maxFret?: number
  tuning?: Note[]
}

// standard guitar tunings, from lowest string to highest
export const sixStringTuning: Note[] = [
  Note.E,
  Note.A,
  Note.D,
  Note.G,
  Note.B,
  Note.E,
]

export const sevenStringTuning: Note[] = [
  Note.B,
  ...sixStringTuning,
]

export const eightStringTuning: Note[] = [
  Note.Gb,
  ...sevenStringTuning,
]

export const defaultTuning = sixStringTuning

// openStringPitches returns the pitch of each open string, in semitones above the
// lowest string. Each string is taken to be tuned to the nearest pitch of its note
// above the string below it, which is how guitars are conventionally tuned.
function openStringPitches(tuning: Note[]): number[] {

  const pitches = [0]
  for (let i=1; i < tuning.length; i++) {
    pitches.push(
      pitches[i-1] + semiTonesBetweenNotesUpwards(tuning[i-1], tuning[i]),
    )
  }
  return pitches
}

// tabVoicingFromFret tabs a voicing with its lowest voice at `lowestFret`, putting each
// voice above it at the fret which sounds it at its interval above that lowest voice.
//
// It returns undefined if any of the voices land off the fret board, which means the
// voicing cannot be played with its lowest voice at that fret.
function tabVoicingFromFret(
  c: VoiceLeadingChord,
  voices: number[],
  lowestFret: number,
  strings: number[],
  tuning: Note[],
  maxFret: number,
): TabNote[] | undefined {

  const openPitches = openStringPitches(tuning)
  const lowestVoicePitch = openPitches[tuning.length - strings[0]] + lowestFret

  const tab: TabNote[] = []

  for (let i=0; i < voices.length; i++) {

    const string = strings[i]

    const pitch = lowestVoicePitch + semiTonesBetweenScaleDegreesUpwards(
      c.scale,
      voices[0],
      voices[i],
    )

    const fret = pitch - openPitches[tuning.length - string]

    if (fret < 0 || fret > maxFret) {
      return undefined
    }

    tab.push({
      string: string,
      fret: fret,
    })
  }

  return tab
}

// lowestStrings returns the `numStrings` lowest strings of the tuning, from the lowest
// string upwards.
function lowestStrings(tuning: Note[], numStrings: number): number[] {

  const strings: number[] = []
  for (let i=0; i < numStrings; i++) {
    strings.push(tuning.length - i)
  }
  return strings
}

// tabNotesForVoicing tabs a chord voicing one note per string, putting the lowest voice
// on the first of the given strings and working up from there.
//
// Each voice is fretted at its own interval above the lowest voice, so the tab sounds
// the voicing itself rather than just the notes it is made of. The voicing is played as
// low on the neck as it can be whilst still leaving every voice on the fret board.
export function tabNotesForVoicing(
  c: VoiceLeadingChord,
  options: TabNotesForVoicingOptions = {},
): TabNote[] {

  const {
    tuning = defaultTuning,
    maxFret = 24,
  } = options

  const voices = [...c.tones].sort((a, b) => a-b)
  const strings = options.strings ?? lowestStrings(tuning, voices.length)

  if (strings.length < voices.length) {
    throw new RangeError("cannot tab voicing of " + voices.length + " voices on " + strings.length + " strings")
  }

  for (let i=0; i < voices.length; i++) {
    if (strings[i] < 1 || strings[i] > tuning.length) {
      throw new RangeError("cannot tab voicing; string " + strings[i] + " is not on a " + tuning.length + " string guitar")
    }
    if (i > 0 && strings[i] >= strings[i-1]) {
      throw new RangeError("cannot tab voicing; strings must be given from the lowest sounding up, got:" + strings)
    }
  }

  const lowestStringNote = tuning[tuning.length - strings[0]]
  const lowestNote = scaleDegree(c.scale, voices[0])

  // the lowest voice can be played at any octave of its note on the lowest string; take
  // the lowest of those which leaves room for the voices above it
  for (
    let lowestFret = semiTonesBetweenNotesUpwards(lowestStringNote, lowestNote);
    lowestFret <= maxFret;
    lowestFret += 12
  ) {
    const tab = tabVoicingFromFret(c, voices, lowestFret, strings, tuning, maxFret)
    if (tab != undefined) {
      return tab
    }
  }

  throw new RangeError("cannot tab voicing (" + voices + "); it does not fit on the fret board across strings " + strings)
}

export function tabNotesNPerString(
  notes: Note[],
  options: TabNotesNPerStringOptions = {},
): TabNote[] {

  const {
    notesPerString = 3,
    tuning = defaultTuning,
    startingString = tuning.length,
    trimExcess = false,
  } = options

  const notesToTab = trimExcess
    ? notes.slice(0, notesPerString * startingString)
    : notes

  let currentString = startingString
  let currentStringPreviousFret = 0
  let iCurrentStringNote = 0

  var retVal = notesToTab.map((n, i) => {

    if (currentString == 1 && iCurrentStringNote > 0) {
      iCurrentStringNote++
    } else {
      iCurrentStringNote = i%notesPerString

      if (i>0 && iCurrentStringNote==0) {
        currentString--
        currentStringPreviousFret = 0
      }
    }

    const currentStringOpenNote = tuning[tuning.length - currentString]

    let fret = semiTonesBetweenNotesUpwards(currentStringOpenNote, n)

    if (iCurrentStringNote > 0 && fret <= currentStringPreviousFret) {
      if (fret == 0 && currentStringPreviousFret >= 12) {
        fret += 24
      } else if (currentStringPreviousFret == 24) {
        throw new RangeError("cannot tab next note (" + n + ") as it would be off the fret board (at fret " + (fret + 24) + ")")
      } else {
        fret += 12
      }
    }

    //console.log("*** calced next fret", i, n, currentStringPreviousFret, currentString, fret)

    currentStringPreviousFret = fret

    return {
      string: currentString,
      fret: fret,
    }
  })

  //console.log("*** returned val:", retVal)

  return retVal
}

// tabScalePosition tabs one position of a scale: every note of it which falls under the
// hand when the scale is climbed a fixed number of notes to a string, from its root on
// the given string up to the top string.
//
// The scale climbs without a break, so each note is fretted where it sounds its own
// pitch in that climb rather than wherever its note first comes up on the string - which
// is what keeps the whole position under the one hand.
//
// A position rooted low on the neck leaves the notes on the strings above it under the
// nut; it is played an octave up instead, which is the same shape further up the board.
//
// The notes come back in the order they are played, so the nth note of the position is
// the nth degree of the scale.
export function tabScalePosition(
  s: Scale,
  options: TabScalePositionOptions = {},
): TabNote[] {

  const {
    notesPerString = 3,
    tuning = defaultTuning,
    startingString = tuning.length,
    maxFret = 24,
  } = options

  if (startingString < 1 || startingString > tuning.length) {
    throw new RangeError("cannot tab a position from string " + startingString + "; it is not on a " + tuning.length + " string guitar")
  }

  const openPitches = openStringPitches(tuning)

  const openPitchOf = (string: number) => openPitches[tuning.length - string]

  // each string carries its own run of the scale, from the one the position starts on
  // up to the top string
  const stringOfNote = (iNote: number) => startingString - Math.floor(iNote/notesPerString)

  // the position starts from its root played as low as it will go on the string it
  // starts from, and climbs the scale from there
  const rootPitch = openPitchOf(startingString) + semiTonesBetweenNotesUpwards(
    tuning[tuning.length - startingString],
    s.root,
  )

  const pitchOfNote = (iNote: number) =>
    rootPitch + semiTonesBetweenScaleDegreesUpwards(s, 1, iNote + 1)

  const notes = [...Array(notesPerString * startingString)].map((_, iNote) => ({
    string: stringOfNote(iNote),
    fret: pitchOfNote(iNote) - openPitchOf(stringOfNote(iNote)),
  }))

  const lowestFret = Math.min(...notes.map((n) => n.fret))

  const octavesUp = lowestFret < 0 ? Math.ceil(-lowestFret/12) : 0

  return notes.map((n, iNote) => {

    const fret = n.fret + (octavesUp * 12)

    if (fret > maxFret) {
      throw new RangeError("cannot tab the position; scale degree " + (iNote+1) + " of it lands beyond the " + maxFret + "th fret of string " + n.string + " (at fret " + fret + ")")
    }

    return {
      string: n.string,
      fret: fret,
    }
  })
}

// tabChordInPosition picks the notes of a chord out of a tabbed scale position.
//
// The chord is rooted on `rootDegree` of the scale and built out of the degrees
// `chordDegrees` counted up from that root. Every note of the position which sounds one
// of the chord's tones is tabbed, from the bottom of the position up to the top, so the
// chord is played as a melodic line right through it.
//
// The line runs through the position rather than starting from the chord, so it opens
// on whichever chord tone the position reaches first - which is only the root when the
// chord is rooted on the lowest degree the position covers.
export function tabChordInPosition(
  s: Scale,
  position: TabNote[],
  rootDegree: number,
  chordDegrees: number[],
): TabNote[] {

  if (rootDegree < 1) {
    throw new RangeError("cannot tab a chord rooted below the first scale degree:" + rootDegree)
  }

  const degreesPerOctave = s.intervals.length

  // the degrees of the scale the chord is made of, with the octaves taken off so that
  // every note of the position can be read against them
  const chordTones = new Set(chordDegrees.map((chordDegree) => {

    if (chordDegree < 1) {
      throw new RangeError("cannot tab a chord degree below the first:" + chordDegree)
    }

    return ((rootDegree + chordDegree - 2)%degreesPerOctave) + 1
  }))

  // the nth note of a position is the nth degree of its scale
  return position.filter((_, iNote) => chordTones.has((iNote%degreesPerOctave) + 1))
}
