precision mediump float;

in vec4 vPosition;
in float vAge;

uniform float uTime;
uniform float uSpeed;
uniform float uLifetime;
uniform float uLastSpawnTime;

out vec4 fragColor;

void main() {
    
    float alpha = 1.0 - (vAge / uLifetime); // Fade out as age approaches lifetime
    alpha = clamp(alpha, 0.0, 1.0); // Ensure alpha is between 0 and 1

    vec3 color = vec3(0.0, 0.5, 0.7); // Water-like color
    fragColor = vec4(color, alpha);
}
