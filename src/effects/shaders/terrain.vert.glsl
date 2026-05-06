// terrain.vert.glsl
// Procedural heightmap via multi-octave Simplex Noise

// --- Simplex Noise 2D (Stefan Gustavson) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz  + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// --- FBM (Fractional Brownian Motion) ---
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// --- Varyings ---
varying float vHeight;
varying vec3  vNormal;
varying vec3  vWorldPos;

uniform float uTime;
uniform float uTerrainScale;
uniform float uHeightScale;

void main() {
  vec2 uv = position.xy * uTerrainScale;

  // Multi-octave height
  float h = fbm(uv);
  // Add a second layer for large-scale hills
  h += 0.4 * fbm(uv * 0.3 + vec2(3.7, 1.9));
  h = h * uHeightScale;

  vec3 pos = position + vec3(0.0, 0.0, h);

  // Approximate normal via finite differences
  float eps = 0.05;
  float hR = fbm((position.xy + vec2(eps, 0.0)) * uTerrainScale)
           + 0.4 * fbm((position.xy + vec2(eps, 0.0)) * uTerrainScale * 0.3 + vec2(3.7, 1.9));
  float hU = fbm((position.xy + vec2(0.0, eps)) * uTerrainScale)
           + 0.4 * fbm((position.xy + vec2(0.0, eps)) * uTerrainScale * 0.3 + vec2(3.7, 1.9));
  hR *= uHeightScale;
  hU *= uHeightScale;

  vec3 tangentX = normalize(vec3(eps, 0.0, hR - h));
  vec3 tangentZ = normalize(vec3(0.0, eps, hU - h));
  vec3 computedNormal = normalize(cross(tangentX, tangentZ));

  vHeight   = h;
  // Transform computed normal into world space directly (avoids rotation matrix issues)
  vNormal   = normalize((modelMatrix * vec4(computedNormal, 0.0)).xyz);
  vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
