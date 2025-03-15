precision mediump float;

in vec3 position;
in float size;
in vec3 velocity;
in float lifeSpan;
in float angle;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;

uniform vec2 uResolution;
uniform float uTime;
uniform float uSize;
uniform float uSpeed;
uniform float uMaxHeight;
uniform float uRotationSpeed;

out float vAlpha;
out vec3 vPosition;

void main() {
  float maxHeight = position.y + uMaxHeight;

  vec3 dynamicPosition = position;
  dynamicPosition.y = maxHeight - mod(maxHeight - (position.y + uSpeed * uTime), maxHeight);

  float rotationAngle = angle * uTime * uRotationSpeed;
  float cosAngle = cos(rotationAngle);
  float sinAngle = sin(rotationAngle);

  vec2 rotatedPosition = vec2(
    dynamicPosition.x * cosAngle - dynamicPosition.z * sinAngle,
    dynamicPosition.x * sinAngle + dynamicPosition.z * cosAngle
  );

  dynamicPosition.x = rotatedPosition.x;
  dynamicPosition.z = rotatedPosition.y;

  float particleSize = size * pow(1.0 + dynamicPosition.y / maxHeight, uSize);

  vAlpha = 1.0 - (dynamicPosition.y / maxHeight);

  vec4 mvPosition = modelMatrix * vec4(dynamicPosition, 1.0);
  gl_Position = projectionMatrix * viewMatrix * mvPosition;

  vPosition = dynamicPosition;
  gl_PointSize = particleSize * (1.0 / gl_Position.w);
}
