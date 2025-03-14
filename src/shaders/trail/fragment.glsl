precision mediump float;

uniform float uTime;
uniform float uSpeed;
uniform float lifetime;

out vec4 fragColor;

void main() {
  vec3 color = vec3(0.0, 0.0, 0.8);

  float age = mod(uTime, lifetime);

  float alpha = 1.0 - (age/lifetime);
  fragColor = vec4(color, alpha);
}
