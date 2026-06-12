import * as THREE from 'three';

/**
 * Renderer für Split-Screen Stereo Rendering (ohne WebXR)
 * Teilt den Bildschirm horizontal in zwei Viewports
 */
export class StereoRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private leftEyeCamera: THREE.PerspectiveCamera;
  private rightEyeCamera: THREE.PerspectiveCamera;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    leftCamera: THREE.PerspectiveCamera,
    rightCamera: THREE.PerspectiveCamera
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.leftEyeCamera = leftCamera;
    this.rightEyeCamera = rightCamera;
  }

  /**
   * Rendert beide Augen im Split-Screen Modus
   */
  render(): void {
    const width = this.renderer.domElement.clientWidth;
    const height = this.renderer.domElement.clientHeight;
    const halfWidth = width / 2;

    // Linkes Auge
    this.renderer.setViewport(0, 0, halfWidth, height);
    this.renderer.setScissor(0, 0, halfWidth, height);
    this.renderer.render(this.scene, this.leftEyeCamera);

    // Rechtes Auge
    this.renderer.setViewport(halfWidth, 0, halfWidth, height);
    this.renderer.setScissor(halfWidth, 0, halfWidth, height);
    this.renderer.render(this.scene, this.rightEyeCamera);

    // Viewport zurücksetzen
    this.renderer.setViewport(0, 0, width, height);
    this.renderer.setScissor(0, 0, width, height);
  }
}
