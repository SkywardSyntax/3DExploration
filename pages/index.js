import React, { useState } from 'react';
import WebGLRenderer from '../components/WebGLRenderer';

function Home() {
  const [cubes, setCubes] = useState([]);

  const addCube = () => {
    setCubes([...cubes, {}]);
  };

  const removeCube = () => {
    setCubes(cubes.slice(0, -1));
  };

  return (
    <main>
      <button onClick={addCube}>Add Cube</button>
      <button onClick={removeCube}>Remove Cube</button>
      <WebGLRenderer cubes={cubes} />
    </main>
  );
}

export default Home;
