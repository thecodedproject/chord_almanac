import {
  Note,
  ScaleType,
} from "./chord_anthology"

import {
  Duration,
  GridNote,
  Pitch,
  midiNumber,
  scaleDegreePitch,
  scoreFromGrid,
  spellScale,
  spelledNoteName,
  trebleOctave,
  trebleStavePosition,
} from "./notation"

// pitch reads a pitch from how it is written, e.g. "Bb4" or "F#5"
function pitch(name: string): Pitch {
  const letter = "CDEFGAB".indexOf(name[0])
  const accidentals = name.slice(1, -1)
  const accidental = accidentals.split("").reduce((sum, a) => sum + (a == "#" ? 1 : -1), 0)
  return {letter: letter, accidental: accidental, octave: Number(name.slice(-1))}
}

// the names of the notes of a scale, as written
const noteNames = (root: Note, type: ScaleType, pos: number) =>
  spellScale(root, type, pos).notes.map(spelledNoteName)

const keySignature = (root: Note, type: ScaleType, pos: number) =>
  spellScale(root, type, pos).keySignature

describe("spellScale", () => {
  it("uses each letter once", () => {
    expect(noteNames(Note.Db, ScaleType.Major, 1)).toEqual(
      ["D♭", "E♭", "F", "G♭", "A♭", "B♭", "C"],
    )
  })

  it("spells a mode as the scale it is a mode of", () => {
    expect(noteNames(Note.Db, ScaleType.Major, 7)).toEqual(
      ["C", "D♭", "E♭", "F", "G♭", "A♭", "B♭"],
    )
  })

  it("writes sharps for the raised notes of harmonic minor", () => {
    // A harmonic minor
    expect(noteNames(Note.C, ScaleType.HarmonicMinor, 6)).toEqual(
      ["A", "B", "C", "D", "E", "F", "G♯"],
    )
  })

  it("writes melodic minor from a flat as the sharp key it would otherwise need too many flats for", () => {
    // G♭ minor would need nine flats; F♯ minor has three sharps
    expect(noteNames(Note.Gb, ScaleType.MelodicMinor, 1)).toEqual(
      ["F♯", "G♯", "A", "B", "C♯", "D♯", "E♯"],
    )
  })

  it("keeps the flat spelling where it needs no more accidentals than the sharp one", () => {
    expect(noteNames(Note.Gb, ScaleType.Major, 1)).toEqual(
      ["G♭", "A♭", "B♭", "C♭", "D♭", "E♭", "F"],
    )
  })
})

describe("key signatures", () => {
  it.each([
    [Note.C, 0],
    [Note.G, 1],
    [Note.B, 5],
    [Note.F, -1],
    [Note.Db, -5],
    [Note.Gb, -6],
  ])("gives the major scale of %s its own key signature", (root, sharps) => {
    expect(keySignature(root, ScaleType.Major, 1)).toEqual(sharps)
  })

  it("gives every mode the key signature of its major scale", () => {
    expect(keySignature(Note.Eb, ScaleType.Major, 6)).toEqual(-3)
  })

  it("gives harmonic minor the key signature of its minor key", () => {
    // C harmonic minor, the sixth mode of the harmonic minor scale from E♭
    expect(keySignature(Note.Eb, ScaleType.HarmonicMinor, 6)).toEqual(-3)
  })

  it("gives melodic minor the key signature of its minor key", () => {
    expect(keySignature(Note.C, ScaleType.MelodicMinor, 1)).toEqual(-3)
    expect(keySignature(Note.A, ScaleType.MelodicMinor, 1)).toEqual(0)
    // written as C♯ minor
    expect(keySignature(Note.Db, ScaleType.MelodicMinor, 1)).toEqual(4)
  })

  it("gives harmonic major the key signature of its major key", () => {
    expect(keySignature(Note.C, ScaleType.HarmonicMajor, 1)).toEqual(0)
    expect(keySignature(Note.Eb, ScaleType.HarmonicMajor, 1)).toEqual(-3)
  })

  it("never needs more than seven sharps or flats", () => {
    for (const root of Object.values(Note)) {
      for (const type of Object.values(ScaleType)) {
        expect(Math.abs(keySignature(root, type, 1))).toBeLessThanOrEqual(7)
      }
    }
  })
})

describe("pitches", () => {
  it("numbers middle C as midi does", () => {
    expect(midiNumber(pitch("C4"))).toEqual(60)
    expect(midiNumber(pitch("Cb4"))).toEqual(59)
    expect(midiNumber(pitch("B#3"))).toEqual(60)
  })

  it("places pitches on the treble stave from its bottom line", () => {
    expect(trebleStavePosition(pitch("E4"))).toEqual(0)
    expect(trebleStavePosition(pitch("F5"))).toEqual(8)
    expect(trebleStavePosition(pitch("C4"))).toEqual(-2)
  })

  it("finds the degrees of a scale in the octaves either side of its tonic", () => {
    const aMajor = spellScale(Note.A, ScaleType.Major, 1).notes
    expect(scaleDegreePitch(aMajor, 1, 4)).toEqual(pitch("A4"))
    // C♯ is the next octave up by letter
    expect(scaleDegreePitch(aMajor, 3, 4)).toEqual(pitch("C#5"))
    expect(scaleDegreePitch(aMajor, 8, 4)).toEqual(pitch("A5"))
    expect(scaleDegreePitch(aMajor, 0, 4)).toEqual(pitch("G#4"))
    expect(scaleDegreePitch(aMajor, -6, 4)).toEqual(pitch("A3"))
  })

  it("puts a scale's tonic in whichever octave sits its degrees on the stave", () => {
    const cMajor = spellScale(Note.C, ScaleType.Major, 1).notes
    expect(trebleOctave(cMajor, [1, 2, 3, 4, 5, 6, 7, 8])).toEqual(4)
    // C to E an octave below the tonic, which sit nearest the middle of the stave as C5
    // to E5
    expect(trebleOctave(cMajor, [-6, -5, -4])).toEqual(6)
  })
})

