precision mediump float;

uniform sampler2D uTexture;
 
in float vAlpha;
in vec3 vPosition;

out vec4 fragColor;

void main() {
  vec4 texColor = texture(uTexture, gl_PointCoord);
  fragColor = vec4(texColor.rgb, texColor.a * vAlpha);
}
