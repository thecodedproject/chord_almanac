import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";

import { ChordCyclePage } from './pages/chord_cycle_page';
import { GuitarHarmonicTetrads } from './pages/guitar_harmonic_tetrads';
import { GuitarMelodicTetradsPage } from './pages/guitar_melodic_tetrads_page';
import { GuitarScalePage } from './pages/guitar_scale_page';
import { GuitarChordInversions } from './pages/guitar_chord_inversions';

export default function App(): JSX.Element {
  return (
    <>
      <nav className="appNav">
        <NavLink to="/" end>Guitar Scale</NavLink>
        <NavLink to="/chord-inversions">Chord Inversions</NavLink>
        <NavLink to="/melodic-tetrads">Melodic Tetrads</NavLink>
        <NavLink to="/harmonic-tetrads">Harmonic Tetrads</NavLink>
        <NavLink to="/chord-cycle">Chord Cycle</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<GuitarScalePage />} />
        <Route path="/melodic-tetrads" element={<GuitarMelodicTetradsPage />} />
        <Route path="/chord-inversions" element={<GuitarChordInversions />} />
        <Route path="/harmonic-tetrads" element={<GuitarHarmonicTetrads />} />
        <Route path="/chord-cycle" element={<ChordCyclePage />} />
      </Routes>
    </>
  );
}
