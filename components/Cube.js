import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 color;
  uniform vec3 lightPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 lightDirection = normalize(lightPosition - vViewPosition);
    float intensity = max(dot(vNormal, lightDirection), 0.0);
    vec3 reflection = reflect(-lightDirection, vNormal);
    float specular = pow(max(dot(reflection, normalize(vViewPosition)), 0.0), 16.0);
    gl_FragColor = vec4(color * intensity + vec3(1.0) * specular, 1.0);
  }
`;

function Cube() {
  const cubeRef = useRef();

  useEffect(() => {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        color: { value: new THREE.Color(0x0000ff) },
        lightPosition: { value: new THREE.Vector3(5, 5, 5) }
      }
    });
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
