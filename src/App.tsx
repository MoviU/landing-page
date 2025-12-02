import './App.css';
import Intro from './Header';
import './App.css';
import HireMeImpact from './Hype';
import { useState } from 'react';

function App() {
  const [showGraph, setShowGraph] = useState(false);

  return (
    <div className="page">
      <Intro onAnimationComplete={() => setShowGraph(true)} />
      {showGraph && <HireMeImpact />}
    </div>
  );
}

export default App;
