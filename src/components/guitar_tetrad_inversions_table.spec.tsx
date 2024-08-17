/**
 * @jest-environment jsdom
 */

import {
  render,
} from "@testing-library/react"

import {
  GuitarTetradInversionsTable,
} from './guitar_tetrad_inversions_table'


describe("GuitarTetradInversionsTable", () => {
  it("renders", () => {
    //TODO pass chord to table
    render(<GuitarTetradInversionsTable />)
  })
})

