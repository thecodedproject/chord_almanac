/**
 * @jest-environment jsdom
 */

import {
  render,
} from "@testing-library/react"

import {
  DiatonicInterval,
  Note,
  ScaleType,
  scaleFromIonianRoot,
} from '../lib/chord_anthology'

import {
  sixStringTuning,
} from '../lib/guitar_notation'

import {
  GuitarMelodicTetradsTable,
} from './guitar_melodic_tetrads_table'

const cIonian = scaleFromIonianRoot(Note.C, ScaleType.Major, 1)

function renderTable(scale = cIonian) {
  return render(
    <GuitarMelodicTetradsTable scale={scale} tuning={sixStringTuning} />,
  )
}

function textOf(container: HTMLElement, selector: string): (string | null)[] {
  return Array.from(container.querySelectorAll(selector)).map((e) => e.textContent)
}

describe("GuitarMelodicTetradsTable", () => {
  it("renders", () => {
    renderTable()
  })

  it("draws one chart for every chord of the scale", () => {
    const {container} = renderTable()

    expect(container.querySelectorAll(".chartCell")).toHaveLength(7)
    expect(container.querySelectorAll(".chordLabel")).toHaveLength(7)
  })

  it("takes the chords of the scale a fourth at a time, starting from its first", () => {
    const {container} = renderTable()

    expect(textOf(container, ".chordLabel .chordDegree")).toEqual(
      ["I", "IV", "VII", "III", "VI", "II", "V"],
    )
  })

  it("names the seventh chord each degree of the scale carries", () => {
    const {container} = renderTable()

    expect(textOf(container, ".chordLabel .chordName")).toEqual(
      ["Cmaj7", "Fmaj7", "Bm7♭5", "Em7", "Am7", "Dm7", "G7"],
    )
  })

  it("lists the notes each chord is played from", () => {
    const {container} = renderTable()

    expect(textOf(container, ".chordLabel .chordNotes").slice(0, 3)).toEqual(
      ["C E G B", "F A C E", "B D F A"],
    )
  })

  it("puts each chord in its own row", () => {
    const {container} = renderTable()

    const rows = Array.from(
      container.querySelectorAll<HTMLElement>(".chartCell"),
    ).map((c) => c.style.getPropertyValue("--row"))

    expect(rows).toEqual(["1", "2", "3", "4", "5", "6", "7"])
  })

  it("runs each chord right through its position", () => {
    const {container} = renderTable()

    for (const chart of Array.from(container.querySelectorAll(".chartCell"))) {

      const played = chart.querySelectorAll(".note:not(.backgroundNote)")

      // the position covers two or three of each of the chord's four notes
      expect(played.length).toBeGreaterThanOrEqual(8)
      expect(played.length).toBeLessThanOrEqual(12)
    }
  })

  it("opens each chord on the note its position reaches first, root or not", () => {
    const {container} = renderTable()

    const opensOn = Array.from(
      container.querySelectorAll<HTMLElement>(".chartCell"),
    ).map((chart) => {

      const first = chart.querySelector<HTMLElement>(".note:not(.backgroundNote)")

      return [
        first?.style.getPropertyValue("--string"),
        first?.style.getPropertyValue("--fret"),
      ].join()
    })

    // the first position of C major opens on its C, which the Cmaj7, the Fmaj7 and the
    // Am7 all take as their first note whichever of their tones it is
    expect(opensOn[0]).toEqual("6,1")
    expect(opensOn[1]).toEqual("6,1")

    // the Bm7b5 has no C in it, so its line opens on the D a tone above instead
    expect(opensOn[2]).toEqual("6,3")
  })

  it("draws the whole position behind every chart", () => {
    const {container} = renderTable()

    for (const chart of Array.from(container.querySelectorAll(".chartCell"))) {
      // three notes to a string across all six of them
      expect(chart.querySelectorAll(".note.backgroundNote")).toHaveLength(18)
    }
  })

  it("draws every chart over the same stretch of the neck", () => {
    const {container} = renderTable()

    const charts = Array.from(
      container.querySelectorAll<HTMLElement>(".chartCell .guitarFingerChart"),
    )

    const labels = charts.map((c) => textOf(c, ".labelArea .label").join(" to "))

    // the first position of C major reaches from the 8th fret to the 13th
    expect(new Set(labels).size).toEqual(1)
    expect(labels[0]).toEqual("8th to 13th")
  })

  it("plays every note of a chord from within the position behind it", () => {
    const {container} = renderTable()

    for (const chart of Array.from(container.querySelectorAll(".chartCell"))) {

      const placeOf = (n: Element) => [
        (n as HTMLElement).style.getPropertyValue("--string"),
        (n as HTMLElement).style.getPropertyValue("--fret"),
      ].join()

      const position = new Set(
        Array.from(chart.querySelectorAll(".note.backgroundNote")).map(placeOf),
      )

      for (const note of Array.from(chart.querySelectorAll(".note:not(.backgroundNote)"))) {
        expect(position).toContain(placeOf(note))
      }
    }
  })

  it("climbs by the interval it is given", () => {
    const {container} = render(
      <GuitarMelodicTetradsTable
        scale={cIonian}
        tuning={sixStringTuning}
        chordInterval={DiatonicInterval.Second}
      />,
    )

    expect(textOf(container, ".chordLabel .chordDegree")).toEqual(
      ["I", "II", "III", "IV", "V", "VI", "VII"],
    )
  })

  it("reads the chords from whichever mode of the scale it is given", () => {
    const {container} = renderTable(
      scaleFromIonianRoot(Note.C, ScaleType.Major, 2),
    )

    // the second position is read from D dorian, so its first chord is the Dm7
    expect(textOf(container, ".chordLabel .chordName")).toEqual(
      ["Dm7", "G7", "Cmaj7", "Fmaj7", "Bm7♭5", "Em7", "Am7"],
    )
  })
})
