precision mediump float;

uniform float uTime;

out vec4 fragColor;

void main() {
  vec3 color = vec3(0.0, 0.0, 0.8);
  float alpha = 1.0 - mod(uTime * uSpeed, 1.0);
  fragColor = vec4(color, alpha);
}
