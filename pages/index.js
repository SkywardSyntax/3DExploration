import React, { useState } from 'react';
import WebGLRenderer from '../components/WebGLRenderer';

function Home() {
  const [sides, setSides] = useState(4);

  const handleSliderChange = (event) => {
    setSides(parseInt(event.target.value, 10));
  };

  return (
    <main>
      <input
        type="range"
        min="3"
        max="12"
        value={sides}
        onChange={handleSliderChange}
      />
      <WebGLRenderer sides={sides} />
    </main>
  );
}

export default Home;
