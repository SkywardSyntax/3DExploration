import React from 'react';

function Slider({ value, onChange }) {
  return (
    <input
      type="range"
      min="0.1"
      max="2"
      step="0.1"
      value={value}
      onChange={onChange}
    />
  );
}

export default Slider;
