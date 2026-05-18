// sky.frag.glsl
// Atmospheric scattering: Rayleigh + Mie + sun disc + halo

uniform vec3  uSunDir;
uniform vec3  uSunColor;
uniform vec3  uZenith;
uniform vec3  uHorizon;
uniform vec3  uGround;

uniform float uRayleighStrength;
uniform float uMieStrength;
uniform float uMieDirectionalG;

varying vec3 vWorldDir;

void main() {
  vec3 dir = normalize(vWorldDir);
  float t = clamp(dir.y, -0.1, 1.0);

  vec3 skyGrad = mix(uHorizon, uZenith, smoothstep(0.0, 0.6, t));
  skyGrad = mix(uGround, skyGrad, smoothstep(-0.15, 0.0, t));

  float cosTheta = dot(dir, normalize(uSunDir));
  float rayleighPhase = 0.75 * (1.0 + cosTheta * cosTheta);
  float rayleigh = rayleighPhase * uRayleighStrength * max(dir.y + 0.1, 0.0);
  vec3 rayleighColor = vec3(0.4, 0.6, 1.0) * rayleigh;

  float miePhase = pow(max(cosTheta, 0.0), uMieDirectionalG);
  float mie = miePhase * uMieStrength * max(dir.y, 0.0);
  vec3 mieColor = uSunColor * mie;

  vec3 color = skyGrad + rayleighColor + mieColor;

  float sunDisc = smoothstep(0.9990, 0.9998, cosTheta);
  color += uSunColor * sunDisc;

  float halo = pow(max(cosTheta, 0.0), 16.0) * 0.25;
  color += uSunColor * halo;

  gl_FragColor = vec4(color, 1.0);
}
