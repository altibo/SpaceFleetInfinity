import * as THREE from 'three';

/**
 * Renderer fuer Split-Screen Stereo Rendering.
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

  render(): void {
    const width = this.renderer.domElement.clientWidth;
    const height = this.renderer.domElement.clientHeight;
    const halfWidth = Math.floor(width / 2);
    const rightWidth = width - halfWidth;
    const previousAutoClear = this.renderer.autoClear;
    const previousScissorTest = this.renderer.getScissorTest();

    this.renderer.autoClear = false;
    this.renderer.setScissorTest(true);

    this.renderEye(this.leftEyeCamera, 0, 0, halfWidth, height);
    this.renderEye(this.rightEyeCamera, halfWidth, 0, rightWidth, height);

    this.renderer.setViewport(0, 0, width, height);
    this.renderer.setScissor(0, 0, width, height);
    this.renderer.setScissorTest(previousScissorTest);
    this.renderer.autoClear = previousAutoClear;
  }

  private renderEye(
    camera: THREE.PerspectiveCamera,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    this.renderer.setViewport(x, y, width, height);
    this.renderer.setScissor(x, y, width, height);
    this.renderer.clear(true, true, true);
    this.renderer.render(this.scene, camera);
  }
}
