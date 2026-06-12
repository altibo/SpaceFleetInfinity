import * as THREE from 'three';
import type { FlightInput, RotationInput } from '../engine/InputManager';
import { World } from './World';

/**
 * GameScene verwaltet alle Spielobjekte und deren Interaktionen.
 */
export class GameScene {
  private customShip: THREE.Group | null = null;
  private engineFlames: THREE.Mesh[] = [];
  private engineFlameMaterial: THREE.MeshBasicMaterial | null = null;
  private engineFlameGeometry: THREE.ConeGeometry | null = null;
  private speedTrailSprites: THREE.Sprite[] = [];
  private speedTrailMaterials: THREE.SpriteMaterial[] = [];
  private speedTrailTexture: THREE.CanvasTexture | null = null;
  private speedTrailPositions: THREE.Vector3[] = [];
  private world: World;
  private scene: THREE.Scene;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private readonly shipForward = new THREE.Vector3(0, 0, -1);

  private readonly engineOffsets = [
    new THREE.Vector3(-1.57, -0.44, 4.96),
    new THREE.Vector3(1.57, -0.44, 4.96),
    new THREE.Vector3(-1.57, 0.37, 4.96),
    new THREE.Vector3(1.57, 0.37, 4.96),
  ];
  private readonly speedTrailLength = 48;
  private readonly rotationSpeed = (95 * Math.PI) / 180;
  private readonly thrustPower = 36;
  private readonly brakePower = 2.8;
  private readonly spaceDrag = 0.08;
  private readonly maxSpeed = 140;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.world = new World();

