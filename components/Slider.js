import React from 'react';

function Slider({ value, onChange }) {
  return (
    <input
      type="range"
      min="0"
      max="0.1"
      step="0.001"
      value={value}
      onChange={onChange}
    />
  );
}

export default Slider;
