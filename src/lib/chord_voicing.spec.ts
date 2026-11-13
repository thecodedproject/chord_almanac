import {
  parseChord,
} from "./chord_parser"

import {
  voiceChord,
  voiceProgression,
} from "./chord_voicing"

const chords = (...symbols: string[]) => symbols.map((s) => parseChord(s)!)

const classes = (notes: number[]) => notes.map((n) => n % 12).sort((a, b) => a - b)

describe("voiceChord", () => {

  it("voices a seventh chord with four notes in close position, the root in the bass", () => {
    const v = voiceChord(parseChord("Dm7")!)

    expect(v.voices.length).toEqual(4)
    expect(classes(v.voices)).toEqual([0, 2, 5, 9])
    expect(v.voices[3] - v.voices[0]).toBeLessThan(12)
    expect(v.bass % 12).toEqual(2)
    expect(v.bass).toBeLessThan(v.voices[0])
  })

  it("voices a triad with three notes", () => {
    const v = voiceChord(parseChord("C")!)

    expect(v.voices.length).toEqual(3)
    expect(classes(v.voices)).toEqual([0, 4, 7])
  })

  it("puts the note under the slash in the bass", () => {
    expect(voiceChord(parseChord("C7/E")!).bass % 12).toEqual(4)
  })
})

describe("voiceProgression", () => {

  it("moves each voice only a little through a ii-V-I", () => {
    const [ii, v, i] = voiceProgression(chords("Dm7", "G7", "Cmaj7"))

    for (const [from, to] of [[ii!, v!], [v!, i!]]) {
      for (let n = 0; n < 4; n++) {
        expect(Math.abs(to.voices[n] - from.voices[n])).toBeLessThanOrEqual(2)
      }
    }
  })

  it("keeps the chords in the middle of the keyboard however long they go on", () => {
    // round the cycle of fourths, which would sink steadily if left to move to the nearest
    const cycle = ["C7", "F7", "B♭7", "E♭7", "A♭7", "D♭7", "G♭7", "B7", "E7", "A7", "D7", "G7"]
    const voicings = voiceProgression(chords(...cycle, ...cycle, ...cycle))

    for (const v of voicings) {
      expect(v!.voices[0]).toBeGreaterThanOrEqual(53)
      expect(v!.voices[0]).toBeLessThanOrEqual(65)
    }
  })

  it("leaves gaps as they are, moving on from the chord before them", () => {
    const [a, gap, b] = voiceProgression([parseChord("Dm7"), undefined, parseChord("G7")])

    expect(gap).toBeUndefined()
    expect(b).toEqual(voiceProgression(chords("Dm7", "G7"))[1])
    expect(a).toBeDefined()
  })
})
