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

  //if (age > uLifetime) {
    //newPosition = uObjectPosition;
    //+ vec3(
     // (fract(sin(dot(position.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * uSpawnRadius * 100000.0,
     // (fract(sin(dot(position.yz, vec2(93.9898, 67.345))) * 43758.5453) - 0.5) * uSpawnRadius * 100000.0,
     // 0.0
     newPosition.y -= uSpeed * age;
     // );
  } else {
    newPosition.y -= uSpeed * age;
  }
  
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  gl_Position = projectionMatrix * viewMatrix * modelPosition;
  
  gl_PointSize = uSize * size;
  //gl_PointSize = uSpawnRadius * 10.0; // Larger points for higher ages
}
