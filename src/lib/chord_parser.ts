// Reading chord symbols as they are written on a lead sheet - "Dm7", "G7♭9", "C^7",
// "F♯ø", "B♭-7/E♭" - in any of the spellings jazz charts use for them.
//
// A symbol is a root, a quality, perhaps an extension and alterations, and perhaps a bass
// note under a slash. Only the triad or seventh chord at its heart is played: the
// extensions and alterations are kept for showing, but a "G13" is played as a G7 and a
// "G7alt" as a G7.

import {
  chordSymbolSuffixes,
} from "./chord_names"

import {
  SpelledNote,
  letterNames,
  midiNumber,
  spelledNoteName,
} from "./notation"

export interface ParsedChord {
  root: SpelledNote
  // the semitones each of the chord's tones other than its root sits above the root,
  // from the lowest up - [3, 7, 10] for a minor seventh
  semitones: number[]
  // the note under the slash, if there is one
  bass?: SpelledNote

  // the symbol written out in full, and in its parts
  display: string
  rootName: string
  suffix: string
  bassName?: string
}

// the suffix each set of intervals is named with, and the reverse
const suffixIntervals: Record<string, number[]> = {}
for (const key of Object.keys(chordSymbolSuffixes)) {
  suffixIntervals[chordSymbolSuffixes[key]] = key.split(",").map(Number)
}

// the intervals a suffix (as chordSymbolSuffixes names it) stands for - [3, 7, 10] for
// "m7"
export function intervalsForSuffix(suffix: string): number[] | undefined {
  return suffixIntervals[suffix]
}

