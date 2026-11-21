// Reading lead sheets from iReal Pro, from the links it shares tunes and playlists by:
// "irealb://" links, and the older "irealbook://" ones.
//
// A link is a list of tunes, percent-encoded, separated by "===" and followed by the
// playlist's name. Each tune is a list of fields separated by "=" - its title, composer,
// style, key and so on - one of which is the chart itself, written in iReal Pro's own
// notation: chords, barlines, rehearsal marks, repeats and endings, one character or so
// apiece. In irealb links the chart is scrambled, to keep it from being read too
// easily; irealbook links leave it as it is.
//
// This follows the reading of the format in Data::iRealPro, by Johan Vromans:
// https://github.com/sciurius/perl-Data-iRealPro
//
// Lead sheets here have no repeat signs, so the repeats and endings are played through
// in order as the bars they stand for. What can't be carried over at all - codas and
// segnos, changes of time signature, alternate chords - is noted, to be told.

import {
  normaliseChord,
  parseChord,
} from "music-lib/theory"

import {
  Bar,
  LeadSheet,
  defaultTempo,
  newSheet,
  repeatChord,
  validateSheet,
} from "./lead_sheet"

export interface IRealSong {
  title: string
  composer: string
  style: string
  key: string
  // the tempo it is played at, if the tune gives one
  tempo?: number
  // the chart, unscrambled
  chart: string
}

export interface IRealPlaylist {
  name?: string
  songs: IRealSong[]
}

