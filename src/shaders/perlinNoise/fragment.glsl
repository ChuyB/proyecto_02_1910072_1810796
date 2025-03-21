precision mediump float;

uniform float uTime;
uniform float uSpeed;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uOctaves;

out vec4 fragColor;

vec2 randomGradient(vec2 p) {
  float x = dot(p, vec2(123.4, 234.5));
  float y = dot(p, vec2(234.5, 345.6));
  vec2 gradient = vec2(x, y);
  gradient = sin(gradient);
  gradient = gradient * 43758.5453;
  gradient = sin(gradient + (uTime * uSpeed));
  return gradient;
}

vec2 quintic(vec2 p) {
  return p * p * p * (10.0 + p * (-15.0 + p * 6.0));
}

float perlinNoise(vec2 uv) {
  vec2 gridId = floor(uv);
  vec2 gridUv = fract(uv);

  vec2 bl = gridId + vec2(0.0, 0.0);
  vec2 br = gridId + vec2(1.0, 0.0);
  vec2 tl = gridId + vec2(0.0, 1.0);
  vec2 tr = gridId + vec2(1.0, 1.0);

  vec2 g1 = randomGradient(bl);
  vec2 g2 = randomGradient(br);
  vec2 g3 = randomGradient(tl);
  vec2 g4 = randomGradient(tr);

  vec2 distFromBl = gridUv - vec2(0.0, 0.0);
  vec2 distFromBr = gridUv - vec2(1.0, 0.0);
  vec2 distFromTl = gridUv - vec2(0.0, 1.0);
  vec2 distFromTr = gridUv - vec2(1.0, 1.0);

  float d1 = dot(g1, distFromBl);
  float d2 = dot(g2, distFromBr);
  float d3 = dot(g3, distFromTl);
  float d4 = dot(g4, distFromTr);

  gridUv = quintic(gridUv);

  float bot = mix(d1, d2, gridUv.x);
  float top = mix(d3, d4, gridUv.x);
  float pNoise = mix(bot, top, gridUv.y);

  return pNoise + 0.1;
}

float fbmPerlinNoise(vec2 uv) {
  float fbmNoise = 0.0;
  float amplitude = 1.0;

  for (float i = 0.0; i < uOctaves; i++) {
    fbmNoise = fbmNoise + perlinNoise(uv) * amplitude;
    amplitude = amplitude * 0.5;
    uv = uv * 2.0;
  }

  fbmNoise = fbmNoise / 2.0;

  return fbmNoise;
}

float domainWarpFbmPerlinNoise(vec2 uv) {
  float fbm1 = fbmPerlinNoise(uv + vec2(0.0, 0.0));
  float fbm2 = fbmPerlinNoise(uv + vec2(5.2, 1.3));
  return fbmPerlinNoise(vec2(fbm1, fbm2));
}

vec3 calcNormal(vec2 uv) {
  float diff = 0.001;
  float p1 = domainWarpFbmPerlinNoise(uv + vec2(diff, 0.0));
  float p2 = domainWarpFbmPerlinNoise(uv - vec2(diff, 0.0));
  float p3 = domainWarpFbmPerlinNoise(uv + vec2(0.0, diff));
  float p4 = domainWarpFbmPerlinNoise(uv - vec2(0.0, diff));

  vec3 normal = normalize(vec3(p1 - p2, p3 - p4, 0.001));
  return normal;
}

in vec2 vUv;

void main() {
  vec2 uv = vUv;

  vec3 color = vec3(0.0);

  uv = uv * 1.0;
  float pNoise = perlinNoise(uv);
  color = vec3(pNoise);

  // Central differences method
  vec3 normal = calcNormal(uv);

  // Diffuse lighting
  vec3 lightColor = uColor;
  vec3 lightSource = vec3(1.0, 1.0, 1.0);
  float diffuseStrength = max(0.0, dot(normal, lightSource));
  vec3 diffuse = diffuseStrength * lightColor;
  vec3 lighting = diffuse * 0.5;
  color = lighting;

  // Specular lighting
  vec3 cameraSource = vec3(0.0, 0.0, 1.0);
  vec3 viewSource = normalize(cameraSource);
  vec3 reflectSource = normalize(reflect(-lightSource, normal));
  float specularStrength = max(0.0, dot(viewSource, reflectSource));
  specularStrength = pow(specularStrength, 32.0);
  vec3 specular = specularStrength * lightColor;

  lighting = diffuse * 0.5 + specular * 0.5;
  color = lighting;

  fragColor = vec4(color, 1.0);
}
