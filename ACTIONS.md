# FlipStreak Development Actions

This document outlines the actionable steps for building FlipStreak, broken down into specific tasks.

## Phase 2: 3D Coin Implementation

### 2.1 Basic Coin Geometry

- [ ] Create `web/src/components/Coin.jsx` component
- [ ] Set up React Three Fiber Canvas in `web/src/App.jsx`
- [ ] Create CylinderGeometry for coin (radius: 1, height: 0.1)
- [ ] Position coin at center of scene (0, 2, 0) for initial idle state
- [ ] Add basic meshStandardMaterial with default color
- [ ] Test coin renders correctly in browser

### 2.2 PBR Material System

- [ ] Create `web/src/assets/textures/` directory structure
- [ ] Set up texture loader utility (`web/src/utils/textureLoader.js`)
- [ ] Implement texture loading for:
  - [ ] Albedo/Color map
  - [ ] Normal map
  - [ ] Roughness map
  - [ ] Metalness map
- [ ] Apply textures to meshStandardMaterial
- [ ] Test material looks correct with all maps

### 2.3 HDRI Environment Lighting

- [ ] Find/download studio HDRI environment map (.exr or .hdr)
- [ ] Place HDRI in `web/src/assets/environments/`
- [ ] Install `three/examples/jsm/loaders/RGBELoader` or use drei's `<Environment>`
- [ ] Load and apply HDRI to scene using `<Environment>` from @react-three/drei
- [ ] Adjust environment intensity for realistic metal reflections
- [ ] Test coin reflects environment correctly

### 2.4 Coin Component Refinement

- [ ] Create coin state management (idle, flipping, landed)
- [ ] Add rotation animation for idle state (subtle rotation)
- [ ] Implement coin faces (heads/tails) - determine which side is which
- [ ] Add visual distinction between heads and tails sides
- [ ] Test coin appearance from all angles

## Phase 3: Physics & Interaction

### 3.1 Physics World Setup

- [ ] Install and configure @react-three/cannon
- [ ] Create `web/src/components/PhysicsWorld.jsx` wrapper
- [ ] Set up physics world with gravity (0, -9.81, 0)
- [ ] Create ground plane physics body
- [ ] Add coin as physics body (cylinder shape)
- [ ] Test coin falls and collides with ground

### 3.2 Touch & Drag (Panning) - Pokemon TCG Style

- [ ] Implement direct rotation on touch and drag
- [ ] Map finger movement to 3D rotation (all axes: X, Y, Z)
- [ ] Convert screen coordinates to 3D rotation angles
- [ ] Make coin follow finger movement 1:1 (no velocity, direct rotation)
- [ ] Ensure panning does NOT trigger flip animation
- [ ] Test coin can be rotated smoothly in all directions
- [ ] Add haptic feedback on touch start (light vibration)

### 3.3 Flick Up Gesture Detection

- [ ] Detect upward flick gesture (distinguish from drag)
- [ ] Calculate flick velocity and direction
- [ ] Only trigger on upward flicks (not downward or horizontal)
- [ ] Set minimum velocity threshold for flick detection
- [ ] Test flick detection works correctly

### 3.4 Apply Physics Impulse (Flip)

- [ ] Connect flick gesture to coin physics body
- [ ] Convert flick velocity to rotational impulse on multiple axes
- [ ] Apply impulse to coin (Z-axis for spin, Y-axis for flip, X-axis for tilt)
- [ ] Add realistic multi-axis rotation for satisfying flip
- [ ] Test coin flips with different flick speeds
- [ ] Adjust impulse multiplier for satisfying feel
- [ ] Add haptic feedback on flick trigger (heavy vibration)

### 3.4 Ground Collision

- [ ] Ensure ground plane has proper collision detection
- [ ] Add collision event listener to coin
- [ ] Detect when coin lands on ground
- [ ] Stop physics simulation when coin settles
- [ ] Add damping to prevent infinite bouncing
- [ ] Test coin lands and settles properly

### 3.5 Heads/Tails Detection

- [ ] Create `web/src/utils/coinDetection.js` utility
- [ ] Get coin's final rotation (Euler angles) after landing
- [ ] Determine which face is up based on Y-axis rotation
- [ ] Define threshold for heads vs tails (e.g., Y rotation % 360)
- [ ] Store result in state
- [ ] Test detection accuracy with various landing positions

## Phase 4: Haptics & Sound

### 4.1 Capacitor Haptics Integration

- [ ] Create `web/src/utils/haptics.js` utility
- [ ] Check if running on native platform (Capacitor.isNativePlatform())
- [ ] Implement light vibration on touch start
- [ ] Implement heavy vibration on coin landing
- [ ] Add fallback for web (no-op or console log)
- [ ] Test haptics on iOS/Android device

### 4.2 Sound Effects

- [ ] Find/download "clink" sound effect (coin landing)
- [ ] Place sound in `web/src/assets/sounds/`
- [ ] Create `web/src/utils/soundManager.js` utility
- [ ] Use Web Audio API or HTML5 Audio for sound playback
- [ ] Trigger sound on ground collision event
- [ ] Add volume control
- [ ] Test sound plays on landing

