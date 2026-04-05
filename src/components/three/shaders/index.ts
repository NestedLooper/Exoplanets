// Shaders inlined as TS strings — avoids any bundler/loader configuration.
// All fragment shaders use 3D world-position noise (not UV) to avoid the
// UV-seam discontinuity that appears as a vertical line on the sphere.

export const planetVert = /* glsl */`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// ─── Shared 3D noise helpers (inlined into each shader) ───────────────────────
// Using world-position (3D) avoids the UV seam on sphere surfaces.
const NOISE3D = /* glsl */`
float hash3(vec3 p) {
  p = fract(p * vec3(127.1, 311.7, 74.7));
  p += dot(p, p.yxz + 19.19);
  return fract(p.x * p.y * p.z);
}
float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i),           hash3(i+vec3(1,0,0)), u.x),
        mix(hash3(i+vec3(0,1,0)), hash3(i+vec3(1,1,0)), u.x), u.y),
    mix(mix(hash3(i+vec3(0,0,1)), hash3(i+vec3(1,0,1)), u.x),
        mix(hash3(i+vec3(0,1,1)), hash3(i+vec3(1,1,1)), u.x), u.y),
    u.z
  );
}
float fbm3(vec3 p) {
  float v = 0.0, a = 0.5, f = 1.0;
  for (int i = 0; i < 6; i++) { v += noise3(p * f) * a; a *= 0.5; f *= 2.07; }
  return v;
}
`

export const rockyFrag = /* glsl */`
uniform float uSeed;
uniform float uTemp;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec3 vNormal;
varying vec3 vWorldPosition;

${NOISE3D}

void main() {
  vec3 dir = normalize(vWorldPosition);
  vec3 p = dir * 3.5 + uSeed * 0.01;

  float terrain = fbm3(p);
  float detail  = fbm3(p * 2.5 + 3.7);

  vec3 lowland  = vec3(0.42, 0.20, 0.10);
  vec3 highland = vec3(0.62, 0.34, 0.16);
  vec3 rock     = vec3(0.55, 0.48, 0.40);

  vec3 color = mix(lowland, highland, smoothstep(0.35, 0.65, terrain));
  color = mix(color, rock, smoothstep(0.70, 0.85, terrain) * 0.5);

  float craterBase  = fbm3(p * 1.8 + 9.3);
  float crater      = smoothstep(0.64, 0.67, craterBase) * (1.0 - smoothstep(0.67, 0.70, craterBase));
  float craterFloor = smoothstep(0.67, 0.70, craterBase) * 0.4;
  color = mix(color, vec3(0.12, 0.07, 0.04), crater * 0.85);
  color = mix(color, vec3(0.30, 0.16, 0.08), craterFloor);

  // Latitude-based ice/lava uses dir.y (no seam)
  float lat = abs(dir.y);
  float iceEdge = fbm3(dir * 6.0 + uSeed * 0.05) * 0.08;
  if (uTemp < 200.0) {
    float iceMix = smoothstep(0.75 + iceEdge, 0.92 + iceEdge, lat);
    color = mix(color, vec3(0.88, 0.93, 1.0), iceMix);
  }
  if (uTemp > 1000.0) {
    float lavaNoise    = fbm3(p * 4.0 + 17.0);
    float lavaLine     = smoothstep(0.60, 0.63, lavaNoise) * (1.0 - smoothstep(0.63, 0.66, lavaNoise));
    float lavaStrength = clamp((uTemp - 1000.0) / 1000.0, 0.0, 1.0);
    color = mix(color, vec3(1.0, 0.28, 0.0), lavaLine * lavaStrength);
    color += vec3(0.15, 0.04, 0.0) * lavaLine * lavaStrength * 0.5;
  }

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.25 + diff * 0.85;
  color *= light * uLightColor;
  gl_FragColor = vec4(color, 1.0);
}
`

export const gasGiantFrag = /* glsl */`
uniform float uSeed;
uniform float uTemp;
uniform float uTime;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec3 vNormal;
varying vec3 vWorldPosition;

${NOISE3D}

