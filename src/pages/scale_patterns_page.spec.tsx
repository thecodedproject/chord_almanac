/**
 * @jest-environment jsdom
 */

import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react"

import {
  ScalePatternsPage
} from './scale_patterns_page'

// the notes drawn on a stave
const notes = (container: HTMLElement, stave: string) => container.querySelectorAll(
  `.${stave} .note`,
)

describe("ScalePatternsPage", () => {
  it("renders", () => {
    render(<ScalePatternsPage />)
  })

  it("draws the pattern, and the run of it through the scale", () => {
    const {container} = render(<ScalePatternsPage />)

    expect(notes(container, "basePatternStave").length).toEqual(3)
    // fourteen beats of triplets, then the tonic
    expect(notes(container, "runStave").length).toEqual(43)
  })

  it("names the scale the run is in, and the key it moves on to", () => {
    const {container} = render(<ScalePatternsPage />)

    expect(container.querySelector(".run h3")?.textContent).toEqual("C Ionian" + "next: F Ionian")
  })

  it("plays a longer pattern in semiquavers", () => {
    const {container} = render(<ScalePatternsPage />)

    fireEvent.click(screen.getByRole("button", {name: "4"}))

    expect(notes(container, "basePatternStave").length).toEqual(4)
    // fourteen beats of semiquavers, then the tonic
    expect(notes(container, "runStave").length).toEqual(57)
    expect(container.querySelector(".rhythmSelector .selected")?.textContent).toEqual("Semiquavers")
  })

  it("changes the degrees of the pattern", () => {
    const {container} = render(<ScalePatternsPage />)

    fireEvent.change(screen.getByLabelText("Degree of note 3"), {target: {value: "5"}})

    const ids = Array.from(notes(container, "basePatternStave")).map((n) => n.getAttribute("data-id"))
    expect(ids).toEqual(["0", "1", "2"])
    expect(container.querySelectorAll(".basePatternStave .ledger").length).toEqual(0)
  })

  it("writes the run in the mode chosen", () => {
    const {container} = render(<ScalePatternsPage />)

    fireEvent.click(screen.getByRole("button", {name: "Dorian"}))

    expect(container.querySelector(".run h3")?.textContent).toMatch(/^D Dorian/)
  })

  it("writes the time signature chosen", () => {
    const {container} = render(<ScalePatternsPage />)

    fireEvent.click(screen.getByRole("button", {name: "3/4"}))

    expect(container.querySelector(".runStave .timeSignature")?.textContent).toEqual("34")
  })
})

describe("ScalePatternsPage playing", () => {

  // FakeAudio stands in for the browser's audio, which jsdom does not have, on a clock
  // the test moves on by hand
  class FakeAudio {
    static last: FakeAudio
    currentTime = 0
    destination = {}
    constructor() { FakeAudio.last = this }
    createGain = node
    createOscillator = node
    resume() { return Promise.resolve() }
    suspend() { return Promise.resolve() }
    close() { return Promise.resolve() }
  }
  function node() {
    const param = {value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}}
    return {gain: param, frequency: param, connect: (n: any) => n, disconnect() {}, start() {}, stop() {}}
  }

  beforeEach(() => {
    jest.useFakeTimers()
    ;(window as any).AudioContext = FakeAudio
  })

  afterEach(() => {
    jest.useRealTimers()
    delete (window as any).AudioContext
  })

  // play moves the audio clock and the page's timers on together, a frame at a time
  const play = async (seconds: number) => {
    for (let t = 0; t < seconds; t += 0.05) {
      await act(async () => {
        FakeAudio.last.currentTime += 0.05
        jest.advanceTimersByTime(50)
      })
    }
  }

  const heading = () => document.querySelector(".run h3")?.textContent
  const playButton = () => screen.queryByRole("button", {name: "▶ Play"})
  const pauseButton = () => screen.queryByRole("button", {name: "❚❚ Pause"})

  // start presses play, at the top speed so a time round takes four seconds
  const start = async () => {
    render(<ScalePatternsPage />)
    fireEvent.change(screen.getByLabelText("Tempo:"), {target: {value: "240"}})
    await act(async () => { fireEvent.click(playButton()!) })
  }

  it("starts and pauses with the space bar", async () => {
    render(<ScalePatternsPage />)

    await act(async () => { fireEvent.keyDown(document.body, {code: "Space"}) })
    expect(pauseButton()).not.toBeNull()

    await act(async () => { fireEvent.keyDown(document.body, {code: "Space"}) })
    expect(playButton()).not.toBeNull()
  })

  it("leaves the space bar to tick a focused checkbox", async () => {
    render(<ScalePatternsPage />)

    await act(async () => {
      fireEvent.keyDown(screen.getByRole("checkbox", {name: "Metronome"}), {code: "Space"})
    })
    expect(playButton()).not.toBeNull()
  })

  it("leaves the space bar alone when a modifier is held", async () => {
    render(<ScalePatternsPage />)

    await act(async () => { fireEvent.keyDown(document.body, {code: "Space", shiftKey: true}) })
    expect(playButton()).not.toBeNull()
  })

  it("picks out the note being played", async () => {
    await start()
    await play(0.5)

    // at four beats a second, the triplets have gone by six to the half second
    expect(document.querySelector(".runStave .highlighted")?.getAttribute("data-id")).toEqual("5")
  })

  it("moves on round the cycle of fourths each time round", async () => {
    await start()
    expect(heading()).toMatch(/^C Ionian/)

    await play(4.2)
    expect(heading()).toMatch(/^F Ionian/)

    await play(4)
    expect(heading()).toMatch(/^B♭ Ionian/)
  })

  it("carries on round the cycle from a key chosen while playing", async () => {
    await start()
    await play(1)

    fireEvent.click(screen.getByRole("button", {name: "D"}))
    expect(heading()).toMatch(/^D Ionian/)

    await play(3.2)
    expect(heading()).toMatch(/^G Ionian/)
  })

  it("stays in the key when not moving round the cycle", async () => {
    await start()
    fireEvent.click(screen.getByRole("checkbox", {name: "Move round the cycle of fourths"}))

    await play(4.2)
    expect(heading()).toMatch(/^C Ionian/)
  })

  it("starts the cycle again from the key shown after stopping", async () => {
    await start()
    await play(4.2)
    expect(heading()).toMatch(/^F Ionian/)

    fireEvent.click(screen.getByRole("button", {name: "■ Stop"}))
    expect(document.querySelector(".runStave .highlighted")).toBeNull()

    await act(async () => { fireEvent.click(playButton()!) })
    await play(1)
    expect(heading()).toMatch(/^F Ionian/)
    await play(3.2)
    expect(heading()).toMatch(/^B♭ Ionian/)
  })

  it("goes back to stopped when there is no audio to play through", async () => {
    delete (window as any).AudioContext
    render(<ScalePatternsPage />)

    await act(async () => { fireEvent.click(playButton()!) })

    expect(playButton()).not.toBeNull()
  })
})
