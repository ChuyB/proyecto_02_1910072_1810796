import * as THREE from "three";
import GUI from "lil-gui";

import vertexShader from "../shaders/perlinNoise/vertex.glsl";
import fragmentShader from "../shaders/perlinNoise/fragment.glsl";

export class PerlinNoise {
  private camera: THREE.PerspectiveCamera;
  private gui: GUI;
  private defaultUniforms: any;
  material: THREE.RawShaderMaterial;
  emitter: THREE.Object3D;
  geometry: THREE.BufferGeometry;

  constructor(camera: THREE.PerspectiveCamera, gui: GUI) {
    this.camera = camera;

    this.defaultUniforms = {
      uSize: 3.0,
      uTime: 0.0,
      uSpeed: 0.5,
      uMaxHeight: 2.5,
      uRotationSpeed: 1.0,
      uColor: { r: 0.4, g: 0.87, b: 0.68 },
      uAlpha: 1.0,
      uOctaves: 2,
    };

    this.emitter = new THREE.Object3D();

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
        uColor: {
          value: new THREE.Vector3(
            this.defaultUniforms.uColor.r,
            this.defaultUniforms.uColor.g,
            this.defaultUniforms.uColor.b,
          ),
        },
        uAlpha: { value: this.defaultUniforms.uAlpha },
        uOctaves: { value: this.defaultUniforms.uOctaves },
      },
      glslVersion: THREE.GLSL3,
    });
    return material;
  }

  private createGeometry(numberOfParticles = 5000) {
    const geometry = new THREE.BufferGeometry();
    let position = new Float32Array(3 * numberOfParticles);
    for (let i = 0; i < numberOfParticles; i++) {
      position[i * 3] = (Math.random() - 0.5) * this.defaultUniforms.uSize;
      position[i * 3 + 1] = (Math.random() - 0.5) * this.defaultUniforms.uSize;
      position[i * 3 + 2] = 0;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));

    return geometry;
  }

  updateTime(time: number) {
    this.material.uniforms.uTime.value = time;
  }

  private addUIControls() {
    const uniforms = this.defaultUniforms;
    const shaderFolder = this.gui.addFolder("Perlin Noise Trails");
    shaderFolder
      .add(uniforms, "uSpeed", 0.05, 3.0)
      .name("Speed")
      .onChange(() => (this.material.uniforms.uSpeed.value = uniforms.uSpeed));
    shaderFolder
      .addColor(uniforms, "uColor")
      .name("Color")
      .onChange(() => {
        this.material.uniforms.uColor.value = this.defaultUniforms.uColor;
      });
    shaderFolder
      .add(uniforms, "uOctaves", 1, 10, 1)
      .name("Octaves")
      .onChange(() => (this.material.uniforms.uOctaves.value = uniforms.uOctaves));
  }
}
