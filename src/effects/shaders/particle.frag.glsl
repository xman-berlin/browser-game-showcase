// particle.frag.glsl
// Soft circular point sprite

varying float vAlpha;
varying vec3  vColor;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  float alpha = smoothstep(0.5, 0.0, dist);
  alpha *= vAlpha;
  gl_FragColor = vec4(vColor, alpha);
}
