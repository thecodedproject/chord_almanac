import {
  DiatonicInterval,
  Interval,
  Mode,
  Note,
  Scale,
  ScaleType,
  TetradVoicing,
  VoiceLeadingChord,
  createCycle,
  diatonicIntervalBetweenScaleDegreesUpwards,
  diatonicScale,
  diatonicScaleIntervals,
  dropVoices,
  intervalBetweenNotesUpwards,
  invertVoicing,
  normaliseVoicing,
  numTetradVoices,
  raiseVoices,
  scaleDegree,
  scaleDegreeNotes,
  scaleFromIonianRoot,
  scaleNotes,
  scaleTypeForMode,
  semiTonesBetweenNotesUpwards,
  shiftChordTonesByMap,
  shiftChordToNextNearestInversion,
  shiftNote,
  shiftScaleDiatonically,
  tetradVoicing,
  tetradVoicings,
  vlChordNotes,
  voicingScaleDegrees,
} from "./chord_anthology"

import {cloneDeep} from "lodash"

describe("semiTonesBetweenNotesUpwards", () => {

  it("returns Unison interval for unison notes", () => {
    expect(semiTonesBetweenNotesUpwards(Note.C, Note.C)).toEqual(0)
  })

  it("returns a minor second for notes next to eachother", () => {
    expect(semiTonesBetweenNotesUpwards(Note.A, Note.Bb)).toEqual( 1)
    expect(semiTonesBetweenNotesUpwards(Note.Bb, Note.B)).toEqual( 1)
    expect(semiTonesBetweenNotesUpwards(Note.B, Note.C)).toEqual(  1)
    expect(semiTonesBetweenNotesUpwards(Note.C, Note.Db)).toEqual( 1)
    expect(semiTonesBetweenNotesUpwards(Note.Db, Note.D)).toEqual( 1)
    expect(semiTonesBetweenNotesUpwards(Note.D, Note.Eb)).toEqual( 1)
    expect(semiTonesBetweenNotesUpwards(Note.Eb, Note.E)).toEqual( 1)
    expect(semiTonesBetweenNotesUpwards(Note.E, Note.F)).toEqual(  1)
    expect(semiTonesBetweenNotesUpwards(Note.F, Note.Gb)).toEqual( 1)
    expect(semiTonesBetweenNotesUpwards(Note.Gb, Note.G)).toEqual( 1)
    expect(semiTonesBetweenNotesUpwards(Note.G, Note.Ab)).toEqual( 1)
    expect(semiTonesBetweenNotesUpwards(Note.Ab, Note.A)).toEqual( 1)
  })

  it("returns a major second for notes next but one to eachother", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.B  ],
      [ Note.Bb , Note.C  ],
      [ Note.B  , Note.Db ],
      [ Note.C  , Note.D  ],
      [ Note.Db , Note.Eb ],
      [ Note.D  , Note.E  ],
      [ Note.Eb , Note.F  ],
      [ Note.E  , Note.Gb ],
      [ Note.F  , Note.G  ],
      [ Note.Gb , Note.Ab ],
      [ Note.G  , Note.A  ],
      [ Note.Ab , Note.Bb ],
    ]
    notePairs.forEach((n) => {
      expect(semiTonesBetweenNotesUpwards(n[0], n[1])).toEqual(2)
    })
  })

  it("returns a minor third for notes three semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.C  ],
      [ Note.Bb , Note.Db  ],
      [ Note.B  , Note.D ],
      [ Note.C  , Note.Eb  ],
      [ Note.Db , Note.E ],
      [ Note.D  , Note.F  ],
      [ Note.Eb , Note.Gb  ],
      [ Note.E  , Note.G ],
      [ Note.F  , Note.Ab  ],
      [ Note.Gb , Note.A ],
      [ Note.G  , Note.Bb  ],
      [ Note.Ab , Note.B ],
    ]
    notePairs.forEach((n) => {
      expect(semiTonesBetweenNotesUpwards(n[0], n[1])).toEqual(3)
    })
  })

  it("returns a major third for notes four semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.Db  ],
      [ Note.Bb , Note.D  ],
      [ Note.B  , Note.Eb ],
      [ Note.C  , Note.E  ],
      [ Note.Db , Note.F ],
      [ Note.D  , Note.Gb  ],
      [ Note.Eb , Note.G  ],
      [ Note.E  , Note.Ab ],
      [ Note.F  , Note.A  ],
      [ Note.Gb , Note.Bb ],
      [ Note.G  , Note.B  ],
      [ Note.Ab , Note.C ],
    ]
    notePairs.forEach((n) => {
      expect(semiTonesBetweenNotesUpwards(n[0], n[1])).toEqual(4)
    })
  })

  it("returns a fourth for notes five semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.D  ],
      [ Note.Bb , Note.Eb  ],
      [ Note.B  , Note.E ],
      [ Note.C  , Note.F  ],
      [ Note.Db , Note.Gb ],
      [ Note.D  , Note.G  ],
      [ Note.Eb , Note.Ab  ],
      [ Note.E  , Note.A ],
      [ Note.F  , Note.Bb  ],
      [ Note.Gb , Note.B ],
      [ Note.G  , Note.C  ],
      [ Note.Ab , Note.Db ],
    ]
    notePairs.forEach((n) => {
      expect(semiTonesBetweenNotesUpwards(n[0], n[1])).toEqual(5)
    })
  })

  it("returns a diminished fifth for notes six semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.Eb  ],
      [ Note.Bb , Note.E  ],
      [ Note.B  , Note.F ],
      [ Note.C  , Note.Gb  ],
      [ Note.Db , Note.G ],
      [ Note.D  , Note.Ab  ],
      [ Note.Eb , Note.A  ],
      [ Note.E  , Note.Bb ],
      [ Note.F  , Note.B  ],
      [ Note.Gb , Note.C ],
      [ Note.G  , Note.Db  ],
      [ Note.Ab , Note.D ],
    ]
    notePairs.forEach((n) => {
      expect(semiTonesBetweenNotesUpwards(n[0], n[1])).toEqual(6)
    })
  })

  it("returns a perfect fifth for notes seven semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.E  ],
      [ Note.Bb , Note.F  ],
      [ Note.B  , Note.Gb ],
      [ Note.C  , Note.G  ],
      [ Note.Db , Note.Ab ],
      [ Note.D  , Note.A  ],
      [ Note.Eb , Note.Bb  ],
      [ Note.E  , Note.B ],
      [ Note.F  , Note.C  ],
      [ Note.Gb , Note.Db ],
      [ Note.G  , Note.D  ],
      [ Note.Ab , Note.Eb ],
    ]
    notePairs.forEach((n) => {
      expect(semiTonesBetweenNotesUpwards(n[0], n[1])).toEqual(7)
    })
  })

  it("returns a augmented fifth for notes eight semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.F  ],
      [ Note.Bb , Note.Gb  ],
      [ Note.B  , Note.G ],
      [ Note.C  , Note.Ab  ],
      [ Note.Db , Note.A ],
      [ Note.D  , Note.Bb  ],
      [ Note.Eb , Note.B  ],
      [ Note.E  , Note.C ],
      [ Note.F  , Note.Db  ],
      [ Note.Gb , Note.D ],
      [ Note.G  , Note.Eb  ],
      [ Note.Ab , Note.E ],
    ]
    notePairs.forEach((n) => {
      expect(semiTonesBetweenNotesUpwards(n[0], n[1])).toEqual(8)
    })
  })

  it("returns a sixth for notes nine semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.Gb  ],
      [ Note.Bb , Note.G  ],
      [ Note.B  , Note.Ab ],
      [ Note.C  , Note.A  ],
      [ Note.Db , Note.Bb ],
      [ Note.D  , Note.B  ],
      [ Note.Eb , Note.C  ],
      [ Note.E  , Note.Db ],
      [ Note.F  , Note.D  ],
      [ Note.Gb , Note.Eb ],
      [ Note.G  , Note.E  ],
      [ Note.Ab , Note.F ],
    ]
    notePairs.forEach((n) => {
      expect(semiTonesBetweenNotesUpwards(n[0], n[1])).toEqual(9)
    })
  })

  it("returns a minor seventh for notes 10 semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.G  ],
      [ Note.Bb , Note.Ab  ],
      [ Note.B  , Note.A ],
      [ Note.C  , Note.Bb  ],
      [ Note.Db , Note.B ],
      [ Note.D  , Note.C  ],
      [ Note.Eb , Note.Db  ],
      [ Note.E  , Note.D ],
      [ Note.F  , Note.Eb  ],
      [ Note.Gb , Note.E ],
      [ Note.G  , Note.F  ],
      [ Note.Ab , Note.Gb ],
    ]
    notePairs.forEach((n) => {
      expect(semiTonesBetweenNotesUpwards(n[0], n[1])).toEqual(10)
    })
  })

  it("returns a major seventh for notes 11 semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.Ab  ],
      [ Note.Bb , Note.A  ],
      [ Note.B  , Note.Bb ],
      [ Note.C  , Note.B  ],
      [ Note.Db , Note.C ],
      [ Note.D  , Note.Db  ],
      [ Note.Eb , Note.D  ],
      [ Note.E  , Note.Eb ],
      [ Note.F  , Note.E  ],
      [ Note.Gb , Note.F ],
      [ Note.G  , Note.Gb  ],
      [ Note.Ab , Note.G ],
    ]
    notePairs.forEach((n) => {
      expect(semiTonesBetweenNotesUpwards(n[0], n[1])).toEqual(11)
    })
  })
})

