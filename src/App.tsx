import { Route, Routes } from "react-router-dom";
import "./App.css";

import { SiteNav } from './components/site_nav';
import { ThemeSwitch } from './components/theme_switch';
import { ChordCyclePage } from './pages/chord_cycle_page';
import { GuitarHarmonicTetrads } from './pages/guitar_harmonic_tetrads';
import { GuitarMelodicTetradsPage } from './pages/guitar_melodic_tetrads_page';
import { GuitarScalePage } from './pages/guitar_scale_page';
import { GuitarChordInversions } from './pages/guitar_chord_inversions';
import { ScalePatternsPage } from './pages/scale_patterns_page';

export default function App(): JSX.Element {
  return (
    <>
      <header className="appHeader">
        <h1 className="siteName">Chord Almanac</h1>
        <ThemeSwitch />
      </header>
      <SiteNav />
      <main className="appMain">
        <Routes>
          <Route path="/" element={<GuitarScalePage />} />
          <Route path="/melodic-tetrads" element={<GuitarMelodicTetradsPage />} />
          <Route path="/chord-inversions" element={<GuitarChordInversions />} />
          <Route path="/harmonic-tetrads" element={<GuitarHarmonicTetrads />} />
          <Route path="/chord-cycle" element={<ChordCyclePage />} />
          <Route path="/scale-patterns" element={<ScalePatternsPage />} />
        </Routes>
      </main>
    </>
  );
}
