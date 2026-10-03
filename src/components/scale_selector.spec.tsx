/**
 * @jest-environment jsdom
 */

import {
  render,
} from "@testing-library/react"

import {
  Note,
  ScaleType,
} from "../lib/chord_anthology"

import {
  ScaleSelector,
} from './scale_selector'

describe("ScaleSelector", () => {
  it("renders", () => {

    const props = {
      rootNote: {
        value: Note.C,
        set: jest.fn(),
      },
      pos: {
        value: 1,
        set: jest.fn(),
      },
      type: {
        value: ScaleType.Major,
        set: jest.fn(),
      },
    }

    render(<ScaleSelector props={props}/>)
  })

  it("picks out the scale type, root and position currently chosen", () => {

    const props = {
      rootNote: {value: Note.Eb, set: jest.fn()},
      pos: {value: 3, set: jest.fn()},
      type: {value: ScaleType.MelodicMinor, set: jest.fn()},
    }

    const {container} = render(<ScaleSelector props={props}/>)

    expect(
      Array.from(container.querySelectorAll("button.selected")).map((b) => b.textContent),
    ).toEqual(["Melodic minor", "Eb", "III"])
  })
})
