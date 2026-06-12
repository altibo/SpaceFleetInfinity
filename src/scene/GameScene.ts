import * as THREE from 'three';
import type { FlightInput, RotationInput } from '../engine/InputManager';
import { World } from './World';

/**
 * GameScene verwaltet alle Spielobjekte und deren Interaktionen.
 */
export class GameScene {
  private customShip: THREE.Group | null = null;
  private world: World;
  private scene: THREE.Scene;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private readonly shipForward = new THREE.Vector3(0, 0, -1);

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
    this.world.update(this.customShip.position, forward);
  }

  private clampVelocity(): void {
    const speed = this.velocity.length();
    if (speed <= this.maxSpeed) return;

    this.velocity.multiplyScalar(this.maxSpeed / speed);
  }

  dispose(): void {
    this.world.dispose();
  }
}
