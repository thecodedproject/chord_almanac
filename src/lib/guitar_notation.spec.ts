import {
  Mode,
  Note,
  ScaleType,
  diatonicScale,
  scaleFromIonianRoot,
} from './chord_anthology'

import {
  sevenStringTuning,
  tabChordInPosition,
  tabNotesForVoicing,
  tabNotesForVoicingCompact,
  tabNotesNPerString,
  tabScalePosition,
} from './guitar_notation'


describe("tabNoteAscending", () => {
  it("returns TabNotes for Notes on a single string", () => {
    expect(tabNotesNPerString([Note.C])).toEqual([
      {
        string: 6,
        fret: 8,
      },
    ])

    expect(tabNotesNPerString([
      Note.G,
      Note.A,
      Note.B,
    ])).toEqual([
      {string: 6, fret: 3},
      {string: 6, fret: 5},
      {string: 6, fret: 7},
    ])
  })

  it("always puts notes on ascending frets on a single string", () => {
    expect(tabNotesNPerString([
      Note.G,
      Note.A,
      Note.B,
      Note.E,
      Note.G,
    ], { notesPerString: 5 })).toEqual([
      {string: 6, fret: 3},
      {string: 6, fret: 5},
      {string: 6, fret: 7},
      {string: 6, fret: 12},
      {string: 6, fret: 15},
    ])
  })

  describe("will put notes on the 24th fret when", () => {
    it("gets 3 E notes", () => {
      expect(tabNotesNPerString([
        Note.E,
        Note.E,
        Note.E,
      ], { notesPerString: 3 })).toEqual([
        {string: 6, fret: 0},
        {string: 6, fret: 12},
        {string: 6, fret: 24},
      ])
    })

    it("gets three A notes to put on 3rd string", () => {
      expect(tabNotesNPerString([
        Note.A,
        Note.A,
        Note.A,
      ], { notesPerString: 3, startingString: 5 })).toEqual([
        {string: 5, fret: 0},
        {string: 5, fret: 12},
        {string: 5, fret: 24},
      ])
    })

    it("gets three D notes to put on 3rd string", () => {
      expect(tabNotesNPerString([
        Note.D,
        Note.D,
        Note.D,
      ], { notesPerString: 3, startingString: 4 })).toEqual([
        {string: 4, fret: 0},
        {string: 4, fret: 12},
        {string: 4, fret: 24},
      ])
    })

    it("gets three G notes to put on 3rd string", () => {
      expect(tabNotesNPerString([
        Note.G,
        Note.G,
        Note.G,
      ], { notesPerString: 3, startingString: 3 })).toEqual([
        {string: 3, fret: 0},
        {string: 3, fret: 12},
        {string: 3, fret: 24},
      ])
    })

    it("gets three B notes to put on second string", () => {
      expect(tabNotesNPerString([
        Note.B,
        Note.B,
        Note.B,
      ], { notesPerString: 3, startingString: 2 })).toEqual([
        {string: 2, fret: 0},
        {string: 2, fret: 12},
        {string: 2, fret: 24},
      ])
    })

    it("gets three E notes to put on 1st string", () => {
      expect(tabNotesNPerString([
        Note.E,
        Note.E,
        Note.E,
      ], { notesPerString: 3, startingString: 1 })).toEqual([
        {string: 1, fret: 0},
        {string: 1, fret: 12},
        {string: 1, fret: 24},
      ])
    })

    it("gets three Gs, Bs and Es to put on top three strings", () => {
      expect(tabNotesNPerString([
        Note.G,
        Note.G,
        Note.G,
        Note.B,
        Note.B,
        Note.B,
        Note.E,
        Note.E,
        Note.E,
      ], { notesPerString: 3, startingString: 3 })).toEqual([
        {string: 3, fret: 0},
        {string: 3, fret: 12},
        {string: 3, fret: 24},
        {string: 2, fret: 0},
        {string: 2, fret: 12},
        {string: 2, fret: 24},
        {string: 1, fret: 0},
        {string: 1, fret: 12},
        {string: 1, fret: 24},
      ])
    })
  })

  it("will put multiples of the same note on different strings", () => {
    expect(tabNotesNPerString([
      Note.E,
      Note.E,
      Note.E,
      Note.E,
      Note.E,
      Note.E,
      Note.E,
      Note.E,
      Note.E,
      Note.E,
      Note.E,
      Note.E,
    ], { notesPerString: 2, startingString: 6 })).toEqual([
      {string: 6, fret: 0},
      {string: 6, fret: 12},
      {string: 5, fret: 7},
      {string: 5, fret: 19},
      {string: 4, fret: 2},
      {string: 4, fret: 14},
      {string: 3, fret: 9},
      {string: 3, fret: 21},
      {string: 2, fret: 5},
      {string: 2, fret: 17},
      {string: 1, fret: 0},
      {string: 1, fret: 12},
    ])
  })

  it("returns TabNotes for Notes on multiple strings - one note per string", () => {

    expect(tabNotesNPerString([
      Note.C,
      Note.D,
      Note.E,
      Note.F,
    ], { notesPerString: 1 })).toEqual([
      {string: 6, fret: 8},
      {string: 5, fret: 5},
      {string: 4, fret: 2},
      {string: 3, fret: 10},
    ])
  })

  it("returns TabNotes for Notes on multiple strings - three notes per string", () => {
    expect(tabNotesNPerString([
      Note.C,
      Note.D,
      Note.E,
      Note.F,
      Note.G,
      Note.A,
      Note.B,
      Note.C,
    ])).toEqual([
      {string: 6, fret: 8},
      {string: 6, fret: 10},
      {string: 6, fret: 12},
      {string: 5, fret: 8},
      {string: 5, fret: 10},
      {string: 5, fret: 12},
      {string: 4, fret: 9},
      {string: 4, fret: 10},
    ])
  })

  it("places any extra notes on the top string if there are still more notes", () => {
    expect(tabNotesNPerString([
      Note.C,
      Note.D,
      Note.E,
      Note.F,
      Note.G,
      Note.A,
      Note.B,
      Note.C,
      Note.F,
      Note.Bb,
      Note.Eb,
      Note.E,
    ], { notesPerString: 3, startingString: 2 })).toEqual([
      {string: 2, fret: 1},
      {string: 2, fret: 3},
      {string: 2, fret: 5},
      {string: 1, fret: 1},
      {string: 1, fret: 3},
      {string: 1, fret: 5},
      {string: 1, fret: 7},
      {string: 1, fret: 8},
      {string: 1, fret: 13},
      {string: 1, fret: 18},
      {string: 1, fret: 23},
      {string: 1, fret: 24},
    ])
  })

  it("throws if one of the notes would be beyond the 24th fret", () => {
    expect((() => {
      tabNotesNPerString([Note.D,
        Note.D,
        Note.D,
        Note.G,
      ], { notesPerString: 4, startingString: 4 })
    })).toThrow()
  })

  describe("with trimExcess: true", () => {
    it("stops once the top string has notesPerString notes", () => {
      expect(tabNotesNPerString([
        Note.C,
        Note.D,
        Note.E,
        Note.F,
        Note.G,
        Note.A,
        Note.B,
        Note.C,
        Note.F,
        Note.Bb,
        Note.Eb,
        Note.E,
      ], { notesPerString: 3, startingString: 2, trimExcess: true })).toEqual([
        {string: 2, fret: 1},
        {string: 2, fret: 3},
        {string: 2, fret: 5},
        {string: 1, fret: 1},
        {string: 1, fret: 3},
        {string: 1, fret: 5},
      ])
    })

    it("returns all notes when input length equals capacity", () => {
      expect(tabNotesNPerString([
        Note.C,
        Note.D,
        Note.E,
        Note.F,
        Note.G,
        Note.A,
      ], { notesPerString: 3, startingString: 2, trimExcess: true })).toEqual([
        {string: 2, fret: 1},
        {string: 2, fret: 3},
        {string: 2, fret: 5},
        {string: 1, fret: 1},
        {string: 1, fret: 3},
        {string: 1, fret: 5},
      ])
    })

    it("is a no-op when input length is below capacity", () => {
      expect(tabNotesNPerString([
        Note.C,
        Note.D,
        Note.E,
        Note.F,
      ], { notesPerString: 1, trimExcess: true })).toEqual([
        {string: 6, fret: 8},
        {string: 5, fret: 5},
        {string: 4, fret: 2},
        {string: 3, fret: 10},
      ])
    })
  })
})

