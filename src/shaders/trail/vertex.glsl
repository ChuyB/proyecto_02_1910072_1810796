precision mediump float;

in vec3 position;
in float size;
in float startTime;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;
uniform float uTime;
uniform float uParticleSize;
uniform float uSpeed;
uniform float uLifetime;
uniform float uSpawnRadius;
uniform vec3 uLastSpawnObjectPosition;
uniform float uLastSpawnTime;

out vec4 vPosition;

// Function to generate a random point in a sphere for dynamic radius updating
vec3 sphereRadius(vec3 seed, float radius){
  // Just some rng dont pay too much attention to the meaning
    float r = fract(sin(dot(seed.xy, vec2(12.9898, 78.233))) * 43758.5453) * radius;
    float theta = fract(sin(dot(seed.yz, vec2(93.9898, 67.345))) * 43758.5453) * 2.0 * 3.14159265359; // Random angle in [0, 2π]
    float phi = acos(2.0 * fract(sin(dot(seed.xz, vec2(45.233, 12.9898))) * 43758.5453) - 1.0); // Random angle in [0, π]

    // Convert spherical coordinates to Cartesian coordinates
    return vec3(
        r * sin(phi) * cos(theta),
        r * sin(phi) * sin(theta),
        r * cos(phi)
    );
}

void main() {
  
  vec3 newPosition = position;

  float age = uTime - startTime;
  vec3 spherePosition = sphereRadius(position, uSpawnRadius);
    
  newPosition = spherePosition + uLastSpawnObjectPosition;
  newPosition.y -= uSpeed * (uTime - startTime);


  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vPosition = projectionMatrix * viewMatrix * modelPosition;
  gl_Position = vPosition;
  
  gl_PointSize = uParticleSize * size;
}
