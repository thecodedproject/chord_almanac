/**
 * @jest-environment jsdom
 */

import {
  render,
} from "@testing-library/react"

import {
  ChordCycleTable
} from './chord_cycle_table'


describe("ChordCycleTable", () => {
  it("renders", () => {
    render(<ChordCycleTable />)
  })
})

