precision mediump float;

in float vAge;
in float vStartTime;

uniform float uTime;
uniform float uLifetime;
uniform float uLastSpawnTime;
uniform vec3 uColor;

out vec4 fragColor;

void main() {
    
    float alpha = 1.0 - (vAge / uLifetime); 
    if (uTime < vStartTime){ // Hide particles that are not falling yet
        alpha = 0.0;
    } else {
        alpha = clamp(alpha, 0.0, 1.0); // Fade out as age approaches lifetime
    }

    fragColor = vec4(uColor, alpha);
}
