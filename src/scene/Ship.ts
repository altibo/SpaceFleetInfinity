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
    // Material für schwarze Oberflächen
    const blackMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.FrontSide,
    });

    // Material für weiße Kanten
    const wireMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 1,
    });

    // Spitze (Cone)
    const noseConeGeom = new THREE.ConeGeometry(0.15, 0.5, 8);
    const noseMesh = new THREE.Mesh(noseConeGeom, blackMaterial);
    noseMesh.position.z = 0.55;
    this.group.add(noseMesh);
    this.meshes.push(noseMesh);
    this.addEdges(noseMesh, noseConeGeom, wireMaterial);

    // Rumpf (Box)
    const hullGeom = new THREE.BoxGeometry(0.5, 0.3, 0.6);
    const hullMesh = new THREE.Mesh(hullGeom, blackMaterial);
    hullMesh.position.z = 0;
    this.group.add(hullMesh);
    this.meshes.push(hullMesh);
    this.addEdges(hullMesh, hullGeom, wireMaterial);

    // Linker Flügel
    const leftWingGeom = new THREE.BoxGeometry(0.35, 0.05, 0.25);
    const leftWingMesh = new THREE.Mesh(leftWingGeom, blackMaterial);
    leftWingMesh.position.set(0.425, 0, 0);
    leftWingMesh.rotation.z = 0.3;
    this.group.add(leftWingMesh);
    this.meshes.push(leftWingMesh);
    this.addEdges(leftWingMesh, leftWingGeom, wireMaterial);

    // Rechter Flügel
    const rightWingGeom = new THREE.BoxGeometry(0.35, 0.05, 0.25);
    const rightWingMesh = new THREE.Mesh(rightWingGeom, blackMaterial);
    rightWingMesh.position.set(-0.425, 0, 0);
    rightWingMesh.rotation.z = -0.3;
    this.group.add(rightWingMesh);
    this.meshes.push(rightWingMesh);
    this.addEdges(rightWingMesh, rightWingGeom, wireMaterial);

    // Linkes Triebwerk
    const leftEngineGeom = new THREE.ConeGeometry(0.08, 0.2, 6);
    const leftEngineMesh = new THREE.Mesh(leftEngineGeom, blackMaterial);
    leftEngineMesh.position.set(0.1, 0, -0.35);
    leftEngineMesh.rotation.z = Math.PI;
    this.group.add(leftEngineMesh);
    this.meshes.push(leftEngineMesh);
    this.addEdges(leftEngineMesh, leftEngineGeom, wireMaterial);

    // Rechtes Triebwerk
    const rightEngineGeom = new THREE.ConeGeometry(0.08, 0.2, 6);
    const rightEngineMesh = new THREE.Mesh(rightEngineGeom, blackMaterial);
    rightEngineMesh.position.set(-0.1, 0, -0.35);
    rightEngineMesh.rotation.z = Math.PI;
    this.group.add(rightEngineMesh);
    this.meshes.push(rightEngineMesh);
    this.addEdges(rightEngineMesh, rightEngineGeom, wireMaterial);
  }

  /**
   * Fügt sichtbare Kanten als weiße Linien hinzu
   */
  private addEdges(
    mesh: THREE.Mesh,
    geometry: THREE.BufferGeometry,
    wireMaterial: THREE.LineBasicMaterial
  ): void {
    // EdgesGeometry extrahiert nur sichtbare Außenkanten
    const edges = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(edges, wireMaterial);
    mesh.add(wireframe);
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
