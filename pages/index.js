import React from 'react';
import WebGLRenderer from '../components/WebGLRenderer';

function Home() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <WebGLRenderer />
    </main>
  );
}

export default Home;