// Returns a 6-stop palette based on seed family
void getPalette(float family, out vec3 p0, out vec3 p1, out vec3 p2, out vec3 p3, out vec3 p4, out vec3 p5) {
  if (family < 0.20) {
    // Jupiter: classic brown/orange belts
    p0 = vec3(0.82, 0.65, 0.38); p1 = vec3(0.68, 0.42, 0.18);
    p2 = vec3(0.88, 0.76, 0.54); p3 = vec3(0.55, 0.30, 0.12);
    p4 = vec3(0.76, 0.56, 0.30); p5 = vec3(0.60, 0.38, 0.16);
  } else if (family < 0.40) {
    // Saturn: pale gold / cream
    p0 = vec3(0.92, 0.85, 0.60); p1 = vec3(0.80, 0.70, 0.42);
    p2 = vec3(0.95, 0.90, 0.70); p3 = vec3(0.72, 0.60, 0.35);
    p4 = vec3(0.86, 0.78, 0.52); p5 = vec3(0.78, 0.65, 0.40);
  } else if (family < 0.60) {
    // Ice giant: steel blue / teal
    p0 = vec3(0.38, 0.62, 0.82); p1 = vec3(0.22, 0.45, 0.70);
    p2 = vec3(0.55, 0.75, 0.90); p3 = vec3(0.18, 0.35, 0.60);
    p4 = vec3(0.42, 0.65, 0.85); p5 = vec3(0.30, 0.52, 0.78);
  } else if (family < 0.80) {
    // Rust giant: deep red / ochre
    p0 = vec3(0.75, 0.30, 0.12); p1 = vec3(0.58, 0.18, 0.06);
    p2 = vec3(0.85, 0.48, 0.20); p3 = vec3(0.50, 0.14, 0.04);
    p4 = vec3(0.70, 0.38, 0.15); p5 = vec3(0.62, 0.24, 0.08);
  } else {
    // Violet exotic: purple / magenta
    p0 = vec3(0.55, 0.28, 0.72); p1 = vec3(0.38, 0.12, 0.55);
    p2 = vec3(0.70, 0.42, 0.85); p3 = vec3(0.30, 0.08, 0.48);
    p4 = vec3(0.60, 0.30, 0.78); p5 = vec3(0.45, 0.18, 0.62);
  }
}

vec3 bandColor(float band, float family) {
  vec3 p0, p1, p2, p3, p4, p5;
  getPalette(family, p0, p1, p2, p3, p4, p5);
  float idx = floor(band * 18.0);
  float r = fract(idx / 6.0);
  float t = fract(band * 3.0);
  if (r < 0.167) return mix(p0, p1, t * 6.0);
  if (r < 0.334) return mix(p1, p2, (t - 0.167) * 6.0);
  if (r < 0.500) return mix(p2, p3, (t - 0.334) * 6.0);
  if (r < 0.667) return mix(p3, p4, (t - 0.500) * 6.0);
  if (r < 0.834) return mix(p4, p5, (t - 0.667) * 6.0);
  return mix(p5, p0, (t - 0.834) * 6.0);
}

void main() {
  vec3 dir = normalize(vWorldPosition);
  float family = fract(uSeed * 0.000073);

  // Primary band turbulence — slow drift
  float turb = fbm3(dir * 3.0 + uSeed * 0.01 + uTime * 0.006) * 0.20;
  // Counter-rotating equatorial jet (opposite sign on x)
  float jet  = fbm3(vec3(-dir.x, dir.y, dir.z) * 2.5 + uSeed * 0.015 + uTime * 0.009) * 0.10;
  float bandY = dir.y * 0.5 + 0.5 + turb + jet * (1.0 - abs(dir.y));

  vec3 color = bandColor(bandY, family);

  // Cloud puff layer — billowy shapes scrolling faster
  float cloudA = fbm3(dir * 5.5 + uSeed * 0.02 + uTime * 0.014);
  float cloudB = fbm3(dir * 9.0 + uSeed * 0.03 + uTime * 0.010);
  float clouds = smoothstep(0.48, 0.62, cloudA) * smoothstep(0.50, 0.58, cloudB);
  // Cloud tone is lighter version of band color
  vec3 cloudColor = mix(color * 1.35, vec3(0.92, 0.90, 0.85), 0.25);
  color = mix(color, cloudColor, clouds * 0.55);

  // Subtle fine detail
  float detail = fbm3(dir * 12.0 + uSeed * 0.04 + uTime * 0.005) * 0.08;
  color += color * detail * 0.20;

  // Storm spot — size and color vary with seed
  vec3 spotDir = normalize(vec3(
    cos(uSeed * 0.001) * 0.8,
    sin(uSeed * 0.00017) * 0.3,
    sin(uSeed * 0.001) * 0.8
  ));
  float spotSize = 0.15 + fract(uSeed * 0.00041) * 0.20;
  float spotR = length(dir - spotDir) * (1.5 / spotSize);
  float spot  = smoothstep(0.25, 0.0, spotR);
  vec3 stormCol = mix(color * 0.45, vec3(0.65, 0.18, 0.08), family * 0.6);
  color = mix(color, stormCol, spot * 0.80);

  if (uTemp < 150.0) {
    float lat = abs(dir.y);
    color = mix(color, vec3(0.55, 0.65, 0.80), smoothstep(0.7, 0.95, lat) * 0.5);
  }

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.3 + diff * 0.8;
  color *= light * uLightColor;
  gl_FragColor = vec4(color, 1.0);
}
`

export const hotJupiterFrag = /* glsl */`
uniform float uSeed;
uniform float uTemp;
uniform float uTime;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec3 vNormal;
varying vec3 vWorldPosition;

