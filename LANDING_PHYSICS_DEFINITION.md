# Landing Physics: Precession & Wobble Definition

## Overview
When a real coin lands, it doesn't immediately flatten. Instead, it goes through a phase where it:
1. **Slows down** (rotation velocity decreases)
2. **Tilts on its edge** (precession - rotating around its edge axis)
3. **Wobbles** (oscillates back and forth)
4. **Settles flat** (final flattening to face-on position)

## Physics Model

### Phase 1: Initial Landing (Current)
- Coin hits ground with some velocity
- Small bounce occurs
- Coin starts to slow down

### Phase 2: Precession (NEW)
**When it happens:**
- Begins when coin's rotation velocity drops below a threshold (e.g., < 0.5 rad/s)
- Occurs BEFORE final flattening
- Coin is still spinning but losing energy

**What happens:**
- Coin tilts onto its edge (X or Z rotation increases)
- Coin rotates around its edge axis (precession motion)
- This creates a "wobbling on edge" effect
- Precession frequency decreases as energy is lost

**Physics Parameters:**
- `PRECESSION_THRESHOLD`: Rotation velocity below which precession starts (e.g., 0.5 rad/s)
- `PRECESSION_AMPLITUDE`: Maximum tilt angle on edge (e.g., 0.3 radians ≈ 17°)
- `PRECESSION_FREQUENCY`: How fast it wobbles (e.g., 2-4 Hz, decreasing over time)
- `PRECESSION_DAMPING`: How quickly precession decays (e.g., 0.95 per frame)

**Visual Effect:**
- Coin appears to "balance on its edge"
- Rotates around the edge axis
- Gradually loses energy and wobble decreases

### Phase 3: Wobble (NEW)
**When it happens:**
- After precession phase, or when coin is close to flat
- Coin is nearly flat but still has small oscillations

**What happens:**
- Coin oscillates back and forth on X and Z axes
- Small amplitude wobble (e.g., ±0.1 radians)
- Wobble frequency: 3-5 Hz
- Wobble amplitude decays exponentially

**Physics Parameters:**
- `WOBBLE_AMPLITUDE`: Maximum wobble angle (e.g., 0.1 radians ≈ 6°)
- `WOBBLE_FREQUENCY`: Oscillation frequency (e.g., 4 Hz)
- `WOBBLE_DAMPING`: Decay rate (e.g., 0.92 per frame)

**Visual Effect:**
- Coin "shimmies" slightly before settling
- Small back-and-forth motion
- Gradually comes to rest

### Phase 4: Final Settling (Current)
- Coin flattens completely (X, Z → 0)
- Shows final result (heads or tails)
- Animation complete

## Implementation Strategy

### State Machine
```
FLIPPING → LANDING_BOUNCE → PRECESSION → WOBBLE → SETTLED
```

### Key Variables Needed
1. `precessionActive`: Boolean flag
2. `precessionAngle`: Current tilt on edge (X or Z rotation)
3. `precessionVelocity`: Angular velocity of precession
4. `wobbleX`, `wobbleZ`: Current wobble offsets
5. `wobbleVelocityX`, `wobbleVelocityZ`: Wobble velocities

### Animation Timeline
```
0.0s - 0.3s: Initial bounce and slowdown
0.3s - 1.0s: Precession phase (coin on edge, rotating)
1.0s - 1.5s: Wobble phase (small oscillations)
1.5s - 2.0s: Final settling (flattening to face-on)
```

### Rotation Behavior
- **During Precession**: 
  - X or Z rotation increases (coin tilts on edge)
  - Y rotation continues but slows down
  - Precession creates rotation around edge axis
  
- **During Wobble**:
  - X and Z oscillate with small amplitude
  - Y rotation is minimal
  - Oscillations decay over time

- **Final Settling**:
  - X and Z → 0 (flat)
  - Y → target (heads or tails)

## Mathematical Model

### Precession
```
precessionAngle(t) = amplitude * sin(frequency * t) * exp(-damping * t)
precessionVelocity(t) = amplitude * frequency * cos(frequency * t) * exp(-damping * t)
```

### Wobble
```
wobbleX(t) = amplitude * sin(frequency * t) * exp(-damping * t)
wobbleZ(t) = amplitude * cos(frequency * t) * exp(-damping * t)
```

### Combined
```
finalRotationX = baseRotationX + precessionAngle + wobbleX
finalRotationZ = wobbleZ
finalRotationY = targetY (heads or tails)
```

## Visual Reference
Think of a coin spinning on a table:
1. It spins fast initially
2. As it slows, it starts to wobble on its edge
3. It rotates around its edge (precession)
4. Wobble decreases
5. Finally settles flat

This creates a more realistic and satisfying landing animation.

