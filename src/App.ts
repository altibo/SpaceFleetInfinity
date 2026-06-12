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
  private useVR: boolean = false;

  constructor() {
    // Engine initialisieren
    this.engine = new Engine();

    // Input Manager
    this.inputManager = new InputManager(this.engine.getRenderer().domElement);

    // Camera Manager für Stereo
    this.cameraManager = new CameraManager(this.engine.getCamera());

    // GameScene
    this.gameScene = new GameScene(this.engine.getScene());

    // UI Setup
    this.setupUI();

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
      const loader = new OBJLoader();

      loader.load(
        '/SpaceFleetInfinity/models/prometheus.obj',
        (obj: THREE.Group) => {
          // Material anpassen für Wireframe-Look
          obj.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
              // Schwarze Oberflächen
              const blackMat = new THREE.MeshBasicMaterial({
                color: 0x000000,
                side: THREE.FrontSide,
              });
              child.material = blackMat;

              // Weiße Kanten hinzufügen
              const edges = new THREE.EdgesGeometry(child.geometry as THREE.BufferGeometry);
              const whiteLine = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 })
              );
              child.add(whiteLine);
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
      'W/RT: Schub | S/LT: Bremse | Maus/Stick/Pfeile: Steuern | Q/E/LB/RB: Roll | V/Y/Start: 3D';
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
    this.inputManager.dispose();
    this.gameScene.dispose();
    this.engine.dispose();
  }
}
