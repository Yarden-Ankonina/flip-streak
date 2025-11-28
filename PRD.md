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
- **Geometry**: Coin must have visible width/thickness (edge/rim) - not a flat paper-like appearance. The coin should appear as a 3D cylinder with distinct faces and edge.
- **Initial State**: Coin always starts face-on showing the heads side (or last coin state if available).
- **Interaction**: The coin reacts to the light source as it rotates.
- **State**: The coin has a binary state (Heads/Tails) determined by the final rotation (Euler angles) relative to the floor plane.

### 3.2 Physics & Interaction (The "Thumb" Feel)

**Interaction Model:**

- **Touch & Drag (Translation)**:
  - User can touch and drag the coin to move it sideways (X/Y translation)
  - Coin follows finger movement directly (1:1 position mapping)
  - **Does NOT rotate the coin** - only translates its position
  - Coin remains face-on to camera during dragging
  - **Does NOT start flipping** - this is just for positioning
  - **Drag Boundaries**: Coin cannot be dragged off-screen
    - Maximum drag distance is constrained to keep coin visible
    - Boundaries prevent coin from being moved too far left/right or up/down
    - When touch ends, coin snaps back to center position
  - **Coin Centering During Flip**:
    - When flip animation starts, coin automatically centers to middle of canvas (0, 0, 0)
    - Prevents coin from overflowing outside visible area during flip
    - Smooth transition to center position at flip start
- **Flip Trigger Methods** (User can choose in settings):
  - **Swipe Up (Default)**:
    - User swipes upward with thumb to initiate the flip
    - The speed of the swipe determines the rotational impulse applied
    - Only upward swipes trigger the flip animation
    - Coin spins/flips in 3D space with physics-based motion
    - **Swipe Sensitivity**: Adjustable sensitivity bar in settings
      - Controls how sensitive the swipe detection is
      - Lower sensitivity = requires faster/longer swipe
      - Higher sensitivity = easier to trigger flip
      - Default: Medium sensitivity
  - **Flip Button (Alternative)**:
    - User can tap a button to flip the coin
    - Button appears at bottom center of screen (above result counter)
    - Uses medium velocity for consistent flips
    - Button is disabled during flip animation to prevent multiple flips
    - Can be toggled on/off in settings panel
- **Physics Simulation**:
  - Coin always falls using physics (gravity + ground collision)
  - Realistic physics simulation for every flip
  - Coin settles naturally on the ground plane
  - Physics should feel heavy and substantial (not like a piece of paper)
  - Damping values should be tuned to give the coin weight and momentum
  - Focus on up/down (Y-axis) movement with minimal rotations
  - Reduced overall impulse for more controlled flips
- **Landing Physics**:
  - Coin must land on the floor at a fixed point (back of screen, same Z position)
  - Gravity applies during flip animation (coin falls down)
  - Coin moves back in Z direction as it falls toward landing position
  - When coin reaches ground level (Y=0), landing animation begins
  - **Landing Animation**: Realistic multi-phase landing with precession and wobble
    - **Phase 1 - Initial Bounce**: Coin bounces slightly when hitting the ground (elasticity-based)
    - **Phase 2 - Precession**: Coin slows down and tilts onto its edge, rotating around the edge axis
      - Begins when rotation velocity drops below threshold
      - Coin appears to "balance on its edge" while spinning
      - Precession amplitude and frequency decrease as energy is lost
      - Creates realistic "wobbling on edge" effect
    - **Phase 3 - Wobble**: Coin oscillates with small amplitude before settling
      - Small back-and-forth motion on X and Z axes
      - Wobble amplitude decays exponentially
      - Creates "shimmy" effect before final rest
    - **Phase 4 - Final Settling**: Coin flattens completely
      - X and Z rotations aggressively flatten to 0
      - Coin gradually rotates to show final result (heads or tails)
      - Animation duration: ~2.0 seconds total for satisfying feel
      - Coin MUST end up perfectly flat (X and Z rotations = 0)
      - Only Y rotation varies to show heads (0°) or tails (180°)
  - After landing animation completes, coin automatically returns to center position
- **Maximum Flip Duration**:
  - Coin toss animation has a maximum time limit (e.g., 3 seconds)
  - Prevents users from waiting too long for the coin to settle
  - If max duration is exceeded, coin is forced to land immediately at the landing position
  - All flip velocities are stopped when max time is reached
- **Double-Click/Tap to Skip**:
  - User can double-click or double-tap during the flip animation
  - Immediately skips the physics simulation and shows the result
  - Useful for impatient users who want instant results
  - Still maintains streak counter accuracy
- **Haptics**: (Via Capacitor Haptics Plugin)
  - Light vibration on "touch start" (when panning).
  - Heavy vibration on "flick trigger".
  - Heavy vibration on "landing".
- **Sound**: A "clink" sound effect triggers on collision with the ground plane.

### 3.3 The Logic (Streak Counter)

- **Display**: A prominent counter at the bottom showing the current result (Heads or Tails) with count.
- **Format**: Shows "Heads x3" or "Tails x5" format with icon, label, and count.
- **Styling**:
  - Counter text should be white (not yellow/gold) for better visibility
  - No background on counter (transparent)
  - Uses actual coin images (heads-corgi.png, tails-corgi.png) for icons
- **Algorithm**:
  - Counter increments only when a new result is detected (not on every frame)
  - If NewResult == PreviousResult: Streak + 1
  - If NewResult != PreviousResult: Streak = 1
  - Counter starts at 0 and increments with each flip
- **Result Detection**:
  - Coin result is determined by Y-axis rotation when landing
  - Y rotation near 0 or 2π = heads
  - Y rotation near π = tails
  - Result is detected during landing animation and reported to counter
- **Visual Feedback**: The counter pulses or changes color when a streak > 3.

## 4. User Flow

1. **Idle**: Coin sits in center, face-on to camera. "Swipe Up to Flip" hint (fades out after first use).
2. **Positioning (Optional)**: User can touch and drag to move coin sideways (translate X/Y), but coin does not rotate.
3. **Action**: User swipes thumb upward.
4. **Animation**: Coin receives rotational impulse and spins/flips in 3D space using physics.
5. **Physics Fall**: Coin falls using physics simulation every time, with gravity and ground collision.
6. **Skip Option (Double-Click)**: User can double-click/tap during the flip animation to skip the physics and immediately show the result (for impatient users).
7. **Result**: Coin collides with the floor and settles (or immediately shows result if skipped).
8. **Feedback**:
   - Haptic click.
   - Text: "HEADS" appears.
   - Streak Counter updates.
9. **Auto-Center**: Coin automatically returns to center position after flip animation completes.
10. **Reset**: Coin returns to center position after flip completes.

## 5. Settings Panel (Future Feature)

- **Flip Method Selection**:
  - Toggle between "Swipe Up" and "Flip Button" methods
  - Setting persists across app sessions
  - Default: Swipe Up
- **Swipe Sensitivity**:
  - Adjustable slider/bar for swipe sensitivity
  - Range: Low (harder to trigger) to High (easier to trigger)
  - Default: Medium
  - Affects minimum velocity and distance thresholds for swipe detection
- **Other Settings** (Future):
  - Sound on/off toggle
  - Haptics on/off toggle
  - Theme selection
  - Animation speed preference

## 6. Future Roadmap (Post-MVP)

- **Skins**: Unlockable coins (Bitcoin, Ancient Gold, Poker Chip) based on total flips.
- **Leaderboard**: Global highest streak.
- **Settings Panel**: Full settings UI for all user preferences.
