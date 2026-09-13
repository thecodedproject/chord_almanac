/**
 * @jest-environment jsdom
 */

import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react"

import {
  GuitarCycle2Tetrads,
  GuitarCycle4Tetrads,
} from "./guitar_cycle_tetrads"

function button(name: string): HTMLButtonElement {
  return screen.getByRole("button", {name: name}) as HTMLButtonElement
}

function textOf(container: HTMLElement, selector: string): (string | null)[] {
  return Array.from(container.querySelectorAll(selector)).map((e) => e.textContent)
}

function modeNames(container: HTMLElement): (string | null)[] {
  return textOf(container, ".modeLabel .modeName")
}

function inversionNames(container: HTMLElement): (string | null)[] {
  return textOf(container, ".fingerChart .chartLabel")
}

// every cycle draws the same table of the same chords, and differs only in the order it
// takes the modes in and where around the inversions each of its rows starts
describe.each(
  [
    ["cycle 4", GuitarCycle4Tetrads],
    ["cycle 2", GuitarCycle2Tetrads],
  ],
)("%s tetrads", (_, Page) => {

  it("renders", () => {
    render(<Page />)
  })

  it("starts on the drop 2 seventh chords of C major, from the ionian mode", () => {
    const {container} = render(<Page />)

    expect(modeNames(container)[0]).toEqual("Ionian")
    expect(textOf(container, ".voicingDegrees")[0]).toEqual("5 1 3 7")
    expect(textOf(container, ".voicingLabel")).toEqual(["Drop 2"])

    expect(button("6 5 4 3").disabled).toBe(true)
    expect(button("5 4 3 2").disabled).toBe(false)
  })

  it("takes in every mode of the scale on its way round", () => {
    const {container} = render(<Page />)

    expect(new Set(modeNames(container))).toEqual(
      new Set(["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"]),
    )
  })

  it("starts from the mode chosen with the scale selector", () => {
    const {container} = render(<Page />)

    // the second degree of the major scale is the dorian mode
    fireEvent.click(button("II"))

    expect(modeNames(container)[0]).toEqual("Dorian")
  })

  it("names the modes of the scale type chosen with the scale selector", () => {
    const {container} = render(<Page />)

    fireEvent.click(button("Melodic minor"))

    expect(modeNames(container)[0]).toEqual("Ionian ♭3")
  })

  it("voices the chords on the chosen strings", () => {
    const {container} = render(<Page />)

    fireEvent.click(button("6 4 3 2"))

    const strings = Array.from(
      container.querySelectorAll<HTMLElement>(".fingerChart .note"),
    ).map((n) => n.style.getPropertyValue("--string"))

    expect(new Set(strings)).toEqual(new Set(["6", "4", "3", "2"]))
  })
})

describe("GuitarCycle4Tetrads", () => {

  it("climbs the modes in fourths", () => {
    const {container} = render(<GuitarCycle4Tetrads />)

    expect(screen.getByRole("heading").textContent).toEqual("Cycle 4 tetrads")

    expect(modeNames(container)).toEqual([
      "Ionian", "Lydian", "Locrian", "Phrygian", "Aeolian", "Dorian", "Mixolydian",
    ])
    expect(textOf(container, ".modeLabel .modeRoot")).toEqual(
      ["C", "F", "B", "E", "A", "D", "G"],
    )
  })

  it("starts each row two inversions on from the row above", () => {
    const {container} = render(<GuitarCycle4Tetrads />)

    expect(inversionNames(container).slice(0, 4)).toEqual(["Root", "1st", "2nd", "3rd"])
    expect(inversionNames(container).slice(4, 8)).toEqual(["2nd", "3rd", "Root", "1st"])
  })
})

describe("GuitarCycle2Tetrads", () => {

  it("climbs the modes in seconds", () => {
    const {container} = render(<GuitarCycle2Tetrads />)

    expect(screen.getByRole("heading").textContent).toEqual("Cycle 2 tetrads")

    expect(modeNames(container)).toEqual([
      "Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian",
    ])
    expect(textOf(container, ".modeLabel .modeRoot")).toEqual(
      ["C", "D", "E", "F", "G", "A", "B"],
    )
  })

  it("takes each row one inversion back from the row above", () => {
    const {container} = render(<GuitarCycle2Tetrads />)

    expect(inversionNames(container).slice(0, 4)).toEqual(["Root", "1st", "2nd", "3rd"])
    expect(inversionNames(container).slice(4, 8)).toEqual(["3rd", "Root", "1st", "2nd"])
    expect(inversionNames(container).slice(8, 12)).toEqual(["2nd", "3rd", "Root", "1st"])
  })
})
