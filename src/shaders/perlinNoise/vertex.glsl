precision mediump float;

in vec3 position;
in vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;

uniform vec2 uResolution;
uniform float uSize;
uniform float uTime;
uniform vec3 uPosition;
uniform float uClickTime;
uniform float uWaveSpeed;
uniform float uWaveForce;
uniform float uWaveDissipation;
uniform float uWaveSpread;

out vec2 vUv;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  vec2 center = uPosition.xz;
  float distanceToCenter = length(modelPosition.xz - center);

  float elapsedTime = uTime - uClickTime;

  // Damping factor to smoothly reduce the wave amplitude over time
  float damping = smoothstep(1.0, 2.0, elapsedTime);

  if (elapsedTime < 2.0) {
    float wave = sin(distanceToCenter * uWaveSpread - elapsedTime * uWaveSpeed) * exp(-distanceToCenter * uWaveDissipation);
    wave *= (1.0 - damping); // Apply damping to the wave amplitude
    modelPosition.y += wave * uWaveForce;
  }

  vUv = (modelPosition.xz / modelPosition.w) / uSize + 0.5; // Perspective
  vec4 mvPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize;
}
