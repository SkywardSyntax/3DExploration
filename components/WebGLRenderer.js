import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import Cube from './Cube';
import Slider from './Slider';

const vertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 color;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.9 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(color * intensity, 1.0);
  }
`;

function WebGLRenderer() {
  const canvasRef = useRef(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.01);

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        color: { value: new THREE.Color(0xd3d3d3) }
      }
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = 2;
    scene.add(cube);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    function animate() {
      requestAnimationFrame(animate);

      sphere.rotation.x += rotationSpeed;
      sphere.rotation.y += rotationSpeed;

      cube.rotation.x += rotationSpeed;
      cube.rotation.y += rotationSpeed;

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [rotationSpeed]);

  const handleSliderChange = (event) => {
    setRotationSpeed(parseFloat(event.target.value));
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block', margin: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      <Slider value={rotationSpeed} onChange={handleSliderChange} />
    </>
  );
}

export default WebGLRenderer;
