import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vLightDirection;
  varying vec3 vReflectDirection;
  varying vec2 vUv;
  uniform sampler2D normalMap;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vLightDirection = normalize(vec3(5.0, 5.0, 5.0) - vViewPosition);
    vReflectDirection = reflect(-vLightDirection, vNormal);
    vUv = uv;
    gl_Position = projectionMatrix * mvPosition;
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
  void main() {
    vec3 normal = texture2D(normalMap, vUv).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    float intensity = max(dot(normal, vLightDirection), 0.0);
    float specular = pow(max(dot(vReflectDirection, normalize(vViewPosition)), 0.0), 32.0);
    vec3 ambient = 0.1 * color;
    vec3 diffuse = intensity * color;
    vec3 specularColor = vec3(1.0) * specular;
    gl_FragColor = vec4(ambient + diffuse + specularColor, 1.0);
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
