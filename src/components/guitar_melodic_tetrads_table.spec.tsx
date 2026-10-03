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

function renderTable(position = 1) {
  return render(
    <GuitarMelodicTetradsTable
      scale={cIonian}
      tuning={sixStringTuning}
      position={position}
    />,
  )
}

function textOf(container: Element, selector: string): (string | null)[] {
  return Array.from(container.querySelectorAll(selector)).map((e) => e.textContent)
}

// the charts of the table, from the first chord down
function charts(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(".chartCell"))
}

function placeOf(n: Element): string {
  return [
    (n as HTMLElement).style.getPropertyValue("--string"),
    (n as HTMLElement).style.getPropertyValue("--fret"),
  ].join()
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

  it("names the position, and the mode it is read as", () => {
    const modes = [
      "Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian",
    ]

    for (let position = 1; position <= 7; position++) {
      const {container, unmount} = renderTable(position)

      expect(textOf(container, ".positionLabel .positionName")).toEqual(
        ["Position " + position],
      )
      expect(textOf(container, ".positionLabel .modeName")).toEqual(
        [modes[position-1]],
      )

      unmount()
    }
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

    const rows = charts(container).map((c) => c.style.getPropertyValue("--row"))

    expect(rows).toEqual(["1", "2", "3", "4", "5", "6", "7"])
  })

  it("keeps the chords of the scale in its order in any position of it", () => {
    const {container} = renderTable(2)

    // the second position of C major still runs from the Cmaj7, numbered as C major's
    expect(textOf(container, ".chordLabel .chordDegree")).toEqual(
      ["I", "IV", "VII", "III", "VI", "II", "V"],
    )
    expect(textOf(container, ".chordLabel .chordName")).toEqual(
      ["Cmaj7", "Fmaj7", "Bm7♭5", "Em7", "Am7", "Dm7", "G7"],
    )
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

    const opensOn = charts(container).map((chart) =>
      placeOf(chart.querySelector(".note:not(.backgroundNote)")!),
    )

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

    const labels = charts(container).map(
      (c) => textOf(c, ".labelArea .label").join(" to "),
    )

    // the first position of C major reaches from the 8th fret to the 13th
    expect(new Set(labels).size).toEqual(1)
    expect(labels[0]).toEqual("8th to 13th")
  })

  it("plays every note of a chord from within the position behind it", () => {
    const {container} = renderTable()

    for (const chart of Array.from(container.querySelectorAll(".chartCell"))) {

      const position = new Set(
        Array.from(chart.querySelectorAll(".note.backgroundNote")).map(placeOf),
      )

      for (const note of Array.from(chart.querySelectorAll(".note:not(.backgroundNote)"))) {
        expect(position).toContain(placeOf(note))
      }
    }
  })

  it("plays the same chord in every position of the scale", () => {

    // the pitch class of each open string in standard tuning, from the 6th string up
    const openPitchClasses: Record<string, number> = {
      "6": 4, "5": 9, "4": 2, "3": 7, "2": 11, "1": 4,
    }

    // a chart numbers its frets from the lowest it draws, which its first label names
    const pitchClassesIn = (chart: HTMLElement) => {

      const lowestFret = parseInt(chart.querySelector(".labelArea .label")!.textContent!)

      return new Set(
        Array.from(chart.querySelectorAll<HTMLElement>(".note:not(.backgroundNote)")).map(
          (n) => (
            openPitchClasses[n.style.getPropertyValue("--string")] +
            lowestFret + Number(n.style.getPropertyValue("--fret")) - 1
          )%12,
        ),
      )
    }

    // every position plays the Cmaj7 of the first row from its C, E, G and B
    for (let position = 1; position <= 7; position++) {
      const {container, unmount} = renderTable(position)

      expect(pitchClassesIn(charts(container)[0])).toEqual(new Set([0, 4, 7, 11]))

      unmount()
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
})
