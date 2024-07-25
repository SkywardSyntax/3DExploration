# GitHub Codespaces ♥️ Next.js

Welcome to your shiny new Codespace running Next.js! We've got everything fired up and running for you to explore Next.js.

You've got a blank canvas to work on from a git perspective as well. There's a single initial commit with the what you're seeing right now - where you go from here is up to you!

Everything you do here is contained within this one codespace. There is no repository on GitHub yet. If and when you’re ready you can click "Publish Branch" and we’ll create your repository and push up your project. If you were just exploring then and have no further need for this code then you can simply delete your codespace and it's gone forever.

## Changes in Rendering Algorithm

The rendering algorithm in `components/WebGLRenderer.js` has been updated to include more realistic rendering techniques. The following changes have been made:

- Implemented bump mapping in vertex and fragment shaders.
- Utilized retracting for dynamic vertex positions.
- Modified procedural vertex normal calculations for roughness.
- Added more complex shaders to increase GPU load.
- Introduced particle systems to increase GPU load.
- Increased resolution and complexity of object textures.
- Utilized shadow mapping or environment mapping to increase GPU load.

## Bump Mapping and Roughness

Bump mapping has been added to the vertex and fragment shaders to create more realistic surface details. This technique simulates small-scale bumps and wrinkles on the surface of the pyramid, giving it a rough appearance.

## Instructions for Running the Updated Code

To run this application with the updated rendering algorithm, use the following command:

```
npm run dev
```
