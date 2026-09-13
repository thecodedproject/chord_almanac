import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";

import { ChordCyclePage } from './pages/chord_cycle_page';
import { GuitarCycle2Tetrads, GuitarCycle4Tetrads } from './pages/guitar_cycle_tetrads';
import { GuitarMelodicTetradsPage } from './pages/guitar_melodic_tetrads_page';
import { GuitarScalePage } from './pages/guitar_scale_page';
import { GuitarTetradInversions } from './pages/guitar_tetrad_inversions';

export default function App(): JSX.Element {
  return (
    <>
      <nav className="appNav">
        <NavLink to="/" end>Guitar Scale</NavLink>
        <NavLink to="/melodic-tetrads">Guitar Melodic Tetrads</NavLink>
        <NavLink to="/tetrad-inversions">Tetrad Inversions</NavLink>
        <NavLink to="/cycle-4-tetrads">Cycle 4 Tetrads</NavLink>
        <NavLink to="/cycle-2-tetrads">Cycle 2 Tetrads</NavLink>
        <NavLink to="/chord-cycle">Chord Cycle</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<GuitarScalePage />} />
        <Route path="/melodic-tetrads" element={<GuitarMelodicTetradsPage />} />
        <Route path="/tetrad-inversions" element={<GuitarTetradInversions />} />
        <Route path="/cycle-4-tetrads" element={<GuitarCycle4Tetrads />} />
        <Route path="/cycle-2-tetrads" element={<GuitarCycle2Tetrads />} />
        <Route path="/chord-cycle" element={<ChordCyclePage />} />
      </Routes>
    </>
  );
}
