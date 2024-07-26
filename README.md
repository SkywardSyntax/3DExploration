# GitHub Codespaces ♥️ Next.js

Welcome to your shiny new Codespace running Next.js! We've got everything fired up and running for you to explore Next.js.

You've got a blank canvas to work on from a git perspective as well. There's a single initial commit with the what you're seeing right now - where you go from here is up to you!

Everything you do here is contained within this one codespace. There is no repository on GitHub yet. If and when you’re ready you can click "Publish Branch" and we’ll create your repository and push up your project. If you were just exploring then and have no further need for this code then you can simply delete your codespace and it's gone forever.

## Using three.js for Rendering

The rendering logic in `components/WebGLRenderer.js` has been updated to use three.js for rendering a rotating light grey sphere with lighting. The following changes have been made:

- Replaced WebGL rendering logic with three.js rendering logic.
- Updated the `WebGLRenderer` component to use three.js.
- Added a light grey sphere with lighting.
- Centered the sphere on the viewport.
- Set the background color to black.

## New Cube and Slider Components

The application has been updated to include a new `Cube` component and a `Slider` component. The following changes have been made:

- Added a new `Cube` component in `components/Cube.js` to render a rotating cube with a different color.
- Updated `WebGLRenderer.js` to include the new `Cube` component alongside the existing sphere.
- Added a new `Slider` component in `components/Slider.js` to control the rotation speed of the sphere and cube.
- Updated `WebGLRenderer.js` to include the new `Slider` component and handle its value to adjust the rotation speed of the sphere and cube.
- Updated `global.css` to style the new `Slider` component.

## Instructions for Using the Slider

To control the rotation speed of the sphere and cube, use the slider located below the canvas. The slider ranges from 0 to 0.1. Adjust the slider to change the rotation speed of the objects in the scene.

## Instructions for Running the Updated Code

To run this application with the updated rendering logic, use the following command:

```
npm run dev
```

## Sophisticated Shaders

The application has been enhanced with sophisticated shaders for both the cube and the sphere. The following changes have been made:

- Updated `components/Cube.js` to use `THREE.ShaderMaterial` with custom vertex and fragment shaders for the cube.
- Updated `components/WebGLRenderer.js` to use `THREE.ShaderMaterial` with custom vertex and fragment shaders for the sphere.
- Added custom vertex and fragment shader code to `components/Cube.js` and `components/WebGLRenderer.js` to include lighting and color effects.

### Effects and Benefits of Custom Shaders

The custom shaders provide the following effects and benefits:

- Enhanced lighting effects: The shaders include advanced lighting calculations that provide more realistic and dynamic lighting effects on the objects.
- Improved color effects: The shaders allow for more sophisticated color manipulation, resulting in more vibrant and visually appealing objects.
- Greater control over rendering: The use of custom shaders provides greater control over the rendering process, allowing for more fine-tuned and customized visual effects.

### Running the Application with Sophisticated Shaders

To run the application with the new sophisticated shaders, use the following command:

```
npm run dev
```
