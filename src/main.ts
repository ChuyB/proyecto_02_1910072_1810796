import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

class App {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private shader;
  private geometry: THREE.PlaneGeometry | THREE.BoxGeometry;
  private mesh: THREE.Mesh;
  private clock: THREE.Clock;
  private controls: OrbitControls;

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

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    if (!this.renderer.capabilities.isWebGL2) {
      console.warn("WebGL 2.0 is not available on this browser.");
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

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
    const selectedGeometry = { position: 0 };
    const selectedMaterial = { position: 0 };
    // folder
    //   .add(selectedMaterial, "position", {
    //     SimpleWave: 0,
    //     BlinnPhong: 1,
    //     CRT: 2,
    //   })
    //   .name("Material")
    //   .onChange(() => {
    //     this.shader = shaders[selectedMaterial.position];
    //     this.mesh.material = this.shader.material;
    //   });
    // folder
    //   .add(selectedGeometry, "position", { Plane: 0, Box: 1 })
    //   .name("Geometry")
    //   .onChange(() => {
    //     this.geometry = geometries[selectedGeometry.position];
    //     this.mesh.geometry = this.geometry;
    //   });

    // Create geometries
    const geometrySize = 4.0;
    const planeGeometry = new THREE.PlaneGeometry(
      geometrySize,
      geometrySize,
      64,
      64,
    );
    const boxGeometry = new THREE.BoxGeometry(
      geometrySize,
      geometrySize,
      geometrySize,
      64,
      64,
      64,
    );
    
    // Create shader materials

    // Arrays of geometries and shaders
    const geometries = [planeGeometry, boxGeometry];
    const shaders = [];

    this.geometry = geometries[selectedGeometry.position];
    this.shader = shaders[selectedMaterial.position];
    this.mesh = new THREE.Mesh(this.geometry, this.shader.material);
    this.scene.add(this.mesh);

    // Initialize
    this.onWindowResize();

    // Bind methods
    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate = this.animate.bind(this);

    // Add event listeners
    window.addEventListener("resize", this.onWindowResize);

    // Start the main loop
    this.renderer.setAnimationLoop(this.animate);
  }

  private animate(): void {
    const elapsedTime = this.clock.getElapsedTime();
    this.shader.updateTime(elapsedTime);
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
