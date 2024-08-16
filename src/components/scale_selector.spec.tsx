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
})

