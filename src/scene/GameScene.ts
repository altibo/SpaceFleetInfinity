import * as THREE from 'three';
import { Ship } from './Ship';
import { World } from './World';

/**
 * GameScene verwaltet alle Spielobjekte und deren Interaktionen
 */
export class GameScene {
  private ship: Ship;
  private world: World;
  private scene: THREE.Scene;
  private rotationSpeed: number = (60 * Math.PI) / 180; // 60 Grad/Sekunde in Radianten

  /**
   * Initialisiert die Spielszene
   */
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.world = new World();
    this.ship = new Ship();

    this.scene.add(this.world.getGroup());
    this.scene.add(this.ship.getGroup());
  }

  /**
   * Gibt das Raumschiff zurück
   */
  getShip(): Ship {
    return this.ship;
  }

  /**
   * Gibt die Welt zurück
   */
  getWorld(): World {
    return this.world;
  }

  /**
   * Aktualisiert die Spielszene
   * @param deltaTime Vergangene Zeit seit letztem Frame in Sekunden
   * @param rotation Rotationsinput {x, y, z}
   */
  update(
    deltaTime: number,
    rotation: { x: number; y: number; z: number }
  ): void {
    const amount = this.rotationSpeed * deltaTime;

    // Schiff rotieren
    this.ship.rotate(
      rotation.x * amount, // Pitch
      rotation.y * amount, // Yaw
      rotation.z * amount  // Roll
    );
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.ship.dispose();
    this.world.dispose();
  }
}
