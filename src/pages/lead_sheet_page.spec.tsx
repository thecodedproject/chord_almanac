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
  LeadSheetPage,
} from "./lead_sheet_page"

import {
  listSheets,
  loadSheet,
} from "../lib/lead_sheet_store"

// the chords on the chart, bar by bar, as they read
const chart = () => Array.from(document.querySelectorAll(".leadSheetChart .bar")).map((bar) =>
  Array.from(bar.querySelectorAll(".chord")).map((c) =>
    c.querySelector("input")?.value ?? c.textContent ?? ""),
)

const chordInput = () => screen.getByRole("textbox", {name: "Chord"}) as HTMLInputElement

// type writes text into the box a chord is written in, a key at a time, pressing the
// keys that move on as they come
function type(text: string) {
  for (const ch of text) {
    const input = chordInput()
    if (ch == " " || ch == "|") {
      fireEvent.keyDown(input, {key: ch})
    } else {
      fireEvent.change(input, {target: {value: input.value + ch}})
    }
  }
}

// waits out the moment before a change is saved
const settle = () => act(() => { jest.advanceTimersByTime(1000) })

describe("LeadSheetPage", () => {

  beforeEach(() => {
    window.localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("opens on an example on a first visit, and keeps it", () => {
    render(<LeadSheetPage />)

    expect(document.querySelector(".sheetName")?.textContent).toEqual("ii–V–I workout")
    expect(chart()[0]).toEqual(["Dm7"])
    expect(listSheets().map((s) => s.name)).toEqual(["ii–V–I workout"])
  })

  it("writes a new sheet in from the keyboard, and saves it", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "New"}))

    // the chord box is ready to type into
    expect(document.activeElement).toBe(chordInput())

    type("d-7 G7|C^7|%|")
    fireEvent.keyDown(chordInput(), {key: "Escape"})

    // the bar moved on to at the end is taken away again on stopping
    expect(chart()).toEqual([["Dm7", "G7"], ["Cmaj7"], ["%"]])

    settle()
    const saved = listSheets().find((s) => s.name == "Untitled")!
    expect(loadSheet(saved.id)?.bars.map((b) => b.chords)).toEqual([["Dm7", "G7"], ["Cmaj7"], ["%"]])
  })

  it("tidies away an empty chord left behind on moving to the next bar", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "New"}))

    type("C7 |F7")

    expect(chart()).toEqual([["C7"], ["F7"]])
  })

  it("takes a chord away with backspace on an empty box", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "New"}))

    type("C7 F7|")
    fireEvent.keyDown(chordInput(), {key: "Backspace"})

    expect(chart()).toEqual([["C7", "F7"]])
    expect(chordInput().value).toEqual("F7")
  })

  it("marks a chord that can't be read", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "New"}))

    type("Q7")
    expect(chordInput().getAttribute("aria-invalid")).toEqual("true")

    fireEvent.keyDown(chordInput(), {key: "Escape"})
    expect(document.querySelector(".chordSymbol.unreadable")?.textContent).toEqual("Q7")
  })

  it("writes a chord with the palette", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "New"}))

    fireEvent.click(screen.getByRole("button", {name: "B♭"}))
    fireEvent.click(screen.getByRole("button", {name: "Quality m7"}))
    fireEvent.click(screen.getByRole("button", {name: "E♭"}))
    fireEvent.click(screen.getByRole("button", {name: "Quality 7"}))

    expect(chart()).toEqual([["B♭m7"], ["E♭7"], [""]])
  })

  it("edits a chord already on the sheet", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "Edit chords"}))

    fireEvent.click(screen.getByRole("button", {name: "Bar 2, chord 1: G7"}))
    fireEvent.change(chordInput(), {target: {value: "Db7"}})
    fireEvent.click(screen.getByRole("button", {name: "Done"}))

    expect(chart()[1]).toEqual(["D♭7"])
  })

  it("renames a sheet", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "Edit chords"}))
    fireEvent.change(screen.getByRole("textbox", {name: "Name"}), {target: {value: "Blues in F"}})
    settle()

    expect(listSheets().map((s) => s.name)).toEqual(["Blues in F"])
    expect(screen.getByRole("option", {name: "Blues in F"})).toBeTruthy()
  })

  it("opens another sheet from the list", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "New"}))
    type("E7")
    fireEvent.keyDown(chordInput(), {key: "Escape"})
    fireEvent.click(screen.getByRole("button", {name: "Done"}))

    const example = listSheets().find((s) => s.name == "ii–V–I workout")!
    fireEvent.change(screen.getByRole("combobox", {name: "Lead sheet:"}), {target: {value: example.id}})
    expect(chart()[0]).toEqual(["Dm7"])

    const untitled = listSheets().find((s) => s.name == "Untitled")!
    fireEvent.change(screen.getByRole("combobox", {name: "Lead sheet:"}), {target: {value: untitled.id}})
    expect(chart()).toEqual([["E7"]])
  })

  it("finishes the chord being written before opening another sheet", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "New"}))
    // a space leaves an empty chord in the bar, and | an empty bar at the end
    type("Bb-7 F7|C7 ")

    const example = listSheets().find((s) => s.name == "ii–V–I workout")!
    fireEvent.change(screen.getByRole("combobox", {name: "Lead sheet:"}), {target: {value: example.id}})

    const untitled = listSheets().find((s) => s.name == "Untitled")!
    expect(loadSheet(untitled.id)?.bars.map((b) => b.chords)).toEqual([["B♭m7", "F7"], ["C7"]])
  })

  it("keeps the bass note when the palette changes a chord", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "New"}))
    type("Dm7/C")

    fireEvent.click(screen.getByRole("button", {name: "E♭"}))
    expect(chordInput().value).toEqual("E♭m7/C")

    fireEvent.click(screen.getByRole("button", {name: "Quality 7"}))
    expect(chart()[0]).toEqual(["E♭7/C"])
  })

  it("keeps the chords a shorter time signature has no beats for", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "New"}))
    type("A B C D")

    fireEvent.click(screen.getByRole("button", {name: "3/4"}))
    expect(document.querySelectorAll(".chord.unplayed").length).toEqual(1)

    fireEvent.click(screen.getByRole("button", {name: "4/4"}))
    expect(chart()[0]).toEqual(["A", "B", "C", "D"])
    expect(document.querySelectorAll(".chord.unplayed").length).toEqual(0)
  })

  it("keeps a sheet open, and says so, when it can't be saved", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "Edit chords"}))
    fireEvent.change(chordInput(), {target: {value: "E7"}})

    const setItem = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("full")
    })
    try {
      fireEvent.click(screen.getByRole("button", {name: "New"}))

      expect(document.querySelector(".saveStatus")?.textContent).toEqual("Couldn't save")
      expect(document.querySelector(".sheetMessage")?.textContent).toMatch(/couldn't be saved/)
      expect(screen.getByRole("textbox", {name: "Name"})).toHaveProperty("value", "ii–V–I workout")
    } finally {
      setItem.mockRestore()
    }

    // and is saved with the next change, once it can be
    expect(document.querySelector(".saveStatus")?.textContent).toEqual("Couldn't save")
    fireEvent.change(chordInput(), {target: {value: "E9"}})
    settle()
    expect(document.querySelector(".saveStatus")?.textContent).toEqual("Saved")
    expect(loadSheet(listSheets()[0].id)?.bars[0].chords).toEqual(["E9"])
  })

  it("opens the sheet open last time", () => {
    const {unmount} = render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "New"}))
    type("A7")
    unmount()

    render(<LeadSheetPage />)
    expect(chart()).toEqual([["A7"]])
  })

  it("deletes a sheet once asked to be sure", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "New"}))
    settle()
    expect(listSheets().length).toEqual(2)

    fireEvent.click(screen.getByRole("button", {name: "Delete…"}))
    fireEvent.click(screen.getByRole("button", {name: "Delete"}))

    expect(listSheets().map((s) => s.name)).toEqual(["ii–V–I workout"])
    expect(screen.getByRole("textbox", {name: "Name"})).toHaveProperty("value", "ii–V–I workout")
    expect(chart()[0]).toEqual(["Dm7"])
  })

  it("imports a sheet from a file", async () => {
    render(<LeadSheetPage />)
    const file = new File(
      [JSON.stringify({name: "Imported", bars: [{chords: ["Fmaj7"]}]})],
      "imported.leadsheet.json",
      {type: "application/json"},
    )
    // jsdom's files have no text() of their own
    ;(file as any).text = () => Promise.resolve(JSON.stringify({name: "Imported", bars: [{chords: ["Fmaj7"]}]}))

    fireEvent.click(screen.getByRole("button", {name: "Import…"}))
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Lead sheet file to import"), {target: {files: [file]}})
    })

    expect(document.querySelector(".sheetName")?.textContent).toEqual("Imported")
    expect(chart()).toEqual([["Fmaj7"]])
    expect(listSheets().map((s) => s.name)).toContain("Imported")
  })

  it("imports a tune from an iReal Pro link", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "Import…"}))
    const link = "irealb://And%20What%20If%20I%20Don%27t=Hancock%20Herbie==Medium%20Swing=Eb==1r34LbKcu71N%7CQy4Eb7%20QyX7bEZL%20lcKQy7X%2DC%7CQyX7bEZL7bB%7CAb7X4TA%2A%7BX7GB%2AQ%7CF%2D77bEZL7bB%207%2DF2NLZ%20QyXQyX%7DQyXbB%2FXyQ%5D%5ByX7%2DFB%207bE%20LZC7%20lcKQyX7bBZL%20lKcQyX7FZL%20lcKQyX%20%5D%5B%2AAlcKQybB%2F7%2Db7XyQ7%2DF%7CQyX7bA%7CQyXb7EZL%20lcKQyX7%2DC%7CXyQ%7CFEZL7bXyQZ%20==0=0==="
    fireEvent.change(screen.getByRole("textbox", {name: "iReal Pro link"}), {target: {value: link}})
    fireEvent.click(screen.getByRole("button", {name: "Import link"}))

    expect(document.querySelector(".sheetName")?.textContent).toEqual("And What If I Don't")
    expect(document.querySelector(".sheetAbout")?.textContent).toEqual("Hancock Herbie · Medium Swing · Key of E♭")
    expect(chart().length).toEqual(32)
    expect(document.querySelector(".sheetMessage")?.textContent).toEqual("Imported “And What If I Don't”.")
    // the panel is put away again
    expect(screen.queryByRole("textbox", {name: "iReal Pro link"})).toBeNull()
    expect(listSheets().map((s) => s.name)).toContain("And What If I Don't")
  })

  it("imports every tune of an iReal Pro playlist, telling what it couldn't carry over", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "Import…"}))
    const link = "irealbook://" + encodeURIComponent(
      "One=A=Swing=n=C=T44C |F |SG Z=Two=B=Swing=n=F=T44F |C Z=Gig")
    fireEvent.change(screen.getByRole("textbox", {name: "iReal Pro link"}), {target: {value: link}})
    fireEvent.click(screen.getByRole("button", {name: "Import link"}))

    expect(document.querySelector(".sheetName")?.textContent).toEqual("One")
    expect(document.querySelector(".sheetMessage")?.textContent).toEqual(
      "Imported 2 tunes from “Gig”. Not carried over yet: codas, segnos, D.C. and D.S. (the chart is played straight through).")
    expect(listSheets().map((s) => s.name)).toEqual(expect.arrayContaining(["One", "Two"]))
  })

  it("says so when a link can't be read", () => {
    render(<LeadSheetPage />)
    fireEvent.click(screen.getByRole("button", {name: "Import…"}))
    fireEvent.change(screen.getByRole("textbox", {name: "iReal Pro link"}), {target: {value: "https://example.com"}})
    fireEvent.click(screen.getByRole("button", {name: "Import link"}))

    expect(document.querySelector(".sheetMessage")?.textContent).toMatch(/isn't an iReal Pro link/)
    expect(document.querySelector(".sheetName")?.textContent).toEqual("ii–V–I workout")
  })

  it("says so when a file isn't a lead sheet", async () => {
    render(<LeadSheetPage />)
    const file = new File(["nonsense"], "nonsense.json")
    ;(file as any).text = () => Promise.resolve("nonsense")

    fireEvent.click(screen.getByRole("button", {name: "Import…"}))
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Lead sheet file to import"), {target: {files: [file]}})
    })

    expect(document.querySelector(".sheetMessage")?.textContent).toMatch(/isn't a lead sheet/)
  })
})

