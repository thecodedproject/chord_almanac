# Chord Almanac

## Further work

- **Verify the compact chord tabbing.** `tabNotesForVoicingCompact` in
  `src/lib/guitar_notation.ts` was added alongside the original `tabNotesForVoicing`,
  and the whole app now uses it. The original sounds every voice of a voicing at its
  exact pitch, which on strings with a gap can strand a note far from the rest of the
  shape (the drop 2 Dm7 in 2nd inversion on strings 6 5 4 1 put its F on the 1st fret,
  with the rest of the chord at the 10th to 12th). The compact version plays each voice
  in whichever octave gives the smallest stretch, keeping only the order the voicing
  stacks its chord tones in. To do:
  - check the charts it draws look right across the chord inversions and harmonic
    tetrads pages - it also changes which string sets the harmonic tetrads page shows
    as playable;
  - check it causes no performance problems. It searches every octave of every voice,
    so it is slower: tabbing every tetrad voicing of every mode of a scale on every set
    of four strings took about 43ms, against about 2ms for the original. The harmonic
    tetrads page does a sixth of that on each render;
  - then remove whichever of the two functions is no longer wanted.

- **Carry over the rest of iReal Pro's charts.** Lead sheets can be imported from
  iReal Pro links (`irealb://`, and the older `irealbook://`) and from the web pages
  iReal Pro exports playlists as - see `src/lib/ireal.ts`. Lead sheets here are a plain
  list of bars, so some of what an iReal Pro chart says is lost on the way in. Each of
  these needs the lead sheet (and its chart and player) to learn something new:
  - **Repeats and endings** are played through in order, as the bars they stand for, so
    an AABA tune with a repeated A comes in as 32 bars. Lead sheets could keep repeat
    signs and first/second-time endings themselves, and the player go round them.
  - **Codas, segnos, D.C., D.S. and Fine** (`Q`, `S` and the `<D.C. al Coda>` style of
    text) are ignored, and the chart is played straight through from top to bottom.
  - **Changes of time signature** part way through: a lead sheet has one time signature,
    so the first in the chart is kept throughout. Time signatures in eighths (6/8, 12/8)
    are taken as that many beats.
  - **Where chords fall in the bar.** iReal Pro places a chord in one of the cells of
    its bar; here the chords in a bar share it evenly (three chords in a bar of four
    take two beats, one and one).
  - **Alternate chords** (the small chords written above, in brackets) are left out.
  - **Chord qualities of the chart's own**, written between asterisks, can't be read,
    and play as nothing.
  - **Fermatas, small and large chords, and text** written on the chart are ignored.
  - **Empty bars**: bars with nothing in them at all are left out (iReal Pro's
    `x`, `r`, `n`, `p` and `W` are all read).
  - **Style, transposition and repeats of the whole tune**: the style is kept and shown,
    but nothing is played in it; the key a tune was transposed to (`actual key`), the
    style it was set to play in, and how many times round it plays are ignored.
  - **Composers' names** are kept as iReal Pro writes them, surname first.
  - **Exporting back to iReal Pro**: there is no way yet to write a lead sheet out as an
    iReal Pro link.
  - **irealbook:// links** are read as Data::iRealPro reads them, but haven't been tried
    on one shared from iReal Pro itself, having none to hand.