describe("intervalBetweenNotesUpwards", () => {

  it("returns Unison interval for unison notes", () => {
    expect(intervalBetweenNotesUpwards(Note.C, Note.C)).toEqual(Interval.Unison)
  })

  it("returns a minor second for notes next to eachother", () => {
    expect(intervalBetweenNotesUpwards(Note.A, Note.Bb)).toEqual( Interval.MinorSecond)
    expect(intervalBetweenNotesUpwards(Note.Bb, Note.B)).toEqual( Interval.MinorSecond)
    expect(intervalBetweenNotesUpwards(Note.B, Note.C)).toEqual(  Interval.MinorSecond)
    expect(intervalBetweenNotesUpwards(Note.C, Note.Db)).toEqual( Interval.MinorSecond)
    expect(intervalBetweenNotesUpwards(Note.Db, Note.D)).toEqual( Interval.MinorSecond)
    expect(intervalBetweenNotesUpwards(Note.D, Note.Eb)).toEqual( Interval.MinorSecond)
    expect(intervalBetweenNotesUpwards(Note.Eb, Note.E)).toEqual( Interval.MinorSecond)
    expect(intervalBetweenNotesUpwards(Note.E, Note.F)).toEqual(  Interval.MinorSecond)
    expect(intervalBetweenNotesUpwards(Note.F, Note.Gb)).toEqual( Interval.MinorSecond)
    expect(intervalBetweenNotesUpwards(Note.Gb, Note.G)).toEqual( Interval.MinorSecond)
    expect(intervalBetweenNotesUpwards(Note.G, Note.Ab)).toEqual( Interval.MinorSecond)
    expect(intervalBetweenNotesUpwards(Note.Ab, Note.A)).toEqual( Interval.MinorSecond)
  })

  it("returns a major second for notes next but one to eachother", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.B  ],
      [ Note.Bb , Note.C  ],
      [ Note.B  , Note.Db ],
      [ Note.C  , Note.D  ],
      [ Note.Db , Note.Eb ],
      [ Note.D  , Note.E  ],
      [ Note.Eb , Note.F  ],
      [ Note.E  , Note.Gb ],
      [ Note.F  , Note.G  ],
      [ Note.Gb , Note.Ab ],
      [ Note.G  , Note.A  ],
      [ Note.Ab , Note.Bb ],
    ]
    notePairs.forEach((n) => {
      expect(intervalBetweenNotesUpwards(n[0], n[1])).toEqual(Interval.MajorSecond)
    })
  })

  it("returns a minor third for notes three semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.C  ],
      [ Note.Bb , Note.Db  ],
      [ Note.B  , Note.D ],
      [ Note.C  , Note.Eb  ],
      [ Note.Db , Note.E ],
      [ Note.D  , Note.F  ],
      [ Note.Eb , Note.Gb  ],
      [ Note.E  , Note.G ],
      [ Note.F  , Note.Ab  ],
      [ Note.Gb , Note.A ],
      [ Note.G  , Note.Bb  ],
      [ Note.Ab , Note.B ],
    ]
    notePairs.forEach((n) => {
      expect(intervalBetweenNotesUpwards(n[0], n[1])).toEqual(Interval.MinorThird)
    })
  })

  it("returns a major third for notes four semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.Db  ],
      [ Note.Bb , Note.D  ],
      [ Note.B  , Note.Eb ],
      [ Note.C  , Note.E  ],
      [ Note.Db , Note.F ],
      [ Note.D  , Note.Gb  ],
      [ Note.Eb , Note.G  ],
      [ Note.E  , Note.Ab ],
      [ Note.F  , Note.A  ],
      [ Note.Gb , Note.Bb ],
      [ Note.G  , Note.B  ],
      [ Note.Ab , Note.C ],
    ]
    notePairs.forEach((n) => {
      expect(intervalBetweenNotesUpwards(n[0], n[1])).toEqual(Interval.MajorThird)
    })
  })

  it("returns a fourth for notes five semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.D  ],
      [ Note.Bb , Note.Eb  ],
      [ Note.B  , Note.E ],
      [ Note.C  , Note.F  ],
      [ Note.Db , Note.Gb ],
      [ Note.D  , Note.G  ],
      [ Note.Eb , Note.Ab  ],
      [ Note.E  , Note.A ],
      [ Note.F  , Note.Bb  ],
      [ Note.Gb , Note.B ],
      [ Note.G  , Note.C  ],
      [ Note.Ab , Note.Db ],
    ]
    notePairs.forEach((n) => {
      expect(intervalBetweenNotesUpwards(n[0], n[1])).toEqual(Interval.Fourth)
    })
  })

  it("returns a diminished fifth for notes six semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.Eb  ],
      [ Note.Bb , Note.E  ],
      [ Note.B  , Note.F ],
      [ Note.C  , Note.Gb  ],
      [ Note.Db , Note.G ],
      [ Note.D  , Note.Ab  ],
      [ Note.Eb , Note.A  ],
      [ Note.E  , Note.Bb ],
      [ Note.F  , Note.B  ],
      [ Note.Gb , Note.C ],
      [ Note.G  , Note.Db  ],
      [ Note.Ab , Note.D ],
    ]
    notePairs.forEach((n) => {
      expect(intervalBetweenNotesUpwards(n[0], n[1])).toEqual(Interval.DiminishedFifth)
    })
  })

  it("returns a perfect fifth for notes seven semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.E  ],
      [ Note.Bb , Note.F  ],
      [ Note.B  , Note.Gb ],
      [ Note.C  , Note.G  ],
      [ Note.Db , Note.Ab ],
      [ Note.D  , Note.A  ],
      [ Note.Eb , Note.Bb  ],
      [ Note.E  , Note.B ],
      [ Note.F  , Note.C  ],
      [ Note.Gb , Note.Db ],
      [ Note.G  , Note.D  ],
      [ Note.Ab , Note.Eb ],
    ]
    notePairs.forEach((n) => {
      expect(intervalBetweenNotesUpwards(n[0], n[1])).toEqual(Interval.PerfectFifth)
    })
  })

  it("returns a augmented fifth for notes eight semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.F  ],
      [ Note.Bb , Note.Gb  ],
      [ Note.B  , Note.G ],
      [ Note.C  , Note.Ab  ],
      [ Note.Db , Note.A ],
      [ Note.D  , Note.Bb  ],
      [ Note.Eb , Note.B  ],
      [ Note.E  , Note.C ],
      [ Note.F  , Note.Db  ],
      [ Note.Gb , Note.D ],
      [ Note.G  , Note.Eb  ],
      [ Note.Ab , Note.E ],
    ]
    notePairs.forEach((n) => {
      expect(intervalBetweenNotesUpwards(n[0], n[1])).toEqual(Interval.AugmentedFifth)
    })
  })

  it("returns a sixth for notes nine semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.Gb  ],
      [ Note.Bb , Note.G  ],
      [ Note.B  , Note.Ab ],
      [ Note.C  , Note.A  ],
      [ Note.Db , Note.Bb ],
      [ Note.D  , Note.B  ],
      [ Note.Eb , Note.C  ],
      [ Note.E  , Note.Db ],
      [ Note.F  , Note.D  ],
      [ Note.Gb , Note.Eb ],
      [ Note.G  , Note.E  ],
      [ Note.Ab , Note.F ],
    ]
    notePairs.forEach((n) => {
      expect(intervalBetweenNotesUpwards(n[0], n[1])).toEqual(Interval.Sixth)
    })
  })

  it("returns a minor seventh for notes 10 semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.G  ],
      [ Note.Bb , Note.Ab  ],
      [ Note.B  , Note.A ],
      [ Note.C  , Note.Bb  ],
      [ Note.Db , Note.B ],
      [ Note.D  , Note.C  ],
      [ Note.Eb , Note.Db  ],
      [ Note.E  , Note.D ],
      [ Note.F  , Note.Eb  ],
      [ Note.Gb , Note.E ],
      [ Note.G  , Note.F  ],
      [ Note.Ab , Note.Gb ],
    ]
    notePairs.forEach((n) => {
      expect(intervalBetweenNotesUpwards(n[0], n[1])).toEqual(Interval.MinorSeven)
    })
  })

  it("returns a major seventh for notes 11 semi tones apart", () => {
    const notePairs: Note[][] = [
      [ Note.A  , Note.Ab  ],
      [ Note.Bb , Note.A  ],
      [ Note.B  , Note.Bb ],
      [ Note.C  , Note.B  ],
      [ Note.Db , Note.C ],
      [ Note.D  , Note.Db  ],
      [ Note.Eb , Note.D  ],
      [ Note.E  , Note.Eb ],
      [ Note.F  , Note.E  ],
      [ Note.Gb , Note.F ],
      [ Note.G  , Note.Gb  ],
      [ Note.Ab , Note.G ],
    ]
    notePairs.forEach((n) => {
      expect(intervalBetweenNotesUpwards(n[0], n[1])).toEqual(Interval.MajorSeven)
    })
  })
})

