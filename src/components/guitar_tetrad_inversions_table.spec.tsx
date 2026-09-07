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

  it("renders a finger chart for every inversion of every voicing", () => {
    const {container} = render(<GuitarTetradInversionsTable />)

    expect(container.querySelectorAll(".fingerChart")).toHaveLength(24)
    expect(container.querySelectorAll(".voicingLabel")).toHaveLength(6)
    expect(container.querySelectorAll(".inversionLabel")).toHaveLength(4)
  })

  it("puts each voicing in its own row and each inversion in its own column", () => {
    const {container} = render(<GuitarTetradInversionsTable />)

    const cells = Array.from(container.querySelectorAll<HTMLElement>(".fingerChart")).map(
      (c) => [c.style.getPropertyValue("--voicing"), c.style.getPropertyValue("--inversion")].join(),
    )

    expect(new Set(cells).size).toEqual(24)
  })
})
