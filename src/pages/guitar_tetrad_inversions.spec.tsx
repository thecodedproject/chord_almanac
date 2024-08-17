/**
 * @jest-environment jsdom
 */

import {
  render,
} from "@testing-library/react"

import {
  GuitarTetradInversions
} from "./guitar_tetrad_inversions"

describe("GuitarTetradInversions", () => {
  it("renders", () => {
    render(<GuitarTetradInversions />)
  })
})

