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
  GuitarChordInversionsTable,
} from './guitar_chord_inversions_table'

const cMaj7 = {
  scale: diatonicScale(Note.C, Mode.Ionian),
  tones: [1,3,5,7],
}

const bottomFourStrings = [6,5,4,3]

function renderTable() {
  return render(
    <GuitarChordInversionsTable chord={cMaj7} strings={bottomFourStrings} />,
  )
}


describe("GuitarChordInversionsTable", () => {
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

describe("GuitarChordInversionsTable for a triad", () => {

  const cMaj = {
    scale: diatonicScale(Note.C, Mode.Ionian),
    tones: [1,3,5],
  }

  function renderTriadTable() {
    return render(
      <GuitarChordInversionsTable chord={cMaj} strings={[6,4,3]} />,
    )
  }

  it("renders a finger chart for each of its three inversions, close and open", () => {
    const {container} = renderTriadTable()

    expect(container.querySelectorAll(".fingerChart")).toHaveLength(6)
    expect(
      Array.from(container.querySelectorAll(".voicingLabel")).map((l) => l.textContent),
    ).toEqual(["Close", "Open"])
    expect(
      Array.from(container.querySelectorAll(".inversionLabel")).map((l) => l.textContent),
    ).toEqual(["Root", "1st", "2nd"])
  })

  it("sizes the table to the chord", () => {
    const {container} = renderTriadTable()

    const table = container.querySelector<HTMLElement>(".guitarChordInversionsTable")!

    expect(table.style.getPropertyValue("--num-inversions")).toEqual("3")
    expect(table.style.getPropertyValue("--num-voicings")).toEqual("2")
  })

  it("stacks the open voicings with the middle voice taken over the top", () => {
    const {container} = renderTriadTable()

    expect(
      Array.from(container.querySelectorAll(".voicingDegrees")).map((d) => d.textContent),
    ).toEqual(["1 3 5", "3 5 1", "5 1 3", "1 5 3", "3 1 5", "5 3 1"])
  })
})