describe("diatonicIntervalBetweenScaleDegreesUpwards", () => {
  it.each([
    [1, 1, DiatonicInterval.Unison],
    [1, 2, DiatonicInterval.Second],
    [1, 3, DiatonicInterval.Third],
    [1, 7, DiatonicInterval.Seventh],
    [2, 1, DiatonicInterval.Seventh],
    [2, 7, DiatonicInterval.Sixth],
    [3, 5, DiatonicInterval.Third],
    [4, 1, DiatonicInterval.Fifth],
    [5, 2, DiatonicInterval.Fifth],
  ])("seven note scale - returns correct interval for %s %s", (lower, upper, expected) => {
    const sevenNoteScale = diatonicScale(Note.C, Mode.Ionian)
    expect(diatonicIntervalBetweenScaleDegreesUpwards(sevenNoteScale, lower, upper))
      .toEqual(expected)
  })

  it.each([
    [1, 1, DiatonicInterval.Unison],
    [1, 2, DiatonicInterval.Second],
    [1, 3, DiatonicInterval.Third],
    [5, 1, DiatonicInterval.Second],
    [3, 1, DiatonicInterval.Fourth],
  ])("five note scale - returns correct interval for %s %s", (lower, upper, expected) => {
    const fiveNoteScale: Scale = {
      root: Note.C,
      intervals: [
        Interval.MajorSecond,
        Interval.MajorSecond,
        Interval.MinorSecond,
        Interval.MajorSecond,
        Interval.MajorSecond,
      ],
    }
    expect(diatonicIntervalBetweenScaleDegreesUpwards(fiveNoteScale, lower, upper))
      .toEqual(expected)
  })
})

