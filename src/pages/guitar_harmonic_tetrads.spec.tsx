/**
 * @jest-environment jsdom
 */

import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react"

import {
  GuitarHarmonicTetrads,
} from "./guitar_harmonic_tetrads"

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

// renders the page on the given cycle
function renderOnCycle(cycle: string) {
  const rendered = render(<GuitarHarmonicTetrads />)

  fireEvent.change(rendered.container.querySelector(".cycleSelector select")!, {
    target: {value: cycle},
  })

  return rendered
}

const Page = GuitarHarmonicTetrads

describe("GuitarHarmonicTetrads", () => {

  it("renders", () => {
    render(<Page />)
  })

  it("starts on the drop 2 seventh chords of C major, from the ionian mode", () => {
    const {container} = render(<Page />)

    expect(modeNames(container)[0]).toEqual("Ionian")
    expect(textOf(container, ".voicingDegrees")[0]).toEqual("5 1 3 7")
    expect(
      (container.querySelector(".voicingLabel select") as HTMLSelectElement).value,
    ).toEqual("Drop2")

    expect(button("6 5 4 3").disabled).toBe(true)
    expect(button("5 4 3 2").disabled).toBe(false)
  })

  it("takes in every mode of the scale on its way round", () => {
    const {container} = render(<Page />)

    expect(new Set(modeNames(container))).toEqual(
      new Set(["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"]),
    )
  })

  it("has no position to choose, as it goes through every mode anyway", () => {
    const {container} = render(<Page />)

    expect(container.querySelector(".positionSelector")).toBeNull()
  })

  it("builds the chords from the degrees chosen", () => {
    const {container} = render(<Page />)

    // swap the 3rd for the 4th
    fireEvent.click(button("3"))
    fireEvent.click(button("4"))

    // each chord is named where its notes have a name in common use, and is given as
    // its notes where they do not
    expect(textOf(container, ".modeLabel .chordName").slice(0, 4)).toEqual(
      ["Cmaj7sus4", "F B C E", "B E F A", "E7sus4"],
    )
    expect(textOf(container, ".voicingDegrees")[0]).toEqual("5 1 4 7")
  })

  it("asks for four degrees until all four are chosen", () => {
    const {container} = render(<Page />)

    fireEvent.click(button("7"))

    expect(container.querySelector(".guitarModeCycleTable")).toBeNull()
    expect(container.querySelector(".chordDegreesPrompt")?.textContent).toEqual(
      "Choose 4 scale degrees to voice.",
    )
    expect(container.querySelectorAll(".stringSetSelector button.playable")).toHaveLength(0)

    fireEvent.click(button("6"))

    expect(textOf(container, ".modeLabel .chordName")[0]).toEqual("C6")
  })

  it("names the modes of the scale type chosen with the scale selector", () => {
    const {container} = render(<Page />)

    fireEvent.click(button("Melodic minor"))

    expect(modeNames(container)[0]).toEqual("Ionian ♭3")
  })

  it("voices the chords in the voicing chosen", () => {
    const {container} = render(<Page />)

    fireEvent.change(container.querySelector(".voicingLabel select")!, {
      target: {value: "Drop3"},
    })

    // drop 3 takes the third voice from the top of the close 1 3 5 7 down an octave
    expect(textOf(container, ".voicingDegrees")[0]).toEqual("3 1 5 7")
  })

  it("offers every set of four strings, picking out those the voicing plays on", () => {
    const {container} = render(<Page />)

    expect(container.querySelectorAll(".stringSetSelector button")).toHaveLength(15)
    // the neighbouring strings, and two sets skipping strings, on which a note stranded
    // away from the rest of the shape is fingered an octave up
    expect(textOf(container, ".stringSetSelector button.playable")).toEqual(
      ["6 5 4 3", "6 5 2 1", "6 3 2 1", "5 4 3 2", "4 3 2 1"],
    )

    expect(container.querySelector(".playableKey")?.textContent).toEqual(" = playable")
  })

  it("moves onto strings the chosen voicing plays on", () => {
    const {container} = render(<Page />)

    fireEvent.change(container.querySelector(".voicingLabel select")!, {
      target: {value: "Drop3"},
    })

    expect(textOf(container, ".stringSetSelector button.playable")).toEqual(
      ["6 4 3 2", "5 3 2 1"],
    )
    expect(button("6 4 3 2").disabled).toBe(true)
  })

  it("keeps to the chosen strings if the new voicing plays on them", () => {
    const {container} = render(<Page />)

    fireEvent.click(button("5 3 2 1"))
    fireEvent.change(container.querySelector(".voicingLabel select")!, {
      target: {value: "Drop3"},
    })

    expect(button("5 3 2 1").disabled).toBe(true)
  })

  it("moves onto strings that possibly play the voicing if none surely do", () => {
    const {container} = render(<Page />)

    fireEvent.change(container.querySelector(".voicingLabel select")!, {
      target: {value: "Spread"},
    })

    expect(textOf(container, ".stringSetSelector button.playable")).toEqual([])
    expect(button("6 5 4 2").disabled).toBe(true)
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

describe("cycle 4", () => {

  it("is the cycle the page starts on", () => {
    const {container} = render(<Page />)

    expect(screen.getByRole("heading").textContent).toEqual("Harmonic tetrads")
    expect(
      (container.querySelector(".cycleSelector select") as HTMLSelectElement).value,
    ).toEqual("Fourth")
  })

  it("climbs the modes in fourths", () => {
    const {container} = renderOnCycle("Fourth")

    expect(modeNames(container)).toEqual([
      "Ionian", "Lydian", "Locrian", "Phrygian", "Aeolian", "Dorian", "Mixolydian",
    ])
    expect(textOf(container, ".modeLabel .chordDegree")).toEqual(
      ["I", "IV", "VII", "III", "VI", "II", "V"],
    )
    expect(textOf(container, ".modeLabel .chordName")).toEqual(
      ["Cmaj7", "Fmaj7", "Bm7♭5", "Em7", "Am7", "Dm7", "G7"],
    )
  })

  it("starts each row two inversions on from the row above", () => {
    const {container} = renderOnCycle("Fourth")

    expect(inversionNames(container).slice(0, 4)).toEqual(["Root", "1st", "2nd", "3rd"])
    expect(inversionNames(container).slice(4, 8)).toEqual(["2nd", "3rd", "Root", "1st"])
  })
})

describe("cycle 2", () => {

  it("climbs the modes in seconds", () => {
    const {container} = renderOnCycle("Second")

    expect(modeNames(container)).toEqual([
      "Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian",
    ])
    expect(textOf(container, ".modeLabel .chordDegree")).toEqual(
      ["I", "II", "III", "IV", "V", "VI", "VII"],
    )
    expect(textOf(container, ".modeLabel .chordName")).toEqual(
      ["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7♭5"],
    )
  })

  it("takes each row one inversion back from the row above", () => {
    const {container} = renderOnCycle("Second")

    expect(inversionNames(container).slice(0, 4)).toEqual(["Root", "1st", "2nd", "3rd"])
    expect(inversionNames(container).slice(4, 8)).toEqual(["3rd", "Root", "1st", "2nd"])
    expect(inversionNames(container).slice(8, 12)).toEqual(["2nd", "3rd", "Root", "1st"])
  })
})

describe("cycle 3", () => {

  it("climbs the modes in thirds", () => {
    const {container} = renderOnCycle("Third")

    expect(modeNames(container)).toEqual([
      "Ionian", "Phrygian", "Mixolydian", "Locrian", "Dorian", "Lydian", "Aeolian",
    ])
    expect(textOf(container, ".modeLabel .chordDegree")).toEqual(
      ["I", "III", "V", "VII", "II", "IV", "VI"],
    )
    expect(textOf(container, ".modeLabel .chordName")).toEqual(
      ["Cmaj7", "Em7", "G7", "Bm7♭5", "Dm7", "Fmaj7", "Am7"],
    )
  })

  it("takes each row one inversion back from the row above", () => {
    const {container} = renderOnCycle("Third")

    expect(inversionNames(container).slice(0, 4)).toEqual(["Root", "1st", "2nd", "3rd"])
    expect(inversionNames(container).slice(4, 8)).toEqual(["3rd", "Root", "1st", "2nd"])
  })
})
