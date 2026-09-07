/**
 * @jest-environment jsdom
 */

import {
  render,
} from "@testing-library/react"

import {
  Mode,
  Note,
  diatonicScale,
} from '../lib/chord_anthology'

import {
  GuitarTetradInversionsTable,
} from './guitar_tetrad_inversions_table'

const cMaj7 = {
  scale: diatonicScale(Note.C, Mode.Ionian),
  tones: [1,3,5,7],
}

const bottomFourStrings = [6,5,4,3]

function renderTable() {
  return render(
    <GuitarTetradInversionsTable chord={cMaj7} strings={bottomFourStrings} />,
  )
}


describe("GuitarTetradInversionsTable", () => {
  it("renders", () => {
    renderTable()
  })

  it("renders a finger chart for every inversion of every voicing", () => {
    const {container} = renderTable()

    expect(container.querySelectorAll(".fingerChart")).toHaveLength(24)
    expect(container.querySelectorAll(".voicingLabel")).toHaveLength(6)
    expect(container.querySelectorAll(".inversionLabel")).toHaveLength(4)
  })

  it("labels each cell with the order its voicing stacks the chord tones in", () => {
    const {container} = renderTable()

    const labels = Array.from(
      container.querySelectorAll(".voicingDegrees"),
    ).map((d) => d.textContent)

    expect(labels).toHaveLength(24)
    expect(labels[0]).toEqual("1 3 5 7")
    expect(new Set(labels).size).toEqual(24)
  })

  it("puts each voicing in its own row and each inversion in its own column", () => {
    const {container} = renderTable()

    const cells = Array.from(container.querySelectorAll<HTMLElement>(".fingerChart")).map(
      (c) => [c.style.getPropertyValue("--voicing"), c.style.getPropertyValue("--inversion")].join(),
    )

    expect(new Set(cells).size).toEqual(24)
  })
})
