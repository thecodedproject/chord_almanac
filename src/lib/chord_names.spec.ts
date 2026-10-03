import {
  Note,
  ScaleType,
  scaleFromIonianRoot,
} from './chord_anthology'

import {
  chordSymbol,
} from './chord_names'

const cIonian = scaleFromIonianRoot(Note.C, ScaleType.Major, 1)
const dDorian = scaleFromIonianRoot(Note.C, ScaleType.Major, 2)
const gMixolydian = scaleFromIonianRoot(Note.C, ScaleType.Major, 5)
const bLocrian = scaleFromIonianRoot(Note.C, ScaleType.Major, 7)
const cMelodicMinor = scaleFromIonianRoot(Note.C, ScaleType.MelodicMinor, 1)

describe("chordSymbol", () => {
  it("names the seventh chord on the first degree of each mode", () => {
    expect(chordSymbol(cIonian, [1,3,5,7])).toEqual("Cmaj7")
    expect(chordSymbol(dDorian, [1,3,5,7])).toEqual("Dm7")
    expect(chordSymbol(gMixolydian, [1,3,5,7])).toEqual("G7")
    expect(chordSymbol(bLocrian, [1,3,5,7])).toEqual("Bm7♭5")
    expect(chordSymbol(cMelodicMinor, [1,3,5,7])).toEqual("CmMaj7")
  })

  it("names triads", () => {
    expect(chordSymbol(cIonian, [1,3,5])).toEqual("C")
    expect(chordSymbol(dDorian, [1,3,5])).toEqual("Dm")
    expect(chordSymbol(bLocrian, [1,3,5])).toEqual("Bdim")
    expect(chordSymbol(cIonian, [1,4,5])).toEqual("Csus4")
    expect(chordSymbol(cIonian, [1,2,5])).toEqual("Csus2")
  })

  it("names suspended seventh chords", () => {
    expect(chordSymbol(cIonian, [1,2,5,7])).toEqual("Cmaj7sus2")
    expect(chordSymbol(cIonian, [1,4,5,7])).toEqual("Cmaj7sus4")
    expect(chordSymbol(gMixolydian, [1,4,5,7])).toEqual("G7sus4")
  })

  it("names sixth chords", () => {
    expect(chordSymbol(cIonian, [1,3,5,6])).toEqual("C6")
    expect(chordSymbol(dDorian, [1,3,5,6])).toEqual("Dm6")
  })

  it("names triads with a note added", () => {
    expect(chordSymbol(cIonian, [1,2,3,5])).toEqual("Cadd9")
    expect(chordSymbol(cIonian, [1,3,4,5])).toEqual("Cadd11")
    expect(chordSymbol(dDorian, [1,2,3,5])).toEqual("Dm(add9)")
  })

  it("names ninth chords without their fifth", () => {
    expect(chordSymbol(cIonian, [1,2,3,7])).toEqual("Cmaj9(no5)")
    expect(chordSymbol(gMixolydian, [1,2,3,7])).toEqual("G9(no5)")
  })

  it("names the chord whatever order its degrees are given in", () => {
    expect(chordSymbol(cIonian, [7,5,3,1])).toEqual("Cmaj7")
  })

  it("leaves a chord without the first degree unnamed", () => {
    expect(chordSymbol(cIonian, [2,4,6,7])).toBeUndefined()
  })

  it("leaves a chord with no name in common use unnamed", () => {
    // C, D, E and F
    expect(chordSymbol(cIonian, [1,2,3,4])).toBeUndefined()
  })
})
