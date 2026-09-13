import "./guitar_tetrad_inversions_table.css"

import {CSSProperties, Fragment} from "react";

import {
  VoiceLeadingChord,
  numTetradVoices,
  tetradVoicings,
} from '../lib/chord_anthology'

import {
  inversionLabels,
  voicingLabels,
} from './music_labels'

import {
  TetradVoicingChart,
} from './tetrad_voicing_chart'

interface VoicingProps extends CSSProperties {
  "--voicing": number;
}

interface InversionProps extends CSSProperties {
  "--inversion": number;
}

interface FingerChartProps extends VoicingProps, InversionProps {}

export function GuitarTetradInversionsTable(
  {chord, strings}: {chord: VoiceLeadingChord, strings: number[]}
) {

  const inversions = [...Array(numTetradVoices)].map((_, i) => i)

  return (
    <>
      <div className="guitarTetradInversionsTable">

        {inversions.map((inversion) => (
          <div
            className="inversionLabel"
            style={{"--inversion": inversion+1} as InversionProps}
            key={inversion}
          >
            {inversionLabels[inversion]}
          </div>
        ))}

        {tetradVoicings.map((voicing, iVoicing) => (
          <Fragment key={voicing}>
            <div
              className="voicingLabel"
              style={{"--voicing": iVoicing+1} as VoicingProps}
            >
              {voicingLabels[voicing]}
            </div>
            {inversions.map((inversion) => (
              <TetradVoicingChart
                chord={chord}
                strings={strings}
                voicing={voicing}
                inversion={inversion}
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
    </>
  )
}
