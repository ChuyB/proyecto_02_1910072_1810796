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
  emitter = new THREE.Object3D();

  constructor(camera: THREE.PerspectiveCamera, gui: GUI) {
    this.camera = camera;

    this.defaultUniforms = {
      uSize: 2.0,
      uTime: 0.0,
      uInitialSpeed: new THREE.Vector2(0.0, -0.5),
      uInitialForce: new THREE.Vector2(0.0, 8.0),
      uForceApplicationTime: 0.2,
      uPostCorrection: 0.0,
      uParticleSize: 0.5,
      uObjectPosition: new THREE.Vector3(0, 0, 0),
      uLifetime: 1.0,
      uSpawnRadius: 0.25,
      uLastSpawnTime: 0.0,
      uColor: { r: 0.0, g: 0.5, b: 0.7 },
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
        uInitialSpeed: { value: this.defaultUniforms.uInitialSpeed },
        uInitialForce: { value: this.defaultUniforms.uInitialForce},
        uForceApplicationTime: { value: this.defaultUniforms.uForceApplicationTime},
        uParticleSize: { value: this.defaultUniforms.uObjectSize },
        uObjectPosition: { value: this.defaultUniforms.uObjectPosition },
        uLifetime: { value: this.defaultUniforms.uLifetime },
        uSpawnRadius: { value: this.defaultUniforms.uSpawnRadius },
        uLastSpawnTime: { value: this.defaultUniforms.uLastSpawnTime },
        uLastSpawnObjectPosition: { value: this.defaultUniforms.uLastSpawnObjectPosition },
        uPostCorrection: { value: this.defaultUniforms.uPostCorrection},
        uColor: {
                  value: new THREE.Vector3(
                    this.defaultUniforms.uColor.r,
                    this.defaultUniforms.uColor.g,
                    this.defaultUniforms.uColor.b,
                  ),
                },
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
    const spawnPositions = new Float32Array(count * 3);
    const prevSpawnPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {

      // Spawns particle in spherical shape
        const r = Math.random() * this.defaultUniforms.uSpawnRadius; // Random radius
        const theta = Math.random() * Math.PI * 2; // Random angle in XY plane
        const phi = Math.acos(2 * Math.random() - 1); // Random angle from Z-axis

        positions[i * 3] = this.defaultUniforms.uObjectPosition.x + r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = this.defaultUniforms.uObjectPosition.y + r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = this.defaultUniforms.uObjectPosition.z + r * Math.cos(phi);
        
        sizes[i] = Math.random() * 1.5 + 1;
        startTimes[i] = Math.random() * this.defaultUniforms.uLifetime;

        // Initialize spawn positions to the current object position
        spawnPositions[i * 3] = positions[i * 3]
        spawnPositions[i * 3 + 1] = positions[i * 3 + 1];
        spawnPositions[i * 3 + 2] = positions[i * 3 + 2];

        prevSpawnPositions[i * 3] = positions[i * 3];
        prevSpawnPositions[i * 3 + 1] = positions[i * 3 + 1];
        prevSpawnPositions[i * 3 + 2] = positions[i * 3 + 2];

    }
    const geometry = new THREE.BufferGeometry();
    // Attributes
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("startTime", new THREE.BufferAttribute(startTimes, 1));
    geometry.setAttribute("spawnPosition", new THREE.BufferAttribute(spawnPositions, 3));
    geometry.setAttribute("prevSpawnPosition", new THREE.BufferAttribute(prevSpawnPositions, 3));

    return geometry;
  }

  updateTime(time: number) {
    this.material.uniforms.uTime.value = time;
    
    const startTimes = this.geometry.attributes.startTime.array;
    const spawnPositions = this.geometry.attributes.spawnPosition.array as Float32Array;
    const count = this.geometry.attributes.startTime.count;
    
    for (let i = 0; i < count; i++) {
      if (time - startTimes[i] > this.defaultUniforms.uLifetime) {
        // Sets random startTimes for particle distribution
        startTimes[i] = time + Math.random() * this.material.uniforms.uLifetime.value;
        
        // Update spawn position to the current object position
        spawnPositions[i * 3] = this.defaultUniforms.uObjectPosition.x;
        spawnPositions[i * 3 + 1] = this.defaultUniforms.uObjectPosition.y;
        spawnPositions[i * 3 + 2] = this.defaultUniforms.uObjectPosition.z;
        
      }
    }
    
    this.geometry.attributes.startTime.needsUpdate = true;
    this.geometry.attributes.spawnPosition.needsUpdate = true;
    
    const systemAge = time - this.material.uniforms.uLastSpawnTime.value;
    if (systemAge > this.defaultUniforms.uLifetime) {
      this.material.uniforms.uLastSpawnTime.value = time;
    }

  }

  updateMouse(x: number, y: number) { 

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
      .add(uniforms, "uParticleSize", 0.01, 5.0)
      .name("Particle size")
      .onChange(() => (this.material.uniforms.uParticleSize.value = uniforms.uParticleSize));
    shaderFolder
      .add(uniforms, "uSpawnRadius", 0.001, 2.0) // Adjust the range as needed
      .name("Spawn Radius")
      .onChange(() => (this.material.uniforms.uSpawnRadius.value = uniforms.uSpawnRadius));
    shaderFolder
      .add(uniforms, "uLifetime", 0.1, 20.0)
      .name("Life time")
      .onChange(() => {
        this.material.uniforms.uLifetime.value = uniforms.uLifetime;

        // Ensure uForceApplicationTime is not greater than uLifetime
        if (uniforms.uForceApplicationTime > uniforms.uLifetime) {
            uniforms.uForceApplicationTime = uniforms.uLifetime;
            this.material.uniforms.uForceApplicationTime.value = uniforms.uLifetime;
            physicsFolder.controllers.forEach((controller) => {
                if (controller.property === "uForceApplicationTime") {
                    controller.updateDisplay(); // Update the GUI slider
                }
            });
        }
    });
    shaderFolder
      .addColor(uniforms, "uColor")
      .name("Color")
      .onChange(() => {
        this.material.uniforms.uColor.value = this.defaultUniforms.uColor;
      });

      const physicsFolder = shaderFolder.addFolder("Physics");
        physicsFolder
          .add(uniforms.uInitialSpeed, "x", -25.0, 25.0)
          .name("Initial speed X")
          .onChange(() => (this.material.uniforms.uInitialSpeed.value.x = uniforms.uInitialSpeed.x));
        physicsFolder
          .add(uniforms.uInitialSpeed, "y", -25.0, 25.0)
          .name("Initial speed Y")
          .onChange(() => (this.material.uniforms.uInitialSpeed.value.y = uniforms.uInitialSpeed.y));
        physicsFolder
          .add(uniforms.uInitialForce, "x", -25.0, 25.0)
          .name("Initial force X")
          .onChange(() => (this.material.uniforms.uInitialForce.value.x = uniforms.uInitialForce.x));
        physicsFolder
          .add(uniforms.uInitialForce, "y", -25.0, 25.0)
          .name("Initial force Y")
          .onChange(() => (this.material.uniforms.uInitialForce.value.y = uniforms.uInitialForce.y));
        physicsFolder
          .add(uniforms,"uForceApplicationTime", 0.1, 20.0)
          .name("Force Application Time")
          .onChange(() => {
            // Ensure uForceApplicationTime is not greater than uLifetime
            if (uniforms.uForceApplicationTime > uniforms.uLifetime) {
                uniforms.uForceApplicationTime = uniforms.uLifetime;
                this.material.uniforms.uForceApplicationTime.value = uniforms.uLifetime;
                physicsFolder.controllers.forEach((controller) => {
                    if (controller.property === "uForceApplicationTime") {
                        controller.updateDisplay(); // Update the GUI slider
                    }
                });
            } else {
                this.material.uniforms.uForceApplicationTime.value = uniforms.uForceApplicationTime;
            }
          });
        physicsFolder
          .add(uniforms, "uPostCorrection", -5.0, 5.0)
          .name("Post-Force Correction")
          .onChange(() => (this.material.uniforms.uPostCorrection.value = uniforms.uPostCorrection));  
  }
}
