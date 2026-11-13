import {
  normaliseChord,
  parseChord,
  pitchClass,
} from "./chord_parser"

// what a symbol is read as: how it is written out, and the intervals played above its root
const read = (text: string) => {
  const c = parseChord(text)
  return c == undefined ? undefined : [c.display, c.semitones.join()]
}

describe("parseChord", () => {

  it.each([
    // major sevenths
    ["Cmaj7", "Cmaj7", "4,7,11"],
    ["CM7", "Cmaj7", "4,7,11"],
    ["C^7", "Cmaj7", "4,7,11"],
    ["C^", "Cmaj7", "4,7,11"],
    ["CΔ", "Cmaj7", "4,7,11"],
    ["CΔ7", "Cmaj7", "4,7,11"],
    ["Cma7", "Cmaj7", "4,7,11"],
    // dominants
    ["G7", "G7", "4,7,10"],
    ["Gdom7", "G7", "4,7,10"],
    // minor sevenths
    ["Dm7", "Dm7", "3,7,10"],
    ["D-7", "Dm7", "3,7,10"],
    ["Dmin7", "Dm7", "3,7,10"],
    ["Dmi7", "Dm7", "3,7,10"],
    // half diminished
    ["Bø", "Bm7♭5", "3,6,10"],
    ["Bø7", "Bm7♭5", "3,6,10"],
    ["Bm7b5", "Bm7♭5", "3,6,10"],
    ["B-7b5", "Bm7♭5", "3,6,10"],
    ["Bm7(♭5)", "Bm7♭5", "3,6,10"],
    // diminished
    ["Bo7", "Bdim7", "3,6,9"],
    ["B°7", "Bdim7", "3,6,9"],
    ["Bdim7", "Bdim7", "3,6,9"],
    // minor major
    ["CmMaj7", "CmMaj7", "3,7,11"],
    ["Cm^7", "CmMaj7", "3,7,11"],
    ["C-Δ7", "CmMaj7", "3,7,11"],
    ["Cm(maj7)", "CmMaj7", "3,7,11"],
    // sixths and suspensions
    ["C6", "C6", "4,7,9"],
    ["Cm6", "Cm6", "3,7,9"],
    ["C-6", "Cm6", "3,7,9"],
    ["G7sus", "G7sus4", "5,7,10"],
    ["G7sus4", "G7sus4", "5,7,10"],
    // altered fifths
    ["C7#5", "C7♯5", "4,8,10"],
    ["C+7", "C7♯5", "4,8,10"],
    ["C7b5", "C7♭5", "4,6,10"],
    ["C+maj7", "Cmaj7♯5", "4,8,11"],
    // triads
    ["C", "C", "4,7"],
    ["Cm", "Cm", "3,7"],
    ["C-", "Cm", "3,7"],
    ["Cmaj", "C", "4,7"],
    ["Cdim", "Cdim", "3,6"],
    ["Co", "Cdim", "3,6"],
    ["C+", "C+", "4,8"],
    ["Caug", "C+", "4,8"],
    ["Csus4", "Csus4", "5,7"],
    ["Csus2", "Csus2", "2,7"],
  ])("reads %s as %s", (text, display, semitones) => {
    expect(read(text)).toEqual([display, semitones])
  })

  it.each([
    ["Bb7", "B♭7"],
    ["B♭7", "B♭7"],
    ["F#m7", "F♯m7"],
    ["F♯m7", "F♯m7"],
    ["Ebmaj7", "E♭maj7"],
    ["bb7", "B♭7"],
    ["dm7", "Dm7"],
  ])("spells the root of %s as %s", (text, display) => {
    expect(parseChord(text)?.display).toEqual(display)
  })

  it.each([
    ["C9", "C9", "4,7,10"],
    ["C13", "C13", "4,7,10"],
    ["Dm9", "Dm9", "3,7,10"],
    ["Dm11", "Dm11", "3,7,10"],
    ["Cmaj9", "Cmaj9", "4,7,11"],
    ["C^9", "Cmaj9", "4,7,11"],
    ["G7b9", "G7♭9", "4,7,10"],
    ["G7(b9, #11)", "G7♭9♯11", "4,7,10"],
    ["G7alt", "G7alt", "4,7,10"],
    ["G13sus", "G13sus4", "5,7,10"],
    ["Cmaj7#11", "Cmaj7♯11", "4,7,11"],
    ["C6/9", "C6/9", "4,7,9"],
    ["C69", "C6/9", "4,7,9"],
    ["Cm6/9", "Cm6/9", "3,7,9"],
    ["Cadd9", "Cadd9", "4,7"],
  ])("keeps the extensions of %s, but plays its heart", (text, display, semitones) => {
    expect(read(text)).toEqual([display, semitones])
  })

  it.each([
    ["C7(9)", "C9", "4,7,10"],
    ["C7(13)", "C13", "4,7,10"],
    ["C7(9,13)", "C13", "4,7,10"],
    ["C7(b9,13)", "C13♭9", "4,7,10"],
    ["Cm7(11)", "Cm11", "3,7,10"],
    ["Cmaj7(9)", "Cmaj9", "4,7,11"],
    ["C^(9)", "Cmaj9", "4,7,11"],
    ["C9(13)", "C13", "4,7,10"],
    ["C6(9)", "C6/9", "4,7,9"],
  ])("stretches %s to the tension written after it", (text, display, semitones) => {
    expect(read(text)).toEqual([display, semitones])
  })

  it("writes a chord the same way however many times it is written out", () => {
    for (const text of ["C7(9)", "Cm7(11)", "Cmaj7(9)", "Cm(add9)", "C7+", "Csus7", "Calt"]) {
      const once = normaliseChord(text)
      expect(normaliseChord(once)).toEqual(once)
    }
  })

  it.each([
    ["Cm(add9)", "Cmadd9", "3,7"],
    ["Cmadd9", "Cmadd9", "3,7"],
    ["CMA7", "Cmaj7", "4,7,11"],
    ["CMAJ7", "Cmaj7", "4,7,11"],
    ["CMI7", "Cm7", "3,7,10"],
    ["CMIN7", "Cm7", "3,7,10"],
    ["CMI", "Cm", "3,7"],
    ["CMA9", "Cmaj9", "4,7,11"],
    ["CMI(MA7)", "CmMaj7", "3,7,11"],
    ["C7+", "C7♯5", "4,8,10"],
    ["Csus7", "C7sus4", "5,7,10"],
    ["Calt", "C7alt", "4,7,10"],
  ])("reads %s as %s", (text, display, semitones) => {
    expect(read(text)).toEqual([display, semitones])
  })

  it("reads the bass note under a slash", () => {
    const c = parseChord("C7/E")!
    expect(c.display).toEqual("C7/E")
    expect(c.bassName).toEqual("E")
    expect(c.rootName).toEqual("C")
    expect(c.suffix).toEqual("7")

    expect(parseChord("Bb-7/Eb")?.display).toEqual("B♭m7/E♭")
    expect(parseChord("C6/9/E")?.display).toEqual("C6/9/E")
  })

  it.each([
    [""],
    ["H7"],
    ["X"],
    ["Cblah"],
    ["C7/"],
    ["7"],
  ])("does not read %p as a chord", (text) => {
    expect(parseChord(text)).toBeUndefined()
  })
})

describe("normaliseChord", () => {
  it("writes a chord in the site's spelling", () => {
    expect(normaliseChord(" Bb-7 ")).toEqual("B♭m7")
    expect(normaliseChord("F#ø")).toEqual("F♯m7♭5")
  })

  it("leaves text that is not a chord as it was", () => {
    expect(normaliseChord(" huh ")).toEqual("huh")
  })
})

describe("pitchClass", () => {
  it("counts the semitones above C", () => {
    expect(pitchClass({letter: 0, accidental: 0})).toEqual(0)
    expect(pitchClass({letter: 6, accidental: -1})).toEqual(10)
    expect(pitchClass({letter: 0, accidental: -1})).toEqual(11)
    expect(pitchClass({letter: 6, accidental: 1})).toEqual(0)
  })
})