describe("shiftNote", () => {

  it("should move a note by a fourth", () => {
    expect(shiftNote(Note.C, Interval.Fourth)).toEqual(Note.F)
  })

  it("should wrap around when shifting beyond a B", () => {
    expect(shiftNote(Note.A, Interval.MinorSeven)).toEqual(Note.G)
  })

  it("shifting by several intervals which make an octave gives the same note", () => {
    expect((() => {
      const n = Note.D
      const o = shiftNote(n, Interval.MajorThird)
      const p = shiftNote(o, Interval.MinorThird)
      const q = shiftNote(p, Interval.Fourth)
      return q
    })()).toEqual(Note.D)

    expect((() => {
      const n = Note.F
      const o = shiftNote(n, Interval.PerfectFifth)
      return shiftNote(o, Interval.Fourth)
    })()).toEqual(Note.F)
  })
})

describe("scaleTypeForMode", () => {
  it.each(
    [
      [Mode.Ionian, ScaleType.Major],
      [Mode.Dorian, ScaleType.Major],
      [Mode.Phrygian, ScaleType.Major],
      [Mode.Lydian, ScaleType.Major],
      [Mode.Mixolydian, ScaleType.Major],
      [Mode.Aeolian, ScaleType.Major],
      [Mode.Locrian, ScaleType.Major],
      [Mode.Ionian_b3, ScaleType.MelodicMinor],
      [Mode.Dorian_b2, ScaleType.MelodicMinor],
      [Mode.Phrygian_b1, ScaleType.MelodicMinor],
      [Mode.Lydian_b7, ScaleType.MelodicMinor],
      [Mode.Mixolydian_b6, ScaleType.MelodicMinor],
      [Mode.Aeolian_b5, ScaleType.MelodicMinor],
      [Mode.Locrian_b4, ScaleType.MelodicMinor],
      [Mode.Ionian_sharp5, ScaleType.HarmonicMinor],
      [Mode.Dorian_sharp4, ScaleType.HarmonicMinor],
      [Mode.Phrygian_natural3, ScaleType.HarmonicMinor],
      [Mode.Lydian_sharp2, ScaleType.HarmonicMinor],
      [Mode.Mixolydian_sharp1, ScaleType.HarmonicMinor],
      [Mode.Aeolian_natural7, ScaleType.HarmonicMinor],
      [Mode.Locrian_natural6, ScaleType.HarmonicMinor],
      [Mode.Ionian_b6, ScaleType.HarmonicMajor],
      [Mode.Dorian_b5, ScaleType.HarmonicMajor],
      [Mode.Phrygian_b4, ScaleType.HarmonicMajor],
      [Mode.Lydian_b3, ScaleType.HarmonicMajor],
      [Mode.Mixolydian_b2, ScaleType.HarmonicMajor],
      [Mode.Aeolian_b1, ScaleType.HarmonicMajor],
      [Mode.Locrian_bb7, ScaleType.HarmonicMajor],
    ],
  )("returns correct scale type for %s", (
    mode,
    expectedScaleType,
  ) => {
    expect(scaleTypeForMode(mode)).toEqual(expectedScaleType)
  })
})

describe("diatonicScale", () => {
  it.each(
    [
      [
        Note.C,
        Mode.Ionian_b3,
        [Note.C, Note.D, Note.Eb, Note.F, Note.G, Note.A, Note.B],
      ],
      [
        Note.D,
        Mode.Dorian_b2,
        [Note.D, Note.Eb, Note.F, Note.G, Note.A, Note.B, Note.C],
      ],
      [
        Note.Eb,
        Mode.Phrygian_b1,
        [Note.Eb, Note.F, Note.G, Note.A, Note.B, Note.C, Note.D],
      ],
      [
        Note.F,
        Mode.Lydian_b7,
        [Note.F, Note.G, Note.A, Note.B, Note.C, Note.D, Note.Eb],
      ],
      [
        Note.G,
        Mode.Mixolydian_b6,
        [Note.G, Note.A, Note.B, Note.C, Note.D, Note.Eb, Note.F],
      ],
      [
        Note.A,
        Mode.Aeolian_b5,
        [Note.A, Note.B, Note.C, Note.D, Note.Eb, Note.F, Note.G],
      ],
      [
        Note.B,
        Mode.Locrian_b4,
        [Note.B, Note.C, Note.D, Note.Eb, Note.F, Note.G, Note.A],
      ],

      [
        Note.C,
        Mode.Ionian_sharp5,
        [Note.C, Note.D, Note.E, Note.F, Note.Ab, Note.A, Note.B],
      ],
      [
        Note.D,
        Mode.Dorian_sharp4,
        [Note.D, Note.E, Note.F, Note.Ab, Note.A, Note.B, Note.C],
      ],
      [
        Note.E,
        Mode.Phrygian_natural3,
        [Note.E, Note.F, Note.Ab, Note.A, Note.B, Note.C, Note.D],
      ],
      [
        Note.F,
        Mode.Lydian_sharp2,
        [Note.F, Note.Ab, Note.A, Note.B, Note.C, Note.D, Note.E],
      ],
      [
        Note.Ab,
        Mode.Mixolydian_sharp1,
        [Note.Ab, Note.A, Note.B, Note.C, Note.D, Note.E, Note.F],
      ],
      [
        Note.A,
        Mode.Aeolian_natural7,
        [Note.A, Note.B, Note.C, Note.D, Note.E, Note.F, Note.Ab],
      ],
      [
        Note.B,
        Mode.Locrian_natural6,
        [Note.B, Note.C, Note.D, Note.E, Note.F, Note.Ab, Note.A],
      ],

      [
        Note.C,
        Mode.Ionian_b6,
        [Note.C, Note.D, Note.E, Note.F, Note.G, Note.Ab, Note.B],
      ],
      [
        Note.D,
        Mode.Dorian_b5,
        [Note.D, Note.E, Note.F, Note.G, Note.Ab, Note.B, Note.C],
      ],
      [
        Note.E,
        Mode.Phrygian_b4,
        [Note.E, Note.F, Note.G, Note.Ab, Note.B, Note.C, Note.D],
      ],
      [
        Note.F,
        Mode.Lydian_b3,
        [Note.F, Note.G, Note.Ab, Note.B, Note.C, Note.D, Note.E],
      ],
      [
        Note.G,
        Mode.Mixolydian_b2,
        [Note.G, Note.Ab, Note.B, Note.C, Note.D, Note.E, Note.F],
      ],
      [
        Note.Ab,
        Mode.Aeolian_b1,
        [Note.Ab, Note.B, Note.C, Note.D, Note.E, Note.F, Note.G],
      ],
      [
        Note.B,
        Mode.Locrian_bb7,
        [Note.B, Note.C, Note.D, Note.E, Note.F, Note.G, Note.Ab],
      ],
    ],
  )("gives the correct notes for one octave %s %s", (
      root,
      mode,
      expectedNotes,
  ) => {
    const s = diatonicScale(root, mode)
    expect(scaleNotes(s)).toEqual(expectedNotes)
  })
})

