import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

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

  // Function to calculate cosine of an angle
  float cosine(float angle) {
    return cos(angle);
  }

  // Function to perform matrix multiplication
  mat4 matrixMultiply(mat4 a, mat4 b) {
    return a * b;
  }

  // Function to perform 3D transformation
  vec3 transform3D(vec3 position, mat4 transformationMatrix) {
    return (transformationMatrix * vec4(position, 1.0)).xyz;
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

    // Use cosine function in some calculation
    float cosineValue = cosine(position.y);

    // Use matrix multiplication in some calculation
    mat4 transformationMatrix = matrixMultiply(modelViewMatrix, projectionMatrix);

    // Use 3D transformation in some calculation
    vec3 transformedPosition = transform3D(position, transformationMatrix);

    gl_Position = transformationMatrix * mvPosition * factValue * sineValue * cosineValue;
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

  // Function to calculate sine of an angle
  float sine(float angle) {
    return sin(angle);
  }

  // Function to calculate cosine of an angle
  float cosine(float angle) {
    return cos(angle);
  }

  // Function to perform matrix multiplication
  mat4 matrixMultiply(mat4 a, mat4 b) {
    return a * b;
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

    // Use sine function in some calculation
    float sineValue = sine(vViewPosition.x);

    // Use cosine function in some calculation
    float cosineValue = cosine(vViewPosition.y);

    // Use matrix multiplication in some calculation
    mat4 transformationMatrix = mat4(1.0);

    // Use 3D transformation in some calculation
    vec3 transformedPosition = transform3D(vViewPosition, transformationMatrix);

    gl_FragColor = vec4((ambient + diffuse + specularColor) * factValue * sineValue * cosineValue, 1.0);
  }
`;

function Cube() {
  const cubeRef = useRef();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const normalMap = loader.load('/path/to/normalMap.png');

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        color: { value: new THREE.Color(0x0000ff) },
        lightPosition: { value: new THREE.Vector3(5, 5, 5) },
        normalMap: { value: normalMap }
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
