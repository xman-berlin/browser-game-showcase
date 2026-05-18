// raymarching.frag.glsl
// Volumetric clouds via 3D FBM noise ray marching

uniform vec3  uCameraPos;
uniform vec3  uSunDir;
uniform float uTime;
uniform float uCloudScale;
uniform float uCoverage;
uniform float uDensity;
uniform float uStepSize;

varying vec3 vWorldDir;

// --- 3D Simplex noise (Stefan Gustavson) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

float sampleCloudDensity(vec3 p) {
  float n = fbm(p * uCloudScale + uTime * 0.015);
  n = n * 0.5 + 0.5;
  return max(n - uCoverage, 0.0) * uDensity;
}

void main() {
  vec3 viewDir = normalize(vWorldDir);
  vec3 ro = uCameraPos;
  vec3 rd = viewDir;

  if (rd.y < 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float tMin = 100.0;
  float tMax = 500.0;
  float stepSize = uStepSize;

  float totalDensity = 0.0;
  float alpha = 0.0;

  float t = tMin;
  for (int i = 0; i < 100; i++) {
    if (t >= tMax) break;
    vec3 pos = ro + rd * t;
    if (pos.y < 0.0) break;

    float density = sampleCloudDensity(pos);
    if (density > 0.01) {
      float light = 0.5 + 0.5 * max(dot(rd - normalize(uSunDir) * 0.3, normalize(uSunDir)), 0.0);
      totalDensity += density * light;
      alpha += density * 0.03;
      if (alpha > 0.95) break;
    }
    t += stepSize;
  }

  vec3 cloudColor = vec3(0.95, 0.93, 0.9) * totalDensity * 0.02;
  cloudColor += vec3(1.0, 0.85, 0.6) * totalDensity * 0.01;
  cloudColor = clamp(cloudColor, 0.0, 1.0);

  gl_FragColor = vec4(cloudColor, clamp(alpha, 0.0, 1.0));
}