const noteName = /^([A-Ga-g])([b#]?)/

function readNote(text: string): {note: SpelledNote, length: number} | undefined {
  const m = noteName.exec(text)
  if (m == null) {
    return undefined
  }
  return {
    note: {
      letter: letterNames.indexOf(m[1].toUpperCase()),
      accidental: m[2] == "b" ? -1 : m[2] == "#" ? 1 : 0,
    },
    length: m[0].length,
  }
}

// the symbols written in a chord, put into one plain spelling: flats and sharps as b and
// #, the triangle as ^, the half-diminished circle as h and the diminished one as o, and
// no spaces, commas or brackets ("C7(b9, #11)" is read as "C7b9#11")
function plainSpelling(text: string): string {
  return text
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .replace(/[Δ∆△]/g, "^")
    .replace(/[øØ]/g, "h")
    .replace(/°/g, "o")
    .replace(/[−–]/g, "-")
    .replace(/[\s,()]/g, "")
}

type Family = "major" | "minor" | "half" | "dim" | "aug" | "minMaj"

// What a quality marker says of the seventh: that there is a major seventh whether a
// number follows or not (the triangle on its own is a major seventh chord), that any
// seventh is major ("maj" on its own is a major triad, "maj7" a major seventh chord), or
// nothing (the seventh is the family's own).
type SeventhMark = "major" | "majorIfAny" | undefined

// the quality markers, tried in order so that longer ones are found before the shorter
// ones they start with. Case matters only where it must: M is major, m minor - though
// the capitals fake books use, MA and MI, are major and minor too. The "ma" of "madd9"
// is the minor "m" of a minor chord with a ninth added.
const minorMark = "(MIN|MI|min|mi|m|-)"
const majorMark = "(MAJ|MA|maj|Maj|ma(?!dd)|Ma|M(?!I))"
const families: [RegExp, Family, SeventhMark][] = [
  [new RegExp("^" + minorMark + "(" + majorMark + "|\\^)"), "minMaj", "major"],
  [/^\^/, "major", "major"],
  [new RegExp("^" + majorMark), "major", "majorIfAny"],
  [new RegExp("^" + minorMark), "minor", undefined],
  [/^h/, "half", undefined],
  [/^(dim|o)/, "dim", undefined],
  [/^(aug|\+)/, "aug", undefined],
  [/^dom/, "major", undefined],
]

// a major seventh following an augmented or diminished marker: "+maj7", "oM7"
const majorSeventh = new RegExp("^(" + majorMark + "|\\^)")

// the extension: a sixth, a seventh or something stacked on one - or a power chord
// ("C5", root and fifth) or a triad with a second added ("C2"), as iReal Pro writes them
const extension = /^(6\/9|69|6|7|9|11|13|5|2)/

// chords the site's own names leave out, as they are only ever written on lead sheets -
// where the names at the heart of other chords are used to name scales' chords too, and
// these would muddle those (a minor triad with a sharpened fifth is an inverted major
// triad, there)
const leadSheetSuffixes: Record<string, string> = {
  "7": "5",
  "3,8": "m♯5",
}

// the alterations and additions that can follow, and how each is written out
const alterations: [RegExp, string][] = [
  [/^alt/, "alt"],
  [/^sus2/, "sus2"],
  [/^sus4?/, "sus4"],
  [/^add(b9|#9|#11|9|11|13|2|3|4)/, "add"],
  [/^(b5|-5)/, "♭5"],
  [/^(#5|\+5)/, "♯5"],
  [/^(b9|-9)/, "♭9"],
  [/^(#9|\+9)/, "♯9"],
  [/^(#11|\+11)/, "♯11"],
  [/^(b13|-13)/, "♭13"],
  [/^b6/, "♭6"],
  [/^9/, "9"],
  [/^11/, "11"],
  [/^13/, "13"],
  // a seventh written after a suspension: "Csus7"
  [/^7/, "7"],
  // a + on its own, after the rest: "C7+"
  [/^\+/, "♯5"],
]

// the tensions that, written after a seventh chord, stretch it: C7(9) is C9
const naturalTensions = ["9", "11", "13"]

const sharpsAndFlats = (s: string) => s.replace(/b/g, "♭").replace(/#/g, "♯")

// parseChord reads a chord symbol, or gives undefined for text that is not one.
export function parseChord(text: string): ParsedChord | undefined {

  let rest = plainSpelling(text)

  const root = readNote(rest)
  if (root == undefined) {
    return undefined
  }
  rest = rest.slice(root.length)

  // the bass note under a slash, which is a note's name - so not the 9 of a 6/9
  let bass: SpelledNote | undefined = undefined
  const slash = /\/([A-Ga-g][b#]?)$/.exec(rest)
  if (slash != null) {
    bass = readNote(slash[1])!.note
    rest = rest.slice(0, slash.index)
  }

  // the quality
  let family: Family = "major"
  let seventhMark: SeventhMark = undefined
  for (const [marker, f, mark] of families) {
    const m = marker.exec(rest)
    if (m != null) {
      family = f
      seventhMark = mark
      rest = rest.slice(m[0].length)
      break
    }
  }
  if ((family == "aug" || family == "dim") && majorSeventh.test(rest)) {
    seventhMark = "major"
    rest = rest.replace(majorSeventh, "")
  }

  // the extension: a sixth, a seventh or something stacked on a seventh
  let number: string | undefined = undefined
  const ext = extension.exec(rest)
  if (ext != null) {
    number = ext[1] == "6/9" ? "69" : ext[1]
    rest = rest.slice(ext[0].length)
  }

  // whatever follows is altered or added notes
  const added: string[] = []
  while (rest.length > 0) {
    const match = alterations.find(([pattern]) => pattern.test(rest))
    if (match == undefined) {
      return undefined
    }
    const [pattern, written] = match
    const m = pattern.exec(rest)!
    added.push(written == "add" ? "add" + sharpsAndFlats(m[1]) : written)
    rest = rest.slice(m[0].length)
  }

  // a seventh written after the rest of the chord, and the seventh that "alt" implies
  if (added.includes("7")) {
    added.splice(added.indexOf("7"), 1)
    number = number ?? "7"
  }
  if (added.includes("alt") && number == undefined) {
    number = "7"
  }

  // the triad or seventh chord at the heart of it
  const isPower = number == "5"
  const isAddedSecond = number == "2"
  const isSixth = number == "6" || number == "69"
  const isSeventh = !isSixth && !isPower && !isAddedSecond
    && (number != undefined || seventhMark == "major" || family == "half")

  // Natural tensions written after the extension: on a seventh chord they stretch it to
  // the highest of them (C7(9) is C9, Cmaj7(9,13) Cmaj13); on a sixth chord a ninth
  // makes a 6/9; on a triad they are added notes (Cadd9). The brackets are gone by now,
  // so C(9) is read as C9.
  const tensions = added.filter((a) => naturalTensions.includes(a))
  if (tensions.length > 0) {
    const others = added.filter((a) => !naturalTensions.includes(a))
    added.length = 0
    added.push(...others)
    if (isSeventh) {
      const highest = Math.max(...tensions.map(Number), number == undefined || number == "7" ? 0 : Number(number))
      number = String(highest)
    } else if (isSixth && tensions.includes("9")) {
      number = "69"
      added.push(...tensions.filter((t) => t != "9").map((t) => "add" + t))
    } else {
      added.push(...tensions.map((t) => "add" + t))
    }
  }

  let third = family == "major" || family == "aug" ? 4 : 3
  if (added.includes("sus4")) {
    third = 5
  } else if (added.includes("sus2")) {
    third = 2
  }

  let fifth = family == "half" || family == "dim" ? 6 : family == "aug" ? 8 : 7
  if (added.includes("♭5")) {
    fifth = 6
  } else if (added.includes("♯5")) {
    fifth = 8
  }

  const intervals = isPower ? [fifth] : [third, fifth]
  if (isSixth) {
    intervals.push(9)
  } else if (isSeventh) {
    intervals.push(seventhMark != undefined ? 11 : family == "dim" ? 9 : 10)
  }

  const baseSuffix = chordSymbolSuffixes[intervals.join()] ?? leadSheetSuffixes[intervals.join()]
  if (baseSuffix == undefined) {
    return undefined
  }

  // the suffix written out: the heart of the chord, stretched to the extension given,
  // then whatever else it was given that the heart does not already say
  let suffix = baseSuffix
  if (number == "69") {
    suffix = suffix.replace("6", "6/9")
  } else if (isAddedSecond) {
    suffix += "2"
  } else if (number == "9" || number == "11" || number == "13") {
    suffix = suffix.replace("7", number)
  }
  for (const a of added) {
    if (!suffix.includes(a)) {
      suffix += a
    }
  }

  const rootName = spelledNoteName(root.note)
  const bassName = bass == undefined ? undefined : spelledNoteName(bass)
  return {
    root: root.note,
    semitones: intervals,
    bass: bass,
    display: rootName + suffix + (bassName == undefined ? "" : "/" + bassName),
    rootName: rootName,
    suffix: suffix,
    bassName: bassName,
  }
}

// normaliseChord writes a chord symbol out in the site's own spelling - "Bb-7" as
// "B♭m7" - leaving text that is not a chord symbol as it was typed.
export function normaliseChord(text: string): string {
  const trimmed = text.trim()
  return parseChord(trimmed)?.display ?? trimmed
}

// pitchClass counts the semitones a note sits above C, from 0 to 11.
export function pitchClass(n: SpelledNote): number {
  return ((midiNumber({...n, octave: 4}) % 12) + 12) % 12
}