describe("scoreFromGrid", () => {
  const cMajor = spellScale(Note.C, ScaleType.Major, 1).notes
  const notesOf = (degrees: number[]): GridNote[] => degrees.map((d, i) => ({
    slot: i,
    pitch: scaleDegreePitch(cMajor, d, 4),
  }))

  it("beams the notes of each beat together", () => {
    const measures = scoreFromGrid(notesOf([1, 2, 3, 4, 5, 6, 7, 8]), {
      slotsPerBeat: 4, beatsPerBar: 4, numBars: 1, keySignature: 0,
    })
    expect(measures[0].beams).toEqual([[0, 1, 2, 3], [4, 5, 6, 7]])
  })

  it("writes each beat divided in three as a triplet", () => {
    const measures = scoreFromGrid(notesOf([1, 2, 3, 2, 3, 4]), {
      slotsPerBeat: 3, beatsPerBar: 4, numBars: 1, keySignature: 0,
    })
    expect(measures[0].tuplets).toEqual([{first: 0, last: 2}, {first: 3, last: 5}])
  })

  it("rests through the beats after the last note", () => {
    const measures = scoreFromGrid(notesOf([1, 2, 3]), {
      slotsPerBeat: 2, beatsPerBar: 4, numBars: 2, keySignature: 0,
    })
    const rests = (m: number) => measures[m].events.filter((e) => e.pitch == undefined)
    expect(rests(0).map((e) => [e.start, e.duration])).toEqual([
      [1.5, Duration.Eighth],
      [2, Duration.Half],
    ])
    expect(rests(1).map((e) => [e.start, e.duration])).toEqual([[0, Duration.Whole]])
  })

  it("pairs semiquaver rests filling half a beat into a quaver rest", () => {
    const measures = scoreFromGrid(notesOf([1]), {
      slotsPerBeat: 4, beatsPerBar: 2, numBars: 1, keySignature: 0,
    })
    expect(measures[0].events.map((e) => e.duration)).toEqual([
      Duration.Sixteenth, Duration.Sixteenth, Duration.Eighth, Duration.Quarter,
    ])
  })

  it("stops after the last note when not filling with rests", () => {
    const measures = scoreFromGrid(notesOf([1, 2, 3]), {
      slotsPerBeat: 2, beatsPerBar: 4, numBars: 4, keySignature: 0, fillWithRests: false,
    })
    expect(measures.length).toEqual(1)
    expect(measures[0].numBeats).toEqual(2)
    expect(measures[0].events.length).toEqual(3)
  })

  it("writes accidentals the key signature does not give, once a bar", () => {
    const cHarmonicMinor = spellScale(Note.Eb, ScaleType.HarmonicMinor, 6).notes
    // B, C, B, then the B an octave up, which takes its own accidental
    const notes = [7, 8, 7, 14].map((d, i) => ({
      slot: i,
      pitch: scaleDegreePitch(cHarmonicMinor, d, 4),
    }))
    const measures = scoreFromGrid(notes, {
      slotsPerBeat: 4, beatsPerBar: 2, numBars: 2, keySignature: -3,
    })
    expect(measures[0].events.map((e) => e.accidental)).toEqual([0, undefined, undefined, 0, undefined])
  })

  it("writes a natural back when a note returns to the key signature", () => {
    const notes = [pitch("B4"), pitch("Bb4")].map((p, i) => ({slot: i, pitch: p}))
    const measures = scoreFromGrid(notes, {
      slotsPerBeat: 2, beatsPerBar: 1, numBars: 1, keySignature: -1,
    })
    expect(measures[0].events.map((e) => e.accidental)).toEqual([0, -1])
  })

  it("writes a note held for a beat as a crotchet", () => {
    const notes = [...notesOf([1, 2, 3]), {slot: 3, pitch: pitch("C5"), length: 3}]
    const measures = scoreFromGrid(notes, {
      slotsPerBeat: 3, beatsPerBar: 4, numBars: 1, keySignature: 0,
    })
    expect(measures[0].events.map((e) => [e.start, e.duration, e.id])).toEqual([
      [0, Duration.Eighth, 0],
      [1 / 3, Duration.Eighth, 1],
      [2 / 3, Duration.Eighth, 2],
      [1, Duration.Quarter, 3],
      [2, Duration.Half, undefined],
    ])
    // only the beat of quavers is a triplet
    expect(measures[0].tuplets).toEqual([{first: 0, last: 2}])
  })

  it("gives each note the slot it is played in as its id", () => {
    const measures = scoreFromGrid(notesOf([1, 2, 3, 4, 5]), {
      slotsPerBeat: 2, beatsPerBar: 2, numBars: 2, keySignature: 0,
    })
    expect(measures.map((m) => m.events.map((e) => e.id))).toEqual([
      [0, 1, 2, 3],
      [4, undefined, undefined],
    ])
  })
})
