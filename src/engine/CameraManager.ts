import * as THREE from 'three';

/**
 * CameraManager verwaltet die Kamera und Kamerapositionen
 */
export class CameraManager {
  private mainCamera: THREE.PerspectiveCamera;
  private leftEyeCamera: THREE.PerspectiveCamera;
  private rightEyeCamera: THREE.PerspectiveCamera;
  private eyeSeparation: number = 0.35;
  private convergenceDistance: number = 20;
  private followDistance: number = 26;
  private followHeight: number = 7;
  private positionSmoothing: number = 3.2;
  private lookSmoothing: number = 5.5;
  private rollSmoothing: number = 4.2;
  private followLookTarget: THREE.Vector3 = new THREE.Vector3();
  private followUp: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

  constructor(baseCamera: THREE.PerspectiveCamera) {
    this.mainCamera = baseCamera;

    // Stereo-Kameras für VR
    this.leftEyeCamera = baseCamera.clone() as THREE.PerspectiveCamera;
    this.rightEyeCamera = baseCamera.clone() as THREE.PerspectiveCamera;

    this.updateStereoCameras();
  }

  /**
   * Gibt die Hauptkamera zurück
   */
  getMainCamera(): THREE.PerspectiveCamera {
    return this.mainCamera;
  }

  /**
   * Gibt die linke Augenkamera zurück
   */
  getLeftEyeCamera(): THREE.PerspectiveCamera {
    return this.leftEyeCamera;
  }

  /**
   * Gibt die rechte Augenkamera zurück
   */
  getRightEyeCamera(): THREE.PerspectiveCamera {
    return this.rightEyeCamera;
  }

  /**
   * Aktualisiert die Positionen der Stereo-Kameras
   */
  private updateStereoCameras(): void {
    const separation = this.eyeSeparation / 2;
    const stereoAspect = this.mainCamera.aspect / 2;
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.mainCamera.quaternion);
    const forward = new THREE.Vector3();

    this.mainCamera.getWorldDirection(forward);

    this.leftEyeCamera.copy(this.mainCamera);
    this.rightEyeCamera.copy(this.mainCamera);

    this.leftEyeCamera.aspect = stereoAspect;
    this.rightEyeCamera.aspect = stereoAspect;

    // Linkes Auge
    this.leftEyeCamera.position.copy(this.mainCamera.position);
    this.leftEyeCamera.position.addScaledVector(right, -separation);

    // Rechtes Auge
    this.rightEyeCamera.position.copy(this.mainCamera.position);
    this.rightEyeCamera.position.addScaledVector(right, separation);

    const target = this.mainCamera.position
      .clone()
      .addScaledVector(forward, this.convergenceDistance);

    this.leftEyeCamera.lookAt(target);
    this.rightEyeCamera.lookAt(target);
    this.leftEyeCamera.updateProjectionMatrix();
    this.rightEyeCamera.updateProjectionMatrix();
  }

  /**
   * Setzt den Eye-Separation für Stereo
   */
  setEyeSeparation(separation: number): void {
    this.eyeSeparation = separation;
    this.updateStereoCameras();
  }

  /**
   * Aktualisiert die Stereo-Kameras (muss nach Bewegung aufgerufen werden)
   */
  updateStereo(): void {
    this.updateStereoCameras();
  }

  updateFollow(
    target: THREE.Object3D | null,
    velocity: THREE.Vector3,
    deltaTime: number
  ): void {
    if (!target) {
      this.updateStereoCameras();
      return;
    }

    const forward = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(target.quaternion)
      .normalize();
    const up = new THREE.Vector3(0, 1, 0)
      .applyQuaternion(target.quaternion)
      .normalize();
    const speedLookAhead = Math.min(28, velocity.length() * 0.22);
    const desiredPosition = target.position
      .clone()
      .addScaledVector(forward, -this.followDistance)
      .addScaledVector(up, this.followHeight);
    const desiredLookTarget = target.position
      .clone()
      .addScaledVector(forward, 16 + speedLookAhead);
    const positionBlend = 1 - Math.exp(-this.positionSmoothing * deltaTime);
    const lookBlend = 1 - Math.exp(-this.lookSmoothing * deltaTime);
    const rollBlend = 1 - Math.exp(-this.rollSmoothing * deltaTime);

    if (this.followLookTarget.lengthSq() === 0) {
      this.followLookTarget.copy(desiredLookTarget);
      this.followUp.copy(up);
    }

    this.mainCamera.position.lerp(desiredPosition, positionBlend);
    this.followLookTarget.lerp(desiredLookTarget, lookBlend);
    this.followUp.lerp(up, rollBlend).normalize();
    this.mainCamera.up.copy(this.followUp);
    this.mainCamera.lookAt(this.followLookTarget);
    this.updateStereoCameras();
  }
}
