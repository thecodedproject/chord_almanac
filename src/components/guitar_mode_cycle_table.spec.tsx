/**
 * @jest-environment jsdom
 */

import {
  render,
} from "@testing-library/react"

import {
  Mode,
  Note,
  TetradVoicing,
  diatonicScale,
} from '../lib/chord_anthology'

import {
  GuitarModeCycleTable,
} from './guitar_mode_cycle_table'

const cMaj7 = {
  scale: diatonicScale(Note.C, Mode.Ionian),
  tones: [1,3,5,7],
}

const bottomFourStrings = [6,5,4,3]

function renderTable() {
  return render(
    <GuitarModeCycleTable
      chord={cMaj7}
      strings={bottomFourStrings}
      voicing={TetradVoicing.Drop2}
    />,
  )
}

function textOf(container: HTMLElement, selector: string): (string | null)[] {
  return Array.from(container.querySelectorAll(selector)).map((e) => e.textContent)
}

describe("GuitarModeCycleTable", () => {
  it("renders", () => {
    renderTable()
  })

  it("renders a finger chart for every inversion of every mode", () => {
    const {container} = renderTable()

    expect(container.querySelectorAll(".fingerChart")).toHaveLength(28)
    expect(container.querySelectorAll(".modeLabel")).toHaveLength(7)
    expect(container.querySelectorAll(".columnLabel")).toHaveLength(4)
  })

  it("takes the modes a fourth at a time, starting from the chord's own mode", () => {
    const {container} = renderTable()

    expect(textOf(container, ".modeLabel .modeName")).toEqual([
      "Ionian",
      "Lydian",
      "Locrian",
      "Phrygian",
      "Aeolian",
      "Dorian",
      "Mixolydian",
    ])

    expect(textOf(container, ".modeLabel .modeRoot")).toEqual(
      ["C", "F", "B", "E", "A", "D", "G"],
    )
  })

  it("names the voicing every chart in the table is drawn in", () => {
    const {container} = renderTable()

    expect(textOf(container, ".voicingLabel")).toEqual(["Drop 2"])
  })

  it("voices every chart in that voicing", () => {
    const {container} = renderTable()

    // drop 2 stacks the tetrad's tones 5 1 3 7 from the bottom up in root position,
    // and each inversion takes that stack round onto the next chord tone
    expect(textOf(container, ".voicingDegrees").slice(0, 4)).toEqual(
      ["5 1 3 7", "7 3 5 1", "1 5 7 3", "3 7 1 5"],
    )
  })

  it("starts each row two inversions on from the row above", () => {
    const {container} = renderTable()

    const labels = textOf(container, ".fingerChart .chartLabel")

    // the first row runs through the inversions from root position
    expect(labels.slice(0, 4)).toEqual(["Root", "1st", "2nd", "3rd"])

    // and each row after it picks up two inversions further round
    expect(labels.slice(4, 8)).toEqual(["2nd", "3rd", "Root", "1st"])
    expect(labels.slice(8, 12)).toEqual(["Root", "1st", "2nd", "3rd"])
    expect(labels.slice(12, 16)).toEqual(["2nd", "3rd", "Root", "1st"])
  })

  it("voices each chart as the inversion it is labelled with", () => {
    const {container} = renderTable()

    // the second row is F lydian, starting from the second inversion of its drop 2
    expect(textOf(container, ".voicingDegrees").slice(4, 8)).toEqual(
      ["1 5 7 3", "3 7 1 5", "5 1 3 7", "7 3 5 1"],
    )
  })

  it("takes the inversions in step down a column when told not to offset them", () => {
    const {container} = render(
      <GuitarModeCycleTable
        chord={cMaj7}
        strings={bottomFourStrings}
        voicing={TetradVoicing.Drop2}
        inversionOffset={0}
      />,
    )

    const labels = textOf(container, ".fingerChart .chartLabel")

    expect(labels.slice(0, 4)).toEqual(["Root", "1st", "2nd", "3rd"])
    expect(labels.slice(4, 8)).toEqual(["Root", "1st", "2nd", "3rd"])
  })

  it("puts each mode in its own row and each chart of it in its own column", () => {
    const {container} = renderTable()

    const cells = Array.from(container.querySelectorAll<HTMLElement>(".fingerChart")).map(
      (c) => [c.style.getPropertyValue("--mode"), c.style.getPropertyValue("--column")].join(),
    )

    expect(new Set(cells).size).toEqual(28)
  })
})
