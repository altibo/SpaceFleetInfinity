import * as THREE from 'three';

/**
 * Ship erstellt ein futuristisches Raumschiff als Wireframe-Mesh
 * Mit echten Geometrien und Back-face Culling
 * Bestandteile: Spitze, Rumpf, 2 Flügel, 2 Triebwerke
 */
export class Ship {
  private group: THREE.Group;
  private meshes: THREE.Mesh[] = [];

  /**
   * Erstellt das Raumschiff
   */
  constructor() {
    this.group = new THREE.Group();
    this.meshes = [];
    this.createShip();
  }

  /**
   * Erstellt alle Komponenten des Schiffs
   */
  private createShip(): void {
    // Material für alle Wireframes
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      side: THREE.FrontSide, // Nur Außenseiten sichtbar
    });

    // Spitze (Cone)
    const noseConeGeom = new THREE.ConeGeometry(0.15, 0.5, 8);
    const noseMesh = new THREE.Mesh(noseConeGeom, wireMaterial);
    noseMesh.position.z = 0.55;
    this.group.add(noseMesh);
    this.meshes.push(noseMesh);

    // Rumpf (Box)
    const hullGeom = new THREE.BoxGeometry(0.5, 0.3, 0.6);
    const hullMesh = new THREE.Mesh(hullGeom, wireMaterial);
    hullMesh.position.z = 0;
    this.group.add(hullMesh);
    this.meshes.push(hullMesh);

    // Linker Flügel
    const leftWingGeom = new THREE.BoxGeometry(0.35, 0.05, 0.25);
    const leftWingMesh = new THREE.Mesh(leftWingGeom, wireMaterial);
    leftWingMesh.position.set(0.425, 0, 0);
    leftWingMesh.rotation.z = 0.3;
    this.group.add(leftWingMesh);
    this.meshes.push(leftWingMesh);

    // Rechter Flügel
    const rightWingGeom = new THREE.BoxGeometry(0.35, 0.05, 0.25);
    const rightWingMesh = new THREE.Mesh(rightWingGeom, wireMaterial);
    rightWingMesh.position.set(-0.425, 0, 0);
    rightWingMesh.rotation.z = -0.3;
    this.group.add(rightWingMesh);
    this.meshes.push(rightWingMesh);

    // Linkes Triebwerk
    const leftEngineGeom = new THREE.ConeGeometry(0.08, 0.2, 6);
    const leftEngineMesh = new THREE.Mesh(leftEngineGeom, wireMaterial);
    leftEngineMesh.position.set(0.1, 0, -0.35);
    leftEngineMesh.rotation.z = Math.PI;
    this.group.add(leftEngineMesh);
    this.meshes.push(leftEngineMesh);

    // Rechtes Triebwerk
    const rightEngineGeom = new THREE.ConeGeometry(0.08, 0.2, 6);
    const rightEngineMesh = new THREE.Mesh(rightEngineGeom, wireMaterial);
    rightEngineMesh.position.set(-0.1, 0, -0.35);
    rightEngineMesh.rotation.z = Math.PI;
    this.group.add(rightEngineMesh);
    this.meshes.push(rightEngineMesh);
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
    this.meshes.forEach((mesh) => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) mesh.material.dispose();
    });
  }
}
