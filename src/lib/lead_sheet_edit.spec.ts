import {
  LeadSheet,
  newSheet,
} from "./lead_sheet"

import {
  addChordToBar,
  barBelow,
  deleteBar,
  insertBar,
  nextBar,
  nextChord,
  nextChordInBar,
  previousChord,
  removeChord,
  setBeatsPerBar,
  setSection,
  tidyBar,
  trimEnd,
  withChord,
} from "./lead_sheet_edit"

const sheet = (...bars: string[][]): LeadSheet => ({
  ...newSheet("Test"),
  bars: bars.map((chords) => ({chords: chords})),
})

const chords = (s: LeadSheet) => s.bars.map((b) => b.chords)

describe("editing a lead sheet", () => {

  it("writes a chord in, leaving the sheet it was given alone", () => {
    const s = sheet(["Dm7"], [""])
    const t = withChord(s, {bar: 1, index: 0}, "G7")

    expect(chords(t)).toEqual([["Dm7"], ["G7"]])
    expect(chords(s)).toEqual([["Dm7"], [""]])
  })

  it("moves on within a bar, making room for another chord while the bar has beats", () => {
    let m = nextChordInBar(sheet(["Dm7"]), {bar: 0, index: 0})
    expect(chords(m.sheet)).toEqual([["Dm7", ""]])
    expect(m.at).toEqual({bar: 0, index: 1})

    // a full bar moves on to a new bar instead
    m = nextChordInBar(sheet(["A", "B", "C", "D"]), {bar: 0, index: 3})
    expect(chords(m.sheet)).toEqual([["A", "B", "C", "D"], [""]])
    expect(m.at).toEqual({bar: 1, index: 0})
  })

  it("moves on to the next bar, adding one at the end", () => {
    const s = sheet(["Dm7"], ["G7"])

    expect(nextBar(s, {bar: 0, index: 0})).toEqual({sheet: s, at: {bar: 1, index: 0}})

    const m = nextBar(s, {bar: 1, index: 0})
    expect(chords(m.sheet)).toEqual([["Dm7"], ["G7"], [""]])
    expect(m.at).toEqual({bar: 2, index: 0})
  })

  it("steps forward and back through the chords", () => {
    const s = sheet(["Dm7", "G7"], ["C"])

    expect(nextChord(s, {bar: 0, index: 0}).at).toEqual({bar: 0, index: 1})
    expect(nextChord(s, {bar: 0, index: 1}).at).toEqual({bar: 1, index: 0})
    expect(previousChord(s, {bar: 1, index: 0})).toEqual({bar: 0, index: 1})
    expect(previousChord(s, {bar: 0, index: 0})).toEqual({bar: 0, index: 0})
  })

  it("moves down a line to the nearest chord of the bar below", () => {
    const s = sheet(["A", "B"], ["C"], ["D"])

    expect(barBelow(s, {bar: 0, index: 1}, 2)).toEqual({bar: 2, index: 0})
    expect(barBelow(s, {bar: 1, index: 0}, 2)).toEqual({bar: 1, index: 0})
  })

  it("takes out the empty chords left in a bar", () => {
    expect(chords(tidyBar(sheet(["Dm7", "", "G7", ""]), 0))).toEqual([["Dm7", "G7"]])
    // but a bar with nothing in it keeps its one empty chord
    expect(chords(tidyBar(sheet(["", ""]), 0))).toEqual([["", ""]])
  })

  it("takes away the empty bars at the end", () => {
    expect(chords(trimEnd(sheet(["A"], [""], ["B"], [""], ["", ""])))).toEqual([["A"], [""], ["B"]])
    expect(chords(trimEnd(sheet([""], [""])))).toEqual([[""]])
  })

  it("removes a chord, then the bar once it is empty", () => {
    let m = removeChord(sheet(["Dm7", "G7"], ["C"]), {bar: 0, index: 1})
    expect(chords(m.sheet)).toEqual([["Dm7"], ["C"]])
    expect(m.at).toEqual({bar: 0, index: 0})

    m = removeChord(sheet(["Dm7", "G7"], [""]), {bar: 1, index: 0})
    expect(chords(m.sheet)).toEqual([["Dm7", "G7"]])
    expect(m.at).toEqual({bar: 0, index: 1})

    // the only bar stays
    m = removeChord(sheet(["C"]), {bar: 0, index: 0})
    expect(chords(m.sheet)).toEqual([[""]])
  })

  it("inserts and deletes bars", () => {
    let m = insertBar(sheet(["A"], ["B"]), 0)
    expect(chords(m.sheet)).toEqual([["A"], [""], ["B"]])
    expect(m.at).toEqual({bar: 1, index: 0})

    m = deleteBar(sheet(["A"], ["B", "C"], ["D"]), 2)
    expect(chords(m.sheet)).toEqual([["A"], ["B", "C"]])
    expect(m.at).toEqual({bar: 1, index: 1})

    m = deleteBar(sheet(["A"], ["B"]), 0)
    expect(chords(m.sheet)).toEqual([["B"]])
    expect(m.at).toEqual({bar: 0, index: 0})
  })

  it("adds a chord to a bar while it has beats to give it", () => {
    const m = addChordToBar(sheet(["A", "B"]), {bar: 0, index: 0})
    expect(chords(m.sheet)).toEqual([["A", "", "B"]])
    expect(m.at).toEqual({bar: 0, index: 1})

    const full = sheet(["A", "B", "C", "D"])
    expect(addChordToBar(full, {bar: 0, index: 0}).sheet).toBe(full)
  })

  it("marks and unmarks the start of a section", () => {
    const s = setSection(sheet(["A"]), 0, " B ")
    expect(s.bars[0]).toEqual({chords: ["A"], section: "B"})
    expect(setSection(s, 0, "").bars[0]).toEqual({chords: ["A"]})
  })

  it("keeps the chords a new time signature has no beats for, to bring back later", () => {
    const s = setBeatsPerBar(sheet(["A", "B", "C", "D"], ["E"]), 3)
    expect(s.beatsPerBar).toEqual(3)
    expect(chords(s)).toEqual([["A", "B", "C", "D"], ["E"]])
  })
})
