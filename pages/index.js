import React from 'react';
import WebGLRenderer from '../components/WebGLRenderer';

function Home() {
  return (
    <main>
      <WebGLRenderer sides={6} />
    </main>
  );
}

export default Home;
