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
  vec2 i=floor(p), f=fract(p), u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5,f=1.0;
  for(int i=0;i<5;i++){v+=noise(p*f)*a;a*=0.5;f*=2.1;}
  return v;
}

void main() {
  float turb = fbm(vec2(vUv.x * 4.0 + uSeed * 0.01, vUv.y * 2.0) + uTime * 0.01);
  float bandY = vUv.y + turb * 0.22;

  float heatRamp = clamp((uTemp - 800.0) / 1200.0, 0.0, 1.0);
  vec3 cool = vec3(0.55, 0.15, 0.05);
  vec3 hot  = vec3(1.0, 0.38, 0.05);
  vec3 base = mix(cool, hot, heatRamp);

  float band = fbm(vec2(uSeed * 0.01, bandY * 6.0));
  base += (band - 0.5) * vec3(0.15, 0.06, 0.02);

  vec3 color = base;

  float dayside = 1.0 - vUv.x;
  color += vec3(0.30, 0.10, 0.02) * dayside * dayside * 0.6;

  float edgeGlow = smoothstep(0.85, 1.0, dayside) * smoothstep(0.4, 0.5, 1.0 - abs(vUv.y - 0.5) * 2.0);
  color = mix(color, vec3(1.0, 0.55, 0.1), edgeGlow * 0.7);

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.35 + diff * 0.75;
  color *= light * uLightColor;

  gl_FragColor = vec4(color, 1.0);
}