${NOISE3D}

void main() {
  vec3 dir = normalize(vWorldPosition);
  float family = fract(uSeed * 0.000091);

  // Churning cloud layers — faster than cold gas giants
  float turb1 = fbm3(dir * 3.5 + uSeed * 0.01 + uTime * 0.012) * 0.20;
  float turb2 = fbm3(dir * 6.0 + uSeed * 0.02 + uTime * 0.008) * 0.10;
  float bandY = dir.y * 0.5 + 0.5 + turb1 + turb2;

  float heatRamp = clamp((uTemp - 800.0) / 1200.0, 0.0, 1.0);

  // 4 colour families: molten orange, dark carbon, violet-iron, deep crimson
  vec3 darkCol, midCol, brightCol, limbCol;
  if (family < 0.25) {
    // Molten orange — classic lava ball
    darkCol   = vec3(0.45, 0.10, 0.02);
    midCol    = mix(vec3(0.60, 0.18, 0.04), vec3(1.0, 0.42, 0.05), heatRamp);
    brightCol = vec3(1.0, 0.70, 0.20);
    limbCol   = vec3(1.0, 0.55, 0.10);
  } else if (family < 0.50) {
    // Dark carbon — near-black with glowing cracks
    darkCol   = vec3(0.08, 0.06, 0.05);
    midCol    = mix(vec3(0.20, 0.12, 0.08), vec3(0.70, 0.28, 0.05), heatRamp);
    brightCol = vec3(0.90, 0.50, 0.10);
    limbCol   = vec3(0.80, 0.35, 0.05);
  } else if (family < 0.75) {
    // Violet-iron — dark purple with orange-white hotspots
    darkCol   = vec3(0.18, 0.06, 0.22);
    midCol    = mix(vec3(0.40, 0.10, 0.45), vec3(0.75, 0.30, 0.55), heatRamp);
    brightCol = vec3(1.0, 0.65, 0.80);
    limbCol   = vec3(0.85, 0.40, 0.70);
  } else {
    // Deep crimson — blood red
    darkCol   = vec3(0.30, 0.04, 0.04);
    midCol    = mix(vec3(0.55, 0.10, 0.06), vec3(0.90, 0.25, 0.08), heatRamp);
    brightCol = vec3(1.0, 0.55, 0.25);
    limbCol   = vec3(0.95, 0.40, 0.15);
  }

  float bandNoise = fbm3(vec3(uSeed * 0.01, bandY * 6.0, uSeed * 0.005));
  vec3 color = mix(darkCol, midCol, bandNoise);
  float detail = fbm3(dir * 9.0 + uSeed * 0.03 + uTime * 0.006) * 0.15;
  color = mix(color, brightCol, detail * heatRamp * 0.5);

  // Dayside glow
  float dayside = clamp(dot(dir, normalize(uLightDir)), 0.0, 1.0);
  color += brightCol * dayside * dayside * 0.35;

  // Limb glow
  float limb = 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
  color = mix(color, limbCol, limb * limb * 0.45);

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.35 + diff * 0.75;
  color *= light * uLightColor;
  gl_FragColor = vec4(color, 1.0);
}
`

export const oceanFrag = /* glsl */`
uniform float uSeed;
uniform float uTemp;
uniform float uTime;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec3 vNormal;
varying vec3 vWorldPosition;

${NOISE3D}

