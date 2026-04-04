uniform float uSeed;
uniform float uTemp;
uniform float uTime;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p) {
  float n = dot(p + uSeed * 0.1, vec2(127.1, 311.7));
  return fract(sin(n) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v=0.0, a=0.5, freq=1.0;
  for (int i=0;i<5;i++){v+=noise(p*freq)*a;a*=0.5;freq*=2.07;}
  return v;
}

vec3 bandColor(float band) {
  float t = fract(band * 3.0);
  vec3 c0 = vec3(0.82, 0.65, 0.38);
  vec3 c1 = vec3(0.68, 0.42, 0.18);
  vec3 c2 = vec3(0.88, 0.76, 0.54);
  vec3 c3 = vec3(0.55, 0.30, 0.12);
  vec3 c4 = vec3(0.76, 0.56, 0.30);
  vec3 c5 = vec3(0.60, 0.38, 0.16);
  float idx = floor(band * 18.0);
  float r = fract(idx / 6.0);
  if (r < 0.167) return mix(c0, c1, t * 6.0);
  if (r < 0.334) return mix(c1, c2, (t - 0.167) * 6.0);
  if (r < 0.500) return mix(c2, c3, (t - 0.334) * 6.0);
  if (r < 0.667) return mix(c3, c4, (t - 0.500) * 6.0);
  if (r < 0.834) return mix(c4, c5, (t - 0.667) * 6.0);
  return mix(c5, c0, (t - 0.834) * 6.0);
}

void main() {
  float turbU = fbm(vec2(vUv.x * 3.0 + uSeed * 0.01, vUv.y * 1.5) + uTime * 0.005);
  float bandY  = vUv.y + turbU * 0.18;

  vec3 color = bandColor(bandY);

  float detail = fbm(vUv * 8.0 + uSeed * 0.02 + uTime * 0.003) * 0.12;
  color += detail * vec3(0.15, 0.08, 0.02);

  float spotX = 0.3 + fract(uSeed * 0.0001) * 0.4;
  float spotY = 0.35 + fract(uSeed * 0.00017) * 0.3;
  vec2 spotUv  = vUv - vec2(spotX, spotY);
  spotUv.x    *= 2.2;
  float spotR  = length(spotUv);
  float spot   = smoothstep(0.12, 0.0, spotR);
  color = mix(color, vec3(0.65, 0.18, 0.08), spot * 0.75);

  if (uTemp < 150.0) {
    float lat = abs(vUv.y - 0.5) * 2.0;
    color = mix(color, vec3(0.55, 0.65, 0.80), smoothstep(0.7, 0.95, lat) * 0.5);
  }

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.3 + diff * 0.8;
  color *= light * uLightColor;

  gl_FragColor = vec4(color, 1.0);
}