describe("scaleFromIonianRoot", () => {

  it.each(
    [
      ["CMajorIonian", Note.C, ScaleType.Major, 1, [Note.C, Note.D, Note.E, Note.F, Note.G, Note.A, Note.B]],
      ["CMajorAeolian", Note.C, ScaleType.Major, 6, [Note.A, Note.B, Note.C, Note.D, Note.E, Note.F, Note.G]],
      ["DMajorIonian", Note.D, ScaleType.Major, 1, [Note.D, Note.E, Note.Gb, Note.G, Note.A, Note.B, Note.Db]],

      [
        "CMelodicMinor_Ionian_b3",
        Note.C,
        ScaleType.MelodicMinor,
        1,
        [Note.C, Note.D, Note.Eb, Note.F, Note.G, Note.A, Note.B],
      ],
      [
        "CMelodicMinor_Dorian_b2",
        Note.C,
        ScaleType.MelodicMinor,
        2,
        [Note.D, Note.Eb, Note.F, Note.G, Note.A, Note.B, Note.C],
      ],

      [
        "CHarmonicMinor_Ionian_sharp5",
        Note.C,
        ScaleType.HarmonicMinor,
        1,
        [Note.C, Note.D, Note.E, Note.F, Note.Ab, Note.A, Note.B],
      ],
      [
        "CHarmonicMinor_Aeolian_natural7",
        Note.C,
        ScaleType.HarmonicMinor,
        6,
        [Note.A, Note.B, Note.C, Note.D, Note.E, Note.F, Note.Ab],
      ],

      [
        "CHarmonicMajor_Ionian_b6",
        Note.C,
        ScaleType.HarmonicMajor,
        1,
        [Note.C, Note.D, Note.E, Note.F, Note.G, Note.Ab, Note.B],
      ],
      [
        "CHarmonicMajor_Aeolian_b1",
        Note.C,
        ScaleType.HarmonicMajor,
        6,
        [Note.Ab, Note.B, Note.C, Note.D, Note.E, Note.F, Note.G],
      ],
    ],
  )("gives the correct notes for one octave %s", (
      _,
      root,
      scaleType,
      startingScaleDegree,
      expected,
  ) => {
    const s = scaleFromIonianRoot(root, scaleType, startingScaleDegree)
    expect(scaleNotes(s)).toEqual(expected)
  })
})

describe("scaleDegree", () => {
  it("should return a degree", () => {
    const AMajorScale: Scale = {
      root: Note.A,
      intervals: diatonicScaleIntervals(Mode.Ionian),
    }
    expect(scaleDegree(AMajorScale, 1)).toEqual(Note.A)
    expect(scaleDegree(AMajorScale, 2)).toEqual(Note.B)
    expect(scaleDegree(AMajorScale, 3)).toEqual(Note.Db)
    expect(scaleDegree(AMajorScale, 4)).toEqual(Note.D)
    expect(scaleDegree(AMajorScale, 5)).toEqual(Note.E)
    expect(scaleDegree(AMajorScale, 7)).toEqual(Note.Ab)
    expect(scaleDegree(AMajorScale, 9)).toEqual(Note.B)
    expect(scaleDegree(AMajorScale, 11)).toEqual(Note.D)
    expect(scaleDegree(AMajorScale, 13)).toEqual(Note.Gb)

    const GbMajorScale: Scale = {
      root: Note.Gb,
      intervals: diatonicScaleIntervals(Mode.Ionian),
    }
    expect(scaleDegree(GbMajorScale, 2)).toEqual(Note.Ab)
    expect(scaleDegree(GbMajorScale, 9)).toEqual(Note.Ab)
  })
})

describe("scaleDegreeNotes", () => {

  const cMajor: Scale = {
    root: Note.C,
    intervals: diatonicScaleIntervals(Mode.Ionian),
  }

  it("returns the selected degrees for one octave", () => {
    expect(scaleDegreeNotes(cMajor, [1, 3, 5, 7])).toEqual([
      Note.C, Note.E, Note.G, Note.B,
    ])
  })

  it("returns the selected degrees repeated across octaves", () => {
    expect(scaleDegreeNotes(cMajor, [1, 3, 5, 7], 2)).toEqual([
      Note.C, Note.E, Note.G, Note.B,
      Note.C, Note.E, Note.G, Note.B,
    ])
  })

  it("preserves the order of the given degrees", () => {
    expect(scaleDegreeNotes(cMajor, [5, 1, 3])).toEqual([
      Note.G, Note.C, Note.E,
    ])
  })

  it("matches scaleNotes when all degrees are given", () => {
    expect(scaleDegreeNotes(cMajor, [1, 2, 3, 4, 5, 6, 7], 2))
      .toEqual(scaleNotes(cMajor, 2))
  })
})

describe("voice leading chord", () => {

  it("should return its notes", () => {
    expect((() => {
      const cMaj: VoiceLeadingChord = {
        scale: diatonicScale(Note.C, Mode.Ionian),
        tones: [1,3,5],
      }
      return vlChordNotes(cMaj)
    })()).toEqual([Note.C, Note.E, Note.G])
  })

  it("should return its notes in order when its inverted", () => {
    expect((() => {
      const cMaj: VoiceLeadingChord = {
        scale: diatonicScale(Note.C, Mode.Ionian),
        tones: [3,1,5],
      }
      return vlChordNotes(cMaj)
    })()).toEqual([Note.E, Note.C, Note.G])

    expect((() => {
      const cMaj: VoiceLeadingChord = {
        scale: diatonicScale(Note.C, Mode.Ionian),
        tones: [3,5,1,7],
      }
      return vlChordNotes(cMaj)
    })()).toEqual([Note.E, Note.G, Note.C, Note.B])
  })
})

describe("shiftScaleDiatonically", () => {

  it("should change the scale of the chord by the step specified", () => {
    expect(
      shiftScaleDiatonically(
        diatonicScale(Note.C, Mode.Ionian),
        DiatonicInterval.Fourth,
      ),
    ).toEqual(
      diatonicScale(Note.F, Mode.Lydian),
    )

    expect(
      shiftScaleDiatonically(
        diatonicScale(Note.A, Mode.Aeolian),
        DiatonicInterval.Second,
      ),
    ).toEqual(
      diatonicScale(Note.B, Mode.Locrian),
    )

    expect(
      shiftScaleDiatonically(
        diatonicScale(Note.Gb, Mode.Lydian),
        DiatonicInterval.Seventh,
      ),
    ).toEqual(
      diatonicScale(Note.F, Mode.Phrygian),
    )

    expect(
      shiftScaleDiatonically(
        diatonicScale(Note.Eb, Mode.Mixolydian),
        DiatonicInterval.Sixth,
      ),
    ).toEqual(
      diatonicScale(Note.C, Mode.Phrygian),
    )
  })

  it("does not change the input scale", () => {
    const input = diatonicScale(Note.C, Mode.Ionian)
    shiftScaleDiatonically(input, DiatonicInterval.Fifth)

    expect(input).toEqual(diatonicScale(Note.C, Mode.Ionian))
  })
})

