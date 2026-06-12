import * as THREE from 'three';
import { Engine } from './engine/Engine';
import { InputManager } from './engine/InputManager';
import { CameraManager } from './engine/CameraManager';
import { GameScene } from './scene/GameScene';
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
  private stereoRenderer: StereoRenderer | null = null;
  private backgroundMusic: HTMLAudioElement | null = null;
  private musicStarted: boolean = false;
  private unlockAudioHandler = () => this.startBackgroundMusic();
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

    // UI Setup
    this.setupUI();

    // Hintergrundmusik vorbereiten
    this.setupBackgroundMusic();

    // Prometheus-Modell laden
    this.loadPrometheusShip();

    // Game Loop starten
    this.start();
  }

  /**
   * Lädt das Prometheus-Raumschiff-Modell
   */
  private async loadPrometheusShip(): Promise<void> {
    try {
      const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
      const { MTLLoader } = await import('three/examples/jsm/loaders/MTLLoader.js');
      const modelPath = '/SpaceFleetInfinity/models/Prometheus%20NX%2059650/';
      const materialLoader = new MTLLoader();
      const loader = new OBJLoader();

      materialLoader.setPath(modelPath);
      materialLoader.setResourcePath(modelPath);

      const materials = await materialLoader.loadAsync('prometheus.mtl');
      materials.preload();
      loader.setMaterials(materials);

      loader.load(
        `${modelPath}prometheus.obj`,
        (obj: THREE.Group) => {
          // Material anpassen für Wireframe-Look
          obj.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material) => {
                  material.side = THREE.DoubleSide;
                  material.needsUpdate = true;
                });
              } else {
                child.material.side = THREE.DoubleSide;
                child.material.needsUpdate = true;
              }
            }
          });

          // Modell skalieren und in Szene hinzufügen
          obj.scale.set(1.5, 1.5, 1.5);
          this.gameScene.setCustomShip(obj);
          console.log('Prometheus-Modell erfolgreich geladen');
        },
        undefined,
        (error: ErrorEvent) => {
          console.warn('Prometheus-Modell konnte nicht geladen werden:', error);
          console.log('Kein Ersatz-Raumschiff geladen');
        }
      );
    } catch (error) {
      console.warn('OBJLoader Import fehlgeschlagen:', error);
    }
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
      'Space/RT: Schub | Shift/LT: Bremse | W/S/Pfeile/Stick: Pitch | A/D: Yaw | Q/E/LB/RB: Roll | V/Y/Start: 3D';
    ui.appendChild(controls);

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
  }

  /**
   * Schaltet VR Modus um
   */
  private setupBackgroundMusic(): void {
    this.backgroundMusic = new Audio('/SpaceFleetInfinity/audio/hazy-eternal-space.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.45;
    this.backgroundMusic.preload = 'auto';

    this.startBackgroundMusic();

    window.addEventListener('pointerdown', this.unlockAudioHandler);
    window.addEventListener('keydown', this.unlockAudioHandler);
    window.addEventListener('touchstart', this.unlockAudioHandler);
  }

  private startBackgroundMusic(): void {
    if (!this.backgroundMusic || this.musicStarted) return;

    this.backgroundMusic
      .play()
      .then(() => {
        this.musicStarted = true;
      })
      .catch(() => {
        // Browser starten Audio oft erst nach einer User-Interaktion.
      });
  }

  private toggleVR(): void {
    if (this.useVR) {
      this.useVR = false;

      // Zurück zu normalem Rendering
      this.stereoRenderer = null;
    } else {
      this.useVR = true;

      // Stereo Rendering aktivieren
      this.stereoRenderer = new StereoRenderer(
        this.engine.getRenderer(),
        this.engine.getScene(),
        this.cameraManager.getLeftEyeCamera(),
        this.cameraManager.getRightEyeCamera()
      );
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
    if (this.inputManager.consumeSplitScreenToggle()) {
      this.toggleVR();
    }

    // Input lesen
    const rotation = this.inputManager.getRotationInput();
    const flight = this.inputManager.getFlightInput();

    // Szene aktualisieren
    this.gameScene.update(deltaTime, rotation, flight);

    // Kameras aktualisieren
    this.cameraManager.updateFollow(
      this.gameScene.getShipObject(),
      this.gameScene.getVelocity(),
      deltaTime
    );

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
    window.removeEventListener('pointerdown', this.unlockAudioHandler);
    window.removeEventListener('keydown', this.unlockAudioHandler);
    window.removeEventListener('touchstart', this.unlockAudioHandler);

    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.src = '';
      this.backgroundMusic = null;
    }

    this.inputManager.dispose();
    this.gameScene.dispose();
    this.engine.dispose();
  }
}
