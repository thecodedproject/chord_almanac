/**
 * @jest-environment jsdom
 */

import {
  render,
} from "@testing-library/react"

import {
  GuitarScalePage
} from './guitar_scale_page'

describe("GuitarScalePage", () => {
  it("renders", () => {
    render(<GuitarScalePage />)
  })
})

