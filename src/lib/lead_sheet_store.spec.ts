/**
 * @jest-environment jsdom
 */

import {
  LeadSheet,
  newSheet,
} from "./lead_sheet"

import {
  deleteSheet,
  lastOpenedId,
  listSheets,
  loadSheet,
  readSheetText,
  saveSheet,
  setLastOpenedId,
  sheetFileName,
} from "./lead_sheet_store"

const sheet = (name: string, updatedAt: number): LeadSheet => ({
  ...newSheet(name),
  bars: [{chords: ["Dm7", "G7"]}, {chords: ["Cmaj7"], section: "A"}],
  updatedAt: updatedAt,
})

describe("lead sheet storage", () => {

  beforeEach(() => {
    window.localStorage.clear()
  })

  it("saves sheets, and lists them the most recently changed first", () => {
    const a = sheet("Alpha", 100)
    const b = sheet("Beta", 200)
    expect(saveSheet(a)).toBe(true)
    expect(saveSheet(b)).toBe(true)

    expect(listSheets()).toEqual([
      {id: b.id, name: "Beta", updatedAt: 200},
      {id: a.id, name: "Alpha", updatedAt: 100},
    ])
    expect(loadSheet(a.id)).toEqual(a)
  })

  it("saves a sheet again over itself", () => {
    const a = sheet("Alpha", 100)
    saveSheet(a)
    saveSheet({...a, name: "Alpha 2", updatedAt: 300})

    expect(listSheets()).toEqual([{id: a.id, name: "Alpha 2", updatedAt: 300}])
    expect(loadSheet(a.id)?.name).toEqual("Alpha 2")
  })

  it("deletes a sheet", () => {
    const a = sheet("Alpha", 100)
    const b = sheet("Beta", 200)
    saveSheet(a)
    saveSheet(b)
    deleteSheet(a.id)

    expect(listSheets().map((s) => s.name)).toEqual(["Beta"])
    expect(loadSheet(a.id)).toBeUndefined()
  })

  it("lists nothing when nothing is stored", () => {
    expect(listSheets()).toEqual([])
  })

  it("still lists every sheet when the list of them is spoilt, and keeps them listed", () => {
    const a = sheet("Alpha", 100)
    const b = sheet("Beta", 200)
    saveSheet(a)
    saveSheet(b)
    window.localStorage.setItem("chordAlmanac.leadSheets", "{not json")

    expect(listSheets().map((s) => s.name)).toEqual(["Beta", "Alpha"])

    // saving one writes the list out again with the other in it
    saveSheet({...a, updatedAt: 300})
    expect(JSON.parse(window.localStorage.getItem("chordAlmanac.leadSheets")!).map((s: any) => s.name))
      .toEqual(["Alpha", "Beta"])
  })

  it("leaves out of the list a sheet no longer stored", () => {
    const a = sheet("Alpha", 100)
    saveSheet(a)
    window.localStorage.removeItem("chordAlmanac.leadSheet." + a.id)

    expect(listSheets()).toEqual([])
  })

  it("lists a sheet with no name as untitled", () => {
    saveSheet(sheet("  ", 100))
    expect(listSheets()[0].name).toEqual("Untitled")
  })

  it("remembers the sheet last opened", () => {
    expect(lastOpenedId()).toBeUndefined()
    setLastOpenedId("abc")
    expect(lastOpenedId()).toEqual("abc")
  })
})

describe("lead sheet files", () => {

  beforeEach(() => {
    window.localStorage.clear()
  })

  it("reads a sheet back from the file it was written to", () => {
    const a = sheet("Alpha", 100)
    const read = readSheetText(JSON.stringify(a, null, 2))!

    expect({...read, updatedAt: 100}).toEqual(a)
  })

  it("gives a sheet a new id if one saved already has its id", () => {
    const a = sheet("Alpha", 100)
    saveSheet(a)
    const read = readSheetText(JSON.stringify(a))!

    expect(read.id).not.toEqual(a.id)
    expect(read.bars).toEqual(a.bars)
  })

  it.each([
    ["not json"],
    ["{}"],
    ["[1, 2, 3]"],
  ])("won't read %p", (text) => {
    expect(readSheetText(text)).toBeUndefined()
  })

  it("names the file after the sheet", () => {
    expect(sheetFileName({...sheet("All the Things / Alt", 0)})).toEqual("All the Things  Alt.leadsheet.json")
    expect(sheetFileName({...sheet(" ?? ", 0)})).toEqual("lead sheet.leadsheet.json")
  })
})
