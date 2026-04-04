uniform float uSeed;
uniform float uTemp;
uniform float uTime;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p) {
  return fract(sin(dot(p + uSeed * 0.1, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5,f=1.0;
  for(int i=0;i<6;i++){v+=noise(p*f)*a;a*=0.5;f*=2.07;}
  return v;
}

void main() {
  vec2 p = vUv * 4.0 + uSeed * 0.01;

  float depth = fbm(p);
  vec3 shallowColor = vec3(0.05, 0.35, 0.70);
  vec3 deepColor    = vec3(0.01, 0.08, 0.30);
  vec3 color = mix(deepColor, shallowColor, depth);

  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfVec = normalize(normalize(uLightDir) + viewDir);
  float spec   = pow(max(0.0, dot(normalize(vNormal), halfVec)), 64.0);
  color += uLightColor * spec * 0.9;

  float chop = fbm(p * 6.0 + uTime * 0.02) * 0.04;
  color += vec3(chop * 0.8, chop * 0.9, chop);

  float lat = abs(vUv.y - 0.5) * 2.0;
  float iceEdge = fbm(vec2(vUv.x * 5.0, uSeed * 0.03)) * 0.06;
  float iceFactor = smoothstep(0.78 + iceEdge, 0.95 + iceEdge, lat);
  float iceThreshold = clamp((400.0 - uTemp) / 200.0, 0.0, 1.0);
  color = mix(color, vec3(0.88, 0.93, 1.0), iceFactor * (0.5 + iceThreshold * 0.5));

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.28 + diff * 0.85;
  color *= light;

  gl_FragColor = vec4(color, 1.0);
}
