import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function Cube() {
  const cubeRef = useRef();

  useEffect(() => {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const cube = new THREE.Mesh(geometry, material);
    cubeRef.current = cube;
  }, []);

  useEffect(() => {
    function animate() {
      requestAnimationFrame(animate);

      if (cubeRef.current) {
        cubeRef.current.rotation.x += 0.01;
        cubeRef.current.rotation.y += 0.01;
      }
    }

    animate();
  }, []);

  return null;
}

export default Cube;
