/**
 * @jest-environment jsdom
 */

import {
  render,
} from "@testing-library/react"

import {
  ChordCyclePage
} from './chord_cycle_page'

describe("ChordCyclePage", () => {
  it("renders", () => {
    render(<ChordCyclePage />)
  })
})

