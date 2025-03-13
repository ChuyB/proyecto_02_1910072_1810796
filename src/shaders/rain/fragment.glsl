precision mediump float;

uniform float uTime;

out vec4 fragColor;

void main() {
  vec3 color = vec3(0.0, 0.0, 0.8);
  
  fragColor = vec4(color, 1.0);
}
