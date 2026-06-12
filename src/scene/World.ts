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
  private backgroundGroup: THREE.Group = new THREE.Group();
  private planets: Planet[] = [];
  private disposableGeometries: THREE.BufferGeometry[] = [];
  private disposableMaterials: THREE.Material[] = [];
  private disposableTextures: THREE.Texture[] = [];
  private randomSeed: number = 1;

  private readonly planetCount = 10;
  private readonly recycleDistance = 760;
  private readonly behindDistance = 180;

  constructor() {
    this.group = new THREE.Group();
    this.group.add(this.backgroundGroup);
    this.createWorldElements();
  }

  private createWorldElements(): void {
    this.createStarField();
    this.createNebulae();
    this.createPlanets();
  }

  update(center: THREE.Vector3, forward: THREE.Vector3): void {
    this.backgroundGroup.position.copy(center);

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
    const starCount = 4200;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < starCount; i++) {
      const radius = 720 + this.random() * 300;
      const theta = this.random() * Math.PI * 2;
      const phi = Math.acos(2 * this.random() - 1);
      const sinPhi = Math.sin(phi);
      const brightness = 0.45 + Math.pow(this.random(), 2.2) * 0.9;
      const tint = this.random();

      positions[i * 3] = Math.cos(theta) * sinPhi * radius;
      positions[i * 3 + 1] = Math.cos(phi) * radius;
      positions[i * 3 + 2] = Math.sin(theta) * sinPhi * radius;

      if (tint < 0.12) {
        color.setRGB(0.6, 0.76, 1);
      } else if (tint > 0.9) {
        color.setRGB(1, 0.86, 0.62);
      } else {
        color.setRGB(1, 1, 1);
      }

      color.multiplyScalar(brightness);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.8,
      sizeAttenuation: true,
      vertexColors: true,
      fog: false,
    });

    const stars = new THREE.Points(geometry, material);
    this.backgroundGroup.add(stars);
    this.disposableGeometries.push(geometry);
    this.disposableMaterials.push(material);
  }

  private createNebulae(): void {
    const nebulae = [
      { color: '#2f66ff', opacity: 0.2, scale: 520 },
      { color: '#b045ff', opacity: 0.16, scale: 430 },
      { color: '#14a8ff', opacity: 0.13, scale: 360 },
      { color: '#ff6b35', opacity: 0.1, scale: 310 },
      { color: '#39d0a0', opacity: 0.08, scale: 280 },
    ];

    for (const nebula of nebulae) {
      const texture = this.createNebulaTexture(nebula.color);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: nebula.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        fog: false,
      });
      const sprite = new THREE.Sprite(material);
      const position = this.randomSpherePoint(880 + this.random() * 90);

      sprite.position.copy(position);
      sprite.scale.set(
        nebula.scale * (0.85 + this.random() * 0.35),
        nebula.scale * (0.55 + this.random() * 0.35),
        1
      );
      sprite.renderOrder = -20;

      this.backgroundGroup.add(sprite);
      this.disposableMaterials.push(material);
      this.disposableTextures.push(texture);
    }
  }

  private createNebulaTexture(color: string): THREE.CanvasTexture {
    const size = 512;
    const center = size / 2;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    canvas.width = size;
    canvas.height = size;

    context.clearRect(0, 0, size, size);

    for (let i = 0; i < 18; i++) {
      const x = center + (this.random() - 0.5) * size * 0.42;
      const y = center + (this.random() - 0.5) * size * 0.34;
      const radius = size * (0.14 + this.random() * 0.28);
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);

      gradient.addColorStop(0, this.hexToRgba(color, 0.13 + this.random() * 0.12));
      gradient.addColorStop(0.45, this.hexToRgba(color, 0.04 + this.random() * 0.05));
      gradient.addColorStop(1, this.hexToRgba(color, 0));

      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private randomSpherePoint(radius: number): THREE.Vector3 {
    const theta = this.random() * Math.PI * 2;
    const phi = Math.acos(2 * this.random() - 1);
    const sinPhi = Math.sin(phi);

    return new THREE.Vector3(
      Math.cos(theta) * sinPhi * radius,
      Math.cos(phi) * radius,
      Math.sin(theta) * sinPhi * radius
    );
  }

  private hexToRgba(hex: string, alpha: number): string {
    const value = Number.parseInt(hex.slice(1), 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
    this.disposableTextures.forEach((texture) => texture.dispose());
  }
}
