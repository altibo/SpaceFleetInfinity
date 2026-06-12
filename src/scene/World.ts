import * as THREE from 'three';

type Planet = {
  mesh: THREE.Mesh;
  radius: number;
};

/**
 * World enthaelt Raumhintergrund und recycelte Planeten.
 */
export class World {
  private group: THREE.Group;
  private stars: THREE.Points | null = null;
  private planets: Planet[] = [];
  private disposableGeometries: THREE.BufferGeometry[] = [];
  private disposableMaterials: THREE.Material[] = [];
  private randomSeed: number = 1;

  private readonly planetCount = 10;
  private readonly recycleDistance = 760;
  private readonly behindDistance = 180;

  constructor() {
    this.group = new THREE.Group();
    this.createWorldElements();
  }

  private createWorldElements(): void {
    this.createStarField();
    this.createPlanets();
  }

  update(center: THREE.Vector3, forward: THREE.Vector3): void {
    if (this.stars) {
      this.stars.position.copy(center);
    }

    for (const planet of this.planets) {
      const offset = planet.mesh.position.clone().sub(center);
      const isTooFar = offset.length() > this.recycleDistance;
      const isBehind = offset.dot(forward) < -this.behindDistance;

      if (isTooFar || isBehind) {
        this.placePlanetAhead(planet.mesh, center, forward, planet.radius);
      }
    }
  }

  private createStarField(): void {
    const starCount = 1600;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 220 + this.random() * 620;
      const theta = this.random() * Math.PI * 2;
      const horizonBias = (this.random() - 0.5) * 0.8;
      const y = horizonBias * radius;
      const ringRadius = Math.sqrt(Math.max(0, radius * radius - y * y));

      positions[i * 3] = Math.cos(theta) * ringRadius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * ringRadius;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      sizeAttenuation: true,
      fog: false,
    });

    this.stars = new THREE.Points(geometry, material);
    this.group.add(this.stars);
    this.disposableGeometries.push(geometry);
    this.disposableMaterials.push(material);
  }

  private createPlanets(): void {
    const initialForward = new THREE.Vector3(0, 0, -1);
    const initialCenter = new THREE.Vector3();

    for (let i = 0; i < this.planetCount; i++) {
      const radius = 9 + this.random() * 28;
      const detail = radius > 24 ? 36 : 28;
      const planet = this.createPlanet(radius, detail);

      this.placePlanetAhead(planet.mesh, initialCenter, initialForward, radius, i * 55);
      this.planets.push(planet);
    }
  }

  private createPlanet(radius: number, detail: number): Planet {
    const geometry = new THREE.SphereGeometry(radius, detail, Math.floor(detail / 2));
    const material = new THREE.MeshBasicMaterial({
      color: 0x050505,
      side: THREE.FrontSide,
      fog: false,
    });
    const planet = new THREE.Mesh(geometry, material);

    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      fog: false,
    });
    const wire = new THREE.LineSegments(edgeGeometry, edgeMaterial);

    planet.add(wire);
    this.group.add(planet);

    this.disposableGeometries.push(geometry, edgeGeometry);
    this.disposableMaterials.push(material, edgeMaterial);

    return { mesh: planet, radius };
  }

  private placePlanetAhead(
    planet: THREE.Object3D,
    center: THREE.Vector3,
    forward: THREE.Vector3,
    radius: number,
    extraDistance: number = 0
  ): void {
    const side = new THREE.Vector3()
      .crossVectors(forward, new THREE.Vector3(0, 1, 0));

    if (side.lengthSq() < 0.0001) {
      side.crossVectors(forward, new THREE.Vector3(1, 0, 0));
    }

    side.normalize();
    const up = new THREE.Vector3()
      .crossVectors(side, forward)
      .normalize();
    const distance = 260 + extraDistance + this.random() * 430;
    const lateral = (this.random() - 0.5) * 460;
    const vertical = (this.random() - 0.5) * 190;

    planet.position
      .copy(center)
      .addScaledVector(forward, distance)
      .addScaledVector(side, lateral)
      .addScaledVector(up, vertical);
    planet.rotation.set(
      this.random() * Math.PI,
      this.random() * Math.PI,
      this.random() * Math.PI
    );
    planet.scale.setScalar(0.85 + this.random() * 0.35 + radius * 0.004);
  }

  private random(): number {
    const value = Math.sin(this.randomSeed * 12.9898 + 78.233) * 43758.5453;
    this.randomSeed += 1;
    return value - Math.floor(value);
  }

  getGroup(): THREE.Group {
    return this.group;
  }

  dispose(): void {
    this.disposableGeometries.forEach((geometry) => geometry.dispose());
    this.disposableMaterials.forEach((material) => material.dispose());
  }
}
