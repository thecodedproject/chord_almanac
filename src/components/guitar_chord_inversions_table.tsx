import "./guitar_chord_inversions_table.css"

import {CSSProperties, Fragment} from "react";

import {
  VoiceLeadingChord,
  numTetradVoices,
  numTriadVoices,
  tetradVoicing,
  tetradVoicings,
  triadVoicing,
  triadVoicings,
} from '../lib/chord_anthology'

import {
  inversionLabels,
  triadVoicingLabels,
  voicingLabels,
} from './music_labels'

import {
  ChordVoicingChart,
} from './chord_voicing_chart'

interface TableProps extends CSSProperties {
  "--num-inversions": number;
  "--num-voicings": number;
}

interface VoicingProps extends CSSProperties {
  "--voicing": number;
}

interface InversionProps extends CSSProperties {
  "--inversion": number;
}

interface FingerChartProps extends VoicingProps, InversionProps {}

// one way of voicing a chord, under the name the table gives its row
interface Voicing {
  label: string
  voice: (c: VoiceLeadingChord, inversion: number) => VoiceLeadingChord
}

// the voicings of a chord of each size: a triad has fewer ways to spread out its voices
// than a tetrad does
const voicingsByNumVoices: Record<number, Voicing[]> = {
  [numTriadVoices]: triadVoicings.map((v) => ({
    label: triadVoicingLabels[v],
    voice: (c, inversion) => triadVoicing(c, v, inversion),
  })),
  [numTetradVoices]: tetradVoicings.map((v) => ({
    label: voicingLabels[v],
    voice: (c, inversion) => tetradVoicing(c, v, inversion),
  })),
}

// GuitarChordInversionsTable draws every inversion of every voicing of a triad or a
// tetrad: a row for each voicing, and a column for each inversion - one for each of the
// chord's voices.
export function GuitarChordInversionsTable(
  {chord, strings}: {chord: VoiceLeadingChord, strings: number[]}
) {

  const voicings = voicingsByNumVoices[chord.tones.length]

  if (voicings == undefined) {
    throw new RangeError("cannot draw the inversions of a chord of " + chord.tones.length + " voices")
  }

  const inversions = [...Array(chord.tones.length)].map((_, i) => i)

  return (
    <div
      className="guitarChordInversionsTable"
      style={{
        "--num-inversions": inversions.length,
        "--num-voicings": voicings.length,
      } as TableProps}
    >

      {inversions.map((inversion) => (
        <div
          className="inversionLabel"
          style={{"--inversion": inversion+1} as InversionProps}
          key={inversion}
        >
          {inversionLabels[inversion]}
        </div>
      ))}

      {voicings.map((voicing, iVoicing) => (
        <Fragment key={voicing.label}>
          <div
            className="voicingLabel"
            style={{"--voicing": iVoicing+1} as VoicingProps}
          >
            {voicing.label}
          </div>
          {inversions.map((inversion) => (
            <ChordVoicingChart
              voicedChord={voicing.voice(chord, inversion)}
              strings={strings}
              style={{
                "--voicing": iVoicing+1,
                "--inversion": inversion+1,
              } as FingerChartProps}
              key={inversion}
            />
          ))}
        </Fragment>
      ))}

    </div>
  )
}
