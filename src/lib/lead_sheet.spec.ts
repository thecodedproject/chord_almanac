import {
  LeadSheet,
  chordAtBeat,
  chordBeats,
  exampleSheet,
  newSheet,
  playedChords,
  sheetChords,
  sheetLoop,
  validateSheet,
} from "./lead_sheet"

const sheet = (bars: string[][], beatsPerBar = 4): LeadSheet => ({
  ...newSheet("Test"),
  beatsPerBar: beatsPerBar,
  bars: bars.map((chords) => ({chords: chords})),
})

describe("chordBeats", () => {
  it.each([
    [1, 4, [4]],
    [2, 4, [2, 2]],
    [3, 4, [2, 1, 1]],
    [4, 4, [1, 1, 1, 1]],
    [2, 3, [2, 1]],
    [5, 4, [1, 1, 1, 1]],
    [0, 4, [4]],
  ])("shares %i chords over %i beats as %p", (n, beats, expected) => {
    expect(chordBeats(n, beats)).toEqual(expected)
  })
})

describe("sheetChords", () => {
  it("places each chord on the beat it starts on", () => {
    const chords = sheetChords(sheet([["Dm7", "G7"], ["Cmaj7"], ["A", "B", "C"]]))

    expect(chords.map((c) => [c.text, c.bar, c.index, c.beat, c.beats])).toEqual([
      ["Dm7", 0, 0, 0, 2],
      ["G7", 0, 1, 2, 2],
      ["Cmaj7", 1, 0, 4, 4],
      ["A", 2, 0, 8, 2],
      ["B", 2, 1, 10, 1],
      ["C", 2, 2, 11, 1],
    ])
  })

  it("finds the chord sounding on a beat", () => {
    const chords = sheetChords(sheet([["Dm7", "G7"], ["Cmaj7"]]))

    expect(chordAtBeat(chords, 0)?.text).toEqual("Dm7")
    expect(chordAtBeat(chords, 3)?.text).toEqual("G7")
    expect(chordAtBeat(chords, 7)?.text).toEqual("Cmaj7")
    expect(chordAtBeat(chords, 8)).toBeUndefined()
  })
})

describe("playedChords", () => {
  const played = (s: LeadSheet) => playedChords(s).map((c) => [c.chord?.display, c.beat, c.beats])

  it("plays nothing for a chord left empty or one that can't be read", () => {
    expect(played(sheet([["Dm7"], [""], ["huh"]]))).toEqual([
      ["Dm7", 0, 4],
      [undefined, 4, 4],
      [undefined, 8, 4],
    ])
  })

  it("plays a bar of % as the bar before it again", () => {
    expect(played(sheet([["Dm7", "G7"], ["%"], ["%"]]))).toEqual([
      ["Dm7", 0, 2], ["G7", 2, 2],
      ["Dm7", 4, 2], ["G7", 6, 2],
      ["Dm7", 8, 2], ["G7", 10, 2],
    ])
  })

  it("plays a % among other chords as the chord before it", () => {
    expect(played(sheet([["Dm7", "G7"], ["%", "C"]]))).toEqual([
      ["Dm7", 0, 2], ["G7", 2, 2],
      ["G7", 4, 2], ["C", 6, 2],
    ])
  })

  it("plays nothing for a % with nothing before it", () => {
    expect(played(sheet([["%"]]))).toEqual([[undefined, 0, 4]])
  })

  it("leaves out chords for which the bar has no beats left", () => {
    expect(played(sheet([["A", "B", "C", "D"]], 3)).map((c) => c[0])).toEqual(["A", "B", "C"])
  })
})

describe("sheetLoop", () => {
  it("plays each chord, with its bass, on the beat it comes in, for as long as it lasts", () => {
    const loop = sheetLoop(sheet([["Dm7", "G7"], ["C"], [""]]))

    expect(loop.slotsPerBeat).toEqual(1)
    expect(loop.beatsPerBar).toEqual(4)
    expect(loop.numBars).toEqual(3)
    expect(loop.notes[0]?.length).toEqual(5)
    expect(loop.notes[0]?.every((n) => n.slots == 2)).toBe(true)
    expect(loop.notes[1]).toBeUndefined()
    expect(loop.notes[2]?.length).toEqual(5)
    expect(loop.notes[4]?.length).toEqual(4)
    expect(loop.notes[4]?.[0].slots).toEqual(4)
    expect(loop.notes[8]).toBeUndefined()
  })

  it("plays a bar of % as the bar before it", () => {
    const loop = sheetLoop(sheet([["Dm7", "G7"], ["%"]]))
    expect(loop.notes[4]).toEqual(loop.notes[0])
    expect(loop.notes[6]).toEqual(loop.notes[2])
  })

  it("has a bar to play even with no bars on the sheet", () => {
    expect(sheetLoop(sheet([])).numBars).toEqual(1)
  })
})

describe("validateSheet", () => {
  it("takes a sheet as it was saved", () => {
    const s = exampleSheet()
    expect(validateSheet(JSON.parse(JSON.stringify(s)))).toEqual(s)
  })

  it("fills in what is missing", () => {
    const s = validateSheet({bars: [{chords: ["C"]}, {chords: []}]})!

    expect(s.name).toEqual("Untitled")
    expect(s.tempo).toEqual(120)
    expect(s.beatsPerBar).toEqual(4)
    expect(s.id).not.toEqual("")
    expect(s.bars).toEqual([{chords: ["C"]}, {chords: [""]}])
  })

  it("keeps what is known of the tune, and leaves out what isn't", () => {
    const s = validateSheet({bars: [], composer: "Hancock Herbie", style: "Medium Swing", key: " "})!
    expect(s.composer).toEqual("Hancock Herbie")
    expect(s.style).toEqual("Medium Swing")
    expect("key" in s).toBe(false)
  })

  it("keeps the tempo in range", () => {
    expect(validateSheet({bars: [], tempo: 1000})!.tempo).toEqual(240)
  })

  it.each([
    [null],
    ["a string"],
    [{}],
    [{bars: "C G"}],
    [{bars: [{chords: [1, 2]}]}],
    [{bars: [], version: 99}],
  ])("rejects %p", (data) => {
    expect(validateSheet(data)).toBeUndefined()
  })
})
