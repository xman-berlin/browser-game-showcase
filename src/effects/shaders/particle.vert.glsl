// particle.vert.glsl
// Billboarded point sprite with size attenuation

uniform float uPixelRatio;
uniform float uScale;

attribute float aSize;
attribute float aAlpha;
attribute vec3  aColor;

varying float vAlpha;
varying vec3  vColor;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uPixelRatio * uScale / -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;

  vAlpha = aAlpha;
  vColor = aColor;
}