    this.scene.add(this.world.getGroup());
  }

  setCustomShip(model: THREE.Group): void {
    if (this.customShip) {
      this.scene.remove(this.customShip);
    }

    this.customShip = model;
    this.scene.add(this.customShip);
    this.createEngineFlames();
    this.createSpeedTrail();
  }

  getCustomShip(): THREE.Group | null {
    return this.customShip;
  }

  getShipObject(): THREE.Object3D | null {
    return this.customShip;
  }

  getVelocity(): THREE.Vector3 {
    return this.velocity;
  }

  getWorld(): World {
    return this.world;
  }

  update(
    deltaTime: number,
    rotation: RotationInput,
    flight: FlightInput
  ): void {
    if (!this.customShip) return;

    const dt = Math.min(deltaTime, 0.05);
    const rotationAmount = this.rotationSpeed * dt;

    this.customShip.rotateX(rotation.x * rotationAmount);
    this.customShip.rotateY(rotation.y * rotationAmount);
    this.customShip.rotateZ(rotation.z * rotationAmount);

    const forward = this.shipForward
      .clone()
      .applyQuaternion(this.customShip.quaternion)
      .normalize();

    this.velocity.addScaledVector(forward, flight.thrust * this.thrustPower * dt);

    if (flight.brake > 0) {
      this.velocity.multiplyScalar(Math.max(0, 1 - flight.brake * this.brakePower * dt));
    }

    this.velocity.multiplyScalar(Math.max(0, 1 - this.spaceDrag * dt));
    this.clampVelocity();
    this.customShip.position.addScaledVector(this.velocity, dt);
    this.updateEngineFlames(flight.thrust);
    this.updateSpeedTrail(forward);
    this.world.update(this.customShip.position, forward);
  }

  private createEngineFlames(): void {
    if (!this.customShip) return;

    this.disposeEngineFlames();

    this.engineFlameGeometry = new THREE.ConeGeometry(0.12, 1, 18, 1, true);
    this.engineFlameMaterial = new THREE.MeshBasicMaterial({
      color: 0xff7a18,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });

    this.engineFlames = this.engineOffsets.map((offset) => {
      const flame = new THREE.Mesh(this.engineFlameGeometry!, this.engineFlameMaterial!);
      flame.position.copy(offset);
      flame.rotation.x = Math.PI / 2;
      flame.visible = false;
      this.customShip!.add(flame);
      return flame;
    });
  }

  private updateEngineFlames(thrust: number): void {
    if (!this.engineFlameMaterial) return;

    const intensity = Math.min(1, Math.max(0, thrust / 1.6));
    const flicker = 0.88 + Math.sin(performance.now() * 0.035) * 0.12;
    const length = (0.35 + intensity * 2.2) * flicker;
    const width = 0.45 + intensity * 0.75;

    this.engineFlameMaterial.opacity = intensity * 0.88;

    for (let i = 0; i < this.engineFlames.length; i++) {
      const flame = this.engineFlames[i];
      flame.visible = intensity > 0.03;
      flame.scale.set(width, length, width);
      flame.position.copy(this.engineOffsets[i]);
      flame.position.z += length * 0.46;
    }
  }

  private createSpeedTrail(): void {
    if (!this.customShip) return;

    this.disposeSpeedTrail();

    this.speedTrailTexture = this.createGlowTexture();
    this.speedTrailPositions = Array.from(
      { length: this.speedTrailLength },
      () => this.customShip!.position.clone()
    );

    for (let i = 0; i < this.speedTrailLength; i++) {
      const material = new THREE.SpriteMaterial({
        map: this.speedTrailTexture,
        color: 0x3aa8ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        fog: false,
      });
      const sprite = new THREE.Sprite(material);

      sprite.visible = false;
      sprite.renderOrder = 30 + i;
      this.scene.add(sprite);
      this.speedTrailSprites.push(sprite);
      this.speedTrailMaterials.push(material);
    }
  }

  private updateSpeedTrail(forward: THREE.Vector3): void {
    if (!this.customShip || this.speedTrailSprites.length === 0) {
      return;
    }

    const speedRatio = Math.min(1, this.velocity.length() / this.maxSpeed);
    const rear = this.customShip.position
      .clone()
      .addScaledVector(forward, -7.6 - speedRatio * 4.5);
    const minStep = 0.2 + speedRatio * 1.2;
    const last = this.speedTrailPositions[0];

    if (!last || rear.distanceToSquared(last) > minStep * minStep) {
      this.speedTrailPositions.unshift(rear);
      this.speedTrailPositions.length = this.speedTrailLength;
    } else if (last) {
      last.copy(rear);
    }

    const visibleCount = speedRatio < 0.03
      ? 0
      : Math.floor(8 + speedRatio * (this.speedTrailLength - 8));

    for (let i = 0; i < this.speedTrailSprites.length; i++) {
      const sprite = this.speedTrailSprites[i];
      const material = this.speedTrailMaterials[i];
      const source = this.speedTrailPositions[i];
      const age = i / Math.max(1, visibleCount - 1);
      const fade = Math.max(0, 1 - age);
      const pulse = 0.82 + Math.sin(performance.now() * 0.012 + i * 0.7) * 0.18;
      const scale = (1.1 + speedRatio * 5.4) * (0.28 + fade * 0.75);

      if (!source || i >= visibleCount) {
        sprite.visible = false;
        material.opacity = 0;
        continue;
      }

      sprite.visible = true;
      sprite.position.copy(source);
      sprite.scale.setScalar(scale);
      material.opacity = (0.025 + speedRatio * 0.28) * fade * pulse;
    }
  }

  private createGlowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    const size = 128;
    const center = size / 2;
    const context = canvas.getContext('2d')!;

    canvas.width = size;
    canvas.height = size;

    const gradient = context.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(170, 235, 255, 0.55)');
    gradient.addColorStop(0.22, 'rgba(70, 185, 255, 0.34)');
    gradient.addColorStop(0.55, 'rgba(25, 90, 220, 0.12)');
    gradient.addColorStop(1, 'rgba(0, 35, 120, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private clampVelocity(): void {
    const speed = this.velocity.length();
    if (speed <= this.maxSpeed) return;

    this.velocity.multiplyScalar(this.maxSpeed / speed);
  }

  dispose(): void {
    this.disposeEngineFlames();
    this.disposeSpeedTrail();
    this.world.dispose();
  }

  private disposeEngineFlames(): void {
    for (const flame of this.engineFlames) {
      flame.removeFromParent();
    }

    this.engineFlames = [];
    this.engineFlameGeometry?.dispose();
    this.engineFlameMaterial?.dispose();
    this.engineFlameGeometry = null;
    this.engineFlameMaterial = null;
  }

  private disposeSpeedTrail(): void {
    for (const sprite of this.speedTrailSprites) {
      sprite.removeFromParent();
    }

    this.speedTrailMaterials.forEach((material) => material.dispose());
    this.speedTrailTexture?.dispose();
    this.speedTrailSprites = [];
    this.speedTrailMaterials = [];
    this.speedTrailTexture = null;
    this.speedTrailPositions = [];
  }
}
