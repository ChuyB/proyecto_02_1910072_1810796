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
      uSpeed: 10.0,
      uObjectSize: 0.5,
      uObjectPosition: new THREE.Vector3(0, 0, 0),
      uLifetime: 5.0,
      uSpawnRadius: 5.0,
      uLastSpawnTime: 0.0,
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
        uObjectSize: { value: this.defaultUniforms.uObjectSize },
        uObjectPosition: { value: this.defaultUniforms.uObjectPosition },
        uLifetime: { value: this.defaultUniforms.uLifetime },
        uSpawnRadius: { value: this.defaultUniforms.uSpawnRadius },
        uLastSpawnTime: { value: this.defaultUniforms.uLastSpawnTime },
      },
      glslVersion: THREE.GLSL3,
      transparent: true, // Enable transparency
      blending: THREE.NormalBlending, // Enable alpha blending
      depthWrite: false, 
    });
    return material;
  }

  private createGeometry() {
    const count = 1000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        positions[i * 3] = this.defaultUniforms.uObjectPosition.x +
        (Math.random() - 0.5) * this.defaultUniforms.uSpawnRadius * 2;
  
        positions[i * 3 + 1] = this.defaultUniforms.uObjectPosition.y +
        (Math.random() - 0.5) * this.defaultUniforms.uSpawnRadius* 2;
  
        positions[i * 3 + 2] = this.defaultUniforms.uObjectPosition.z + 
        (Math.random() - 0.5) * this.defaultUniforms.uSpawnRadius * 2;

    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    return geometry;
  }

  updateTime(time: number) {
    this.material.uniforms.uTime.value = time;
    const age = time - this.material.uniforms.uLastSpawnTime.value;
    // this.material.uniforms.uObjectPosition.value.copy(objectPosition);

    // Needed to reset the particles at spawn
    //const positions = this.geometry.attributes.position.array;
    //const count = positions.length/3;

    if (age > this.defaultUniforms.uLifetime) {
/*
        for (let i = 0; i < count; i++) {
    
          // Reset particle position
          positions[i * 3] =
            this.defaultUniforms.uObjectPosition.x +
            (Math.random() - 0.5) * this.defaultUniforms.uSpawnRadius * 2;
    
          positions[i * 3 + 1] =
            this.defaultUniforms.uObjectPosition.y +
            (Math.random() - 0.5) * this.defaultUniforms.uSpawnRadius * 2;
    
          positions[i * 3 + 2] =
            this.defaultUniforms.uObjectPosition.z +
            (Math.random() - 0.5) * this.defaultUniforms.uSpawnRadius * 2;
            
        }      
*/
        this.material.uniforms.uLastSpawnTime.value = time;
      }
      // Mark attributes as needing an update
      //this.geometry.attributes.position.needsUpdate = true;

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
      .add(uniforms, "uSize", 0.1, 10.0)
      .name("Size")
      .onChange(() => (this.material.uniforms.uSize.value = uniforms.uSize));
    shaderFolder
      .add(uniforms, "uSpeed", 0.1, 50.0)
      .name("Speed")
      .onChange(() => (this.material.uniforms.uSpeed.value = uniforms.uSpeed));
    shaderFolder
        .add(uniforms, "uLifetime", 0.1, 50.0)
        .name("Life time")
        .onChange(() => (this.material.uniforms.uLifetime.value = uniforms.uLifetime));
    shaderFolder
        .add(uniforms, "uSpawnRadius", 0.1, 50.0)
        .name("Spawn radius")
        .onChange(() => {
            console.log("uSpawnRadius", uniforms.uSpawnRadius);
            this.material.uniforms.uSpawnRadius.value = uniforms.uSpawnRadius
        });
  }
}