describe("tabNotesForVoicing", () => {

  const cMaj = diatonicScale(Note.C, Mode.Ionian)

  it("tabs a close Cmaj7 as the open chord shape", () => {
    expect(tabNotesForVoicing(
      {scale: cMaj, tones: [1,3,5,7]},
      {strings: [5,4,3,2]},
    )).toEqual([
      {string: 5, fret: 3},
      {string: 4, fret: 2},
      {string: 3, fret: 0},
      {string: 2, fret: 0},
    ])
  })

  it("frets each voice at its own interval above the lowest voice", () => {
    // drop 3 Cmaj7 - the dropped E leaves an octave below the C, so the C, G and B
    // above it have to be fretted an octave up
    expect(tabNotesForVoicing(
      {scale: cMaj, tones: [3,8,12,14]},
      {strings: [5,4,3,2]},
    )).toEqual([
      {string: 5, fret: 7},
      {string: 4, fret: 10},
      {string: 3, fret: 12},
      {string: 2, fret: 12},
    ])
  })

  it("moves the voicing up the neck when its shape does not fit lower down", () => {
    // the B and C of this close voicing are a semitone apart, so the B cannot be
    // played at the 2nd fret - the C above it would fall off the bottom of the D string
    expect(tabNotesForVoicing(
      {scale: cMaj, tones: [7,8,10,12]},
      {strings: [5,4,3,2]},
    )).toEqual([
      {string: 5, fret: 14},
      {string: 4, fret: 10},
      {string: 3, fret: 9},
      {string: 2, fret: 8},
    ])
  })

  it("puts one voice on each of the given strings, from the lowest voice up", () => {
    const tabbed = tabNotesForVoicing(
      {scale: cMaj, tones: [5,8,10,14]},
      {strings: [5,3,2,1]},
    )
    expect(tabbed.map((t) => t.string)).toEqual([5,3,2,1])
  })

  it("draws a wide voicing in closer when a skipped string gives it more room", () => {
    // drop 3 Cmaj7 - the gap between its bottom two voices is what the skipped 5th
    // string is there for, and it pulls the shape from five frets wide down to two
    expect(tabNotesForVoicing(
      {scale: cMaj, tones: [3,8,12,14]},
      {strings: [6,5,4,3]},
    )).toEqual([
      {string: 6, fret: 0},
      {string: 5, fret: 3},
      {string: 4, fret: 5},
      {string: 3, fret: 4},
    ])

    expect(tabNotesForVoicing(
      {scale: cMaj, tones: [3,8,12,14]},
      {strings: [6,4,3,2]},
    )).toEqual([
      {string: 6, fret: 12},
      {string: 4, fret: 10},
      {string: 3, fret: 12},
      {string: 2, fret: 12},
    ])
  })

  it("defaults to the lowest strings of the tuning", () => {
    expect(tabNotesForVoicing({scale: diatonicScale(Note.E, Mode.Ionian), tones: [1]}))
      .toEqual([{string: 6, fret: 0}])
  })

  it("tabs against the given tuning", () => {
    expect(tabNotesForVoicing(
      {scale: diatonicScale(Note.B, Mode.Ionian), tones: [1,4]},
      {tuning: sevenStringTuning, strings: [7,6]},
    )).toEqual([
      {string: 7, fret: 0},
      {string: 6, fret: 0},
    ])
  })

  it("throws when there are more voices than strings to put them on", () => {
    expect(() => tabNotesForVoicing(
      {scale: cMaj, tones: [1,3,5,7]},
      {strings: [3,2,1]},
    )).toThrow(RangeError)
  })

  it("throws when given a string the guitar does not have", () => {
    expect(() => tabNotesForVoicing(
      {scale: cMaj, tones: [1,3]},
      {strings: [7,6]},
    )).toThrow(RangeError)
  })

  it("throws when the strings are not given from the lowest sounding up", () => {
    expect(() => tabNotesForVoicing(
      {scale: cMaj, tones: [1,3]},
      {strings: [3,4]},
    )).toThrow(RangeError)
  })

  it("throws when the voicing does not fit on the fret board", () => {
    // the two voices are three octaves apart, which is further than two neighbouring
    // strings can reach
    expect(() => tabNotesForVoicing(
      {scale: cMaj, tones: [1,22]},
      {strings: [2,1]},
    )).toThrow(RangeError)
  })
})

