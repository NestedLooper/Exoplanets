uniform float uSeed;
uniform float uTemp;
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
  vec2 p = vUv * 3.5 + uSeed * 0.01;
  float terrain = fbm(p);

  float landThreshold = 0.50;
  bool isLand = terrain > landThreshold;

  vec3 color;
  if (isLand) {
    float elev = (terrain - landThreshold) / (1.0 - landThreshold);
    vec3 jungle  = vec3(0.18, 0.42, 0.12);
    vec3 grass   = vec3(0.30, 0.52, 0.18);
    vec3 highland= vec3(0.48, 0.38, 0.22);
    vec3 mountain= vec3(0.62, 0.58, 0.52);
    vec3 snow    = vec3(0.90, 0.93, 0.96);

    if (elev < 0.25)      color = mix(jungle, grass, elev * 4.0);
    else if (elev < 0.55) color = mix(grass, highland, (elev - 0.25) * 3.3);
    else if (elev < 0.80) color = mix(highland, mountain, (elev - 0.55) * 4.0);
    else                  color = mix(mountain, snow, (elev - 0.80) * 5.0);
  } else {
    float depth = (landThreshold - terrain) / landThreshold;
    vec3 shallow = vec3(0.05, 0.40, 0.75);
    vec3 deep    = vec3(0.01, 0.08, 0.28);
    color = mix(shallow, deep, depth * 1.4);

    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec = normalize(normalize(uLightDir) + viewDir);
    float spec = pow(max(0.0, dot(normalize(vNormal), halfVec)), 48.0);
    color += uLightColor * spec * 0.6;
  }

  float lat      = abs(vUv.y - 0.5) * 2.0;
  float iceEdge  = fbm(vec2(vUv.x * 7.0, uSeed * 0.04)) * 0.07;
  float poleBase = mix(0.85, 0.65, clamp((300.0 - uTemp) / 150.0, 0.0, 1.0));
  float iceMix   = smoothstep(poleBase + iceEdge, poleBase + iceEdge + 0.12, lat);
  color = mix(color, vec3(0.90, 0.94, 1.0), iceMix);

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.28 + diff * 0.85;
  color *= light * uLightColor;

  gl_FragColor = vec4(color, 1.0);
}
