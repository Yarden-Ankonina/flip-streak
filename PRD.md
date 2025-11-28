# Product Requirements Document (PRD): FlipStreak

## 1. Executive Summary

FlipStreak is a hyper-casual utility app allowing users to flip a realistic 3D coin using thumb gestures. The core value proposition is the "satisfying feel" of the physics and a streak counter that tracks consecutive outcomes (e.g., "Heads x3").

## 2. Technical Architecture

### 2.1 Tech Stack

- **Core Framework**: React (latest)
- **Bundler**: Vite
- **Mobile Wrapper**: Capacitor.js (for iOS/Android deployment)
- **3D Engine**: React Three Fiber (R3F) & @react-three/drei
- **Physics**: @react-three/cannon (for realistic gravity and ground collision) or simple vector math (if strictly air-flipping).
- **State Management**: Zustand (preferred for 3D state).

### 2.2 Artist Asset Pipeline (Strict 3D Workflow)

The artist must provide PBR (Physically Based Rendering) textures.

- **Geometry**: A simple low-poly Cylinder .obj or .gltf (optional, can use default CylinderGeometry), OR just the textures if using code-generated geometry.
- **UV Mapping**: The artist must ensure the "Side/Edge" of the coin is UV unrapped separately from the Faces so the ridges look correct.

**Required Textures (Per Skin):**
- **Albedo/Color Map**: The visual design.
- **Normal Map**: Purple map for fake 3D depth (embossing).
- **Roughness Map**: Defines shiny vs matte areas.
- **Metalness Map**: White = Metal, Black = Non-metal.

### 2.3 Lighting & Environment (Crucial)

**Environment Map (HDRI)**: To make the metal look realistic, we cannot rely on simple point lights. We must load a .exr or .hdr environment map (e.g., a "Studio Lighting" setup) so the gold/silver has something to reflect.

## 3. Core Features (MVP)

### 3.1 The Coin

- **Visuals**: A standard meshStandardMaterial using the maps defined in 2.2.
- **Interaction**: The coin reacts to the light source as it rotates.
- **State**: The coin has a binary state (Heads/Tails) determined by the final rotation (Euler angles) relative to the floor plane.

### 3.2 Physics & Interaction (The "Thumb" Feel)

- **Gesture**: User swipes up/flick with thumb.
- **Velocity**: The speed of the swipe determines the rotational impulse applied to the physics body.
- **Haptics**: (Via Capacitor Haptics Plugin)
  - Light vibration on "touch start".
  - Heavy vibration on "landing".
- **Sound**: A "clink" sound effect triggers on collision with the ground plane.

### 3.3 The Logic (Streak Counter)

- **Display**: A prominent counter showing the current streak.
- **Algorithm**:
  - If NewResult == PreviousResult: Streak + 1
  - If NewResult != PreviousResult: Streak = 1
- **Visual Feedback**: The counter pulses or changes color when a streak > 3.

## 4. User Flow

1. **Idle**: Coin sits in center. "Swipe to Flip" hint (fades out after first use).
2. **Action**: User flicks thumb.
3. **Animation**: Coin spins in 3D space (Z-axis rotation) using physics impulses.
4. **Result**: Coin collides with the floor and settles.
5. **Feedback**:
   - Haptic click.
   - Text: "HEADS" appears.
   - Streak Counter updates.

## 5. Future Roadmap (Post-MVP)

- **Skins**: Unlockable coins (Bitcoin, Ancient Gold, Poker Chip) based on total flips.
- **Leaderboard**: Global highest streak.

