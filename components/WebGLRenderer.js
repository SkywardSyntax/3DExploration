import React, { useRef, useEffect, useState } from 'react';
import { mat4 } from 'gl-matrix';

const vertexShaderSource = `
  attribute vec4 aVertexPosition;
  attribute vec3 aVertexColor;
  attribute vec3 aVertexNormal;
  attribute float aVertexRoughness;
  attribute vec3 aVertexTangent;
  attribute vec3 aVertexBitangent;
  attribute vec2 aTextureCoord;
  varying lowp vec4 vColor;
  varying highp vec3 vLighting;
  varying highp float vRoughness;
  varying highp vec2 vTextureCoord;
  varying highp vec3 vTangent;
  varying highp vec3 vBitangent;
  varying highp vec3 vNormal;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uNormalMatrix;
  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = vec4(aVertexColor, 1.0);
    vRoughness = aVertexRoughness;
    vTextureCoord = aTextureCoord;
    vTangent = aVertexTangent;
    vBitangent = aVertexBitangent;
    vNormal = mat3(uNormalMatrix) * aVertexNormal;

    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  }
`;

const fragmentShaderSource = `
  varying lowp vec4 vColor;
  varying highp vec3 vLighting;
  varying highp float vRoughness;
  varying highp vec2 vTextureCoord;
  varying highp vec3 vTangent;
  varying highp vec3 vBitangent;
  varying highp vec3 vNormal;
  uniform sampler2D uBumpMap;
  void main(void) {
    highp vec3 bumpMapNormal = texture2D(uBumpMap, vTextureCoord).rgb;
    bumpMapNormal = bumpMapNormal * 2.0 - 1.0;
    highp mat3 TBN = mat3(vTangent, vBitangent, vNormal);
    highp vec3 newNormal = normalize(TBN * bumpMapNormal);

    highp vec3 roughnessFactor = vec3(1.0 - vRoughness);
    highp vec3 lighting = vLighting * roughnessFactor;
    highp float directional = max(dot(newNormal, vec3(0.85, 0.8, 0.75)), 0.0);
    lighting += directional;

    gl_FragColor = vec4(vColor.rgb * lighting, vColor.a);
  }
`;

const particleVertexShaderSource = `
  attribute vec4 aParticlePosition;
  attribute vec3 aParticleColor;
  varying lowp vec4 vParticleColor;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aParticlePosition;
    vParticleColor = vec4(aParticleColor, 1.0);
  }
`;

const particleFragmentShaderSource = `
  varying lowp vec4 vParticleColor;
  void main(void) {
    gl_FragColor = vParticleColor;
  }
`;

const shadowVertexShaderSource = `
  attribute vec4 aVertexPosition;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`;

