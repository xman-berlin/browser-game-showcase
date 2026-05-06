// terrain.frag.glsl
// Height-based texture blending: grass → rock → snow
// Uses procedural colors (no texture samplers needed for Phase 2)

varying float vHeight;
varying vec3  vNormal;
varying vec3  vWorldPos;

uniform float uHeightScale;
uniform bool  uPBR; // toggled by showcaseStore

// Simple diffuse lighting
uniform vec3 uSunDir;
uniform vec3 uSunColor;

// Procedural color palette
vec3 grassColor = vec3(0.18, 0.35, 0.10);
vec3 rockColor  = vec3(0.38, 0.33, 0.28);
vec3 snowColor  = vec3(0.90, 0.93, 0.98);
vec3 dirtColor  = vec3(0.30, 0.22, 0.14);

// Small noise for color variation
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

void main() {
  // Normalised height (0 = lowest, 1 = highest)
  float normalH = clamp(vHeight / uHeightScale, -0.5, 1.0) * 0.5 + 0.5;

  // Slope steepness — prefer rock on steep surfaces
  float slope = 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 1.0, 0.0)));
  slope = clamp(slope * 2.5, 0.0, 1.0);

  // Micro-variation
  float var = noise2(vWorldPos.xz * 3.0) * 0.08 - 0.04;

  // Blend zones
  float grassBlend = smoothstep(0.35, 0.55, normalH + var) * (1.0 - smoothstep(0.55, 0.75, normalH));
  float rockBlend  = slope + smoothstep(0.52, 0.70, normalH + var) * (1.0 - slope * 0.5);
  float snowBlend  = smoothstep(0.68, 0.82, normalH + var);
  float dirtBlend  = 1.0 - smoothstep(0.30, 0.50, normalH + var);

  rockBlend  = clamp(rockBlend,  0.0, 1.0);
  snowBlend  = clamp(snowBlend,  0.0, 1.0);
  grassBlend = clamp(grassBlend * (1.0 - snowBlend) * (1.0 - slope * 0.6), 0.0, 1.0);
  dirtBlend  = clamp(dirtBlend  * (1.0 - snowBlend), 0.0, 1.0);

  // Blend final color
  vec3 color = dirtColor;
  color = mix(color, grassColor, grassBlend);
  color = mix(color, rockColor,  rockBlend  * (1.0 - snowBlend));
  color = mix(color, snowColor,  snowBlend);

  if (uPBR) {
    // Simple Lambertian shading
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uSunDir);
    float diff = max(dot(N, L), 0.0);
    float ambient = 0.25;
    vec3 lit = color * (uSunColor * diff + ambient);

    // Fake specular on snow
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 32.0) * snowBlend * 0.6;

    gl_FragColor = vec4(lit + vec3(spec), 1.0);
  } else {
    // Flat shading — unlit color only
    gl_FragColor = vec4(color, 1.0);
  }
}
