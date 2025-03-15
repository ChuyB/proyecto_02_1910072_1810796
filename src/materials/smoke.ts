import * as THREE from "three";
import GUI from "lil-gui";

import vertexShader from "../shaders/rain/vertex.glsl";
import fragmentShader from "../shaders/rain/fragment.glsl";
import ParticleEmitter from "./particleEmitter";

export class Smoke {
  private camera: THREE.PerspectiveCamera;
  private gui: GUI;
  private defaultUniforms: any;
  material: THREE.RawShaderMaterial;
  emitter: THREE.Object3D;
  geometry: THREE.BufferGeometry;

  constructor(camera: THREE.PerspectiveCamera, gui: GUI) {
    this.camera = camera;

    this.defaultUniforms = {
      uSize: 4.0,
      uTime: 0.0,
      uSpeed: 0.5,
      uMaxHeight: 2.5,
      uRotationSpeed: 1.0,
    };

    this.material = this.createMaterial();
    this.emitter = new THREE.Object3D();
    this.emitter.position.set(0, 0, 0);
    let particleEmitter = new ParticleEmitter(this.emitter, 100);
    this.geometry = particleEmitter.geometry;
    this.gui = gui;
    this.addUIControls();
  }

  private createMaterial() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setPath("src/textures/");

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
        uTexture: { value: textureLoader.load("smoke.png") },
        uTime: { value: this.defaultUniforms.uTime },
        uSize: { value: this.defaultUniforms.uSize },
        uSpeed: { value: this.defaultUniforms.uSpeed },
        uMaxHeight: { value: this.defaultUniforms.uMaxHeight },
        uRotationSpeed: { value: this.defaultUniforms.uRotationSpeed },
      },
      blending: THREE.NormalBlending,
      depthWrite: false,
      transparent: true,
      glslVersion: THREE.GLSL3,
    });
    return material;
  }

  updateTime(time: number) {
    this.material.uniforms.uTime.value = time;
  }

  private addUIControls() {
    const uniforms = this.defaultUniforms;
    const shaderFolder = this.gui.addFolder("Smoke");
    shaderFolder
      .add(uniforms, "uSize", 0.1, 10.0)
      .name("Size")
      .onChange(() => (this.material.uniforms.uSize.value = uniforms.uSize));
    shaderFolder
      .add(uniforms, "uSpeed", 0.05, 3.0)
      .name("Speed")
      .onChange(() => (this.material.uniforms.uSpeed.value = uniforms.uSpeed));
    shaderFolder
      .add(uniforms, "uMaxHeight", 1.0, 10.0)
      .name("Max height")
      .onChange(
        () => (this.material.uniforms.uMaxHeight.value = uniforms.uMaxHeight),
      );
    shaderFolder
      .add(uniforms, "uRotationSpeed", 0.1, 5.0)
      .name("Rotation speed")
      .onChange(
        () =>
          (this.material.uniforms.uRotationSpeed.value =
            uniforms.uRotationSpeed),
      );
  }
}
