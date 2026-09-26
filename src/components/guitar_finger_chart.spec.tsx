/**
 * @jest-environment jsdom
 */

import {
  render,
} from "@testing-library/react"

import {
  GuitarFingerChart,
} from './guitar_finger_chart'


describe("GuitarFingerChart", () => {
  it("renders", () => {
    const notes = [{string: 1, fret: 1}]
    render(<GuitarFingerChart tabNotes={notes}/>)
  })

  it("draws the background notes it is given behind the notes to play", () => {
    const {container} = render(
      <GuitarFingerChart
        tabNotes={[{string: 6, fret: 5}]}
        backgroundNotes={[{string: 6, fret: 5}, {string: 6, fret: 7}]}
      />,
    )

    expect(container.querySelectorAll(".note.backgroundNote")).toHaveLength(2)
    expect(container.querySelectorAll(".note:not(.backgroundNote)")).toHaveLength(1)
  })

  it("reaches across its background notes as well as the notes to play", () => {
    const {container} = render(
      <GuitarFingerChart
        tabNotes={[{string: 6, fret: 5}]}
        backgroundNotes={[{string: 6, fret: 3}, {string: 6, fret: 8}]}
      />,
    )

    const labels = Array.from(
      container.querySelectorAll(".labelArea .label"),
    ).map((l) => l.textContent)

    expect(labels).toEqual(["3rd", "8th"])
  })

  it("draws nothing behind the notes when it is given no background notes", () => {
    const {container} = render(
      <GuitarFingerChart tabNotes={[{string: 6, fret: 5}]}/>,
    )

    expect(container.querySelectorAll(".backgroundNote")).toHaveLength(0)
  })
})

