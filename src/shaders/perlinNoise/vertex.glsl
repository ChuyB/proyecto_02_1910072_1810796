precision mediump float;

in vec3 position;
in vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;

uniform vec2 uResolution;
uniform float uSize;

out vec2 vUv;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vUv = (modelPosition.xy / modelPosition.w) / uSize + 0.5; // Perspective
  vec4 mvPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize;
}
