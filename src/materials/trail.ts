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
      },
      glslVersion: THREE.GLSL3,
    });
    return material;
  }

  private createGeometry() {
    const count = 1000;
    const sizes = new Float32Array(count);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = this.defaultUniforms.uObjectPosition.x +
        (Math.random() - 0.5) * this.defaultUniforms.uObjectSize * 2;
  
        positions[i * 3 + 1] = this.defaultUniforms.uObjectPosition.y +
        (Math.random() - 0.5) * this.defaultUniforms.uObjectSize * 2;
  
        positions[i * 3 + 2] = this.defaultUniforms.uObjectPosition.z +
        (Math.random() - 0.5) * this.defaultUniforms.uObjectSize * 2;

      sizes[i] = Math.random() * 1.5 + 1;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geometry;
  }

  updateTime(time: number) {
    this.material.uniforms.uTime.value = time;
    // this.material.uniforms.uObjectPosition.value.copy(objectPosition);
  }

  updateMouse(x: number, y: number) {
    this.material.uniforms.uObjectPosition.value.set(x * 10, y * 10, 0);
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
  }
}
