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
uniform vec3 uObjectPosition;
uniform float uLifetime;
uniform float uSpawnRadius;
uniform float uLastSpawnTime;

void main() {
  
  vec3 newPosition = position;

  float age = uTime - uLastSpawnTime;
  newPosition += uObjectPosition;
  newPosition.y -= uSpeed * age;
  
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  gl_Position = projectionMatrix * viewMatrix * modelPosition;
  
  gl_PointSize = uSize * size;
  //gl_PointSize = uSpawnRadius * 10.0; // Larger points for higher ages
}