describe("tabNotesForVoicingCompact", () => {

  const cMaj = diatonicScale(Note.C, Mode.Ionian)
  const dDorian = diatonicScale(Note.D, Mode.Dorian)

  const fretSpanOf = (tab: {fret: number}[]) => {
    const fretted = tab.map((n) => n.fret).filter((f) => f > 0)
    return Math.max(...fretted) - Math.min(...fretted)
  }

  it("takes a stranded note up an octave to sit with the rest of the shape", () => {
    // the drop 2 Dm7 in 2nd inversion, D A C F: tabbed at its exact pitches its F is
    // left on the 1st fret, nine frets below the rest of the chord
    const dm7 = {scale: dDorian, tones: [1,5,7,10]}
    const strings = [6,5,4,1]

    expect(tabNotesForVoicing(dm7, {strings: strings})).toEqual([
      {string: 6, fret: 10},
      {string: 5, fret: 12},
      {string: 4, fret: 10},
      {string: 1, fret: 1},
    ])

    expect(tabNotesForVoicingCompact(dm7, {strings: strings})).toEqual([
      {string: 6, fret: 10},
      {string: 5, fret: 12},
      {string: 4, fret: 10},
      {string: 1, fret: 13},
    ])
  })

  it("plays an open string only when the rest of the shape is down by the nut", () => {
    // the drop 2 Cmaj7 in 3rd inversion, E B C G: its E could be the open 6th string,
    // but the rest of the chord is up at the 10th to 14th frets, so it is played at the
    // 12th alongside them
    expect(tabNotesForVoicingCompact(
      {scale: cMaj, tones: [3,7,8,12]},
      {strings: [6,5,4,3]},
    )).toEqual([
      {string: 6, fret: 12},
      {string: 5, fret: 14},
      {string: 4, fret: 10},
      {string: 3, fret: 12},
    ])

    // whereas the open Cmaj7 shape keeps its open strings
    expect(tabNotesForVoicingCompact(
      {scale: cMaj, tones: [1,3,5,7]},
      {strings: [5,4,3,2]},
    )).toEqual([
      {string: 5, fret: 3},
      {string: 4, fret: 2},
      {string: 3, fret: 0},
      {string: 2, fret: 0},
    ])
  })

  it("tabs a voicing which suits its strings just as tabNotesForVoicing does", () => {
    for (const tones of [[1,3,5,7], [3,8,12,14], [5,8,10,14]]) {
      const chord = {scale: cMaj, tones: tones}
      expect(tabNotesForVoicingCompact(chord, {strings: [5,4,3,2]})).toEqual(
        tabNotesForVoicing(chord, {strings: [5,4,3,2]}),
      )
    }
  })

  it("never stretches further than tabNotesForVoicing", () => {
    for (const strings of [[6,5,4,1], [6,5,2,1], [6,3,2,1], [6,4,3,1]]) {
      for (const tones of [[1,3,5,7], [5,8,10,14], [3,8,12,14], [1,5,10,14]]) {
        const chord = {scale: cMaj, tones: tones}
        expect(fretSpanOf(tabNotesForVoicingCompact(chord, {strings: strings})))
          .toBeLessThanOrEqual(fretSpanOf(tabNotesForVoicing(chord, {strings: strings})))
      }
    }
  })

  it("keeps the notes climbing from the lowest string to the highest", () => {
    const openPitches: Record<number, number> = {6: 0, 5: 5, 4: 10, 3: 15, 2: 19, 1: 24}

    for (const strings of [[6,5,4,1], [6,5,2,1], [6,3,2,1], [5,4,3,2]]) {
      for (const tones of [[1,3,5,7], [5,8,10,14], [3,8,12,14], [1,5,10,14]]) {
        const pitches = tabNotesForVoicingCompact(
          {scale: cMaj, tones: tones},
          {strings: strings},
        ).map((n) => openPitches[n.string] + n.fret)

        expect(pitches).toEqual([...pitches].sort((a, b) => a-b))
        expect(new Set(pitches).size).toEqual(pitches.length)
      }
    }
  })

  it("takes the shape lower on the neck between two of the same stretch", () => {
    // a C on its own can be played at the 8th or the 20th fret of the 6th string
    expect(tabNotesForVoicingCompact({scale: cMaj, tones: [1]}, {strings: [6]}))
      .toEqual([{string: 6, fret: 8}])
  })

  it("throws when the voicing does not fit on the strings", () => {
    expect(() => tabNotesForVoicingCompact(
      {scale: cMaj, tones: [1,3,5,7]},
      {strings: [6,5,4]},
    )).toThrow(RangeError)
  })
})