void main() {
  vec3 dir = normalize(vWorldPosition);
  vec3 p = dir * 4.0 + uSeed * 0.01;
  float family = fract(uSeed * 0.000059);

  float depth = fbm3(p);

  // 4 ocean chemistry families
  vec3 shallowColor, deepColor;
  if (family < 0.25) {
    // Earth-blue
    shallowColor = vec3(0.06, 0.52, 0.90);
    deepColor    = vec3(0.02, 0.10, 0.40);
  } else if (family < 0.50) {
    // Teal/algae — biological
    shallowColor = vec3(0.04, 0.65, 0.58);
    deepColor    = vec3(0.01, 0.22, 0.28);
  } else if (family < 0.75) {
    // Grey-storm — ammonia ocean
    shallowColor = vec3(0.42, 0.52, 0.65);
    deepColor    = vec3(0.12, 0.18, 0.32);
  } else {
    // Violet-methane
    shallowColor = vec3(0.45, 0.22, 0.72);
    deepColor    = vec3(0.12, 0.04, 0.35);
  }

  vec3 color = mix(deepColor, shallowColor, depth);

  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfVec = normalize(normalize(uLightDir) + viewDir);
  float spec   = pow(max(0.0, dot(normalize(vNormal), halfVec)), 64.0);
  color += uLightColor * spec * 0.9;

  float chop = fbm3(p * 6.0 + uTime * 0.02) * 0.04;
  color += shallowColor * chop * 0.6;

  float lat = abs(dir.y);
  float iceEdge = fbm3(dir * 5.0 + uSeed * 0.03) * 0.06;
  float iceFactor = smoothstep(0.78 + iceEdge, 0.95 + iceEdge, lat);
  float iceThreshold = clamp((400.0 - uTemp) / 200.0, 0.0, 1.0);
  color = mix(color, vec3(0.88, 0.93, 1.0), iceFactor * (0.5 + iceThreshold * 0.5));

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.28 + diff * 0.85;
  color *= light;
  gl_FragColor = vec4(color, 1.0);
}
`

export const earthLikeFrag = /* glsl */`
uniform float uSeed;
uniform float uTemp;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec3 vNormal;
varying vec3 vWorldPosition;

${NOISE3D}

void main() {
  vec3 dir = normalize(vWorldPosition);
  vec3 p = dir * 3.5 + uSeed * 0.01;
  float terrain = fbm3(p);

  float landThreshold = 0.50;
  bool isLand = terrain > landThreshold;

  vec3 color;
  if (isLand) {
    float elev = (terrain - landThreshold) / (1.0 - landThreshold);
    vec3 jungle   = vec3(0.22, 0.55, 0.14);
    vec3 grass    = vec3(0.38, 0.65, 0.22);
    vec3 highland = vec3(0.55, 0.44, 0.24);
    vec3 mountain = vec3(0.68, 0.63, 0.56);
    vec3 snow     = vec3(0.93, 0.96, 1.00);
    if (elev < 0.25)      color = mix(jungle, grass, elev * 4.0);
    else if (elev < 0.55) color = mix(grass, highland, (elev - 0.25) * 3.3);
    else if (elev < 0.80) color = mix(highland, mountain, (elev - 0.55) * 4.0);
    else                  color = mix(mountain, snow, (elev - 0.80) * 5.0);
  } else {
    float depth = (landThreshold - terrain) / landThreshold;
    vec3 shallow = vec3(0.06, 0.52, 0.90);
    vec3 deep    = vec3(0.02, 0.12, 0.45);
    color = mix(shallow, deep, depth * 1.3);
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec = normalize(normalize(uLightDir) + viewDir);
    float spec = pow(max(0.0, dot(normalize(vNormal), halfVec)), 48.0);
    color += uLightColor * spec * 0.7;
  }

  float lat = abs(dir.y);
  float iceEdge  = fbm3(dir * 7.0 + uSeed * 0.04) * 0.07;
  float poleBase = mix(0.85, 0.65, clamp((300.0 - uTemp) / 150.0, 0.0, 1.0));
  float iceMix   = smoothstep(poleBase + iceEdge, poleBase + iceEdge + 0.12, lat);
  color = mix(color, vec3(0.90, 0.94, 1.0), iceMix);

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.28 + diff * 0.85;
  color *= light * uLightColor;
  gl_FragColor = vec4(color, 1.0);
}
`

export const cloudFrag = /* glsl */`
uniform float uSeed;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vWorldPosition;

${NOISE3D}

void main() {
  vec3 dir = normalize(vWorldPosition);

  // Two noise layers at different scales — creates patchy, irregular coverage
  float coarseN = fbm3(dir * 2.1 + uSeed * 0.013 + uTime * 0.007);
  float fineN   = fbm3(dir * 5.3 + uSeed * 0.027 + uTime * 0.005);

  // Threshold to break it into discrete cloud areas
  float cov = smoothstep(0.50, 0.64, coarseN) * smoothstep(0.47, 0.60, fineN);

  // Wispy edges via high-frequency noise
  float wisp = fbm3(dir * 11.0 + uSeed * 0.04 + uTime * 0.003) * 0.25;
  cov = clamp(cov * (0.65 + wisp), 0.0, 1.0);

  // Seed-based coverage density (0.3–0.7 range)
  float density = 0.30 + fract(uSeed * 0.00031) * 0.40;
  float alpha = cov * density;

  gl_FragColor = vec4(0.96, 0.97, 1.0, alpha);
}
`

export const subNeptuneFrag = /* glsl */`
uniform float uSeed;
uniform float uTemp;
uniform float uTime;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec3 vNormal;
varying vec3 vWorldPosition;

