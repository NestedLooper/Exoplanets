uniform float uSeed;
uniform float uTemp;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p) {
  float n = dot(p + uSeed * 0.1, vec2(127.1, 311.7));
  return fract(sin(n) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, amp = 0.5, freq = 1.0;
  for (int i = 0; i < 6; i++) {
    v += noise(p * freq) * amp;
    amp *= 0.5;
    freq *= 2.07;
  }
  return v;
}

void main() {
  vec2 p = vUv * 5.0 + uSeed * 0.01;

  float terrain = fbm(p);
  float detail  = fbm(p * 2.5 + 3.7);

  vec3 lowland  = vec3(0.42, 0.20, 0.10);
  vec3 highland = vec3(0.62, 0.34, 0.16);
  vec3 rock     = vec3(0.55, 0.48, 0.40);

  vec3 color = mix(lowland, highland, smoothstep(0.35, 0.65, terrain));
  color = mix(color, rock, smoothstep(0.70, 0.85, terrain) * 0.5);

  float craterBase  = fbm(p * 1.8 + 9.3);
  float crater      = smoothstep(0.64, 0.67, craterBase) * (1.0 - smoothstep(0.67, 0.70, craterBase));
  float craterFloor = smoothstep(0.67, 0.70, craterBase) * 0.4;
  color = mix(color, vec3(0.12, 0.07, 0.04), crater * 0.85);
  color = mix(color, vec3(0.30, 0.16, 0.08), craterFloor);

  float lat     = abs(vUv.y - 0.5) * 2.0;
  float iceEdge = fbm(vec2(vUv.x * 6.0, uSeed * 0.05)) * 0.08;
  if (uTemp < 200.0) {
    float iceMix = smoothstep(0.75 + iceEdge, 0.92 + iceEdge, lat);
    color = mix(color, vec3(0.88, 0.93, 1.0), iceMix);
  }

  if (uTemp > 1000.0) {
    float lavaNoise    = fbm(p * 4.0 + 17.0);
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
