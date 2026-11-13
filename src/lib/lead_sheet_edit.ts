// Changing a lead sheet a chord at a time, as the editor does: writing a chord in, moving
// on from one to the next (making room for it as it goes), and adding and taking away
// bars and chords. Each change gives a new sheet, leaving the one it was given as it was.

import {
  Bar,
  LeadSheet,
} from "./lead_sheet"

// At is a place for a chord: a bar, and which of the chords in it
export interface At {
  bar: number
  index: number
}

export interface Moved {
  sheet: LeadSheet
  at: At
}

const withBars = (sheet: LeadSheet, bars: Bar[]): LeadSheet => ({...sheet, bars: bars})

const replaceBar = (sheet: LeadSheet, b: number, bar: Bar): LeadSheet =>
  withBars(sheet, sheet.bars.map((old, i) => i == b ? bar : old))

const emptyBar = (): Bar => ({chords: [""]})

export function chordAt(sheet: LeadSheet, at: At): string {
  return sheet.bars[at.bar]?.chords[at.index] ?? ""
}

export function withChord(sheet: LeadSheet, at: At, text: string): LeadSheet {
  const bar = sheet.bars[at.bar]
  if (bar == undefined || bar.chords[at.index] == text) {
    return sheet
  }
  return replaceBar(sheet, at.bar, {...bar, chords: bar.chords.map((c, i) => i == at.index ? text : c)})
}

// tidyBar takes the empty chords out of a bar that has others in it, which are left
// behind by moving on from a chord without writing one
export function tidyBar(sheet: LeadSheet, b: number): LeadSheet {
  const bar = sheet.bars[b]
  if (bar == undefined || !bar.chords.some((c) => c.trim() == "") || bar.chords.every((c) => c.trim() == "")) {
    return sheet
  }
  return replaceBar(sheet, b, {...bar, chords: bar.chords.filter((c) => c.trim() != "")})
}

// trimEnd takes away the empty bars at the end of the sheet, which are left behind by
// moving on past the last chord written - keeping at least one bar
export function trimEnd(sheet: LeadSheet): LeadSheet {
  const isEmpty = (bar: Bar) => bar.section == undefined && bar.chords.every((c) => c.trim() == "")
  let end = sheet.bars.length
  while (end > 1 && isEmpty(sheet.bars[end - 1])) {
    end--
  }
  return end == sheet.bars.length ? sheet : withBars(sheet, sheet.bars.slice(0, end))
}

// nextBar moves to the first chord of the next bar, adding a bar if this is the last
export function nextBar(sheet: LeadSheet, at: At): Moved {
  if (at.bar + 1 >= sheet.bars.length) {
    sheet = withBars(sheet, [...sheet.bars, emptyBar()])
  }
  return {sheet: sheet, at: {bar: at.bar + 1, index: 0}}
}

// nextChordInBar moves to the next chord in the bar, adding one if the bar has a beat
// left to give it, and on to the next bar if not
export function nextChordInBar(sheet: LeadSheet, at: At): Moved {
  const bar = sheet.bars[at.bar]
  if (at.index + 1 < bar.chords.length) {
    return {sheet: sheet, at: {bar: at.bar, index: at.index + 1}}
  }
  if (bar.chords.length < sheet.beatsPerBar) {
    return {
      sheet: replaceBar(sheet, at.bar, {...bar, chords: [...bar.chords, ""]}),
      at: {bar: at.bar, index: at.index + 1},
    }
  }
  return nextBar(sheet, at)
}

// nextChord moves to the chord after this one, wherever it is, adding a bar after the
// last chord of the last bar
export function nextChord(sheet: LeadSheet, at: At): Moved {
  if (at.index + 1 < sheet.bars[at.bar].chords.length) {
    return {sheet: sheet, at: {bar: at.bar, index: at.index + 1}}
  }
  return nextBar(sheet, at)
}

// previousChord moves to the chord before this one, staying put at the very start
export function previousChord(sheet: LeadSheet, at: At): At {
  if (at.index > 0) {
    return {bar: at.bar, index: at.index - 1}
  }
  if (at.bar > 0) {
    return {bar: at.bar - 1, index: sheet.bars[at.bar - 1].chords.length - 1}
  }
  return at
}

// barAbove and barBelow move up or down a line of the chart, to whichever chord of that
// bar is nearest the same place in it
export function barAbove(sheet: LeadSheet, at: At, barsPerLine: number): At {
  return toBar(sheet, at, at.bar - barsPerLine)
}

export function barBelow(sheet: LeadSheet, at: At, barsPerLine: number): At {
  return toBar(sheet, at, at.bar + barsPerLine)
}

function toBar(sheet: LeadSheet, at: At, b: number): At {
  if (b < 0 || b >= sheet.bars.length) {
    return at
  }
  return {bar: b, index: Math.min(at.index, sheet.bars[b].chords.length - 1)}
}

// removeChord takes a chord out of its bar, and the bar out of the sheet if it was the
// bar's only chord - unless it is the only bar. It moves back to the chord before.
export function removeChord(sheet: LeadSheet, at: At): Moved {
  const bar = sheet.bars[at.bar]
  if (bar.chords.length > 1) {
    return {
      sheet: replaceBar(sheet, at.bar, {...bar, chords: bar.chords.filter((_, i) => i != at.index)}),
      at: {bar: at.bar, index: Math.max(0, at.index - 1)},
    }
  }
  return deleteBar(sheet, at.bar)
}

// insertBar adds an empty bar after the one given, and moves into it
export function insertBar(sheet: LeadSheet, after: number): Moved {
  const bars = [...sheet.bars]
  bars.splice(after + 1, 0, emptyBar())
  return {sheet: withBars(sheet, bars), at: {bar: after + 1, index: 0}}
}

// deleteBar takes a bar out, leaving an empty one if it was the only one, and moves to
// the last chord of the bar before it
export function deleteBar(sheet: LeadSheet, b: number): Moved {
  if (sheet.bars.length <= 1) {
    return {sheet: withBars(sheet, [emptyBar()]), at: {bar: 0, index: 0}}
  }
  const bars = sheet.bars.filter((_, i) => i != b)
  const to = Math.max(0, b - 1)
  return {
    sheet: withBars(sheet, bars),
    at: b == 0 ? {bar: 0, index: 0} : {bar: to, index: bars[to].chords.length - 1},
  }
}

// addChordToBar adds a chord after the one given, if the bar has a beat to
// give it
export function addChordToBar(sheet: LeadSheet, at: At): Moved {
  const bar = sheet.bars[at.bar]
  if (bar.chords.length >= sheet.beatsPerBar) {
    return {sheet: sheet, at: at}
  }
  const chords = [...bar.chords]
  chords.splice(at.index + 1, 0, "")
  return {sheet: replaceBar(sheet, at.bar, {...bar, chords: chords}), at: {bar: at.bar, index: at.index + 1}}
}

export function setSection(sheet: LeadSheet, b: number, section: string): LeadSheet {
  const bar = sheet.bars[b]
  const label = section.trim()
  const {section: _old, ...rest} = bar
  return replaceBar(sheet, b, label == "" ? rest : {...rest, section: label})
}

// setBeatsPerBar changes the time signature. A bar left with more chords than beats
// keeps them all, though only as many as it has beats for are played, so that changing
// back brings the rest back.
export function setBeatsPerBar(sheet: LeadSheet, beatsPerBar: number): LeadSheet {
  return {...sheet, beatsPerBar: beatsPerBar}
}
