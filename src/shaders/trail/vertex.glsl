precision mediump float;

in vec3 position;
in float size;
in float startTime;

in vec3 spawnPosition;
in vec3 prevSpawnPosition;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;
uniform float uTime;
uniform float uParticleSize;
uniform vec2 uInitialSpeed;
uniform vec2 uInitialForce;
uniform float uForceApplicationTime;
uniform float uLifetime;
uniform float uSpawnRadius;
uniform float uLastSpawnTime; 

uniform float uPostCorrection;

out float vAge;
out float vStartTime;

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
  // Time since particle was last moved to an initial position
  float age = uTime - startTime;

  // Cull particles that are not yet active (optimization)
  // we still set placeholder values for size and position
  if (uTime < startTime) {
      gl_PointSize = 0.0; // Make the particle invisible
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Move it off-screen
      return;
  }

  vec3 spherePosition = sphereRadius(position, uSpawnRadius);

  // Calculate acceleration (a = F / m) (we associate mass to particle size)
  vec2 acceleration = uInitialForce / size;

  // Apply acceleration to speed if applies
  vec2 speed = uInitialSpeed;
  if (uTime <= startTime + uForceApplicationTime) {
    float timeInForceWindow = uTime - startTime;
    speed += acceleration * timeInForceWindow;

  } else if (uTime > startTime + uForceApplicationTime) {
     // After the force application window, apply exponential decay to the force
     // Preferred to let the decay factor be an uniform for manual tuning
    float timeSinceForceEnd = uTime - (startTime + uForceApplicationTime);
    vec2 decayedForce = uInitialForce * exp(-uPostCorrection * timeSinceForceEnd);
    vec2 decayedAcceleration = decayedForce / size;

    speed += decayedAcceleration * uForceApplicationTime;
  }

  // Locate the particle within a sphere and apply movement
  newPosition = spherePosition + spawnPosition;
  newPosition.xy += speed * age;

  // Apply the changes
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  gl_Position = projectionMatrix * viewMatrix * modelPosition;
  vAge = age;
  vStartTime = startTime;
  gl_PointSize = uParticleSize * size;
}
