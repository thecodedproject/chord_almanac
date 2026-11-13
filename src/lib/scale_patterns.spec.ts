import {
  Note,
  ScaleType,
} from "./chord_anthology"

import {
  spelledNoteName,
} from "./notation"

import {
  Direction,
  Rhythm,
  RunNote,
  keyAfter,
  nextKey,
  patternRun,
  runBars,
  writeBasePattern,
  writeRun,
} from "./scale_patterns"

// the degrees of the notes of a run
const degrees = (run: RunNote[]) => run.map((n) => n.degree)

describe("patternRun", () => {
  const climbing = {degrees: [1, 2, 3], rhythm: Rhythm.Triplets, direction: Direction.Ascending}

  it("climbs the pattern a degree at a time", () => {
    expect(degrees(patternRun(climbing, 4).slice(0, 6))).toEqual([-13, -12, -11, -12, -11, -10])
  })

  it("ends on the tonic, held for the third beat of the last bar", () => {
    const run = patternRun(climbing, 4)

    // fourteen beats of triplets, a pattern to the beat, then the tonic
    expect(run.length).toEqual(43)
    expect(run[run.length - 1]).toEqual({degree: 1, slot: 42, length: 3})
  })

  it("plays the pattern from the note below the tonic last", () => {
    // in C major, A-B-C, B-C-D, C
    const lastBar = patternRun(climbing, 4).filter((n) => n.slot >= 36)
    expect(degrees(lastBar)).toEqual([-1, 0, 1, 0, 1, 2, 1])
  })

  it("rests until the final beat when the patterns fall short of it", () => {
    // 28 quavers lead up to the third beat of the last bar, which fit nine patterns of
    // three with a quaver to spare
    const run = patternRun({...climbing, rhythm: Rhythm.Quavers}, 4)

    expect(run.length).toEqual(28)
    expect(run[26].slot).toEqual(26)
    expect(run[27]).toEqual({degree: 1, slot: 28, length: 2})
  })

  it("falls the pattern a degree at a time when descending", () => {
    const run = patternRun(
      {degrees: [3, 2, 1], rhythm: Rhythm.Triplets, direction: Direction.Descending},
      4,
    )
    expect(degrees(run.slice(0, 6))).toEqual([15, 14, 13, 14, 13, 12])
    // D-C-B, then C
    expect(degrees(run.slice(-4))).toEqual([2, 1, 0, 1])
  })

  it("ends on the second beat of the last bar of 3/4", () => {
    const run = patternRun(
      {degrees: [1, 3, 2, 5], rhythm: Rhythm.Semiquavers, direction: Direction.Ascending},
      3,
    )
    expect(run[run.length - 1]).toEqual({degree: 1, slot: 40, length: 4})
  })
})

describe("keys", () => {
  it("takes the cycle of fourths", () => {
    expect(nextKey(Note.C)).toEqual(Note.F)
    expect([...Array(12)].map((_, i) => keyAfter(Note.C, i))).toEqual([
      Note.C, Note.F, Note.Bb, Note.Eb, Note.Ab, Note.Db,
      Note.Gb, Note.B, Note.E, Note.A, Note.D, Note.G,
    ])
  })
})

describe("writing patterns", () => {
  const pattern = {degrees: [1, 2, 3], rhythm: Rhythm.Triplets, direction: Direction.Ascending}

  it("writes the run across the bars of the run, ending in the tonic", () => {
    const written = writeRun({ionianRoot: Note.Db, type: ScaleType.Major, pos: 2}, pattern, 4)

    expect(written.measures.length).toEqual(runBars)
    expect(written.keySignature).toEqual(-5)
    const last = written.notes[written.notes.length - 1]
    expect(spelledNoteName(last.pitch)).toEqual("E♭")
  })

  it("writes the base pattern from the tonic", () => {
    const written = writeBasePattern({ionianRoot: Note.D, type: ScaleType.Major, pos: 1}, pattern, 4)

    expect(written.notes.map((n) => spelledNoteName(n.pitch))).toEqual(["D", "E", "F♯"])
    expect(written.measures.length).toEqual(1)
  })
})