describe("shiftChordTonesByMap", () => {

  it("throws error when inversion map not specified", () => {
    expect(() => {shiftChordTonesByMap([5,1], new Map<number, number>())}).toThrow()
  })

  it("throws error when map does not have same number of entries as chord tones", () => {
    expect(() => {
      shiftChordTonesByMap(
        [5,1,3],
        new Map<number, number>(
          [
            [1,1],
            [1,1],
          ],
        ),
      )
    }).toThrow()
    expect(() => {
      shiftChordTonesByMap(
        [5,1,3],
        new Map<number, number>(
          [
            [1,1],
            [1,1],
            [1,1],
            [1,1],
          ],
        ),
      )
    }).toThrow()
  })


  it("throws error when there are chord tones which are not keys within the map", () => {
    expect(() => {
      shiftChordTonesByMap(
        [5,1,3],
        new Map<number, number>(
          [
            [1,1],
            [1,5],
            [1,3],
          ],
        ),
      )
    }).toThrow()
    expect(() => {
      shiftChordTonesByMap(
        [5,1,3],
        new Map<number, number>(
          [
            [5,1],
            [3,1],
            [2,1],
          ],
        ),
      )
    }).toThrow()
  })


  it("changes the chord tones according to the map", () => {
    expect(shiftChordTonesByMap(
      [5,1,3],
      new Map<number, number>(
        [
          [5,1],
          [1,3],
          [3,5],
        ],
      ),
    )).toEqual([1,3,5])

    expect(shiftChordTonesByMap(
      [5,1,3],
      new Map<number, number>(
        [
          [5,6],
          [1,2],
          [3,4],
        ],
      ),
    )).toEqual([6,2,4])
  })

  it("does not change the input tones after a shift", () => {

    const input = [1,2,3]

    shiftChordTonesByMap(
      input,
      new Map<number, number>(
        [
          [1,3],
          [2,4],
          [3,5],
        ],
      ),
    )
    expect(input).toEqual([1,2,3])
  })
})

describe("shiftChordToNextNearestInversion", () => {

  const CAeolian = diatonicScale(Note.C, Mode.Aeolian)

  it.each([
    [
      "Triad close",
      {scale: CAeolian, tones: [1,3,5]},
      {scale: CAeolian, tones: [3,5,1]},
    ],
    [
      "Triad close inverted",
      {scale: CAeolian, tones: [3,5,1]},
      {scale: CAeolian, tones: [5,1,3]},
    ],
    [
      "Triad open",
      {scale: CAeolian, tones: [3,1,5]},
      {scale: CAeolian, tones: [5,3,1]},
    ],
    [
      "Triad open inverted",
      {scale: CAeolian, tones: [5,3,1]},
      {scale: CAeolian, tones: [1,5,3]},
    ],
    [
      "1357",
      {scale: CAeolian, tones: [1,3,5,7]},
      {scale: CAeolian, tones: [3,5,7,1]},
    ],
    [
      "7135",
      {scale: CAeolian, tones: [7,1,3,5]},
      {scale: CAeolian, tones: [1,3,5,7]},
    ],
    [
      "1537",
      {scale: CAeolian, tones: [1,5,3,7]},
      {scale: CAeolian, tones: [3,7,5,1]},
    ],
    [
      "639",
      {scale: CAeolian, tones: [6,3,9]},
      {scale: CAeolian, tones: [9,6,3]},
    ],
  ])("returns correct chord %s", (
    _,
    input,
    expected,
  ) => {
    expect(shiftChordToNextNearestInversion(input)).toEqual(expected)
  })

  it.each([
    [
      "Triad close",
      {scale: CAeolian, tones: [1,3,5]},
      {scale: CAeolian, tones: [5,1,3]},
      2,
    ],
    [
      "1357",
      {scale: CAeolian, tones: [1,3,5,7]},
      {scale: CAeolian, tones: [7,1,3,5]},
      3,
    ],
    [
      "3175",
      {scale: CAeolian, tones: [3,1,7,5]},
      {scale: CAeolian, tones: [3,1,7,5]},
      4,
    ],
    [
      "3175",
      {scale: CAeolian, tones: [3,1,7,5]},
      {scale: CAeolian, tones: [1,7,5,3]},
      3,
    ],
    [
      "1537",
      {scale: CAeolian, tones: [1,5,3,7]},
      {scale: CAeolian, tones: [7,3,1,5]},
      3,
    ],
  ])("returns correct chord with multile shifts %s", (
    _,
    input,
    expected,
    numShifts
  ) => {
    expect(shiftChordToNextNearestInversion(input, numShifts)).toEqual(expected)
  })

  it("does not chage the input chord", () => {

    const inputChord: VoiceLeadingChord = {
      scale: diatonicScale(Note.A, Mode.Ionian_b3),
      tones: [1,3,5],
    }
    const expectedInputChord = cloneDeep(inputChord)
    shiftChordToNextNearestInversion(inputChord)
    expect(inputChord).toEqual(expectedInputChord)
  })
})

