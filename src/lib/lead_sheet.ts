// A lead sheet: the chord changes of a tune, bar by bar, and how to play them through.
//
// Chords are kept as the symbols written on the sheet ("B♭m7", "G7alt"), so the sheet
// reads as the chart does, and is read into chords to play only when it is played. A bar
// with nothing but "%" in it repeats the bar before it, as on a chart; a "%" among other
// chords repeats the chord before it. A chord left empty is a bar (or part of one) with
// no chord, and nothing but the metronome is heard through it.

import {
  ParsedChord,
  parseChord,
} from "./chord_parser"

import {
  voiceProgression,
} from "./chord_voicing"

import {
  PlayerLoop,
  PlayerNote,
} from "./pattern_player"

export const leadSheetVersion = 1

export interface Bar {
  // the chords in the bar, which share its beats between them
  chords: string[]
  // the letter of the section of the tune the bar starts, if it starts one: "A", "B"
  section?: string
}

export interface LeadSheet {
  // the version of the format the sheet was saved in, so that later versions can read
  // older sheets
  version: number
  id: string
  name: string
  // the tempo it is played at to start with, in beats a minute
  tempo: number
  beatsPerBar: number
  bars: Bar[]
  // when it was last changed, in milliseconds since 1970
  updatedAt: number
}

export const defaultTempo = 120
export const repeatChord = "%"

// newId gives a sheet an identity no other sheet has
export function newId(): string {
  const c = typeof crypto != "undefined" ? crypto : undefined
  if (c != undefined && typeof c.randomUUID == "function") {
    return c.randomUUID()
  }
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10)
}

export function newSheet(name: string): LeadSheet {
  return {
    version: leadSheetVersion,
    id: newId(),
    name: name,
    tempo: defaultTempo,
    beatsPerBar: 4,
    bars: [{chords: [""]}],
    updatedAt: Date.now(),
  }
}

// a sheet to start with on a first visit, so there is something to play: ii-V-Is round
// a few keys, major then minor
export function exampleSheet(): LeadSheet {
  const bars = (text: string): Bar[] => text.split("|").map((bar) => ({
    chords: bar.trim().split(/\s+/),
  }))
  return {
    ...newSheet("ii–V–I workout"),
    bars: [
      ...bars("Dm7 | G7 | Cmaj7 | % | Cm7 | F7 | B♭maj7 | %"),
      ...bars("B♭m7 | E♭7 | A♭maj7 | % | Dm7♭5 | G7alt | Cm6 | Cm6"),
    ].map((bar, i) => i % 8 == 0 ? {...bar, section: i == 0 ? "A" : "B"} : bar),
  }
}

// chordBeats shares out a bar's beats among the chords in it, as evenly as they will go:
// the first chords take any beats over, so three chords in a bar of four take two beats,
// one and one.
export function chordBeats(numChords: number, beatsPerBar: number): number[] {
  const n = Math.max(1, Math.min(numChords, beatsPerBar))
  const each = Math.floor(beatsPerBar / n)
  const over = beatsPerBar % n
  return Array.from({length: n}, (_, i) => each + (i < over ? 1 : 0))
}

// SheetChord is a chord on the sheet, where it falls in the tune and how long it lasts
export interface SheetChord {
  bar: number
  // its place among the chords of its bar
  index: number
  // the beat it starts on, counting from the start of the tune
  beat: number
  beats: number
  text: string
}

// sheetChords lists the chords of the sheet in order, each where it falls
export function sheetChords(sheet: LeadSheet): SheetChord[] {
  const chords: SheetChord[] = []
  sheet.bars.forEach((bar, b) => {
    let beat = b * sheet.beatsPerBar
    const lengths = chordBeats(bar.chords.length, sheet.beatsPerBar)
    lengths.forEach((beats, i) => {
      chords.push({bar: b, index: i, beat: beat, beats: beats, text: bar.chords[i] ?? ""})
      beat += beats
    })
  })
  return chords
}

// chordAtBeat finds the chord sounding on a beat of the tune
export function chordAtBeat(chords: SheetChord[], beat: number): SheetChord | undefined {
  return chords.find((c) => c.beat <= beat && beat < c.beat + c.beats)
}

