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
      uPosition: { x: 0, y: 0, z: 0 },
      uClickTime: 0.0,
      uWaveSpread: 10.0,
      uWaveSpeed: 10.0,
      uWaveDissipation: 4.0,
      uWaveForce: 0.2,
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
        uPosition: { value: this.defaultUniforms.uPosition },
        uClickTime: { value: this.defaultUniforms.uClickTime },
        uWaveSpread: { value: this.defaultUniforms.uWaveSpread },
        uWaveSpeed: { value: this.defaultUniforms.uWaveSpeed },
        uWaveDissipation: { value: this.defaultUniforms.uWaveDissipation },
        uWaveForce: { value: this.defaultUniforms.uWaveForce },
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

  updateMouse(mouse: THREE.Vector2, time: number) {
    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(mouse, this.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    rayCaster.ray.intersectPlane(plane, intersection);

    this.material.uniforms.uPosition.value = intersection;
    this.material.uniforms.uClickTime.value = time;
  }

  private addUIControls() {
    const uniforms = this.defaultUniforms;
    const shaderFolder = this.gui.addFolder("Perlin Noise");
    shaderFolder
      .addColor(uniforms, "uColor")
      .name("Color")
      .onChange(() => {
        this.material.uniforms.uColor.value = this.defaultUniforms.uColor;
      });
    shaderFolder
      .add(uniforms, "uSpeed", 0.0, 2.0)
      .name("Color Speed")
      .onChange(() => (this.material.uniforms.uSpeed.value = uniforms.uSpeed));
    shaderFolder
      .add(uniforms, "uWaveSpeed", 1.0, 20.0)
      .name("Wave Speed")
      .onChange(() => (this.material.uniforms.uWaveSpeed.value = uniforms.uWaveSpeed));
    shaderFolder
      .add(uniforms, "uWaveSpread", 1.0, 20.0)
      .name("Wave Spread")
      .onChange(() => (this.material.uniforms.uWaveSpread.value = uniforms.uWaveSpread));
    shaderFolder
      .add(uniforms, "uWaveDissipation", 0.0, 10.0)
      .name("Wave Dissipation")
      .onChange(() => (this.material.uniforms.uWaveDissipation.value = uniforms.uWaveDissipation));
    shaderFolder
      .add(uniforms, "uWaveForce", 0.0, 2.0)
      .name("Wave Force")
      .onChange(() => (this.material.uniforms.uWaveForce.value = uniforms.uWaveForce));
    shaderFolder
      .add(uniforms, "uOctaves", 1, 10, 1)
      .name("Octaves")
      .onChange(
        () => (this.material.uniforms.uOctaves.value = uniforms.uOctaves),
      );
  }
}
