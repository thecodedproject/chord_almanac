import {
  Note,
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
  startingString?: number
  maxFret?: number
  tuning?: Note[]
}

export interface TabNotesNPerStringOptions {
  notesPerString?: number
  startingString?: number
  trimExcess?: boolean
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
  startingString: number,
  tuning: Note[],
  maxFret: number,
): TabNote[] | undefined {

  const openPitches = openStringPitches(tuning)
  const lowestVoicePitch = openPitches[tuning.length - startingString] + lowestFret

  const tab: TabNote[] = []

  for (let i=0; i < voices.length; i++) {

    const string = startingString - i

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

// tabNotesForVoicing tabs a chord voicing one note per string, starting on
// `startingString` and working up towards the highest string.
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
    startingString = tuning.length,
    maxFret = 24,
  } = options

  const voices = [...c.tones].sort((a, b) => a-b)

  if (voices.length > startingString) {
    throw new RangeError("cannot tab voicing of " + voices.length + " voices starting on string " + startingString + "; it would run off the neck")
  }

  const startingStringNote = tuning[tuning.length - startingString]
  const lowestNote = scaleDegree(c.scale, voices[0])

  // the lowest voice can be played at any octave of its note on the starting string;
  // take the lowest of those which leaves room for the voices above it
  for (
    let lowestFret = semiTonesBetweenNotesUpwards(startingStringNote, lowestNote);
    lowestFret <= maxFret;
    lowestFret += 12
  ) {
    const tab = tabVoicingFromFret(c, voices, lowestFret, startingString, tuning, maxFret)
    if (tab != undefined) {
      return tab
    }
  }

  throw new RangeError("cannot tab voicing (" + voices + "); it does not fit on the fret board from string " + startingString)
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
