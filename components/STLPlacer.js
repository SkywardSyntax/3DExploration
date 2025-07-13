import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

function STLPlacer({ scene, onModelLoaded }) {
  const [stlModel, setStlModel] = useState(null);
  const [modelScale, setModelScale] = useState(1);
  const [modelPosition, setModelPosition] = useState({ x: 0, y: 0, z: 0 });
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle STL file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      setIsLoading(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        loadSTLFromBuffer(arrayBuffer, file.name);
      };
      
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please select a valid STL file');
    }
  };

  // Load STL from buffer
  const loadSTLFromBuffer = (arrayBuffer, fileName) => {
    const loader = new STLLoader();
    
    try {
      const geometry = loader.parse(arrayBuffer);
      
      // Center the geometry
      geometry.computeBoundingBox();
      const boundingBox = geometry.boundingBox;
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);
      
      // Create material for the STL model
      const material = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.8
      });
      
      // Remove existing model if any
      if (stlModel && scene) {
        scene.remove(stlModel);
      }
      
      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = fileName;
      
      // Apply current transformations
      mesh.scale.setScalar(modelScale);
      mesh.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
      mesh.rotation.set(modelRotation.x, modelRotation.y, modelRotation.z);
      
      // Add to scene
      if (scene) {
        scene.add(mesh);
      }
      
      setStlModel(mesh);
      setIsLoading(false);
      
      if (onModelLoaded) {
        onModelLoaded(mesh);
      }
      
    } catch (error) {
      console.error('Error loading STL file:', error);
      setIsLoading(false);
      alert('Error loading STL file. Please check the file format.');
    }
  };

  // Update model transformations
  useEffect(() => {
    if (stlModel) {
      stlModel.scale.setScalar(modelScale);
      stlModel.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
      stlModel.rotation.set(modelRotation.x, modelRotation.y, modelRotation.z);
    }
  }, [stlModel, modelScale, modelPosition, modelRotation]);

  // Handle scale change
  const handleScaleChange = (event) => {
    setModelScale(parseFloat(event.target.value));
  };

  // Handle position change
  const handlePositionChange = (axis, value) => {
    setModelPosition(prev => ({
      ...prev,
      [axis]: parseFloat(value)
    }));
  };

  // Handle rotation change
  const handleRotationChange = (axis, value) => {
    setModelRotation(prev => ({
      ...prev,
      [axis]: parseFloat(value) * Math.PI / 180 // Convert degrees to radians
    }));
  };

  // Remove model
  const removeModel = () => {
    if (stlModel && scene) {
      scene.remove(stlModel);
      setStlModel(null);
      // Reset controls to default values
      setModelScale(1);
      setModelPosition({ x: 0, y: 0, z: 0 });
      setModelRotation({ x: 0, y: 0, z: 0 });
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      minWidth: '250px',
      maxWidth: '300px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>STL Placer</h3>
      
      {/* File Upload */}
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {isLoading ? 'Loading...' : 'Upload STL File'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".stl"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Model Controls */}
      {stlModel && (
        <>
          {/* Scale Control */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Scale: {modelScale.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={modelScale}
              onChange={handleScaleChange}
              style={{ width: '100%' }}
            />
          </div>

          {/* Position Controls */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Position</label>
            {['x', 'y', 'z'].map(axis => (
              <div key={axis} style={{ marginBottom: '5px' }}>
                <label style={{ display: 'inline-block', width: '20px' }}>
                  {axis.toUpperCase()}:
                </label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={modelPosition[axis]}
                  onChange={(e) => handlePositionChange(axis, e.target.value)}
                  style={{ width: 'calc(100% - 50px)', marginLeft: '5px' }}
                />
                <span style={{ fontSize: '12px', marginLeft: '5px' }}>
                  {modelPosition[axis].toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          {/* Rotation Controls */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Rotation (degrees)</label>
            {['x', 'y', 'z'].map(axis => (
              <div key={axis} style={{ marginBottom: '5px' }}>
                <label style={{ display: 'inline-block', width: '20px' }}>
                  {axis.toUpperCase()}:
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={modelRotation[axis] * 180 / Math.PI} // Convert radians to degrees
                  onChange={(e) => handleRotationChange(axis, e.target.value)}
                  style={{ width: 'calc(100% - 50px)', marginLeft: '5px' }}
                />
                <span style={{ fontSize: '12px', marginLeft: '5px' }}>
                  {Math.round(modelRotation[axis] * 180 / Math.PI)}°
                </span>
              </div>
            ))}
          </div>

          {/* Model Info */}
          <div style={{ marginBottom: '15px', fontSize: '12px', color: '#ccc' }}>
            <div>Model: {stlModel.name}</div>
            <div>Vertices: {stlModel.geometry.attributes.position.count}</div>
          </div>

          {/* Remove Model Button */}
          <button
            onClick={removeModel}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Remove Model
          </button>
        </>
      )}
    </div>
  );
}

export default STLPlacer;