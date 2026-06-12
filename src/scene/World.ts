import * as THREE from 'three';

/**
 * World enthält alle statischen Elemente der Szene
 */
export class World {
  private group: THREE.Group;

  /**
   * Erstellt die Welt
   */
  constructor() {
    this.group = new THREE.Group();
    this.createWorldElements();
  }

  /**
   * Erstellt alle Weltelemente
   */
  private createWorldElements(): void {
    // Im Moment leere Szene außer Raumschiff
    // Hier können später Planeten, Asteroiden etc. hinzugefügt werden
  }

  /**
   * Gibt die Group der Welt zurück
   */
  getGroup(): THREE.Group {
    return this.group;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    // Cleanup bei Bedarf
  }
}
