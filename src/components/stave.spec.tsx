/**
 * @jest-environment jsdom
 */

import {
  render,
} from "@testing-library/react"

import {
  GridNote,
  Pitch,
  scoreFromGrid,
} from "../lib/notation"

import {
  Stave,
} from "./stave"

// pitch reads a natural pitch from how it is written, e.g. "C4"
function pitch(name: string, accidental = 0): Pitch {
  return {letter: "CDEFGAB".indexOf(name[0]), accidental: accidental, octave: Number(name[1])}
}

// drawNotes draws single notes, a beat apart, on a stave in C
function drawNotes(pitches: Pitch[], slotsPerBeat = 1) {
  const notes: GridNote[] = pitches.map((p, i) => ({slot: i * slotsPerBeat, pitch: p}))
  const measures = scoreFromGrid(notes, {
    slotsPerBeat: slotsPerBeat, beatsPerBar: pitches.length, numBars: 1, keySignature: 0,
  })
  return render(<Stave measures={measures} keySignature={0} slotsPerBeat={slotsPerBeat} />).container
}

const attr = (e: Element | null | undefined, name: string) => Number(e?.getAttribute(name))

describe("Stave", () => {
  it("points stems up below the middle line and down from it", () => {
    const container = drawNotes([pitch("A4"), pitch("B4")])
    const [low, middle] = Array.from(container.querySelectorAll(".note"))

    const stemPointsUp = (note: Element) => {
      const stem = note.querySelector(".stem")
      return attr(stem, "y2") < attr(stem, "y1")
    }
    expect(stemPointsUp(low)).toBe(true)
    expect(stemPointsUp(middle)).toBe(false)
  })

  it("draws ledger lines for notes off the stave", () => {
    const container = drawNotes([pitch("C4"), pitch("E4"), pitch("A5"), pitch("C6")])
    const ledgers = Array.from(container.querySelectorAll(".note")).map(
      (n) => n.querySelectorAll(".ledger").length,
    )
    expect(ledgers).toEqual([1, 0, 1, 2])
  })

  it("brackets a triplet whose notes are not beamed together", () => {
    // one triplet quaver, then two triplet quaver rests
    const container = drawNotes([pitch("C5")], 3)

    expect(container.querySelector(".tuplet path")).not.toBeNull()
    expect(container.querySelector(".tuplet text")?.textContent).toEqual("3")
  })

  it("leaves a beamed triplet's number unbracketed", () => {
    const notes: GridNote[] = [pitch("C5"), pitch("D5"), pitch("E5")].map((p, i) => ({slot: i, pitch: p}))
    const measures = scoreFromGrid(notes, {slotsPerBeat: 3, beatsPerBar: 1, numBars: 1, keySignature: 0})
    const {container} = render(<Stave measures={measures} keySignature={0} slotsPerBeat={3} />)

    expect(container.querySelector(".tuplet path")).toBeNull()
    expect(container.querySelector(".tuplet text")).not.toBeNull()
  })

  it("makes room before a note for its accidental", () => {
    const noteX = (container: HTMLElement) => Array.from(container.querySelectorAll(".noteHead"))
      .map((n) => attr(n, "cx"))
    const gaps = (xs: number[]) => xs.slice(1).map((x, i) => x - xs[i])

    const plain = gaps(noteX(drawNotes([pitch("C5"), pitch("D5"), pitch("E5")], 4)))
    const sharp = gaps(noteX(drawNotes([pitch("C5"), pitch("D5", 1), pitch("E5")], 4)))

    expect(sharp[0]).toBeGreaterThan(plain[0])
    expect(sharp[1]).toEqual(plain[1])
  })

  it("picks out the highlighted note", () => {
    const container = render(
      <Stave
        measures={scoreFromGrid([{slot: 0, pitch: pitch("C5")}, {slot: 1, pitch: pitch("D5")}], {
          slotsPerBeat: 2, beatsPerBar: 1, numBars: 1, keySignature: 0,
        })}
        keySignature={0}
        slotsPerBeat={2}
        highlight={1}
      />,
    ).container

    const highlighted = container.querySelectorAll(".highlighted")
    expect(highlighted.length).toEqual(1)
    expect(highlighted[0].getAttribute("data-id")).toEqual("1")
  })

  it("draws a barline after every bar", () => {
    const notes: GridNote[] = [0, 4, 8].map((slot) => ({slot: slot, pitch: pitch("C5")}))
    const measures = scoreFromGrid(notes, {slotsPerBeat: 2, beatsPerBar: 2, numBars: 3, keySignature: 0})
    const {container} = render(<Stave measures={measures} keySignature={0} slotsPerBeat={2} />)

    expect(container.querySelectorAll(".barline").length).toEqual(3)
  })
})
