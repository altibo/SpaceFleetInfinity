import * as THREE from 'three';

/**
 * CameraManager verwaltet die Kamera und Kamerapositionen
 */
export class CameraManager {
  private mainCamera: THREE.PerspectiveCamera;
  private leftEyeCamera: THREE.PerspectiveCamera;
  private rightEyeCamera: THREE.PerspectiveCamera;
  private eyeSeparation: number = 0.064; // 64mm Standard

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

    // Linkes Auge
    this.leftEyeCamera.position.copy(this.mainCamera.position);
    this.leftEyeCamera.position.x -= separation;

    // Rechtes Auge
    this.rightEyeCamera.position.copy(this.mainCamera.position);
    this.rightEyeCamera.position.x += separation;

    // Beide Kameras schauen auf den gleichen Punkt
    const target = new THREE.Vector3();
    this.mainCamera.getWorldDirection(target);
    target.add(this.mainCamera.position);

    this.leftEyeCamera.lookAt(target);
    this.rightEyeCamera.lookAt(target);
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
}