describe("createCycle", () => {

  it("creates cycle 2 with maximum number of chords", () => {
    const startingChord: VoiceLeadingChord = {
      scale: diatonicScale(Note.C, Mode.Ionian),
      tones: [1,3,5],
    }

    const cycle = createCycle(
      startingChord,
      DiatonicInterval.Second,
      new Map<number, number>(
        [
          [1, 5],
          [3, 1],
          [5, 3],
        ],
      ),
      3,
    )
    expect(cycle).toEqual([
      {
        scale: diatonicScale(Note.C, Mode.Ionian),
        tones: [1,3,5],
      },
      {
        scale: diatonicScale(Note.D, Mode.Dorian),
        tones: [5,1,3],
      },
      {
        scale: diatonicScale(Note.E, Mode.Phrygian),
        tones: [3,5,1],
      },
    ])
  })

  it("creates cycle 2 with no max specified", () => {
    const startingChord: VoiceLeadingChord = {
      scale: diatonicScale(Note.C, Mode.Ionian),
      tones: [1,3,5],
    }

    const cycle = createCycle(
      startingChord,
      DiatonicInterval.Second,
      new Map<number, number>(
        [
          [1, 5],
          [3, 1],
          [5, 3],
        ],
      ),
    )

    expect(cycle).toEqual([
      {scale: diatonicScale(Note.C, Mode.Ionian),      tones: [1,3,5]},
      {scale: diatonicScale(Note.D, Mode.Dorian),      tones: [5,1,3]},
      {scale: diatonicScale(Note.E, Mode.Phrygian),    tones: [3,5,1]},
      {scale: diatonicScale(Note.F, Mode.Lydian),      tones: [1,3,5]},
      {scale: diatonicScale(Note.G, Mode.Mixolydian),  tones: [5,1,3]},
      {scale: diatonicScale(Note.A, Mode.Aeolian),     tones: [3,5,1]},
      {scale: diatonicScale(Note.B, Mode.Locrian),     tones: [1,3,5]},
      {scale: diatonicScale(Note.C, Mode.Ionian),      tones: [5,1,3]},
      {scale: diatonicScale(Note.D, Mode.Dorian),      tones: [3,5,1]},
      {scale: diatonicScale(Note.E, Mode.Phrygian),    tones: [1,3,5]},
      {scale: diatonicScale(Note.F, Mode.Lydian),      tones: [5,1,3]},
      {scale: diatonicScale(Note.G, Mode.Mixolydian),  tones: [3,5,1]},
      {scale: diatonicScale(Note.A, Mode.Aeolian),     tones: [1,3,5]},
      {scale: diatonicScale(Note.B, Mode.Locrian),     tones: [5,1,3]},
      {scale: diatonicScale(Note.C, Mode.Ionian),      tones: [3,5,1]},
      {scale: diatonicScale(Note.D, Mode.Dorian),      tones: [1,3,5]},
      {scale: diatonicScale(Note.E, Mode.Phrygian),    tones: [5,1,3]},
      {scale: diatonicScale(Note.F, Mode.Lydian),      tones: [3,5,1]},
      {scale: diatonicScale(Note.G, Mode.Mixolydian),  tones: [1,3,5]},
      {scale: diatonicScale(Note.A, Mode.Aeolian),     tones: [5,1,3]},
      {scale: diatonicScale(Note.B, Mode.Locrian),     tones: [3,5,1]},
    ])
  })

  it("returns once the cycle reaches the starting chord if we havnt reached the max number of chords", () => {

    const startingChord: VoiceLeadingChord = {
      scale: diatonicScale(Note.C, Mode.Ionian),
      tones: [1,3,5],
    }

    const cycle = createCycle(
      startingChord,
      DiatonicInterval.Unison,
      new Map<number, number>(
        [
          [1, 3],
          [3, 5],
          [5, 1],
        ],
      ),
    )

    expect(cycle).toEqual([
      {scale: diatonicScale(Note.C, Mode.Ionian),      tones: [1,3,5]},
      {scale: diatonicScale(Note.C, Mode.Ionian),      tones: [3,5,1]},
      {scale: diatonicScale(Note.C, Mode.Ionian),      tones: [5,1,3]},
    ])
  })

})

describe("POC creating cycle2", () => {

  it("logs cycle 2 chord notes - triads; close voice", () => {

    let c: VoiceLeadingChord = {
      scale: diatonicScale(Note.C, Mode.Ionian),
      tones: [1, 5, 3],
    }

    for (let i=0; i < 10; i++) {
      c.tones = shiftChordTonesByMap(c.tones, new Map<number, number>(
        [
          [1, 5],
          [3, 1],
          [5, 3],
        ],
      ))

      c.scale = shiftScaleDiatonically(c.scale, DiatonicInterval.Second)
    }

  })

})

describe("normaliseVoicing", () => {

  const cMaj = diatonicScale(Note.C, Mode.Ionian)

  it.each(
    [
      ["a voicing already in the first octave", [1,3,5,7], [1,3,5,7]],
      ["a voicing sitting above the first octave", [8,10,12,14], [1,3,5,7]],
      ["a voicing sitting below the first octave", [-4,-2,1,7], [3,5,8,14]],
      ["a voicing straddling the first octave", [0,3,5,8], [7,10,12,15]],
    ],
  )("brings the lowest voice into the first octave for %s", (
    _,
    tones,
    expectedTones,
  ) => {
    expect(normaliseVoicing({scale: cMaj, tones: tones})).toEqual({
      scale: cMaj,
      tones: expectedTones,
    })
  })

  it("moves every voice by the same number of octaves, keeping the shape of the voicing", () => {
    const tones = [-4,-2,1,7]
    const normalised = normaliseVoicing({scale: cMaj, tones: tones}).tones

    const shifts = normalised.map((t, i) => t - tones[i])
    expect(shifts).toEqual([7,7,7,7])
  })
})

describe("invertVoicing", () => {

  const cMaj7: VoiceLeadingChord = {
    scale: diatonicScale(Note.C, Mode.Ionian),
    tones: [1,3,5,7],
  }

  it.each(
    [
      [0, [1,3,5,7],   [Note.C, Note.E, Note.G, Note.B]],
      [1, [3,5,7,8],   [Note.E, Note.G, Note.B, Note.C]],
      [2, [5,7,8,10],  [Note.G, Note.B, Note.C, Note.E]],
      [3, [7,8,10,12], [Note.B, Note.C, Note.E, Note.G]],
    ],
  )("takes the lowest voice up an octave %s times", (
    numInversions,
    expectedTones,
    expectedNotes,
  ) => {
    const inverted = invertVoicing(cMaj7, numInversions)
    expect(inverted.tones).toEqual(expectedTones)
    expect(vlChordNotes(inverted)).toEqual(expectedNotes)
  })

  it("returns to the original voicing after a full turn of inversions", () => {
    expect(invertVoicing(cMaj7, 4)).toEqual(cMaj7)
  })

  it("throws for a negative number of inversions", () => {
    expect(() => invertVoicing(cMaj7, -1)).toThrow(RangeError)
  })
})

describe("dropVoices", () => {

  const cMaj7: VoiceLeadingChord = {
    scale: diatonicScale(Note.C, Mode.Ionian),
    tones: [1,3,5,7],
  }

  it("drops the second voice from the top to the bottom", () => {
    expect(vlChordNotes(dropVoices(cMaj7, [2]))).toEqual(
      [Note.G, Note.C, Note.E, Note.B],
    )
  })

  it("drops the third voice from the top to the bottom", () => {
    expect(vlChordNotes(dropVoices(cMaj7, [3]))).toEqual(
      [Note.E, Note.C, Note.G, Note.B],
    )
  })

  it("drops the second and third voices from the top together", () => {
    expect(vlChordNotes(dropVoices(cMaj7, [2,3]))).toEqual(
      [Note.E, Note.G, Note.C, Note.B],
    )
  })

  it("throws when the voicing has no such voice", () => {
    expect(() => dropVoices(cMaj7, [5])).toThrow(RangeError)
    expect(() => dropVoices(cMaj7, [0])).toThrow(RangeError)
  })
})

