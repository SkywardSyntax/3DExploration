import React from 'react';

function Slider({ value, onChange }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '10px',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
        Rotation Speed: {value.toFixed(2)}
      </label>
      <input
        type="range"
        min="0"
        max="0.1"
        step="0.01"
        value={value}
        onChange={onChange}
        style={{ width: '200px' }}
      />
    </div>
  );
}

export default Slider;
