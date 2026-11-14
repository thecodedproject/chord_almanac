import {
  parseIRealLink,
  readChart,
  readIRealText,
  unscramble,
} from "./ireal"

// a tune shared from iReal Pro: And What If I Don't, by Herbie Hancock
const andWhatIfIDont = "irealb://And%20What%20If%20I%20Don%27t=Hancock%20Herbie==Medium%20Swing=Eb==1r34LbKcu71N%7CQy4Eb7%20QyX7bEZL%20lcKQy7X%2DC%7CQyX7bEZL7bB%7CAb7X4TA%2A%7BX7GB%2AQ%7CF%2D77bEZL7bB%207%2DF2NLZ%20QyXQyX%7DQyXbB%2FXyQ%5D%5ByX7%2DFB%207bE%20LZC7%20lcKQyX7bBZL%20lKcQyX7FZL%20lcKQyX%20%5D%5B%2AAlcKQybB%2F7%2Db7XyQ7%2DF%7CQyX7bA%7CQyXb7EZL%20lcKQyX7%2DC%7CXyQ%7CFEZL7bXyQZ%20==0=0==="

const chords = (bars: {chords: string[]}[]) => bars.map((b) => b.chords.join(" "))

describe("unscramble", () => {
  it("unscrambles the chart of a tune", () => {
    const song = parseIRealLink(andWhatIfIDont)!.songs[0]

    expect(song.chart).toEqual(
      "{*AT44Eb7 Bb7 |Eb7   |C-7   | x  |Eb7   |Ab7   |N1F-7   |F-7/Bb   }        |N2F-7 Bb7 |Eb7   ]"
      + "[*BG7   | x  |C7   | x  |F7   | x  |Bb7   | x  ]"
      + "[*AEb7 Bb7 |Eb7   |C-7   | x  |Eb7   |Ab7   |F-7   |F-7/Bb   Z ")
  })

  it("is undone by doing it again, before the shorthand is spelled out", () => {
    const text = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "!".repeat(40)
    const once = unscramble("1r34LbKcu7" + text)
    expect(unscramble("1r34LbKcu7" + once)).toEqual(text)
    expect(once).not.toEqual(text)
  })

  it("leaves a chart of 50 characters or fewer as it is", () => {
    expect(unscramble("1r34LbKcu7" + "a".repeat(20) + "b".repeat(30))).toEqual("a".repeat(20) + "b".repeat(30))
  })

  it("leaves the last block alone when only one character follows it", () => {
    const text = "x".repeat(50) + "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX" + "!"
    expect(unscramble("1r34LbKcu7" + text).slice(50)).toEqual(text.slice(50))
  })
})

describe("parseIRealLink", () => {
  it("reads what is known of the tune", () => {
    const list = parseIRealLink(andWhatIfIDont)!

    expect(list.name).toBeUndefined()
    expect(list.songs.length).toEqual(1)
    const {chart: _chart, ...song} = list.songs[0]
    expect(song).toEqual({
      title: "And What If I Don't",
      composer: "Hancock Herbie",
      style: "Medium Swing",
      key: "Eb",
      tempo: undefined,
    })
  })

  it("reads every tune of a playlist, and the playlist's name", () => {
    const tune = andWhatIfIDont.slice("irealb://".length, -"===".length)
    const tempoed = tune.replace(/==0=0$/, "==160=0")
    const list = parseIRealLink("irealb://" + tune + "===" + tempoed + "===My%20Gig")!

    expect(list.name).toEqual("My Gig")
    expect(list.songs.length).toEqual(2)
    expect(list.songs[1].tempo).toEqual(160)
  })

  it("reads the older irealbook links, whose charts are not scrambled", () => {
    const list = parseIRealLink(
      "irealbook://Blues%20in%20F=Someone=Medium%20Swing=n=F=*AT44F7 |Bb7 |F7 |x |Bb7 |x |F7 |D7 |G-7 |C7 |F7 D7|G-7 C7 Z"
      + "=Other=Someone=Bossa%20Nova=n=C=T44C^7 |x Z=Old%20List")!

    expect(list.name).toEqual("Old List")
    expect(list.songs.map((s) => [s.title, s.style, s.key])).toEqual([
      ["Blues in F", "Medium Swing", "F"],
      ["Other", "Bossa Nova", "C"],
    ])
    expect(chords(readChart(list.songs[0].chart).bars)).toEqual([
      "F7", "B♭7", "F7", "%", "B♭7", "%", "F7", "D7", "Gm7", "C7", "F7 D7", "Gm7 C7",
    ])
  })

  it.each([
    ["https://example.com"],
    ["irealb://%E0%A4%A"],
    ["irealb://not=a=tune"],
  ])("reads no tunes from %p", (link) => {
    expect(parseIRealLink(link)?.songs ?? []).toEqual([])
  })
})

