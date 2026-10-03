/**
 * @jest-environment jsdom
 */

import {
  fireEvent,
  render,
} from "@testing-library/react"

import {
  GuitarMelodicTetradsPage
} from './guitar_melodic_tetrads_page'

function chordDegrees(container: HTMLElement): (string | null)[] {
  return Array.from(
    container.querySelectorAll(".chordLabel .chordDegree"),
  ).map((e) => e.textContent)
}

describe("GuitarMelodicTetradsPage", () => {
  it("renders", () => {
    render(<GuitarMelodicTetradsPage />)
  })

  it("takes the chords a fourth at a time to begin with", () => {
    const {container} = render(<GuitarMelodicTetradsPage />)

    expect(chordDegrees(container)).toEqual(
      ["I", "IV", "VII", "III", "VI", "II", "V"],
    )
  })

  it("takes the chords through whichever cycle is chosen", () => {
    const {container} = render(<GuitarMelodicTetradsPage />)

    fireEvent.change(container.querySelector(".cycleSelector select")!, {
      target: {value: "Third"},
    })

    expect(chordDegrees(container)).toEqual(
      ["I", "III", "V", "VII", "II", "IV", "VI"],
    )
  })
})
