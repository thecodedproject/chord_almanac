import {
  Note
} from './chord_anthology'

import {
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
