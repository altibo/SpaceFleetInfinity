import * as THREE from 'three';

/**
 * Hauptgame-Engine für WireVerse
 * Verwaltet den Renderer, die Szene und den Update-Loop
 */
export class Engine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private running: boolean = false;
  private lastTime: number = 0;
  private fps: number = 0;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;

  /**
   * Initialisiert die Engine mit Renderer, Szene und Kamera
   */
  constructor() {
    const container = document.getElementById('app');
    if (!container) {
      throw new Error('Container mit ID "app" nicht gefunden');
    }

    // WebGL Renderer mit Antialiasing
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000);
    this.renderer.setScissorTest(false);
    container.appendChild(this.renderer.domElement);

    // Szene mit schwarzem Hintergrund
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.Fog(0x000000, 100, 1000);
    this.setupLighting();

    // Perspektivische Kamera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    // Event Listener
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.45);
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    const fillLight = new THREE.DirectionalLight(0x7fb8ff, 0.9);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);

    keyLight.position.set(8, 10, 6);
    fillLight.position.set(-10, 3, -8);
    rimLight.position.set(0, -6, -10);

    this.scene.add(ambientLight, keyLight, fillLight, rimLight);
  }

  /**
   * Gibt Zugriff auf die Szene
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Gibt Zugriff auf die Kamera
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Gibt Zugriff auf den Renderer
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * Gibt die aktuelle FPS zurück
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Startet die Game Loop
   * @param updateCallback Callback für Update-Logik
   */
  start(updateCallback: (deltaTime: number) => void): void {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    this.lastFpsUpdate = this.lastTime;

    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      // FPS berechnen
      this.frameCount++;
      if (currentTime - this.lastFpsUpdate >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFpsUpdate = currentTime;
      }

      // Update callback owns rendering so callers can switch render modes.
      updateCallback(deltaTime);

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
  }

  /**
   * Behandelt Fenstergrößenänderung
   */
  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.running = false;
    this.renderer.dispose();
  }
}
