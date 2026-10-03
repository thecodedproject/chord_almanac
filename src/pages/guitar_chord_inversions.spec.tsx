/**
 * @jest-environment jsdom
 */

import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react"

import {
  GuitarChordInversions
} from "./guitar_chord_inversions"

function button(name: string): HTMLButtonElement {
  return screen.getByRole("button", {name: name}) as HTMLButtonElement
}

function degreeButton(degree: number): HTMLButtonElement {
  return button(String(degree))
}

function cellDegrees(container: HTMLElement): (string | null)[] {
  return Array.from(container.querySelectorAll(".voicingDegrees")).map((d) => d.textContent)
}

describe("GuitarChordInversions", () => {
  it("renders", () => {
    render(<GuitarChordInversions />)
  })

  it("voices the seventh chord of C major on the bottom four strings by default", () => {
    const {container} = render(<GuitarChordInversions />)

    expect(cellDegrees(container)[0]).toEqual("1 3 5 7")

    for (const degree of [1,3,5,7]) {
      expect(degreeButton(degree).className).toContain("selected")
    }
    expect(degreeButton(2).className).not.toContain("selected")

    expect(button("6 5 4 3").disabled).toBe(true)
    expect(button("5 4 3 2").disabled).toBe(false)
  })

  it("is titled for chords of any size", () => {
    render(<GuitarChordInversions />)

    expect(screen.getByText("Scale degrees:")).toBeTruthy()
  })

  it("names the chord and its notes in the heading", () => {
    render(<GuitarChordInversions />)

    const heading = () => screen.getByRole("heading").textContent

    expect(heading()).toEqual("Chord inversions for Cmaj7 [C E G B]")

    fireEvent.click(button("Dorian"))
    expect(heading()).toEqual("Chord inversions for Dm7 [D F A C]")

    // a triad is named too
    fireEvent.click(degreeButton(7))
    expect(heading()).toEqual("Chord inversions for Dm [D F A]")

    // a chord with no name in common use is given by its notes alone
    fireEvent.click(degreeButton(5))
    fireEvent.click(degreeButton(2))
    fireEvent.click(degreeButton(4))
    expect(heading()).toEqual("Chord inversions for [D E F G]")

    // and there is no chord to name until three or four degrees are chosen
    fireEvent.click(degreeButton(2))
    fireEvent.click(degreeButton(4))
    expect(heading()).toEqual("Chord inversions")
  })

  it("voices the degrees chosen with the scale degree selector", () => {
    const {container} = render(<GuitarChordInversions />)

    // swap the seventh for the sixth, giving a sixth chord
    fireEvent.click(degreeButton(7))
    fireEvent.click(degreeButton(6))

    expect(cellDegrees(container)[0]).toEqual("1 3 5 6")
  })

  it("will not let more than four scale degrees be chosen", () => {
    render(<GuitarChordInversions />)

    expect(degreeButton(2).disabled).toBe(true)
    expect(degreeButton(3).disabled).toBe(false)

    fireEvent.click(degreeButton(3))

    expect(degreeButton(2).disabled).toBe(false)
  })

  it("voices a triad when three scale degrees are chosen", () => {
    const {container} = render(<GuitarChordInversions />)

    fireEvent.click(degreeButton(7))

    // three inversions, each close and open
    expect(container.querySelectorAll(".fingerChart")).toHaveLength(6)
    expect(cellDegrees(container)).toEqual(
      ["1 3 5", "3 5 1", "5 1 3", "1 5 3", "3 1 5", "5 3 1"],
    )
  })

  it("offers sets of three strings for a triad, keeping a choice for each size", () => {
    const {container} = render(<GuitarChordInversions />)

    fireEvent.click(button("5 4 3 2"))
    fireEvent.click(degreeButton(7))

    expect(button("6 5 4").disabled).toBe(true)
    expect(screen.queryByRole("button", {name: "5 4 3 2"})).toBeNull()

    fireEvent.click(button("5 3 2"))

    const strings = Array.from(
      container.querySelectorAll<HTMLElement>(".fingerChart .note"),
    ).map((n) => n.style.getPropertyValue("--string"))

    expect(new Set(strings)).toEqual(new Set(["5", "3", "2"]))

    // back to a tetrad, on the strings chosen for it before
    fireEvent.click(degreeButton(7))

    expect(button("5 4 3 2").disabled).toBe(true)
  })

  it("asks for three or four scale degrees rather than drawing a part built chord", () => {
    const {container} = render(<GuitarChordInversions />)

    fireEvent.click(degreeButton(7))
    fireEvent.click(degreeButton(5))

    expect(container.querySelectorAll(".fingerChart")).toHaveLength(0)
    expect(screen.getByText(/Choose 3 or 4 scale degrees/)).toBeTruthy()
  })

  it("chooses the mode by name rather than a position", () => {
    const {container} = render(<GuitarChordInversions />)

    expect(screen.getByText("Mode:")).toBeTruthy()
    expect(
      Array.from(container.querySelectorAll(".positionSelector button")).map(
        (b) => b.textContent,
      ),
    ).toEqual(
      ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"],
    )

    // the fret each string of the first chart is played at, from its labels and notes
    const firstChart = () => {
      const chart = container.querySelector<HTMLElement>(".fingerChart")!
      return [
        chart.querySelector(".labelArea .label")?.textContent,
        ...Array.from(chart.querySelectorAll<HTMLElement>(".note")).map(
          (n) => n.style.getPropertyValue("--fret"),
        ),
      ].join()
    }

    const ionian = firstChart()

    fireEvent.click(button("Dorian"))

    expect(button("Dorian").className).toContain("selected")

    // the dorian seventh chord is the Dm7, played somewhere else from the Cmaj7
    expect(firstChart()).not.toEqual(ionian)
  })

  it("names the modes of the scale type chosen", () => {
    const {container} = render(<GuitarChordInversions />)

    fireEvent.click(button("Melodic minor"))

    expect(
      container.querySelector(".positionSelector button")?.textContent,
    ).toEqual("Ionian ♭3")
  })

  it("voices the chords on the chosen strings", () => {
    const {container} = render(<GuitarChordInversions />)

    fireEvent.click(button("6 4 3 2"))

    const strings = Array.from(
      container.querySelectorAll<HTMLElement>(".fingerChart .note"),
    ).map((n) => n.style.getPropertyValue("--string"))

    expect(new Set(strings)).toEqual(new Set(["6", "4", "3", "2"]))
  })
})