## Phase 5: Streak Counter

### 5.1 State Management Setup

- [ ] Create Zustand store (`web/src/store/coinStore.js`)
- [ ] Define state: currentResult, previousResult, streak, totalFlips
- [ ] Create actions: setResult, resetStreak, incrementStreak
- [ ] Implement streak logic:
  - [ ] If newResult === previousResult: increment streak
  - [ ] If newResult !== previousResult: reset streak to 1
- [ ] Test streak logic with mock data

### 5.2 Streak Counter UI

- [ ] Create `web/src/components/StreakCounter.jsx` component
- [ ] Display current streak number prominently
- [ ] Show "Heads x3" or "Tails x5" format
- [ ] Style counter with large, readable font
- [ ] Position counter at top of screen
- [ ] Test counter displays correctly

### 5.3 Result Display

- [ ] Create `web/src/components/ResultDisplay.jsx` component
- [ ] Show "HEADS" or "TAILS" text after coin lands
- [ ] Add fade-in animation
- [ ] Position result text in center/visible area
- [ ] Auto-hide result after 2-3 seconds
- [ ] Test result display appears correctly

### 5.4 Visual Feedback

- [ ] Add pulse animation to streak counter when streak > 3
- [ ] Change counter color when streak > 3 (e.g., gold/yellow)
- [ ] Add scale animation on streak increment
- [ ] Test visual feedback triggers correctly

## Phase 6: Polish & UX

### 6.1 Idle State & Hints

- [ ] Create `web/src/components/Hint.jsx` component
- [ ] Display "Swipe to Flip" text on first load
- [ ] Add fade-out animation after first flip
- [ ] Store "hasFlipped" in localStorage or state
- [ ] Test hint appears and disappears correctly

### 6.2 Coin Idle Animation

- [ ] Add subtle floating animation (Y-axis oscillation)
- [ ] Add gentle rotation animation
- [ ] Ensure animation stops when user interacts
- [ ] Test idle animation looks natural

### 6.3 Transitions & Animations

- [ ] Add smooth transition when coin state changes (idle → flipping → landed)
- [ ] Add fade transitions for UI elements
- [ ] Ensure animations don't block interactions
- [ ] Test all transitions feel smooth

### 6.4 Performance Optimization

- [ ] Optimize 3D rendering for mobile (reduce polygon count if needed)
- [ ] Implement texture compression/optimization
- [ ] Add loading states for assets
- [ ] Test performance on low-end devices
- [ ] Optimize physics simulation (reduce iterations if needed)

### 6.5 Responsive Design

- [ ] Ensure UI works on various screen sizes
- [ ] Test on iOS and Android devices
- [ ] Adjust camera position for different aspect ratios
- [ ] Test landscape and portrait orientations

## Phase 7: Future Features (Post-MVP)

### 7.1 Coin Skins System

- [ ] Create skin data structure (id, name, textures, unlockThreshold)
- [ ] Create `web/src/store/skinStore.js` Zustand store
- [ ] Implement skin selection UI
- [ ] Load different texture sets based on selected skin
- [ ] Test skin switching works

### 7.2 Unlockable Coins

- [ ] Track total flips in store
- [ ] Define unlock thresholds for each skin
- [ ] Create unlock notification system
- [ ] Add "New Skin Unlocked!" celebration
- [ ] Test unlock system triggers correctly

### 7.3 Leaderboard (Future)

- [ ] Set up backend/database for leaderboard
- [ ] Create API endpoints for submitting/retrieving scores
- [ ] Implement leaderboard UI component
- [ ] Add authentication system
- [ ] Test leaderboard functionality

## Testing Checklist

### Functionality Tests

- [ ] Coin flips when swiped
- [ ] Coin lands and settles correctly
- [ ] Heads/tails detection is accurate
- [ ] Streak counter increments correctly
- [ ] Streak resets when result changes
- [ ] Haptics work on mobile devices
- [ ] Sound plays on landing
- [ ] UI updates correctly after each flip

### Performance Tests

- [ ] App runs smoothly at 60fps
- [ ] No memory leaks during extended use
- [ ] Physics simulation doesn't lag
- [ ] Textures load quickly
- [ ] App size is reasonable

### Platform Tests

- [ ] Works on iOS (Safari and native)
- [ ] Works on Android (Chrome and native)
- [ ] Works on desktop browsers
- [ ] Touch gestures work correctly
- [ ] Haptics work on both platforms

## Development Notes

- Always test on actual devices, not just simulators
- Keep physics parameters tweakable (create config file)
- Use environment variables for API keys if needed
- Document any physics tuning values for future reference
- Keep texture sizes optimized for mobile (max 1024x1024 recommended)

## Next Immediate Steps

1. **Start with Phase 2.1**: Create basic Coin component with React Three Fiber
2. **Set up Canvas**: Modify App.jsx to include R3F Canvas
3. **Test rendering**: Ensure coin appears in browser
4. **Iterate**: Move through phases sequentially, testing each step

---

**Last Updated**: Initial creation
**Current Phase**: Ready to begin Phase 2
