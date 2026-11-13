// Keeping lead sheets: in the browser's own storage, where they are saved as they are
// changed and are there again on the next visit, and in files, to keep a copy of a sheet
// elsewhere or take it to another browser.
//
// Each sheet is stored under its own key, with a list of them all - their names, and when
// each was last changed - under another, so the list can be shown without reading every
// sheet. Storage can be turned off or full, so nothing here fails for the want of it: a
// sheet that can't be saved just isn't, and saveSheet says so.

import {
  LeadSheet,
  newId,
  validateSheet,
} from "./lead_sheet"

export interface SheetSummary {
  id: string
  name: string
  updatedAt: number
}

const indexKey = "chordAlmanac.leadSheets"
const sheetKeyPrefix = "chordAlmanac.leadSheet."
const sheetKey = (id: string) => sheetKeyPrefix + id
const lastOpenedKey = "chordAlmanac.leadSheets.lastOpened"

function storage(): Storage | undefined {
  try {
    return typeof window != "undefined" ? window.localStorage : undefined
  } catch {
    return undefined
  }
}

function readJson(key: string): unknown {
  try {
    const text = storage()?.getItem(key)
    return text == null ? undefined : JSON.parse(text)
  } catch {
    return undefined
  }
}

function writeJson(key: string, value: unknown): boolean {
  try {
    const s = storage()
    if (s == undefined) {
      return false
    }
    s.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// storedIds lists the ids of every sheet in storage, whether listed or not
function storedIds(): string[] {
  const ids: string[] = []
  try {
    const s = storage()
    for (let i = 0; s != undefined && i < s.length; i++) {
      const key = s.key(i)
      if (key != null && key.indexOf(sheetKeyPrefix) == 0) {
        ids.push(key.slice(sheetKeyPrefix.length))
      }
    }
  } catch {
    // none can be found, then, beyond those listed
  }
  return ids
}

// listSheets lists the sheets saved, the most recently changed first.
//
// The list is kept to save reading every sheet to show it, but it is the sheets
// themselves that count: any sheet in storage the list has lost - because the list
// couldn't be written, or has been spoilt - is listed too, so that it is never lost
// from sight and then overwritten.
export function listSheets(): SheetSummary[] {
  const index = readJson(indexKey)
  const listed = (Array.isArray(index) ? index : [])
    .filter((s): s is SheetSummary => typeof s?.id == "string" && typeof s?.name == "string")
    .map((s) => ({id: s.id, name: s.name, updatedAt: typeof s.updatedAt == "number" ? s.updatedAt : 0}))

  const known = new Set(listed.map((s) => s.id))
  const stored = new Set(storedIds())
  const found: SheetSummary[] = []
  stored.forEach((id) => {
    if (!known.has(id)) {
      const sheet = loadSheet(id)
      if (sheet != undefined) {
        found.push({id: id, name: sheet.name, updatedAt: sheet.updatedAt})
      }
    }
  })

  return [...listed.filter((s) => stored.has(s.id)), ...found]
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function loadSheet(id: string): LeadSheet | undefined {
  const sheet = validateSheet(readJson(sheetKey(id)))
  return sheet == undefined ? undefined : {...sheet, id: id}
}

let askedToPersist = false

// saveSheet saves a sheet, and lists it with the others. It tells whether it could.
export function saveSheet(sheet: LeadSheet): boolean {
  if (!writeJson(sheetKey(sheet.id), sheet)) {
    return false
  }
  const others = listSheets().filter((s) => s.id != sheet.id)
  const name = sheet.name.trim() == "" ? "Untitled" : sheet.name
  const saved = writeJson(indexKey, [{id: sheet.id, name: name, updatedAt: sheet.updatedAt}, ...others])

  // the browser may clear out a site's storage when it runs short of space, unless it
  // has been asked not to; it is asked once, the first time there is something to keep
  if (!askedToPersist) {
    askedToPersist = true
    try {
      navigator.storage?.persist?.().catch(() => {})
    } catch {
      // it may be cleared out, then
    }
  }
  return saved
}

export function deleteSheet(id: string) {
  try {
    storage()?.removeItem(sheetKey(id))
  } catch {
    // it stays, then, but out of the list
  }
  writeJson(indexKey, listSheets().filter((s) => s.id != id))
}

export function lastOpenedId(): string | undefined {
  try {
    return storage()?.getItem(lastOpenedKey) ?? undefined
  } catch {
    return undefined
  }
}

export function setLastOpenedId(id: string) {
  try {
    storage()?.setItem(lastOpenedKey, id)
  } catch {
    // it opens on another sheet next time, then
  }
}

// the extension of a lead sheet file
export const sheetFileExtension = ".leadsheet.json"

// sheetFileName names the file a sheet is exported to, after the sheet, leaving out any
// characters a file's name can't have
export function sheetFileName(sheet: LeadSheet): string {
  const name = sheet.name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "").trim()
  return (name == "" ? "lead sheet" : name) + sheetFileExtension
}

// exportSheet hands the sheet to the browser to save as a file, as it would anything
// else downloaded
export function exportSheet(sheet: LeadSheet) {
  const blob = new Blob([JSON.stringify(sheet, null, 2)], {type: "application/json"})
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = sheetFileName(sheet)
  document.body.appendChild(link)
  link.click()
  link.remove()
  // once the browser has had the chance to start saving it
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// readSheetText reads a sheet from the text of a file. A sheet whose id is already in use
// by a saved sheet is given a new one, so that importing a copy never overwrites the
// sheet it was a copy of.
//
// Lead sheets written in other formats will be read from here too, one day.
export function readSheetText(text: string): LeadSheet | undefined {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return undefined
  }
  const sheet = validateSheet(data)
  if (sheet == undefined) {
    return undefined
  }
  const taken = listSheets().some((s) => s.id == sheet.id)
  return {...sheet, id: taken ? newId() : sheet.id, updatedAt: Date.now()}
}

// importSheetFile reads a sheet from a file chosen to import, failing if it isn't one
export async function importSheetFile(file: Blob): Promise<LeadSheet> {
  const text = await file.text()
  const sheet = readSheetText(text)
  if (sheet == undefined) {
    throw new Error("not a lead sheet this site can read")
  }
  return sheet
}
