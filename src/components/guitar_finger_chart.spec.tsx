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
})

