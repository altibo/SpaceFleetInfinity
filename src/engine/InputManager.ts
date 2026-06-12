import * as THREE from 'three';

/**
 * InputManager verwaltet die Tastatureingaben
 * für die Schiffsrotation
 */
export class InputManager {
  private pressedKeys: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  /**
   * Behandelt Key Down Events
   */
  private onKeyDown(event: KeyboardEvent): void {
    this.pressedKeys.add(event.key.toLowerCase());
  }

  /**
   * Behandelt Key Up Events
   */
  private onKeyUp(event: KeyboardEvent): void {
    this.pressedKeys.delete(event.key.toLowerCase());
  }

  /**
   * Überprüft ob eine Taste gedrückt ist
   */
  isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(key.toLowerCase());
  }

  /**
   * Gibt die Rotationsachsen basierend auf Input zurück
   * @returns {x, y, z} Rotationswerte (-1, 0, oder 1)
   */
  getRotationInput(): { x: number; y: number; z: number } {
    const rotation = { x: 0, y: 0, z: 0 };

    // Pitch (W/S)
    if (this.isKeyPressed('w')) rotation.x += 1;
    if (this.isKeyPressed('s')) rotation.x -= 1;

    // Yaw (A/D)
    if (this.isKeyPressed('a')) rotation.y -= 1;
    if (this.isKeyPressed('d')) rotation.y += 1;

    // Roll (Q/E)
    if (this.isKeyPressed('q')) rotation.z -= 1;
    if (this.isKeyPressed('e')) rotation.z += 1;

    return rotation;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.pressedKeys.clear();
  }
}