const shadowFragmentShaderSource = `
  void main(void) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
`;

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initBuffers(gl) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    0.0,  1.0,  0.0,  // Top vertex
   -1.0, -1.0,  1.0,  // Front-left vertex
    1.0, -1.0,  1.0,  // Front-right vertex
    1.0, -1.0, -1.0,  // Back-right vertex
   -1.0, -1.0, -1.0,  // Back-left vertex
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const faceColors = [
    [0.75, 0.75, 0.75, 1.0],    // Front face: light grey
    [0.75, 0.75, 0.75, 1.0],    // Right face: light grey
    [0.75, 0.75, 0.75, 1.0],    // Back face: light grey
    [0.75, 0.75, 0.75, 1.0],    // Left face: light grey
    [0.75, 0.75, 0.75, 1.0],    // Bottom face: light grey
  ];

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    colors = colors.concat(c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  const roughnessValues = [
    0.1, 0.1, 0.1,  // Top vertex
    0.5, 0.5, 0.5,  // Front-left vertex
    0.5, 0.5, 0.5,  // Front-right vertex
    0.8, 0.8, 0.8,  // Back-right vertex
    0.8, 0.8, 0.8,  // Back-left vertex
  ];

  const roughnessBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, roughnessBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(roughnessValues), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const indices = [
    0,  1,  2,    // front face
    0,  2,  3,    // right face
    0,  3,  4,    // back face
    0,  4,  1,    // left face
    1,  2,  3,    // bottom face
    1,  3,  4,    // bottom face
  ];

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  const vertexNormals = [
    // Front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,

    // Right
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // Back
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Left
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,

    // Bottom
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

  const tangentBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);

  const vertexTangents = [
    // Front
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // Right
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Back
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,

    // Left
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Bottom
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTangents), gl.STATIC_DRAW);

  const bitangentBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bitangentBuffer);

  const vertexBitangents = [
    // Front
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Right
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Back
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Left
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBitangents), gl.STATIC_DRAW);

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    // Front
    0.0,  0.0,
    1.0,  0.0,
    0.5,  1.0,

    // Right
    0.0,  0.0,
    1.0,  0.0,
    0.5,  1.0,

    // Back
    0.0,  0.0,
    1.0,  0.0,
    0.5,  1.0,

    // Left
    0.0,  0.0,
    1.0,  0.0,
    0.5,  1.0,

    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    0.5,  1.0,
    0.5,  1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

  const particlePositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, particlePositionBuffer);

  const particlePositions = [];
  for (let i = 0; i < 1000; i++) {
    particlePositions.push(Math.random() * 2 - 1);
    particlePositions.push(Math.random() * 2 - 1);
    particlePositions.push(Math.random() * 2 - 1);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particlePositions), gl.STATIC_DRAW);

  const particleColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, particleColorBuffer);

  const particleColors = [];
  for (let i = 0; i < 1000; i++) {
    particleColors.push(Math.random());
    particleColors.push(Math.random());
    particleColors.push(Math.random());
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particleColors), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    roughness: roughnessBuffer,
    indices: indexBuffer,
    normal: normalBuffer,
    tangent: tangentBuffer,
    bitangent: bitangentBuffer,
    textureCoord: textureCoordBuffer,
    particlePosition: particlePositionBuffer,
    particleColor: particleColorBuffer,
  };
}

function drawScene(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const fieldOfView = 45 * Math.PI / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const modelViewMatrix = mat4.create();

  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, pyramidRotation, [0, 1, 0]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, pyramidRotation * .7, [1, 0, 0]);

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition);
  }

  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexColor);
  }

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexNormal,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexNormal);
  }

  {
    const numComponents = 1;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.roughness);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexRoughness,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexRoughness);
  }

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.tangent);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexTangent,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexTangent);
  }

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.bitangent);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexBitangent,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexBitangent);
  }

  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
      programInfo.attribLocations.textureCoord,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.textureCoord);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.normalMatrix,
    false,
    normalMatrix);

  {
    const vertexCount = 18;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.particlePosition);
    gl.vertexAttribPointer(
      programInfo.attribLocations.particlePosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.particlePosition);
  }

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.particleColor);
    gl.vertexAttribPointer(
      programInfo.attribLocations.particleColor,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.particleColor);
  }

  gl.useProgram(programInfo.particleProgram);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix);

  {
    const vertexCount = 1000;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawArrays(gl.POINTS, 0, vertexCount);
  }

  pyramidRotation += deltaTime;
}

let pyramidRotation = 0.0;

function WebGLRenderer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }

    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    const particleShaderProgram = initShaderProgram(gl, particleVertexShaderSource, particleFragmentShaderSource);
    const shadowShaderProgram = initShaderProgram(gl, shadowVertexShaderSource, shadowFragmentShaderSource);

    const programInfo = {
      program: shaderProgram,
      particleProgram: particleShaderProgram,
      shadowProgram: shadowShaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        vertexRoughness: gl.getAttribLocation(shaderProgram, 'aVertexRoughness'),
        vertexTangent: gl.getAttribLocation(shaderProgram, 'aVertexTangent'),
        vertexBitangent: gl.getAttribLocation(shaderProgram, 'aVertexBitangent'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        particlePosition: gl.getAttribLocation(particleShaderProgram, 'aParticlePosition'),
        particleColor: gl.getAttribLocation(particleShaderProgram, 'aParticleColor'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
        bumpMap: gl.getUniformLocation(shaderProgram, 'uBumpMap'),
      },
    };

    const buffers = initBuffers(gl);

    let then = 0;

    function render(now) {
      now *= 0.001;
      const deltaTime = now - then;
      then = now;

      drawScene(gl, programInfo, buffers, deltaTime);

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }, []);

  return <canvas ref={canvasRef} width="640" height="480" style={{ display: 'block', margin: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />;
}

export default WebGLRenderer;
