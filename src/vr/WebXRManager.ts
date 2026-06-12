/**
 * WebXRManager verwaltet WebXR Sessions
 * Ermöglicht VR-Headset Unterstützung, wenn verfügbar
 */
export class WebXRManager {
  private xrSession: XRSession | null = null;
  private isAvailable: boolean = false;

  constructor() {
    this.checkXRAvailability();
  }

  /**
   * Überprüft ob WebXR verfügbar ist
   */
  private checkXRAvailability(): void {
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-vr').then((supported) => {
        this.isAvailable = supported;
        console.log('WebXR VR supported:', supported);
      });
    }
  }

  /**
   * Überprüft ob WebXR verfügbar ist
   */
  isXRAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Startet eine VR Session
   */
  async startSession(): Promise<XRSession | null> {
    if (!this.isAvailable || !('xr' in navigator)) {
      console.warn('WebXR nicht verfügbar');
      return null;
    }

    try {
      this.xrSession = await navigator.xr?.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor'],
      }) || null;

      console.log('WebXR Session started');
      return this.xrSession;
    } catch (error) {
      console.error('Fehler beim Starten der WebXR Session:', error);
      return null;
    }
  }

  /**
   * Beendet die VR Session
   */
  async endSession(): Promise<void> {
    if (this.xrSession) {
      await this.xrSession.end();
      this.xrSession = null;
      console.log('WebXR Session beendet');
    }
  }

  /**
   * Gibt die aktuelle Session zurück
   */
  getSession(): XRSession | null {
    return this.xrSession;
  }

  /**
   * Überprüft ob eine Session aktiv ist
   */
  isSessionActive(): boolean {
    return this.xrSession !== null;
  }
}
