import {
  Scale,
  semiTonesBetweenScaleDegreesUpwards,
} from './chord_anthology'

// The symbols of the chords that can be named, by the semitones each of the chord's
// tones other than its root sits above the root, from the lowest up.
//
// No list of names can cover every set of three or four notes, and those it leaves out are the
// ones without a name in common use. Add to it freely.
export const chordSymbolSuffixes: Record<string, string> = {

  // triads
  "4,7": "",
  "3,7": "m",
  "3,6": "dim",
  "4,8": "+",
  "2,7": "sus2",
  "5,7": "sus4",
  "4,6": "(♭5)",

  // seventh chords
  "4,7,11": "maj7",
  "4,7,10": "7",
  "3,7,10": "m7",
  "3,7,11": "mMaj7",
  "3,6,10": "m7♭5",
  "3,6,9": "dim7",
  "3,6,11": "dimMaj7",
  "4,8,11": "maj7♯5",
  "4,8,10": "7♯5",
  "4,6,11": "maj7♭5",
  "4,6,10": "7♭5",

  // seventh chords with the third suspended
  "2,7,11": "maj7sus2",
  "2,7,10": "7sus2",
  "5,7,11": "maj7sus4",
  "5,7,10": "7sus4",

  // sixth chords
  "4,7,9": "6",
  "3,7,9": "m6",
  "2,7,9": "6sus2",
  "5,7,9": "6sus4",

  // triads with a note added
  "2,4,7": "add9",
  "2,3,7": "m(add9)",
  "1,4,7": "add♭9",
  "1,3,7": "m(add♭9)",
  "3,4,7": "add♯9",
  "4,5,7": "add11",
  "3,5,7": "m(add11)",
  "4,6,7": "add♯11",
  "2,4,8": "+(add9)",
  "2,3,6": "dim(add9)",

  // ninth chords with the fifth left out
  "2,4,11": "maj9(no5)",
  "2,4,10": "9(no5)",
  "2,3,10": "m9(no5)",
  "2,3,11": "mMaj9(no5)",
  "1,4,10": "7♭9(no5)",
  "3,4,10": "7♯9(no5)",
}

// chordSymbol names the chord the given degrees of the scale make, rooted on its first
// degree - "Cmaj7" for the 1st, 3rd, 5th and 7th of C major, say.
//
// A chord without the first degree in it is not rooted there, and a chord whose
// intervals have no name in common use has no name to give; both are left unnamed.
export function chordSymbol(s: Scale, degrees: number[]): string | undefined {

  if (!degrees.includes(1)) {
    return undefined
  }

  const numDegrees = s.intervals.length

  const semiTonesAboveRoot = Array.from(new Set(degrees))
    .map((d) => ((d - 1)%numDegrees) + 1)
    .filter((d) => d != 1)
    .map((d) => semiTonesBetweenScaleDegreesUpwards(s, 1, d))
    .sort((a, b) => a-b)

  const suffix = chordSymbolSuffixes[semiTonesAboveRoot.join()]

  return suffix == undefined ? undefined : s.root + suffix
}
