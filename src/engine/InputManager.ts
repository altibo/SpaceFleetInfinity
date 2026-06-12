export type RotationInput = { x: number; y: number; z: number };
export type FlightInput = { thrust: number; brake: number };

/**
 * InputManager verwaltet Tastatur, Maus und Gamecontroller.
 */
export class InputManager {
  private pressedKeys: Set<string> = new Set();
  private previousGamepadButtons: Map<number, boolean[]> = new Map();

  private readonly deadZone = 0.15;

  private readonly keyDownHandler = (e: KeyboardEvent) => this.onKeyDown(e);
  private readonly keyUpHandler = (e: KeyboardEvent) => this.onKeyUp(e);

  constructor() {
    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.repeat) return;

    this.pressedKeys.add(event.key.toLowerCase());
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.pressedKeys.delete(event.key.toLowerCase());
  }

  isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(key.toLowerCase());
  }

  consumeSplitScreenToggle(): boolean {
    const keyboardToggle = this.consumeKey('v');
    let gamepadToggle = false;

    for (const gamepad of this.getGamepads()) {
      gamepadToggle = this.wasGamepadButtonPressed(gamepad, 3)
        || this.wasGamepadButtonPressed(gamepad, 9)
        || gamepadToggle;
    }

    return keyboardToggle || gamepadToggle;
  }

  getRotationInput(): RotationInput {
    const rotation: RotationInput = { x: 0, y: 0, z: 0 };

    this.addKeyboardInput(rotation);
    this.addGamepadInput(rotation);

    rotation.x = this.clamp(rotation.x, -3, 3);
    rotation.y = this.clamp(rotation.y, -3, 3);
    rotation.z = this.clamp(rotation.z, -3, 3);

    return rotation;
  }

  getFlightInput(): FlightInput {
    const flight: FlightInput = { thrust: 0, brake: 0 };

    if (this.isKeyPressed(' ')) flight.thrust += 1;
    if (this.isKeyPressed('shift')) flight.brake += 1;

    for (const gamepad of this.getGamepads()) {
      flight.thrust += gamepad.buttons[7]?.value ?? 0;
      flight.brake += gamepad.buttons[6]?.value ?? 0;

      if (gamepad.buttons[0]?.pressed) flight.thrust += 0.7;
      if (gamepad.buttons[1]?.pressed) flight.brake += 0.7;
    }

    flight.thrust = this.clamp(flight.thrust, 0, 1.6);
    flight.brake = this.clamp(flight.brake, 0, 1);

    return flight;
  }

  private addKeyboardInput(rotation: RotationInput): void {
    if (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) rotation.x -= 1;
    if (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) rotation.x += 1;

    if (this.isKeyPressed('a')) rotation.y += 1;
    if (this.isKeyPressed('d')) rotation.y -= 1;

    if (this.isKeyPressed('q')) rotation.z += 1;
    if (this.isKeyPressed('e')) rotation.z -= 1;
  }

  private addGamepadInput(rotation: RotationInput): void {
    for (const gamepad of this.getGamepads()) {
      const leftX = this.applyDeadZone(gamepad.axes[0] ?? 0);
      const leftY = this.applyDeadZone(gamepad.axes[1] ?? 0);
      const rightX = this.applyDeadZone(gamepad.axes[2] ?? 0);
      const leftShoulder = gamepad.buttons[4]?.pressed ? 1 : 0;
      const rightShoulder = gamepad.buttons[5]?.pressed ? 1 : 0;

      rotation.x -= leftY;
      rotation.y -= leftX;
      rotation.z += rightX;
      rotation.z += leftShoulder;
      rotation.z -= rightShoulder;
    }
  }

  private getGamepads(): Gamepad[] {
    return navigator.getGamepads().filter(
      (gamepad): gamepad is Gamepad => gamepad !== null
    );
  }

  private wasGamepadButtonPressed(gamepad: Gamepad, buttonIndex: number): boolean {
    const buttons = this.previousGamepadButtons.get(gamepad.index) ?? [];
    const wasPressed = buttons[buttonIndex] ?? false;
    const isPressed = gamepad.buttons[buttonIndex]?.pressed ?? false;

    buttons[buttonIndex] = isPressed;
    this.previousGamepadButtons.set(gamepad.index, buttons);

    return isPressed && !wasPressed;
  }

  private consumeKey(key: string): boolean {
    if (!this.isKeyPressed(key)) return false;

    this.pressedKeys.delete(key.toLowerCase());
    return true;
  }

  private applyDeadZone(value: number): number {
    if (Math.abs(value) < this.deadZone) return 0;

    return value;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  dispose(): void {
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);

    this.pressedKeys.clear();
    this.previousGamepadButtons.clear();
  }
}
