# GitHub Codespaces ♥️ Next.js

Welcome to your shiny new Codespace running Next.js! We've got everything fired up and running for you to explore Next.js.

You've got a blank canvas to work on from a git perspective as well. There's a single initial commit with the what you're seeing right now - where you go from here is up to you!

Everything you do here is contained within this one codespace. There is no repository on GitHub yet. If and when you’re ready you can click "Publish Branch" and we’ll create your repository and push up your project. If you were just exploring then and have no further need for this code then you can simply delete your codespace and it's gone forever.

## Changes in Rendering Algorithm

The rendering algorithm in `components/WebGLRenderer.js` has been updated to optimize GPU load. The following changes have been made:

- Simplified vertex and fragment shaders by removing bump mapping and normal mapping.
- Reduced the number of particles in the particle system to 500.
- Simplified particle color calculations by using a single color for all particles.
- Removed shadow mapping and environment mapping.

## Simplified Shaders

The vertex and fragment shaders have been simplified to reduce GPU load. Bump mapping and normal mapping have been removed to decrease the complexity of the shaders.

## Optimized Particle System

The particle system has been optimized by reducing the number of particles to 500 and simplifying the particle color calculations. All particles now use a single color, which reduces the computational load on the GPU.

## Instructions for Running the Updated Code

To run this application with the updated rendering algorithm, use the following command:

```
npm run dev
```