describe("readChart", () => {
  it("plays the repeat through, taking each ending in turn", () => {
    const chart = readChart(parseIRealLink(andWhatIfIDont)!.songs[0].chart)

    expect(chart.beatsPerBar).toEqual(4)
    expect(chords(chart.bars)).toEqual([
      // A, with the first ending
      "E♭7 B♭7", "E♭7", "Cm7", "%", "E♭7", "A♭7", "Fm7", "Fm7/B♭",
      // A again, with the second
      "E♭7 B♭7", "E♭7", "Cm7", "%", "E♭7", "A♭7", "Fm7 B♭7", "E♭7",
      // B
      "G7", "%", "C7", "%", "F7", "%", "B♭7", "%",
      // A
      "E♭7 B♭7", "E♭7", "Cm7", "%", "E♭7", "A♭7", "Fm7", "Fm7/B♭",
    ])
    expect(chart.bars.map((b) => b.section).filter((s) => s != undefined)).toEqual(["A", "A", "B", "A"])
    expect(chart.bars[0].section).toEqual("A")
    expect(chart.bars[8].section).toEqual("A")
    expect(chart.bars[16].section).toEqual("B")
    expect(chart.notes).toEqual([])
  })

  it("plays a repeat with no endings twice, or as many times as it says", () => {
    expect(chords(readChart("{C |F }G Z").bars)).toEqual(["C", "F", "C", "F", "G"])
    expect(chords(readChart("{C |F <3x>}G Z").bars)).toEqual(["C", "F", "C", "F", "C", "F", "G"])
  })

  it("takes three endings in turn", () => {
    expect(chords(readChart("{C |N1D }|N2E }|N3F Z").bars)).toEqual(["C", "D", "C", "E", "C", "F"])
  })

  it("writes out a repeat of the two bars before", () => {
    expect(chords(readChart("C |D |r|   |E Z").bars)).toEqual(["C", "D", "C", "D", "E"])
  })

  it("reads no chord, slashes and chords not shown", () => {
    expect(chords(readChart("C7 p p p|n |W/E Z").bars)).toEqual(["C7 % % %", "", "%"])
  })

  it("takes its time signature from the chart", () => {
    expect(readChart("T34C |D Z").beatsPerBar).toEqual(3)
    expect(readChart("T12C |D Z").beatsPerBar).toEqual(12)
  })

  it("notes what it can't carry over", () => {
    const chart = readChart("T44C(Db7) |SD |T34E |<D.C. al Coda>F |QG f|C*weird* Z")

    expect(chords(chart.bars)).toEqual(["C", "D", "E", "F", "G", "C*weird*"])
    expect(chart.notes.sort()).toEqual([
      "alternate chords (left out)",
      "changes of time signature (the first is kept throughout)",
      "chords it can't read (left silent)",
      "codas, segnos, D.C. and D.S. (the chart is played straight through)",
      "fermatas",
    ])
  })

  it("gives up on a chart that repeats without end", () => {
    // a repeat with an ending numbered past any the chart has
    expect(readChart("{C |N9D }").bars.length).toBeLessThanOrEqual(2000)
  })
})

describe("readIRealText", () => {
  it("reads a tune into a lead sheet", () => {
    const read = readIRealText(andWhatIfIDont)!
    const sheet = read.sheets[0]

    expect(sheet.name).toEqual("And What If I Don't")
    expect(sheet.composer).toEqual("Hancock Herbie")
    expect(sheet.style).toEqual("Medium Swing")
    expect(sheet.key).toEqual("Eb")
    expect(sheet.tempo).toEqual(120)
    expect(sheet.bars.length).toEqual(32)
  })

  it("finds the links in a page of them, as iReal Pro exports a playlist", () => {
    const page = `<html><body><a href="${andWhatIfIDont}">And What If I Don't</a></body></html>`
    expect(readIRealText(page)?.sheets.map((s) => s.name)).toEqual(["And What If I Don't"])
  })

  it("finds nothing where there are no links", () => {
    expect(readIRealText("{\"bars\": []}")).toBeUndefined()
  })
})
