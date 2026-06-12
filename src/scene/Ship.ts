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
      linewidth: 1.5,
    });

    // Spitze (Cone - verbessert)
    const noseConeGeom = new THREE.ConeGeometry(0.15, 0.6, 8);
    const noseMesh = new THREE.Mesh(noseConeGeom, blackMaterial);
    noseMesh.position.z = 0.55;
    this.group.add(noseMesh);
    this.meshes.push(noseMesh);
    this.addEdges(noseMesh, noseConeGeom, wireMaterial);

    // Rumpf (Box - verbessert)
    const hullGeom = new THREE.BoxGeometry(0.55, 0.35, 0.65);
    const hullMesh = new THREE.Mesh(hullGeom, blackMaterial);
    hullMesh.position.z = 0;
    this.group.add(hullMesh);
    this.meshes.push(hullMesh);
    this.addEdges(hullMesh, hullGeom, wireMaterial);

    // Linker Flügel (vergrößert)
    const leftWingGeom = new THREE.BoxGeometry(0.4, 0.06, 0.3);
    const leftWingMesh = new THREE.Mesh(leftWingGeom, blackMaterial);
    leftWingMesh.position.set(0.425, 0, 0);
    leftWingMesh.rotation.z = 0.3;
    this.group.add(leftWingMesh);
    this.meshes.push(leftWingMesh);
    this.addEdges(leftWingMesh, leftWingGeom, wireMaterial);

    // Rechter Flügel (vergrößert)
    const rightWingGeom = new THREE.BoxGeometry(0.4, 0.06, 0.3);
    const rightWingMesh = new THREE.Mesh(rightWingGeom, blackMaterial);
    rightWingMesh.position.set(-0.425, 0, 0);
    rightWingMesh.rotation.z = -0.3;
    this.group.add(rightWingMesh);
    this.meshes.push(rightWingMesh);
    this.addEdges(rightWingMesh, rightWingGeom, wireMaterial);

    // Linkes Triebwerk (verbesserter Look)
    const leftEngineGeom = new THREE.ConeGeometry(0.1, 0.25, 8);
    const leftEngineMesh = new THREE.Mesh(leftEngineGeom, blackMaterial);
    leftEngineMesh.position.set(0.1, 0, -0.35);
    leftEngineMesh.rotation.z = Math.PI;
    this.group.add(leftEngineMesh);
    this.meshes.push(leftEngineMesh);
    this.addEdges(leftEngineMesh, leftEngineGeom, wireMaterial);

    // Rechtes Triebwerk (verbesserter Look)
    const rightEngineGeom = new THREE.ConeGeometry(0.1, 0.25, 8);
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

/**
 * Hilfsfunktion zum Laden von GLTF-Modellen von Sketchfab oder anderen Quellen
 * Beispiel: loadGLTFModel(scene, 'https://example.com/model.glb')
 */
export async function loadGLTFModel(
  scene: THREE.Scene,
  url: string
): Promise<THREE.Group | null> {
  try {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(1, 1, 1);
          scene.add(model);
          resolve(model);
        },
        undefined,
        (error) => {
          console.error('Fehler beim Laden des Modells:', error);
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('GLTFLoader konnte nicht geladen werden:', error);
    return null;
  }
}
