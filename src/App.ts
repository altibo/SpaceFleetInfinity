import { Engine } from './engine/Engine';
import { InputManager } from './engine/InputManager';
import { CameraManager } from './engine/CameraManager';
import { GameScene } from './scene/GameScene';
import { WebXRManager } from './vr/WebXRManager';
import { StereoRenderer } from './vr/StereoRenderer';
import './styles/style.css';

/**
 * Hauptklasse der WireVerse Applikation
 */
export class App {
  private engine: Engine;
  private inputManager: InputManager;
  private cameraManager: CameraManager;
  private gameScene: GameScene;
  private webXRManager: WebXRManager;
  private stereoRenderer: StereoRenderer | null = null;
  private useVR: boolean = false;

  constructor() {
    // Engine initialisieren
    this.engine = new Engine();

    // Input Manager
    this.inputManager = new InputManager();

    // Camera Manager für Stereo
    this.cameraManager = new CameraManager(this.engine.getCamera());

    // GameScene
    this.gameScene = new GameScene(this.engine.getScene());

    // WebXR Manager
    this.webXRManager = new WebXRManager();

    // UI Setup
    this.setupUI();

    // Game Loop starten
    this.start();
  }

  /**
   * Setzt die UI auf
   */
  private setupUI(): void {
    const app = document.getElementById('app');
    if (!app) return;

    // UI Container
    const ui = document.createElement('div');
    ui.id = 'ui';
    app.appendChild(ui);

    // Stats Display
    const stats = document.createElement('div');
    stats.id = 'stats';
    ui.appendChild(stats);

    // Controls Info
    const controls = document.createElement('div');
    controls.id = 'controls';
    controls.textContent =
      'W/S: Pitch | A/D: Yaw | Q/E: Roll | V: VR Mode';
    ui.appendChild(controls);

    // VR Button (immer anzeigen - auch für Split-Screen Fallback)
    const vrButton = document.createElement('button');
    vrButton.id = 'vrButton';
    vrButton.textContent = this.webXRManager.isXRAvailable() ? 'Enter VR' : 'Splitscreen VR';
    vrButton.onclick = () => this.toggleVR(vrButton);
    ui.appendChild(vrButton);

    // FPS Update Loop
    let lastUpdate = 0;
    const updateStats = () => {
      const now = performance.now();
      if (now - lastUpdate > 500) {
        stats.textContent = `FPS: ${this.engine.getFPS()}`;
        lastUpdate = now;
      }
      requestAnimationFrame(updateStats);
    };
    updateStats();

    // V Taste für VR Toggle
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'v') {
        const vrBtn = document.getElementById('vrButton') as HTMLButtonElement;
        if (vrBtn) {
          this.toggleVR(vrBtn);
        }
      }
    });
  }

  /**
   * Schaltet VR Modus um
   */
  private async toggleVR(button: HTMLButtonElement): Promise<void> {
    if (this.useVR) {
      if (this.webXRManager.isSessionActive()) {
        await this.webXRManager.endSession();
      }
      this.useVR = false;
      button.textContent = this.webXRManager.isXRAvailable() ? 'Enter VR' : 'Splitscreen VR';

      // Zurück zu normalem Rendering
      this.stereoRenderer = null;
    } else {
      // Versuche WebXR zu starten
      let session: XRSession | null = null;
      if (this.webXRManager.isXRAvailable()) {
        session = await this.webXRManager.startSession();
      }

      if (session || !this.webXRManager.isXRAvailable()) {
        this.useVR = true;
        button.textContent = 'Exit VR';

        // Stereo Rendering aktivieren (WebXR oder Split-Screen)
        this.stereoRenderer = new StereoRenderer(
          this.engine.getRenderer(),
          this.engine.getScene(),
          this.cameraManager.getLeftEyeCamera(),
          this.cameraManager.getRightEyeCamera()
        );
      }
    }
  }

  /**
   * Startet die Game Loop
   */
  private start(): void {
    this.engine.start((deltaTime: number) => this.update(deltaTime));
  }

  /**
   * Update Callback für die Game Loop
   */
  private update(deltaTime: number): void {
    // Input lesen
    const rotation = this.inputManager.getRotationInput();

    // Szene aktualisieren
    this.gameScene.update(deltaTime, rotation);

    // Kameras aktualisieren
    this.cameraManager.updateStereo();

    // Rendern
    if (this.stereoRenderer) {
      this.stereoRenderer.render();
    } else {
      this.engine.getRenderer().render(
        this.engine.getScene(),
        this.engine.getCamera()
      );
    }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.inputManager.dispose();
    this.gameScene.dispose();
    this.engine.dispose();
  }
}