describe("tabScalePosition", () => {

  // C major taken from each of its degrees, which is what the positions are numbered by
  const cMajorPosition = (pos: number) =>
    scaleFromIonianRoot(Note.C, ScaleType.Major, pos)

  // the fret every note of a string is played at, string by string from the lowest up
  function fretsByString(tab: {string: number, fret: number}[]): number[][] {

    const frets: number[][] = []

    for (const n of tab) {
      const iString = frets.length - 1
      if (iString < 0 || tab[0].string - n.string !== iString) {
        frets.push([n.fret])
      } else {
        frets[iString].push(n.fret)
      }
    }

    return frets
  }

  it("puts three notes on every string, from the lowest string up", () => {
    const tab = tabScalePosition(cMajorPosition(1))

    expect(tab).toHaveLength(18)
    expect(tab.map((n) => n.string)).toEqual([
      6,6,6, 5,5,5, 4,4,4, 3,3,3, 2,2,2, 1,1,1,
    ])
  })

  it("plays the first position of C major from the 8th fret", () => {
    expect(fretsByString(tabScalePosition(cMajorPosition(1)))).toEqual([
      [8, 10, 12],
      [8, 10, 12],
      [9, 10, 12],
      [9, 10, 12],
      [10, 12, 13],
      [10, 12, 13],
    ])
  })

  it("keeps the whole position under one hand as it climbs the strings", () => {

    // the second position starts on the D of the 10th fret; every string carries on
    // from the one below it rather than dropping back down to the nut
    expect(fretsByString(tabScalePosition(cMajorPosition(2)))).toEqual([
      [10, 12, 13],
      [10, 12, 14],
      [10, 12, 14],
      [10, 12, 14],
      [12, 13, 15],
      [12, 13, 15],
    ])
  })

  it("climbs the scale a note at a time, never repeating or skipping one", () => {
    const tab = tabScalePosition(cMajorPosition(1))

    // eighteen notes of the major scale climb two octaves and a fourth, so the top of
    // the position sounds 29 semitones above its bottom whichever strings they are on
    const pitches = tab.map((n) => n.fret + [0,5,10,15,19,24][6 - n.string])

    expect(pitches[0]).toEqual(8)
    expect(pitches[pitches.length-1]).toEqual(8 + 29)

    for (let i=1; i < pitches.length; i++) {
      expect(pitches[i] - pitches[i-1]).toBeGreaterThanOrEqual(1)
      expect(pitches[i] - pitches[i-1]).toBeLessThanOrEqual(2)
    }
  })

  it("plays a position rooted at the nut an octave up, so it fits on the board", () => {

    // E locrian b4 starts on the open sixth string, which leaves the note after its
    // third under the nut of the fifth - the shape is played from the 12th fret instead
    const tab = tabScalePosition(scaleFromIonianRoot(Note.F, ScaleType.MelodicMinor, 7))

    expect(Math.min(...tab.map((n) => n.fret))).toBeGreaterThanOrEqual(0)
    expect(fretsByString(tab)[0]).toEqual([12, 13, 15])
  })

  it("tabs as many notes to a string as it is asked for", () => {
    const tab = tabScalePosition(cMajorPosition(1), {notesPerString: 2})

    expect(tab).toHaveLength(12)
    expect(fretsByString(tab)).toEqual([
      [8, 10],
      [7, 8],
      [5, 7],
      [4, 5],
      [3, 5],
      [1, 3],
    ])
  })

  it("starts from the string it is given, and tabs only the strings above it", () => {
    const tab = tabScalePosition(cMajorPosition(1), {startingString: 3})

    expect(tab).toHaveLength(9)
    expect(tab.map((n) => n.string)).toEqual([3,3,3, 2,2,2, 1,1,1])
  })

  it("tabs against the given tuning", () => {
    const tab = tabScalePosition(cMajorPosition(1), {tuning: sevenStringTuning})

    expect(tab).toHaveLength(21)

    // the seventh string is a B, so the position starts from the C a fret above it
    expect(tab[0]).toEqual({string: 7, fret: 1})
  })

  it("throws when the position runs off the end of the fret board", () => {
    expect(() => {
      tabScalePosition(cMajorPosition(1), {maxFret: 11})
    }).toThrow(RangeError)
  })

  it("throws when asked to start from a string the guitar does not have", () => {
    expect(() => {
      tabScalePosition(cMajorPosition(1), {startingString: 7})
    }).toThrow(RangeError)
  })
})