${NOISE3D}

void main() {
  vec3 dir = normalize(vWorldPosition);
  float turb = fbm3(dir * 2.5 + uSeed * 0.01 + uTime * 0.004) * 0.15;
  float bandY = dir.y * 0.5 + 0.5 + turb;

  float hueShift = fract(uSeed * 0.00001) * 0.25;
  vec3 deep   = vec3(0.02 + hueShift * 0.1, 0.08, 0.35);
  vec3 mid    = vec3(0.05 + hueShift * 0.1, 0.25, 0.70);
  vec3 bright = vec3(0.30 + hueShift * 0.1, 0.55, 0.90);

  float band = sin(bandY * 12.0 + uSeed * 0.1) * 0.5 + 0.5;
  float detail = fbm3(dir * 6.0 + uSeed * 0.02) * 0.3;

  vec3 color = mix(deep, mid, band);
  color = mix(color, bright, detail * 0.4);

  float limb = 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
  color = mix(color, bright * 1.2, limb * limb * 0.35);

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.32 + diff * 0.82;
  color *= light * uLightColor;
  gl_FragColor = vec4(color, 1.0);
}
`

// ─── Star surface shader ───────────────────────────────────────────────────────
// Domain-warped plasma: each noise layer's output offsets the next layer's input,
// creating organic swirling flow rather than a static texture.
// uTempNorm: 0 = M-dwarf (3000 K)  →  1 = O-type (40 000 K)
export const starFrag = /* glsl */`
uniform float uSeed;
uniform float uTime;
uniform vec3  uColor;
uniform float uTempNorm;

varying vec3 vNormal;
varying vec3 vWorldPosition;

${NOISE3D}

void main() {
  vec3 dir = normalize(vWorldPosition);

  // Speed scales with temperature: hot stars churn faster
  float speed = mix(0.012, 0.030, uTempNorm);

  // ── Domain warp pass 1 — large slow eddies ─────────────────────────────────
  vec3 q = vec3(
    fbm3(dir * 2.2 + uSeed * 0.010 + uTime * speed),
    fbm3(dir * 2.2 + uSeed * 0.031 + uTime * speed * 0.85),
    fbm3(dir * 2.2 + uSeed * 0.053 + uTime * speed * 1.10)
  ) - 0.5;

  // ── Domain warp pass 2 — medium turbulence, fed by pass 1 ──────────────────
  vec3 r = vec3(
    fbm3(dir * 4.5 + q * 1.4 + uSeed * 0.021 + uTime * speed * 1.6),
    fbm3(dir * 4.5 + q * 1.4 + uSeed * 0.044 + uTime * speed * 1.4),
    fbm3(dir * 4.5 + q * 1.4 + uSeed * 0.067 + uTime * speed * 1.8)
  ) - 0.5;

  // ── Final plasma sample through doubly-warped coordinates ──────────────────
  float plasma = fbm3(dir * 7.0 + r * 1.8 + uSeed * 0.09 + uTime * speed * 0.5);

  // ── Colour: cooler pockets dim toward spectral hue, hotter spike white ──────
  float heat = smoothstep(0.28, 0.72, plasma);
  vec3 coolCol = uColor * mix(0.45, 0.65, uTempNorm);   // dark, saturated
  vec3 hotCol  = mix(uColor * 1.5, uColor + vec3(0.55, 0.45, 0.30), heat * (1.0 - uTempNorm * 0.6));
  vec3 color   = mix(coolCol, hotCol, heat);

  // ── Bright filaments — thin fast streaks of superheated plasma ─────────────
  float filNoise  = fbm3(dir * 16.0 + r * 0.6 + uTime * speed * 3.5);
  float filament  = smoothstep(0.63, 0.70, filNoise) * mix(0.55, 0.08, uTempNorm);
  color += mix(uColor * 1.8, vec3(1.6, 1.4, 1.1), uTempNorm) * filament;

  // ── Limb: plasma column thins → cooler, dimmer at edge ─────────────────────
  vec3  viewDir = normalize(cameraPosition - vWorldPosition);
  float ndotv   = max(0.0, dot(normalize(vNormal), viewDir));
  // Centre full brightness, limb fades toward cool colour
  color = mix(coolCol * 0.7, color, ndotv * 0.55 + 0.45);

  gl_FragColor = vec4(color, 1.0);
}
`