describe("raiseVoices", () => {

  const cMaj7: VoiceLeadingChord = {
    scale: diatonicScale(Note.C, Mode.Ionian),
    tones: [1,3,5,7],
  }

  it("raises the second voice from the bottom to the top", () => {
    expect(vlChordNotes(raiseVoices(cMaj7, [2]))).toEqual(
      [Note.C, Note.G, Note.B, Note.E],
    )
  })

  it("raises the third voice from the bottom to the top", () => {
    expect(vlChordNotes(raiseVoices(cMaj7, [3]))).toEqual(
      [Note.C, Note.E, Note.B, Note.G],
    )
  })

  it("throws when the voicing has no such voice", () => {
    expect(() => raiseVoices(cMaj7, [5])).toThrow(RangeError)
    expect(() => raiseVoices(cMaj7, [0])).toThrow(RangeError)
  })
})

describe("tetradVoicing", () => {

  const cMaj7: VoiceLeadingChord = {
    scale: diatonicScale(Note.C, Mode.Ionian),
    tones: [1,3,5,7],
  }

  // the tones are checked as well as the notes, so that voicings which stack the same
  // notes in the same order but at different octaves are told apart
  it.each(
    [
      [TetradVoicing.Close, 0, [1,3,5,7],     [Note.C, Note.E, Note.G, Note.B]],
      [TetradVoicing.Close, 1, [3,5,7,8],     [Note.E, Note.G, Note.B, Note.C]],
      [TetradVoicing.Close, 2, [5,7,8,10],    [Note.G, Note.B, Note.C, Note.E]],
      [TetradVoicing.Close, 3, [7,8,10,12],   [Note.B, Note.C, Note.E, Note.G]],

      [TetradVoicing.Drop2, 0, [5,8,10,14],   [Note.G, Note.C, Note.E, Note.B]],
      [TetradVoicing.Drop2, 1, [7,10,12,15],  [Note.B, Note.E, Note.G, Note.C]],
      [TetradVoicing.Drop2, 2, [1,5,7,10],    [Note.C, Note.G, Note.B, Note.E]],
      [TetradVoicing.Drop2, 3, [3,7,8,12],    [Note.E, Note.B, Note.C, Note.G]],

      [TetradVoicing.Drop3, 0, [3,8,12,14],   [Note.E, Note.C, Note.G, Note.B]],
      [TetradVoicing.Drop3, 1, [5,10,14,15],  [Note.G, Note.E, Note.B, Note.C]],
      [TetradVoicing.Drop3, 2, [7,12,15,17],  [Note.B, Note.G, Note.C, Note.E]],
      [TetradVoicing.Drop3, 3, [1,7,10,12],   [Note.C, Note.B, Note.E, Note.G]],

      [TetradVoicing.Drop2And3, 0, [3,5,8,14],   [Note.E, Note.G, Note.C, Note.B]],
      [TetradVoicing.Drop2And3, 1, [5,7,10,15],  [Note.G, Note.B, Note.E, Note.C]],
      [TetradVoicing.Drop2And3, 2, [7,8,12,17],  [Note.B, Note.C, Note.G, Note.E]],
      [TetradVoicing.Drop2And3, 3, [1,3,7,12],   [Note.C, Note.E, Note.B, Note.G]],

      [TetradVoicing.Drop2And4, 0, [1,5,10,14],  [Note.C, Note.G, Note.E, Note.B]],
      [TetradVoicing.Drop2And4, 1, [3,7,12,15],  [Note.E, Note.B, Note.G, Note.C]],
      [TetradVoicing.Drop2And4, 2, [5,8,14,17],  [Note.G, Note.C, Note.B, Note.E]],
      [TetradVoicing.Drop2And4, 3, [7,10,15,19], [Note.B, Note.E, Note.C, Note.G]],

      [TetradVoicing.Spread, 0, [5,10,15,21],  [Note.G, Note.E, Note.C, Note.B]],
      [TetradVoicing.Spread, 1, [7,12,17,22],  [Note.B, Note.G, Note.E, Note.C]],
      [TetradVoicing.Spread, 2, [1,7,12,17],   [Note.C, Note.B, Note.G, Note.E]],
      [TetradVoicing.Spread, 3, [3,8,14,19],   [Note.E, Note.C, Note.B, Note.G]],
    ],
  )("gives the %s voicing in inversion %s", (
    voicing,
    inversion,
    expectedTones,
    expectedNotes,
  ) => {
    const voiced = tetradVoicing(cMaj7, voicing, inversion)
    expect(voiced.tones).toEqual(expectedTones)
    expect(vlChordNotes(voiced)).toEqual(expectedNotes)
  })

  it("gives a voicing per inversion for every voicing", () => {
    expect(tetradVoicings.length).toEqual(6)
    expect(numTetradVoices).toEqual(4)
  })

  it("throws when the chord is not a tetrad", () => {
    const cMaj: VoiceLeadingChord = {
      scale: diatonicScale(Note.C, Mode.Ionian),
      tones: [1,3,5],
    }
    expect(() => tetradVoicing(cMaj, TetradVoicing.Drop2, 0)).toThrow(RangeError)
  })
})

describe("voicingScaleDegrees", () => {

  const cMaj7: VoiceLeadingChord = {
    scale: diatonicScale(Note.C, Mode.Ionian),
    tones: [1,3,5,7],
  }

  it.each(
    [
      [TetradVoicing.Close, 0, [1,3,5,7]],
      [TetradVoicing.Close, 3, [7,1,3,5]],
      [TetradVoicing.Drop2, 0, [5,1,3,7]],
      [TetradVoicing.Drop3, 0, [3,1,5,7]],
      [TetradVoicing.Drop2And3, 0, [3,5,1,7]],
      [TetradVoicing.Drop2And4, 0, [1,5,3,7]],
      [TetradVoicing.Spread, 0, [5,3,1,7]],
      [TetradVoicing.Spread, 1, [7,5,3,1]],
    ],
  )("gives the order the %s voicing stacks its chord tones in, in inversion %s", (
    voicing,
    inversion,
    expectedDegrees,
  ) => {
    expect(voicingScaleDegrees(tetradVoicing(cMaj7, voicing, inversion)))
      .toEqual(expectedDegrees)
  })

  it("gives every order the four voices can be stacked in across the table", () => {
    const orders = new Set<string>()

    for (const voicing of tetradVoicings) {
      for (let inversion = 0; inversion < numTetradVoices; inversion++) {
        orders.add(voicingScaleDegrees(tetradVoicing(cMaj7, voicing, inversion)).join())
      }
    }

    expect(orders.size).toEqual(24)
  })
})
