import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import Cube from './Cube';
import Slider from './Slider';

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vLightDirection;
  varying vec3 vReflectDirection;
  varying vec2 vUv;
  uniform sampler2D normalMap;

  // Function to calculate factorial
  float factorial(int n) {
    if (n == 0) return 1.0;
    float result = 1.0;
    for (int i = 1; i <= n; ++i) {
      result *= float(i);
    }
    return result;
  }

  // Function to calculate sine of an angle
  float sine(float angle) {
    return sin(angle);
  }

  // Function to perform matrix multiplication
  mat4 matrixMultiply(mat4 a, mat4 b) {
    return a * b;
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vLightDirection = normalize(vec3(5.0, 5.0, 5.0) - vViewPosition);
    vReflectDirection = reflect(-vLightDirection, vNormal);
    vUv = uv;

    // Use factorial in some calculation
    float factValue = factorial(5);

    // Use sine function in some calculation
    float sineValue = sine(position.x);

    // Use matrix multiplication in some calculation
    mat4 transformationMatrix = matrixMultiply(modelViewMatrix, projectionMatrix);

    gl_Position = transformationMatrix * mvPosition * factValue * sineValue;
  }
`;

const fragmentShader = `
  uniform vec3 color;
  uniform vec3 lightPosition;
  uniform sampler2D normalMap;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vLightDirection;
  varying vec3 vReflectDirection;
  varying vec2 vUv;

  // Function to calculate factorial
  float factorial(int n) {
    if (n == 0) return 1.0;
    float result = 1.0;
    for (int i = 1; i <= n; ++i) {
      result *= float(i);
    }
    return result;
  }

  // Function to calculate cosine of an angle
  float cosine(float angle) {
    return cos(angle);
  }

  // Function to perform 3D transformation
  vec3 transform3D(vec3 position, mat4 transformationMatrix) {
    return (transformationMatrix * vec4(position, 1.0)).xyz;
  }

  void main() {
    vec3 normal = texture2D(normalMap, vUv).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    float intensity = max(dot(normal, vLightDirection), 0.0);
    float specular = pow(max(dot(vReflectDirection, normalize(vViewPosition)), 0.0), 32.0);
    vec3 ambient = 0.1 * color;
    vec3 diffuse = intensity * color;
    vec3 specularColor = vec3(1.0) * specular;

    // Use factorial in some calculation
    float factValue = factorial(3);

    // Use cosine function in some calculation
    float cosineValue = cosine(vViewPosition.x);

    // Use 3D transformation in some calculation
    mat4 transformationMatrix = mat4(1.0);
    vec3 transformedPosition = transform3D(vViewPosition, transformationMatrix);

    gl_FragColor = vec4((ambient + diffuse + specularColor) * factValue * cosineValue, 1.0);
  }
`;

function WebGLRenderer() {
  const canvasRef = useRef(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.01);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const loader = new THREE.TextureLoader();
    const normalMap = loader.load('/path/to/normalMap.png');

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    // Introduce randomness in the vertices to create a rough surface
    if (geometry.vertices) {
      for (let i = 0; i < geometry.vertices.length; i++) {
        geometry.vertices[i].x += (Math.random() - 0.5) * 0.1;
        geometry.vertices[i].y += (Math.random() - 0.5) * 0.1;
        geometry.vertices[i].z += (Math.random() - 0.5) * 0.1;
      }
      geometry.verticesNeedUpdate = true;
    }

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        color: { value: new THREE.Color(0xd3d3d3) },
        lightPosition: { value: new THREE.Vector3(5, 5, 5) },
        normalMap: { value: normalMap }
      }
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = 2;
    scene.add(cube);

    // Add a new IrregularObject component
    const irregularGeometry = new THREE.SphereGeometry(1, 32, 32);
    for (let i = 0; i < irregularGeometry.vertices.length; i++) {
      irregularGeometry.vertices[i].x += (Math.random() - 0.5) * 0.2;
      irregularGeometry.vertices[i].y += (Math.random() - 0.5) * 0.2;
      irregularGeometry.vertices[i].z += (Math.random() - 0.5) * 0.2;
    }
    irregularGeometry.verticesNeedUpdate = true;

    const irregularMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const irregularObject = new THREE.Mesh(irregularGeometry, irregularMaterial);
    irregularObject.position.x = -2; // Position the irregular object to the left of the sphere
    scene.add(irregularObject);

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

      irregularObject.rotation.x += rotationSpeed;
      irregularObject.rotation.y += rotationSpeed;

      camera.fov = 75 / zoomLevel;
      camera.position.z = 5 / zoomLevel;
      camera.updateProjectionMatrix();

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

    const handleWheel = (event) => {
      setZoomLevel((prevZoomLevel) => Math.max(0.1, prevZoomLevel + event.deltaY * 0.001));
      sphere.position.set(0, 0, 0);
      cube.position.set(2, 0, 0);
      irregularObject.position.set(-2, 0, 0);
    };

    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [rotationSpeed, zoomLevel]);

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
