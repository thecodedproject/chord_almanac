import {
  Note,
  ScaleType,
  TetradVoicing,
  scaleFromIonianRoot,
} from './chord_anthology'

import {
  Playability,
  chordPlayability,
  combinedPlayability,
  fretSpan,
  tetradVoicingPlayability,
} from './guitar_chords'

const cMajor7 = {
  scale: scaleFromIonianRoot(Note.C, ScaleType.Major, 1),
  tones: [1,3,5,7],
}

// a chord fretted on the 6th to 3rd strings at the given frets
function tabAt(...frets: number[]) {
  return frets.map((fret, i) => ({string: 6-i, fret: fret}))
}

describe("fretSpan", () => {
  it("counts the frets from the lowest fretted to the highest", () => {
    expect(fretSpan(tabAt(12,14,10,12))).toEqual(4)
    expect(fretSpan(tabAt(5,5,5,5))).toEqual(0)
  })

  it("leaves out open strings, which need no finger", () => {
    expect(fretSpan(tabAt(0,2,0,0))).toEqual(0)
    expect(fretSpan(tabAt(1,3,0,2))).toEqual(2)
  })

  it("spans nothing when nothing is fretted", () => {
    expect(fretSpan(tabAt(0,0,0,0))).toEqual(0)
    expect(fretSpan([])).toEqual(0)
  })
})

describe("chordPlayability", () => {
  it("is playable stretching 4 frets or fewer", () => {
    expect(chordPlayability(tabAt(3,3,2,4))).toEqual(Playability.Playable)
    expect(chordPlayability(tabAt(10,12,14,11))).toEqual(Playability.Playable)
  })

  it("is possibly playable stretching 5 frets", () => {
    expect(chordPlayability(tabAt(10,12,15,11))).toEqual(Playability.PossiblyPlayable)
  })

  it("is unplayable stretching more than 5 frets", () => {
    expect(chordPlayability(tabAt(10,12,16,11))).toEqual(Playability.Unplayable)
  })
})

describe("combinedPlayability", () => {
  it("is playable only if every chord is", () => {
    expect(combinedPlayability(
      [Playability.Playable, Playability.Playable],
    )).toEqual(Playability.Playable)
  })

  it("is unplayable only if every chord is", () => {
    expect(combinedPlayability(
      [Playability.Unplayable, Playability.Unplayable],
    )).toEqual(Playability.Unplayable)
  })

  it("is possibly playable for any mix", () => {
    expect(combinedPlayability(
      [Playability.Playable, Playability.Unplayable],
    )).toEqual(Playability.PossiblyPlayable)
    expect(combinedPlayability(
      [Playability.Playable, Playability.PossiblyPlayable],
    )).toEqual(Playability.PossiblyPlayable)
  })
})

describe("tetradVoicingPlayability", () => {
  it("finds the drop 2 voicings playable on neighbouring strings", () => {
    for (const strings of [[6,5,4,3], [5,4,3,2], [4,3,2,1]]) {
      expect(tetradVoicingPlayability(cMajor7, TetradVoicing.Drop2, strings))
        .toEqual(Playability.Playable)
    }
  })

  it("finds the drop 3 voicings playable with a string skipped below", () => {
    for (const strings of [[6,4,3,2], [5,3,2,1]]) {
      expect(tetradVoicingPlayability(cMajor7, TetradVoicing.Drop3, strings))
        .toEqual(Playability.Playable)
    }
    expect(tetradVoicingPlayability(cMajor7, TetradVoicing.Drop3, [6,5,4,3]))
      .toEqual(Playability.PossiblyPlayable)
  })

  it("finds a voicing unplayable when none of its chords can be played", () => {
    // spread voicings reach further than four neighbouring strings allow
    expect(tetradVoicingPlayability(cMajor7, TetradVoicing.Spread, [6,5,4,3]))
      .toEqual(Playability.Unplayable)
  })
})
