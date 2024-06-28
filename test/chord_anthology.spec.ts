import {
  DiatonicInterval,
  Interval,
  Mode,
  Note,
  Scale,
  VoiceLeadingChord,
  createCycle,
  intervalBetweenNotesUpwards,
  majorScale,
  majorScaleIntervals,
  scaleDegree,
  semiTonesBetweenNotesUpwards,
  shiftChordTonesByMap,
  shiftNote,
  shiftScaleDiatonically,
  vlChordNotes,
} from "../src/chord_anthology"

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

describe("majorScaleIntervals", () => {
  it("should return correct intervals for all seven modes", () => {
    expect(majorScaleIntervals(Mode.Ionian)).toEqual([
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MinorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MinorSecond,
    ])
    expect(majorScaleIntervals(Mode.Dorian)).toEqual([
      Interval.MajorSecond,
      Interval.MinorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MinorSecond,
      Interval.MajorSecond,
    ])
    expect(majorScaleIntervals(Mode.Phrygian)).toEqual([
      Interval.MinorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MinorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
    ])
    expect(majorScaleIntervals(Mode.Lydian)).toEqual([
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MinorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MinorSecond,
    ])
    expect(majorScaleIntervals(Mode.Mixolydian)).toEqual([
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MinorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MinorSecond,
      Interval.MajorSecond,
    ])
    expect(majorScaleIntervals(Mode.Aeolian)).toEqual([
      Interval.MajorSecond,
      Interval.MinorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MinorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
    ])
    expect(majorScaleIntervals(Mode.Locrian)).toEqual([
      Interval.MinorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MinorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
      Interval.MajorSecond,
    ])
  })
})

describe("scaleDegree", () => {
  it("should return a degree", () => {
    const AMajorScale: Scale = {
      root: Note.A,
      intervals: majorScaleIntervals(Mode.Ionian),
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
      intervals: majorScaleIntervals(Mode.Ionian),
    }
    expect(scaleDegree(GbMajorScale, 2)).toEqual(Note.Ab)
    expect(scaleDegree(GbMajorScale, 9)).toEqual(Note.Ab)
  })
})

describe("voice leading chord", () => {

  it("should return its notes", () => {
    expect((() => {
      const cMaj: VoiceLeadingChord = {
        scale: majorScale(Note.C, Mode.Ionian),
        tones: [1,3,5],
      }
      return vlChordNotes(cMaj)
    })()).toEqual([Note.C, Note.E, Note.G])
  })

  it("should return its notes in order when its inverted", () => {
    expect((() => {
      const cMaj: VoiceLeadingChord = {
        scale: majorScale(Note.C, Mode.Ionian),
        tones: [3,1,5],
      }
      return vlChordNotes(cMaj)
    })()).toEqual([Note.E, Note.C, Note.G])

    expect((() => {
      const cMaj: VoiceLeadingChord = {
        scale: majorScale(Note.C, Mode.Ionian),
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
        majorScale(Note.C, Mode.Ionian),
        DiatonicInterval.Fourth,
      ),
    ).toEqual(
      majorScale(Note.F, Mode.Lydian),
    )

    expect(
      shiftScaleDiatonically(
        majorScale(Note.A, Mode.Aeolian),
        DiatonicInterval.Second,
      ),
    ).toEqual(
      majorScale(Note.B, Mode.Locrian),
    )

    expect(
      shiftScaleDiatonically(
        majorScale(Note.Gb, Mode.Lydian),
        DiatonicInterval.Seventh,
      ),
    ).toEqual(
      majorScale(Note.F, Mode.Phrygian),
    )

    expect(
      shiftScaleDiatonically(
        majorScale(Note.Eb, Mode.Mixolydian),
        DiatonicInterval.Sixth,
      ),
    ).toEqual(
      majorScale(Note.C, Mode.Phrygian),
    )
  })

  it("does not change the input scale", () => {
    const input = majorScale(Note.C, Mode.Ionian)
    shiftScaleDiatonically(input, DiatonicInterval.Fifth)

    expect(input).toEqual(majorScale(Note.C, Mode.Ionian))
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

describe("createCycle", () => {

  it("creates cycle 2 with maximum number of chords", () => {
    const startingChord: VoiceLeadingChord = {
      scale: majorScale(Note.C, Mode.Ionian),
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
        scale: majorScale(Note.C, Mode.Ionian),
        tones: [1,3,5],
      },
      {
        scale: majorScale(Note.D, Mode.Dorian),
        tones: [5,1,3],
      },
      {
        scale: majorScale(Note.E, Mode.Phrygian),
        tones: [3,5,1],
      },
    ])
  })

  it("creates cycle 2 with no max specified", () => {
    const startingChord: VoiceLeadingChord = {
      scale: majorScale(Note.C, Mode.Ionian),
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
      {scale: majorScale(Note.C, Mode.Ionian),      tones: [1,3,5]},
      {scale: majorScale(Note.D, Mode.Dorian),      tones: [5,1,3]},
      {scale: majorScale(Note.E, Mode.Phrygian),    tones: [3,5,1]},
      {scale: majorScale(Note.F, Mode.Lydian),      tones: [1,3,5]},
      {scale: majorScale(Note.G, Mode.Mixolydian),  tones: [5,1,3]},
      {scale: majorScale(Note.A, Mode.Aeolian),     tones: [3,5,1]},
      {scale: majorScale(Note.B, Mode.Locrian),     tones: [1,3,5]},
      {scale: majorScale(Note.C, Mode.Ionian),      tones: [5,1,3]},
      {scale: majorScale(Note.D, Mode.Dorian),      tones: [3,5,1]},
      {scale: majorScale(Note.E, Mode.Phrygian),    tones: [1,3,5]},
      {scale: majorScale(Note.F, Mode.Lydian),      tones: [5,1,3]},
      {scale: majorScale(Note.G, Mode.Mixolydian),  tones: [3,5,1]},
      {scale: majorScale(Note.A, Mode.Aeolian),     tones: [1,3,5]},
      {scale: majorScale(Note.B, Mode.Locrian),     tones: [5,1,3]},
      {scale: majorScale(Note.C, Mode.Ionian),      tones: [3,5,1]},
      {scale: majorScale(Note.D, Mode.Dorian),      tones: [1,3,5]},
      {scale: majorScale(Note.E, Mode.Phrygian),    tones: [5,1,3]},
      {scale: majorScale(Note.F, Mode.Lydian),      tones: [3,5,1]},
      {scale: majorScale(Note.G, Mode.Mixolydian),  tones: [1,3,5]},
      {scale: majorScale(Note.A, Mode.Aeolian),     tones: [5,1,3]},
      {scale: majorScale(Note.B, Mode.Locrian),     tones: [3,5,1]},
    ])
  })

  it("returns once the cycle reaches the starting chord if we havnt reached the max number of chords", () => {

    const startingChord: VoiceLeadingChord = {
      scale: majorScale(Note.C, Mode.Ionian),
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
      {scale: majorScale(Note.C, Mode.Ionian),      tones: [1,3,5]},
      {scale: majorScale(Note.C, Mode.Ionian),      tones: [3,5,1]},
      {scale: majorScale(Note.C, Mode.Ionian),      tones: [5,1,3]},
    ])
  })

})

describe("POC creating cycle2", () => {

  it("logs cycle 2 chord notes - triads; close voice", () => {

    let c: VoiceLeadingChord = {
      scale: majorScale(Note.C, Mode.Ionian),
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
