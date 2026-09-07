/**
 * @jest-environment jsdom
 */

import {
  render,
} from "@testing-library/react"

import {
  GuitarMelodicTetradsPage
} from './guitar_melodic_tetrads_page'

describe("GuitarMelodicTetradsPage", () => {
  it("renders", () => {
    render(<GuitarMelodicTetradsPage />)
  })
})
