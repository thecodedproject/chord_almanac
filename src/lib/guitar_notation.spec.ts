import {
  Mode,
  Note,
  diatonicScale,
} from './chord_anthology'

import {
  sevenStringTuning,
  tabNotesForVoicing,
  tabNotesNPerString,
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
