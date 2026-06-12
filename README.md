# WireVerse

Ein minimalistisches 3D-Weltraum-Spiel mit 1980er-Jahre Vektor-Grafik-Stil. Implementiert mit **Three.js**, **TypeScript** und **Vite**.

## Features

- **Wireframe Graphics**: Nur weiße Linien auf schwarzem Hintergrund
- **Futuristisches Raumschiff**: Symmetrisch, animierbar mit Tastatursteuerung
- **VR Support**: Stereo-Rendering (Split-Screen) und WebXR-Integration
- **PWA**: Vollständig offline-fähig
- **Performance**: 60 FPS auf Desktop, 72 FPS mit VR-Headset

## Installation

```bash
# Repository klonen
git clone https://github.com/altibo/SpaceFleetInfinity.git
cd SpaceFleetInfinity

# Dependencies installieren
npm install
```

## Entwicklung

```bash
# Development Server starten
npm run dev
```

Der Server öffnet sich automatisch unter `http://localhost:3000`.

### Code Style

```bash
# ESLint (Fehlerüberprüfung)
npm run lint

# ESLint mit Fixes
npm run lint:fix

# Prettier (Code-Formatierung)
npm run format
```

## Build

```bash
# Optimierter Build für Produktion
npm run build

# Build-Ergebnis in Vorschau anschauen
npm run preview
```

Die optimierte Version wird im `dist/` Verzeichnis generiert.

## Deployment

Das Projekt wird automatisch zu GitHub Pages deployed, wenn Sie Code in den `main` Branch pushen.

### Manuelles Deployment

```bash
npm run build
# dist/ Verzeichnis zu GitHub Pages hochladen
```

## Tastatursteuerung

| Taste | Funktion |
|-------|----------|
| **W** | Pitch + (nach oben kippen) |
| **S** | Pitch - (nach unten kippen) |
| **A** | Yaw - (nach links drehen) |
| **D** | Yaw + (nach rechts drehen) |
| **Q** | Roll - (gegen Uhrzeigersinn drehen) |
| **E** | Roll + (im Uhrzeigersinn drehen) |
| **V** | VR Modus aktivieren/deaktivieren |

Die Rotation erfolgt kontinuierlich mit **60 Grad/Sekunde** solange die Taste gedrückt wird.

## VR Support

### WebXR (Wenn verfügbar)
Das Spiel erkennt automatisch, ob WebXR auf dem Gerät verfügbar ist:
- ✅ VR Button wird angezeigt
- ✅ Vollständiges WebXR Session Management
- ✅ Optimiert für VR-Headsets (72 FPS)

### Fallback: Split-Screen Stereo
Wenn WebXR nicht verfügbar ist (Desktop Browser):
- ✅ Horizontale Bildschirm-Teilung
- ✅ Separate Kameras für beide Augen
- ✅ Eye Separation: 6.4 cm (Standard)

## Projektstruktur

```
SpaceFleetInfinity/
├── public/                  # Statische Dateien
│   ├── manifest.webmanifest # PWA Konfiguration
│   ├── favicon.svg          # Icon
│   └── icons/               # App Icons
│
├── src/
│   ├── main.ts             # Einstiegspunkt
│   ├── App.ts              # Hauptapplication
│   │
│   ├── engine/             # Rendering Engine
│   │   ├── Engine.ts       # Hauptengine
│   │   ├── InputManager.ts # Tastatureingabe
│   │   └── CameraManager.ts # Kameraverwaltung
│   │
│   ├── scene/              # Spielszene
│   │   ├── GameScene.ts    # Szene-Manager
│   │   ├── Ship.ts         # Raumschiff
│   │   └── World.ts        # Welt-Objekte
│   │
│   ├── vr/                 # VR Features
│   │   ├── StereoRenderer.ts # Split-Screen Rendering
│   │   └── WebXRManager.ts   # WebXR Integration
│   │
│   ├── styles/
│   │   └── style.css       # Styling
│   │
│   └── assets/             # Ressourcen
│
├── index.html              # HTML Template
├── vite.config.ts          # Vite Konfiguration
├── tsconfig.json           # TypeScript Konfiguration
├── package.json            # Dependencies
├── .eslintrc.json          # ESLint Konfiguration
├── .prettierrc.json        # Prettier Konfiguration
├── .gitignore              # Git Ignore
└── README.md               # Dieses Dokument
```

## Technologie-Stack

| Technologie | Verwendung |
|------------|-----------|
| **Three.js** | 3D Rendering |
| **TypeScript** | Strenge Typisierung |
| **Vite** | Build Tool & Dev Server |
| **ESLint** | Code-Qualität |
| **Prettier** | Code-Formatierung |
| **PWA** | Offline-Fähigkeit |
| **WebXR** | VR Support |

## Code Style Richtlinien

- **Strict TypeScript Mode**: Aktiviert
- **Keine globalen Variablen**: Nur Module und Klassen
- **Kleine Klassen**: Jede Klasse hat genau eine Aufgabe (Single Responsibility)
- **Max 300 Zeilen pro Datei**: Für bessere Lesbarkeit
- **JSDoc Kommentare**: Ausführliche Dokumentation jeder Klasse und Methode
- **Keine Datei größer als 300 Zeilen**: Modular und wartbar

## Performance

### Target FPS
- **Desktop**: 60 FPS
- **VR Headset**: 72 FPS

### Optimierungen
- ✅ Antialiasing aktiviert
- ✅ Pixel Ratio beachtet
- ✅ Effiziente Geometrie mit Line Segments
- ✅ Minimale Materialien (nur Weiß)

## Kamera-Parameter

```
Field of View: 75°
Near Plane: 0.1
Far Plane: 1000
Position: (0, 0, 5)
Blick: Auf Ursprung (0, 0, 0)
```

## Raumschiff

Das Wireframe-Raumschiff besteht aus:
- **Spitze**: Pyramidenförmig
- **Rumpf**: Rechteckiges Prisma
- **2 Flügel**: Dreieckig, symmetrisch
- **2 Triebwerke**: Hinten, pyramidenförmig

Alle Komponenten sind als Linien-Segmente (Line Segments) implementiert.

## Zukunfts-Features

Das Projekt ist modular aufgebaut und kann einfach erweitert werden um:

- 🌍 Planeten
- 🪨 Asteroiden
- 👾 Gegner
- 🔫 Waffen
- ✨ Partikelsystem
- 👥 Multiplayer
- 🎮 Physik-Engine
- 🤖 KI
- 🌌 Prozedurale Galaxien
- 🗺️ Open World

## Lizenz

MIT

## Autoren

- **Alex Tibbo** (Altibo)

---

**WireVerse** - Back to the 80s. Forward to the future.
