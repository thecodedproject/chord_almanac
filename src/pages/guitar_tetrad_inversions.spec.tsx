/**
 * @jest-environment jsdom
 */

import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react"

import {
  GuitarTetradInversions
} from "./guitar_tetrad_inversions"

function button(name: string): HTMLButtonElement {
  return screen.getByRole("button", {name: name}) as HTMLButtonElement
}

function degreeButton(degree: number): HTMLButtonElement {
  return button(String(degree))
}

function cellDegrees(container: HTMLElement): (string | null)[] {
  return Array.from(container.querySelectorAll(".voicingDegrees")).map((d) => d.textContent)
}

describe("GuitarTetradInversions", () => {
  it("renders", () => {
    render(<GuitarTetradInversions />)
  })

  it("voices the seventh chord of C major on the bottom four strings by default", () => {
    const {container} = render(<GuitarTetradInversions />)

    expect(cellDegrees(container)[0]).toEqual("1 3 5 7")

    for (const degree of [1,3,5,7]) {
      expect(degreeButton(degree).className).toContain("selected")
    }
    expect(degreeButton(2).className).not.toContain("selected")

    expect(button("6 5 4 3").disabled).toBe(true)
    expect(button("5 4 3 2").disabled).toBe(false)
  })

  it("voices the degrees chosen with the chord degree selector", () => {
    const {container} = render(<GuitarTetradInversions />)

    // swap the seventh for the sixth, giving a sixth chord
    fireEvent.click(degreeButton(7))
    fireEvent.click(degreeButton(6))

    expect(cellDegrees(container)[0]).toEqual("1 3 5 6")
  })

  it("will not let more than four chord degrees be chosen", () => {
    render(<GuitarTetradInversions />)

    expect(degreeButton(2).disabled).toBe(true)
    expect(degreeButton(3).disabled).toBe(false)

    fireEvent.click(degreeButton(3))

    expect(degreeButton(2).disabled).toBe(false)
  })

  it("asks for four chord degrees rather than drawing a part built chord", () => {
    const {container} = render(<GuitarTetradInversions />)

    fireEvent.click(degreeButton(7))

    expect(container.querySelectorAll(".fingerChart")).toHaveLength(0)
    expect(screen.getByText(/Choose 4 scale degrees/)).toBeTruthy()
  })

  it("voices the chords on the chosen strings", () => {
    const {container} = render(<GuitarTetradInversions />)

    fireEvent.click(button("6 4 3 2"))

    const strings = Array.from(
      container.querySelectorAll<HTMLElement>(".fingerChart .note"),
    ).map((n) => n.style.getPropertyValue("--string"))

    expect(new Set(strings)).toEqual(new Set(["6", "4", "3", "2"]))
  })
})
