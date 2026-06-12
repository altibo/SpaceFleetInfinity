# 3D Raumschiff-Modelle laden

## Kostenlose Modell-Quellen

### 1. **Sketchfab** (Empfohlen)
- Website: https://sketchfab.com
- Such nach: "spaceship", "spacecraft"
- Filter: Lizenz = "CC" oder "CC0", Format = GLTF/GLB
- Direkter Download: Klick auf Model → Download → glTF (.glb/.gltf)

### 2. **TurboSquid Free**
- Website: https://www.turbosquid.com/Search/3D-Models/free/spaceship
- Hochwertige Modelle, viele kostenlos

### 3. **CGTrader**
- Website: https://www.cgtrader.com
- Filter nach "Free"

## Modelle in die App integrieren

### Option 1: Modell in `public/models/` speichern
```bash
# Modell herunterladen und in public/models/ ablegen
cp ~/Downloads/spaceship.glb ./public/models/
```

### Option 2: Direkt von URL laden
Bearbeite `src/App.ts` und füge hinzu:
```typescript
import { loadGLTFModel } from './scene/Ship';

// Nach dem Engine-Start:
await loadGLTFModel(this.scene, '/SpaceFleetInfinity/models/spaceship.glb');
```

## Beispiel-Modelle die gut funktionieren

**Für Low-Poly / Wireframe-Style:**
- "Low Poly Spaceship" von sketchfab.com
- "Sci-Fi Spacecraft" von sketchfab.com

**Mit Material-Support:**
- "Simple Spaceship" (Sketchfab)
- "Fighter Jet" (kann auch als Raumschiff verwendet werden)

## Tipps

✅ Wähle Modelle mit kleiner Dateigröße (< 5MB)
✅ Achte auf die Lizenz (CC0/CC-BY sind kostenlos)
✅ Teste das Modell vorher im Sketchfab-Viewer
❌ Vermeide sehr hochaufgelöste Modelle (Performance!)

## Performance-Optimierung

Falls Modell zu langsam lädt:
```typescript
// Modell-Größe anpassen
model.scale.set(0.5, 0.5, 0.5);

// Material vereinfachen
model.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    child.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  }
});
```