// PlayedChord is a chord as it is played: the beat it starts on, how long it lasts, and
// the chord (none, for a chord left empty or one that can't be read)
export interface PlayedChord {
  beat: number
  beats: number
  chord?: ParsedChord
}

const isRepeat = (text: string) => text.trim() == repeatChord

// playedChords reads the sheet into the chords to play, in order, the repeats played as
// the bars and chords they repeat
export function playedChords(sheet: LeadSheet): PlayedChord[] {
  const played: PlayedChord[] = []
  // the bar before, as it was played, with its chords' beats counted from its start
  let barBefore: PlayedChord[] = []
  let chordBefore: ParsedChord | undefined = undefined

  sheet.bars.forEach((bar, b) => {
    const start = b * sheet.beatsPerBar
    let thisBar: PlayedChord[]

    if (b > 0 && bar.chords.length == 1 && isRepeat(bar.chords[0])) {
      thisBar = barBefore
    } else {
      let beat = 0
      thisBar = chordBeats(bar.chords.length, sheet.beatsPerBar).map((beats, i) => {
        const text = bar.chords[i] ?? ""
        const chord = isRepeat(text) ? chordBefore : parseChord(text)
        const c = {beat: beat, beats: beats, chord: chord}
        beat += beats
        return c
      })
    }

    for (const c of thisBar) {
      played.push({...c, beat: start + c.beat})
      chordBefore = c.chord
    }
    barBefore = thisBar
  })
  return played
}

// sheetLoop is the sheet as the player plays it, a beat to a slot: each chord sounded
// as it comes in and held through its beats
export function sheetLoop(sheet: LeadSheet): PlayerLoop {
  const played = playedChords(sheet)
  const voicings = voiceProgression(played.map((c) => c.chord))

  const notes: (PlayerNote[] | undefined)[] = []
  played.forEach((c, i) => {
    const v = voicings[i]
    if (v != undefined) {
      notes[c.beat] = [v.bass, ...v.voices].map((midi) => ({midi: midi, slots: c.beats}))
    }
  })

  return {
    slotsPerBeat: 1,
    beatsPerBar: sheet.beatsPerBar,
    // a sheet with no bars still has a bar of metronome to play
    numBars: Math.max(1, sheet.bars.length),
    notes: notes,
  }
}

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x == "object" && x != null && !Array.isArray(x)

// validateSheet checks that what was read in (from a file, or from the browser's
// storage) is a lead sheet this version of the site can play, giving undefined if not.
// Anything it can fill in for itself - a missing tempo, say - it does.
export function validateSheet(data: unknown): LeadSheet | undefined {
  if (!isRecord(data) || !Array.isArray(data.bars)) {
    return undefined
  }
  if (typeof data.version == "number" && data.version > leadSheetVersion) {
    return undefined
  }

  const bars: Bar[] = []
  for (const bar of data.bars) {
    if (!isRecord(bar) || !Array.isArray(bar.chords) || !bar.chords.every((c) => typeof c == "string")) {
      return undefined
    }
    bars.push({
      chords: bar.chords.length > 0 ? bar.chords as string[] : [""],
      ...(typeof bar.section == "string" && bar.section != "" ? {section: bar.section} : {}),
    })
  }

  const number = (x: unknown, min: number, max: number, otherwise: number) =>
    typeof x == "number" && isFinite(x) ? Math.max(min, Math.min(max, Math.round(x))) : otherwise

  const beatsPerBar = number(data.beatsPerBar, 1, 12, 4)
  return {
    version: leadSheetVersion,
    id: typeof data.id == "string" && data.id != "" ? data.id : newId(),
    name: typeof data.name == "string" && data.name.trim() != "" ? data.name : "Untitled",
    tempo: number(data.tempo, 30, 240, defaultTempo),
    beatsPerBar: beatsPerBar,
    bars: bars.length > 0 ? bars : [{chords: [""]}],
    updatedAt: number(data.updatedAt, 0, Number.MAX_SAFE_INTEGER, Date.now()),
  }
}
