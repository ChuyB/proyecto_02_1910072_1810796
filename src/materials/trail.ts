import * as THREE from "three";
import GUI from "lil-gui";

import vertexShader from "../shaders/trail/vertex.glsl";
import fragmentShader from "../shaders/trail/fragment.glsl";

export class Trail {
  private camera: THREE.PerspectiveCamera;
  private gui: GUI;
  private defaultUniforms: any;
  material: THREE.RawShaderMaterial;
  geometry: THREE.BufferGeometry;

  constructor(camera: THREE.PerspectiveCamera, gui: GUI) {
    this.camera = camera;

    this.defaultUniforms = {
      uSize: 2.0,
      uTime: 0.0,
      uSpeed: 2.0,
      uParticleSize: 0.5,
      uObjectPosition: new THREE.Vector3(0, 0, 0),
      uLifetime: 0.2,
      uSpawnRadius: 0.01,
      uLastSpawnTime: 0.0,
      uLastSpawnObjectPosition: new THREE.Vector3(0, 0, 0),
    };

    this.material = this.createMaterial();
    this.geometry = this.createGeometry();
    this.gui = gui;
    this.addUIControls();
  }

  private createMaterial() {
    let material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        projectionMatrix: { value: this.camera.projectionMatrix },
        viewMatrix: { value: this.camera.matrixWorldInverse },
        modelMatrix: { value: new THREE.Matrix4() },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTime: { value: this.defaultUniforms.uTime },
        uSize: { value: this.defaultUniforms.uSize },
        uSpeed: { value: this.defaultUniforms.uSpeed },
        uParticleSize: { value: this.defaultUniforms.uObjectSize },
        uObjectPosition: { value: this.defaultUniforms.uObjectPosition },
        uLifetime: { value: this.defaultUniforms.uLifetime },
        uSpawnRadius: { value: this.defaultUniforms.uSpawnRadius },
        uLastSpawnTime: { value: this.defaultUniforms.uLastSpawnTime },
        uLastSpawnObjectPosition: { value: this.defaultUniforms.uLastSpawnObjectPosition },
      },
      glslVersion: THREE.GLSL3,
      transparent: true, // Enable transparency
      blending: THREE.NormalBlending, // Enable alpha blending
      depthWrite: false, 
    });
    return material;
  }

  private createGeometry() {
    const count = 100000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const startTimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const r = Math.random() * this.defaultUniforms.uSpawnRadius; // Random radius
        const theta = Math.random() * Math.PI * 2; // Random angle in XY plane
        const phi = Math.acos(2 * Math.random() - 1); // Random angle from Z-axis

        positions[i * 3] = this.defaultUniforms.uObjectPosition.x + r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = this.defaultUniforms.uObjectPosition.y + r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = this.defaultUniforms.uObjectPosition.z + r * Math.cos(phi);
        
        sizes[i] = Math.random() * 1.5 + 1;
        startTimes[i] = Math.random() * this.defaultUniforms.uLifetime;

    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("startTime", new THREE.BufferAttribute(startTimes, 1));

    return geometry;
  }

  updateTime(time: number) {
    this.material.uniforms.uTime.value = time;
    
    const systemAge = time - this.material.uniforms.uLastSpawnTime.value;
    const startTimes = this.geometry.attributes.startTime.array;
    const count = this.geometry.attributes.startTime.count;

    for (let i = 0; i < count; i++) {
      if (time - startTimes[i] > this.defaultUniforms.uLifetime) {
        startTimes[i] = time + Math.random() * this.material.uniforms.uLifetime.value;
      }
    }
    this.geometry.attributes.startTime.needsUpdate = true;
    
    if (systemAge > this.defaultUniforms.uLifetime) {

      this.material.uniforms.uLastSpawnTime.value = time;
      this.material.uniforms.uLastSpawnObjectPosition.value = this.material.uniforms.uObjectPosition.value.clone();
    }

  }

  updateMouse(x: number, y: number) { 
    // Scale the mouse coordinates based on the window dimensions

    const raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(new THREE.Vector2(x, y) , this.camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Plane at z = 0
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);

    this.material.uniforms.uObjectPosition.value.copy(intersection);
  }

  private addUIControls() {
    const uniforms = this.defaultUniforms;
    const shaderFolder = this.gui.addFolder("Trail");
    shaderFolder
      .add(uniforms, "uParticleSize", 0.1, 10.0)
      .name("Particle size")
      .onChange(() => (this.material.uniforms.uParticleSize.value = uniforms.uParticleSize));
    shaderFolder
      .add(uniforms, "uSpeed", 0.1, 50.0)
      .name("Speed")
      .onChange(() => (this.material.uniforms.uSpeed.value = uniforms.uSpeed));
    shaderFolder
        .add(uniforms, "uLifetime", 0.1, 50.0)
        .name("Life time")
        .onChange(() => (this.material.uniforms.uLifetime.value = uniforms.uLifetime));
    shaderFolder
        .add(uniforms, "uSpawnRadius", 0.01, 50.0)
        .name("Spawn radius")
        .onChange(() => (
            this.material.uniforms.uSpawnRadius.value = uniforms.uSpawnRadius
        ));
  }
}
