precision mediump float;

in vec4 vPosition;
uniform float uTime;
uniform float uSpeed;
uniform float uLifetime;
uniform float uLastSpawnTime;

out vec4 fragColor;

void main() {
  vec3 color = vec3(0.0, 0.0, 0.8);

  //Calculate distance from despawn point to current point 
  float despawnPositionY = vPosition.y - uSpeed * uLifetime;
  float currentPositionY = vPosition.y - uSpeed * (uTime - uLastSpawnTime);
  float distance = abs(despawnPositionY - currentPositionY);


  float alpha = (distance/(uLifetime * uSpeed));
  fragColor = vec4(color, alpha);
}
