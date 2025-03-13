precision mediump float;

in vec3 position;
in float size;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;
uniform float uTime;
uniform float uSize;
uniform float uSpeed;
uniform float uMaxHeight;
uniform float uMinHeight;

void main() {
  // Vertical movement (fall)
  vec3 newPosition = position;
  float totalHeight = uMaxHeight - uMinHeight;
  newPosition.y = uMaxHeight - mod(uMaxHeight - (newPosition.y - uTime * uSpeed), totalHeight);

  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);

  gl_Position = projectionMatrix * viewMatrix * modelPosition;
  gl_PointSize = uSize * size;
}
