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
  for(int i=0;i<5;i++){v+=noise(p*f)*a;a*=0.5;f*=2.07;}
  return v;
}

void main() {
  float turb = fbm(vec2(vUv.x * 2.5 + uSeed * 0.01, vUv.y) + uTime * 0.004) * 0.15;
  float bandY = vUv.y + turb;

  float hueShift = fract(uSeed * 0.00001) * 0.25;
  vec3 deep   = vec3(0.02 + hueShift * 0.1, 0.08, 0.35);
  vec3 mid    = vec3(0.05 + hueShift * 0.1, 0.25, 0.70);
  vec3 bright = vec3(0.30 + hueShift * 0.1, 0.55, 0.90);

  float band = sin(bandY * 12.0 + uSeed * 0.1) * 0.5 + 0.5;
  float detail = fbm(vUv * 6.0 + uSeed * 0.02) * 0.3;

  vec3 color = mix(deep, mid, band);
  color = mix(color, bright, detail * 0.4);

  float limb = 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
  color = mix(color, bright * 1.2, limb * limb * 0.35);

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.32 + diff * 0.82;
  color *= light * uLightColor;

  gl_FragColor = vec4(color, 1.0);
}
