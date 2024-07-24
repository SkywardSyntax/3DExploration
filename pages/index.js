import React, { useState } from 'react';
import WebGLRenderer from '../components/WebGLRenderer';

function Home() {
  const [cubes, setCubes] = useState([]);

  const addCube = () => {
    const distanceBetweenCubes = 7.0;
    const startPosition = -(cubes.length) * distanceBetweenCubes / 2;
    const newCube = {
      position: [startPosition + cubes.length * distanceBetweenCubes, 0.0, -6.0]
    };
    setCubes([...cubes, newCube]);
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
