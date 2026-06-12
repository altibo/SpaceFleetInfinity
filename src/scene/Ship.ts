import * as THREE from 'three';

/**
 * Ship erstellt ein futuristisches Raumschiff als Wireframe
 * Bestandteile: Spitze, Rumpf, 2 Flügel, 2 Triebwerke
 */
export class Ship {
  private group: THREE.Group;
  private geometries: THREE.BufferGeometry[] = [];

  /**
   * Erstellt das Raumschiff
   */
  constructor() {
    this.group = new THREE.Group();
    this.createShip();
  }

  /**
   * Erstellt alle Komponenten des Schiffs
   */
  private createShip(): void {
    // Spitze
    this.createNose();
    // Rumpf
    this.createHull();
    // Flügel
    this.createWings();
    // Triebwerke
    this.createEngines();
  }

  /**
   * Erstellt die Spitze des Schiffs
   */
  private createNose(): void {
    const noseGeom = new THREE.BufferGeometry();
    const noseVertices = new Float32Array([
      0, 0, 0.8, // Spitze
      0.15, 0, 0.3,
      -0.15, 0, 0.3,
      0, 0.15, 0.3,
      0, -0.15, 0.3,
    ]);

    noseGeom.setAttribute('position', new THREE.BufferAttribute(noseVertices, 3));
    const indices = [0, 1, 0, 2, 0, 3, 0, 4, 1, 3, 3, 2, 2, 4, 4, 1];
    noseGeom.setIndex(indices);

    const noseLine = new THREE.LineSegments(
      noseGeom,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    this.group.add(noseLine);
    this.geometries.push(noseGeom);
  }

  /**
   * Erstellt den Rumpf des Schiffs
   */
  private createHull(): void {
    const hullGeom = new THREE.BufferGeometry();
    const hullVertices = new Float32Array([
      0.25, 0.15, 0.3, // oben rechts
      -0.25, 0.15, 0.3, // oben links
      0.25, -0.15, 0.3, // unten rechts
      -0.25, -0.15, 0.3, // unten links
      0.2, 0.1, -0.3, // hinten oben rechts
      -0.2, 0.1, -0.3, // hinten oben links
      0.2, -0.1, -0.3, // hinten unten rechts
      -0.2, -0.1, -0.3, // hinten unten links
    ]);

    hullGeom.setAttribute('position', new THREE.BufferAttribute(hullVertices, 3));
    const indices = [
      0, 1, 1, 3, 3, 2, 2, 0, // Vorne
      4, 5, 5, 7, 7, 6, 6, 4, // Hinten
      0, 4, 1, 5, 2, 6, 3, 7, // Seiten
    ];
    hullGeom.setIndex(indices);

    const hullLine = new THREE.LineSegments(
      hullGeom,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    this.group.add(hullLine);
    this.geometries.push(hullGeom);
  }

  /**
   * Erstellt die Flügel
   */
  private createWings(): void {
    // Linker Flügel
    const leftWingGeom = new THREE.BufferGeometry();
    const leftWingVertices = new Float32Array([
      0.25, 0, 0.15, // Basis
      0.6, 0.15, 0.1, // Außen oben
      0.6, -0.15, 0.1, // Außen unten
      0.4, 0, -0.1, // Hinterkante
    ]);

    leftWingGeom.setAttribute('position', new THREE.BufferAttribute(leftWingVertices, 3));
    const leftWingIndices = [0, 1, 1, 2, 2, 0, 1, 3, 2, 3, 0, 3];
    leftWingGeom.setIndex(leftWingIndices);

    const leftWingLine = new THREE.LineSegments(
      leftWingGeom,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    this.group.add(leftWingLine);
    this.geometries.push(leftWingGeom);

    // Rechter Flügel (gespiegelt)
    const rightWingGeom = new THREE.BufferGeometry();
    const rightWingVertices = new Float32Array([
      -0.25, 0, 0.15, // Basis
      -0.6, 0.15, 0.1, // Außen oben
      -0.6, -0.15, 0.1, // Außen unten
      -0.4, 0, -0.1, // Hinterkante
    ]);

    rightWingGeom.setAttribute('position', new THREE.BufferAttribute(rightWingVertices, 3));
    const rightWingIndices = [0, 1, 1, 2, 2, 0, 1, 3, 2, 3, 0, 3];
    rightWingGeom.setIndex(rightWingIndices);

    const rightWingLine = new THREE.LineSegments(
      rightWingGeom,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    this.group.add(rightWingLine);
    this.geometries.push(rightWingGeom);
  }

  /**
   * Erstellt die Triebwerke
   */
  private createEngines(): void {
    const engineGeom = new THREE.BufferGeometry();
    const engineVertices = new Float32Array([
      0.1, 0, -0.35, // Linkes Triebwerk Spitze
      0.15, 0.05, -0.2, // Linkes Triebwerk Rückseite
      0.15, -0.05, -0.2,
      -0.1, 0, -0.35, // Rechtes Triebwerk Spitze
      -0.15, 0.05, -0.2, // Rechtes Triebwerk Rückseite
      -0.15, -0.05, -0.2,
    ]);

    engineGeom.setAttribute('position', new THREE.BufferAttribute(engineVertices, 3));
    const engineIndices = [0, 1, 1, 2, 2, 0, 3, 4, 4, 5, 5, 3];
    engineGeom.setIndex(engineIndices);

    const engineLine = new THREE.LineSegments(
      engineGeom,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    this.group.add(engineLine);
    this.geometries.push(engineGeom);
  }

  /**
   * Gibt die Group des Schiffs zurück
   */
  getGroup(): THREE.Group {
    return this.group;
  }

  /**
   * Rotiert das Schiff
   * @param pitch Rotation um X-Achse
   * @param yaw Rotation um Y-Achse
   * @param roll Rotation um Z-Achse
   */
  rotate(pitch: number, yaw: number, roll: number): void {
    this.group.rotation.x += pitch;
    this.group.rotation.y += yaw;
    this.group.rotation.z += roll;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.geometries.forEach((geom) => geom.dispose());
  }
}
