import * as THREE from "three";
export default class ParticleEmitter {
  object: THREE.Object3D;
  maxParticles: number;
  geometry: THREE.BufferGeometry;
  private positions: Float32Array;
  private sizes: Float32Array;
  private velocities: Float32Array;
  private lifeSpans: Float32Array;
  private angle: Float32Array;

  constructor(
    object: THREE.Object3D,
    maxParticles: number,
  ) {
    this.object = object;
    this.maxParticles = maxParticles;

    this.positions = new Float32Array(maxParticles * 3);
    this.sizes = new Float32Array(maxParticles);
    this.velocities = new Float32Array(maxParticles * 3);
    this.lifeSpans = new Float32Array(maxParticles);
    this.angle = new Float32Array(maxParticles);

    this.geometry = new THREE.BufferGeometry();
    this.createParticles();
  }

  private createParticles() {
    const geometry = new THREE.BufferGeometry();
    for (let i = 0; i < this.maxParticles; i++) {
      this.setParticleValues(i);
    }
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3),
    );
    geometry.setAttribute("size", new THREE.BufferAttribute(this.sizes, 1));
    geometry.setAttribute(
      "velocity",
      new THREE.BufferAttribute(this.velocities, 3),
    );
    geometry.setAttribute(
      "lifeSpan",
      new THREE.BufferAttribute(this.lifeSpans, 1),
    );
    geometry.setAttribute("angle", new THREE.BufferAttribute(this.angle, 1));

    this.geometry = geometry;
  }

  private setParticleValues(index: number) {
    // Set the initial position of the particle at a radius

    let radius = 0.1;
    let angle = Math.random() * Math.PI * 2;
    let distance = Math.random() * radius;

    let x = Math.cos(angle) * distance;
    let z = Math.sin(angle) * distance;
    let y = Math.random() * 5;

    // Set particle position in the positions array
    this.positions[index * 3] = this.object.position.x + x;
    this.positions[index * 3 + 1] = this.object.position.y + y;
    this.positions[index * 3 + 2] = this.object.position.z + z;

    // Random velocity
    this.velocities[index * 3] = (Math.random() - 0.5) * 2;
    this.velocities[index * 3 + 1] = Math.random();
    this.velocities[index * 3 + 2] = (Math.random() - 0.5) * 2;

    this.sizes[index] = 100;

    // Random lifespan and rotation
    this.lifeSpans[index] = Math.random() + 1;
    this.angle[index] = (Math.random() - 0.5) * 2;
  }
}
