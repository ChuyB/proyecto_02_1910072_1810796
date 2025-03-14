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
uniform float uObjectPosition;

void main() {
  // Vertical movement (fall)
  vec3 newPosition = position;
  newPosition.y -= uSpeed * uTime;
  float totalHeight = 10.0; 

  // Y position reset
  newPosition.y = uObjectPosition.y - mod(uObjectPosition.y - (newPosition.y - uTime * uSpeed), totalHeight);

  // X and Z
  newPosition.x += uObjectPosition.x - position.x;
  newPosition.z += uObjectPosition.z - position.z;

  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);

  gl_Position = projectionMatrix * viewMatrix * modelPosition;
  gl_PointSize = uSize * size;
}