describe("tabChordInPosition", () => {

  const cIonian = scaleFromIonianRoot(Note.C, ScaleType.Major, 1)

  const cMajorPosition = tabScalePosition(cIonian)

  const tetradDegrees = [1,3,5,7]

  // which note of the position each tab note is, counting from its lowest
  function positionDegreesOf(tab: {string: number, fret: number}[]): number[] {
    return tab.map((n) => cMajorPosition.findIndex(
      (p) => p.string === n.string && p.fret === n.fret,
    ) + 1)
  }

  it("takes the chord right through the position, not just its lowest four notes", () => {

    // the Cmaj7 is played at every C, E, G and B the first position covers
    expect(positionDegreesOf(
      tabChordInPosition(cIonian, cMajorPosition, 1, tetradDegrees),
    )).toEqual([1, 3, 5, 7, 8, 10, 12, 14, 15, 17])
  })

  it("opens on the chord tone the position reaches first, root or not", () => {

    // the Fmaj7 of the first position is F A C E, but the position starts on a C, so
    // the line runs C E F A from the bottom of the neck up
    const tab = tabChordInPosition(cIonian, cMajorPosition, 4, tetradDegrees)

    expect(positionDegreesOf(tab)).toEqual([1, 3, 4, 6, 8, 10, 11, 13, 15, 17, 18])

    expect(tab.slice(0, 4)).toEqual([
      {string: 6, fret: 8},
      {string: 6, fret: 12},
      {string: 5, fret: 8},
      {string: 5, fret: 12},
    ])
  })

  it("plays four different notes, however many times the position reaches them", () => {

    for (let rootDegree = 1; rootDegree < 8; rootDegree++) {

      const tab = tabChordInPosition(cIonian, cMajorPosition, rootDegree, tetradDegrees)

      // the position covers between two and three of each degree of the scale
      expect(tab.length).toBeGreaterThanOrEqual(8)
      expect(tab.length).toBeLessThanOrEqual(12)

      // every note of it is one of the four the chord is made of
      const degrees = new Set(positionDegreesOf(tab).map((d) => (d-1)%7))
      expect(degrees.size).toEqual(4)
    }
  })

  it("climbs the position, never doubling back on itself", () => {

    const degrees = positionDegreesOf(
      tabChordInPosition(cIonian, cMajorPosition, 5, tetradDegrees),
    )

    for (let i=1; i < degrees.length; i++) {
      expect(degrees[i]).toBeGreaterThan(degrees[i-1])
    }
  })

  it("only ever returns notes the position itself holds", () => {
    for (let rootDegree = 1; rootDegree < 8; rootDegree++) {
      for (const note of tabChordInPosition(cIonian, cMajorPosition, rootDegree, tetradDegrees)) {
        expect(cMajorPosition).toContainEqual(note)
      }
    }
  })

  it("takes only the degrees asked for", () => {

    // a bare fifth, which the first position reaches three Cs and two Gs of
    expect(positionDegreesOf(
      tabChordInPosition(cIonian, cMajorPosition, 1, [1,5]),
    )).toEqual([1, 5, 8, 12, 15])
  })

  it("counts a chord degree past the octave as the one it sounds", () => {

    // the ninth sounds the second, so a chord reaching for it plays the same notes as
    // one built on the second itself
    expect(tabChordInPosition(cIonian, cMajorPosition, 1, [1,3,5,9])).toEqual(
      tabChordInPosition(cIonian, cMajorPosition, 1, [1,2,3,5]),
    )
  })

  it("throws when rooted below the first degree of the scale", () => {
    expect(() => {
      tabChordInPosition(cIonian, cMajorPosition, 0, tetradDegrees)
    }).toThrow(RangeError)
  })

  it("throws when asked for a chord degree below the first", () => {
    expect(() => {
      tabChordInPosition(cIonian, cMajorPosition, 1, [0,3,5,7])
    }).toThrow(RangeError)
  })
})