const linkPattern = /irealb(?:ook)?:\/\/[^\s"'<>]+/g

// the charts in irealb links start with this, before they are scrambled
const scrambledPrefix = "1r34LbKcu7"

// unscramble undoes the scrambling of an irealb chart. The chart is taken 50 characters
// at a time, and in each the first five and last five swap places back to front, as do
// the 10th to 24th and the 27th to 40th; scrambling and unscrambling are the same. The
// last 50 characters or fewer are left as they are - as are the 50 before them if only
// one character follows. Then the shorthand for runs that come up often is spelled out.
export function unscramble(scrambled: string): string {
  let s = scrambled.indexOf(scrambledPrefix) == 0 ? scrambled.slice(scrambledPrefix.length) : scrambled
  let out = ""
  while (s.length > 50) {
    const block = s.slice(0, 50)
    s = s.slice(50)
    if (s.length < 2) {
      out += block
      break
    }
    const chars = block.split("")
    for (let i = 0; i < 50; i++) {
      if (i < 5 || (i >= 10 && i < 24) || (i >= 26 && i < 40) || i >= 45) {
        chars[i] = block[49 - i]
      }
    }
    out += chars.join("")
  }
  return (out + s)
    .replace(/XyQ/g, "   ")
    .replace(/LZ/g, " |")
    .replace(/Kcl/g, "| x")
}

// parseIRealLink reads the tunes from a link, or gives undefined if it isn't one
export function parseIRealLink(link: string): IRealPlaylist | undefined {
  const m = /^irealb(ook)?:\/\/([\s\S]*)$/.exec(link.trim())
  if (m == null) {
    return undefined
  }
  const isOld = m[1] != undefined

  let data: string
  try {
    data = decodeURIComponent(m[2])
  } catch {
    return undefined
  }

  let name: string | undefined = undefined
  let tunes: string[]
  if (data.indexOf("===") >= 0) {
    tunes = data.split("===")
    // a single tune ends with "===" and nothing after
    name = tunes.length > 1 ? tunes.pop() : undefined
  } else if (isOld) {
    // the old links can run their tunes together, six fields apiece, with the
    // playlist's name last
    const fields = data.split("=")
    tunes = []
    while (fields.length >= 6) {
      tunes.push(fields.splice(0, 6).join("="))
    }
    name = fields.join("=")
  } else {
    tunes = [data]
  }

  const songs: IRealSong[] = []
  for (const tune of tunes) {
    const song = isOld ? readOldTune(tune) : readTune(tune)
    if (song != undefined) {
      songs.push(song)
    }
  }
  return {name: name == undefined || name.trim() == "" ? undefined : name, songs: songs}
}

// a tune in an irealb link: title, composer, (unused), style, key, (key transposed to),
// chart, (style played in), tempo, (times played through)
function readTune(tune: string): IRealSong | undefined {
  const f = tune.split("=")
  if (f.length < 7 || f[6].indexOf(scrambledPrefix) != 0) {
    return undefined
  }
  const tempo = Number(f[8])
  return {
    title: f[0],
    composer: f[1],
    style: f[3],
    key: f[4],
    tempo: isFinite(tempo) && tempo > 0 ? tempo : undefined,
    chart: unscramble(f[6]),
  }
}

// a tune in an irealbook link: title, composer, style, (unused), key, chart - except that
// the key and the unused field are sometimes the other way round, with "n" for the key
function readOldTune(tune: string): IRealSong | undefined {
  const f = tune.split("=")
  if (f.length < 6) {
    return undefined
  }
  const key = f[4] == "n" ? f[3] : f[4]
  return {title: f[0], composer: f[1], style: f[2], key: key, chart: f[5]}
}

// ---- reading a chart

// ChartBar is a bar as the chart writes it, before its repeats are played through
interface ChartBar {
  chords: string[]
  section?: string
  // the ending (first time, second time...) it starts
  ending?: number
  repeatStart?: boolean
  repeatEnd?: boolean
  // how many times a repeat is played, if the chart says ("3x")
  times?: number
  // a bar repeating the bar before ("x"), or the two before ("r")
  repeat?: "bar" | "twoBars"
}

export interface Chart {
  beatsPerBar?: number
  bars: Bar[]
  // what in the chart couldn't be carried over
  notes: string[]
}

const hasContent = (bar: ChartBar) => bar.chords.length > 0 || bar.repeat != undefined

const sectionNames: Record<string, string> = {v: "V", i: "In"}

// a chord: a root (or W, a chord not shown), its quality (or a quality of its own,
// between asterisks), a bass note, and an alternate chord in brackets
const chordPattern = /^([A-G][b#]?|W)((?:\*[^*]*\*|sus|alt|add|[\^\-+ohb#\d])*)(\/[A-G][b#]?)?(\([^)]*\))?/

// readChart reads a chart into bars, with its repeats played through
export function readChart(chart: string): Chart {
  const notes = new Set<string>()
  const bars: ChartBar[] = []
  let beatsPerBar: number | undefined = undefined
  let bar: ChartBar = {chords: []}

  // the bar is finished at a barline - unless nothing has been written in it, when what
  // has been marked on it (a section, say) goes on to the bar that is
  const close = () => {
    if (hasContent(bar)) {
      bars.push(bar)
      bar = {chords: []}
    }
  }

  let i = 0
  while (i < chart.length) {
    const rest = chart.slice(i)
    const c = chart[i]
    let m: RegExpExecArray | null

    if (c == "{") {
      close()
      bar.repeatStart = true
      i++
    } else if (c == "}") {
      if (hasContent(bar)) {
        bar.repeatEnd = true
        close()
      } else if (bars.length > 0) {
        bars[bars.length - 1].repeatEnd = true
      }
      i++
    } else if (c == "|" || c == "[" || c == "]" || c == "Z") {
      close()
      i++
    } else if ((m = /^\*([A-Za-z])/.exec(rest)) != null) {
      bar.section = sectionNames[m[1]] ?? m[1]
      i += m[0].length
    } else if ((m = /^T(\d)(\d)/.exec(rest)) != null) {
      // 12/8 is written T12
      const beats = m[1] + m[2] == "12" ? 12 : Number(m[1])
      if (beatsPerBar == undefined) {
        beatsPerBar = beats
      } else if (beats != beatsPerBar) {
        notes.add("changes of time signature (the first is kept throughout)")
      }
      i += m[0].length
    } else if ((m = /^N(\d)/.exec(rest)) != null) {
      bar.ending = Number(m[1])
      i += m[0].length
    } else if ((m = /^<([^>]*)>/.exec(rest)) != null) {
      const text = m[1]
      const times = /(\d+)\s*x/i.exec(text)
      if (times != null) {
        bar.times = Number(times[1])
      } else if (/D\.?\s*[CS]\.?|Fine|Coda|Segno/i.test(text)) {
        notes.add("codas, segnos, D.C. and D.S. (the chart is played straight through)")
      }
      i += m[0].length
    } else if ((m = chordPattern.exec(rest)) != null) {
      const [whole, root, quality, bass, alternate] = m
      if (root == "W") {
        // a chord not shown, which carries on the one before
        bar.chords.push(repeatChord)
      } else {
        const text = root + quality + (bass ?? "")
        if (parseChord(text) == undefined) {
          notes.add("chords it can't read (left silent)")
        }
        bar.chords.push(normaliseChord(text))
      }
      if (alternate != undefined) {
        notes.add("alternate chords (left out)")
      }
      i += whole.length
    } else if (c == "n") {
      // no chord
      bar.chords.push("")
      i++
    } else if (c == "p") {
      // a slash, carrying on the chord before
      bar.chords.push(repeatChord)
      i++
    } else if (c == "x") {
      bar.repeat = "bar"
      i++
    } else if (c == "r") {
      bar.repeat = "twoBars"
      i++
    } else if (c == "Q" || c == "S") {
      notes.add("codas, segnos, D.C. and D.S. (the chart is played straight through)")
      i++
    } else if (c == "f") {
      notes.add("fermatas")
      i++
    } else if ((m = /^\([^)]*\)/.exec(rest)) != null) {
      notes.add("alternate chords (left out)")
      i += m[0].length
    } else {
      // spaces and commas between chords, chords drawn small or large (s, l), space
      // between lines (Y), the end (U), and anything else unknown
      i++
    }
  }
  close()

  return {beatsPerBar: beatsPerBar, bars: playThrough(bars), notes: Array.from(notes)}
}

// how many times a repeat starting at the given bar is played: as many times as it has
// endings, or as the chart says, or twice
function timesPlayed(bars: ChartBar[], start: number, end: number): number {
  let endings = 0
  for (let j = start; j < bars.length && (j == start || !bars[j].repeatStart); j++) {
    endings = Math.max(endings, bars[j].ending ?? 0)
  }
  if (endings >= 2) {
    return endings
  }
  for (let j = start; j <= end; j++) {
    const times = bars[j].times
    if (times != undefined && times >= 1) {
      return times
    }
  }
  return 2
}

// the bar after the ending starting at the given bar: after the end of its repeat, or
// at the start of the next ending
function afterEnding(bars: ChartBar[], start: number): number {
  let j = start
  while (j < bars.length) {
    j++
    if (bars[j - 1].repeatEnd || (j < bars.length && bars[j].ending != undefined)) {
      break
    }
  }
  return j
}

// a repeat played through more times than any tune needs is taken as a chart gone wrong
const mostBars = 2000

// playThrough lays out the bars as they are played, going round each repeat - skipping
// the endings already played on the way round - and writing out the bars that repeat
// others as % (or, for two bars, as the bars they repeat)
function playThrough(bars: ChartBar[]): Bar[] {
  const out: Bar[] = []
  let start = 0
  let pass = 1
  let goneBack = false

  let i = 0
  while (i < bars.length && out.length < mostBars) {
    const bar = bars[i]
    if (bar.repeatStart && !goneBack) {
      start = i
      pass = 1
    }
    goneBack = false

    if (bar.ending != undefined && bar.ending < pass) {
      i = afterEnding(bars, i)
      continue
    }

    const section = bar.section == undefined ? {} : {section: bar.section}
    if (bar.repeat == "bar") {
      out.push({chords: [repeatChord], ...section})
    } else if (bar.repeat == "twoBars") {
      const two = out.slice(-2).map((b) => ({chords: [...b.chords]}))
      if (two.length > 0) {
        two[0] = {...two[0], ...section}
      }
      out.push(...two)
    } else {
      out.push({chords: bar.chords, ...section})
    }

    if (bar.repeatEnd && pass < timesPlayed(bars, start, i)) {
      pass++
      i = start
      goneBack = true
      continue
    }
    i++
  }
  return out
}

// ---- tunes into lead sheets

export function songToSheet(song: IRealSong): {sheet: LeadSheet, notes: string[]} {
  const chart = readChart(song.chart)
  const sheet = validateSheet({
    ...newSheet(song.title.trim() == "" ? "Untitled" : song.title),
    composer: song.composer,
    style: song.style,
    key: song.key,
    tempo: song.tempo ?? defaultTempo,
    beatsPerBar: chart.beatsPerBar ?? 4,
    bars: chart.bars,
  })!
  return {sheet: sheet, notes: chart.notes}
}

export interface IRealImport {
  sheets: LeadSheet[]
  playlist?: string
  notes: string[]
}

// readIRealText reads every tune from the iReal Pro links found in some text - a link
// on its own, or a page of them, as iReal Pro exports a playlist - giving undefined if
// there are none
export function readIRealText(text: string): IRealImport | undefined {
  const links = text.match(linkPattern)
  if (links == null) {
    return undefined
  }
  const sheets: LeadSheet[] = []
  const notes = new Set<string>()
  let playlist: string | undefined = undefined
  for (const link of links) {
    const list = parseIRealLink(link)
    if (list == undefined) {
      continue
    }
    playlist = playlist ?? list.name
    for (const song of list.songs) {
      const read = songToSheet(song)
      sheets.push(read.sheet)
      read.notes.forEach((n) => notes.add(n))
    }
  }
  return sheets.length == 0 ? undefined : {sheets: sheets, playlist: playlist, notes: Array.from(notes)}
}