describe("LeadSheetPage playing", () => {

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
    window.localStorage.clear()
    jest.useFakeTimers()
    ;(window as any).AudioContext = FakeAudio
  })

  afterEach(() => {
    jest.useRealTimers()
    delete (window as any).AudioContext
  })

  const play = async (seconds: number) => {
    for (let t = 0; t < seconds; t += 0.05) {
      await act(async () => {
        FakeAudio.last.currentTime += 0.05
        jest.advanceTimersByTime(50)
      })
    }
  }

  it("picks out the chord being played", async () => {
    render(<LeadSheetPage />)
    // two beats a second, so a bar of four every two seconds
    fireEvent.change(screen.getByLabelText("Tempo:"), {target: {value: "120"}})
    await act(async () => { fireEvent.click(screen.getByRole("button", {name: "▶ Play"})) })

    await play(0.5)
    expect(document.querySelector(".chord.playing")?.textContent).toEqual("Dm7")

    await play(2)
    expect(document.querySelector(".chord.playing")?.textContent).toEqual("G7")

    fireEvent.click(screen.getByRole("button", {name: "■ Stop"}))
    expect(document.querySelector(".chord.playing")).toBeNull()
  })

  it("saves the tempo with the sheet", () => {
    render(<LeadSheetPage />)
    fireEvent.change(screen.getByLabelText("Tempo:"), {target: {value: "150"}})
    act(() => { jest.advanceTimersByTime(1000) })

    expect(loadSheet(listSheets()[0].id)?.tempo).toEqual(150)
  })
})
