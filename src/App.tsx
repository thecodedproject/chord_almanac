import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";

import { ChordCyclePage } from './pages/chord_cycle_page';
import { GuitarScalePage } from './pages/guitar_scale_page';
import { GuitarTetradInversions } from './pages/guitar_tetrad_inversions';

export default function App(): JSX.Element {
  return (
    <>
      <nav className="appNav">
        <NavLink to="/" end>Guitar Scale</NavLink>
        <NavLink to="/tetrad-inversions">Tetrad Inversions</NavLink>
        <NavLink to="/chord-cycle">Chord Cycle</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<GuitarScalePage />} />
        <Route path="/tetrad-inversions" element={<GuitarTetradInversions />} />
        <Route path="/chord-cycle" element={<ChordCyclePage />} />
      </Routes>
    </>
  );
}
