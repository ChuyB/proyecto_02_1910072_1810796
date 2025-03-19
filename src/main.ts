import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";
import { Trail } from "./materials/trail";
import { Smoke } from "./materials/smoke";
import { PerlinNoise } from "./materials/perlinNoise";

class App {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private mesh: THREE.Points;
  private shader: Smoke | Trail | PerlinNoise;
  private clock: THREE.Clock;
  private controls: OrbitControls;
  private elapsedTime: number;

  private camConfig = {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
  };

  constructor() {
    // Create scene
    this.scene = new THREE.Scene();

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      this.camConfig.fov,
      this.camConfig.aspect,
      this.camConfig.near,
      this.camConfig.far,
    );
    this.camera.position.set(0, 0, 3);

    // Setup clock
    this.clock = new THREE.Clock();
    this.elapsedTime = this.clock.getElapsedTime();

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    if (!this.renderer.capabilities.isWebGL2) {
      console.warn("WebGL 2.0 is not available on this browser.");
    }
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Creates orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.keyPanSpeed = 30;

    // GUI controls
    const gui = new GUI();
    const folder = gui.addFolder("General Settings");
    const selectedMaterial = { position: 0 };
    folder
      .add(selectedMaterial, "position", {
        Smoke: 0,
        Trail: 1,
        PerlinNoise: 2,
      })
      .name("Particle system")
      .onChange(() => {
        this.scene.remove(this.shader.emitter);
        this.shader = shaders[selectedMaterial.position];
        this.mesh.material = this.shader.material;
        this.mesh.geometry = this.shader.geometry;
        this.scene.add(this.shader.emitter);
      });

    // Arrays of geometries and shaders
    const smoke = new Smoke(this.camera, gui);
    const trail = new Trail(this.camera, gui);
    const perlinNoise = new PerlinNoise(this.camera, gui);
    const shaders = [smoke, trail, perlinNoise];

    this.shader = shaders[selectedMaterial.position];
    this.mesh = new THREE.Points(this.shader.geometry, this.shader.material);
    this.scene.add(this.mesh);
    this.scene.add(this.shader.emitter);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff);
    const sun = new THREE.DirectionalLight(0xffffff, 10);
    sun.position.set(0, 1, 1);
    this.scene.add(ambientLight);
    this.scene.add(sun);

    // Initialize
    this.onWindowResize();

    // Bind methods
    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate = this.animate.bind(this);

    // Add event listeners
    window.addEventListener("resize", this.onWindowResize);
    window.addEventListener("mousemove", (event) => {
      if (this.shader instanceof Trail) {
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        this.shader.updateMouse(mouseX, mouseY);
      }
    });
    window.addEventListener("click", (event) => {
      if (this.shader instanceof PerlinNoise) {
        let mouse = new THREE.Vector2();
        mouse.set(
          (event.clientX / window.innerWidth) * 2 - 1,
          ((window.innerHeight - event.clientY) / window.innerHeight) * 2 - 1,
        );

        this.shader.updateMouse(mouse, this.elapsedTime);
      }
    });

    // Start the main loop
    this.renderer.setAnimationLoop(this.animate);
  }

  private animate(): void {
    this.elapsedTime = this.clock.getElapsedTime();
    this.shader.updateTime(this.elapsedTime);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = this.camConfig.aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.shader.material.uniforms.uResolution.value.set(
      window.innerWidth,
      window.innerHeight,
    );
  }
}

new App();
