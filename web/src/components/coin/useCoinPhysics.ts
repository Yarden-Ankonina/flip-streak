import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface UseCoinPhysicsProps {
  panData: { deltaX: number; deltaY: number; x: number; y: number } | null;
  flickData: { velocity: number; direction: string; deltaY: number } | null;
  onPanComplete: () => void;
  onFlickComplete: () => void;
  onTouchEnd: (() => void) | null;
  baseRotationX: number;
  groupRef: React.RefObject<THREE.Group | null>;
  onLand?: (result: "heads" | "tails") => void;
}

interface FlipAnimationState {
  isActive: boolean;
  startTime: number;
  duration: number;
  startRotation: { x: number; y: number; z: number };
  startPosition: { x: number; y: number; z: number };
  startScale: number;
  targetRotationX: number; // Multiple of π
  targetRotationY: number; // 0 for heads, π for tails
  targetRotationZ: number; // Always 0
  result: "heads" | "tails" | null;
}

export function useCoinPhysics({
  panData,
  flickData,
  onPanComplete,
  onFlickComplete,
  onTouchEnd,
  baseRotationX,
  groupRef,
  onLand,
}: UseCoinPhysicsProps) {
  // Current position (translation only, no rotation from panning)
  const currentPositionRef = useRef({ x: 0, y: 0, z: 0 });

  // Target position for snap back (always returns to center)
  const targetPositionRef = useRef({ x: 0, y: 0, z: 0 });

  // Current rotation (only from flipping, not from panning)
  const currentRotationRef = useRef({ x: 0, y: 0, z: 0 });

  // Snap back velocity for position
  const snapBackVelocityRef = useRef({ x: 0, y: 0, z: 0 });

  // Flip animation state
  const flipAnimationRef = useRef<FlipAnimationState>({
    isActive: false,
    startTime: 0,
    duration: 2.0, // 2 seconds flip duration
    startRotation: { x: 0, y: 0, z: 0 },
    startPosition: { x: 0, y: 0, z: 0 },
    startScale: 1.0,
    targetRotationX: 0,
    targetRotationY: 0,
    targetRotationZ: 0,
    result: null,
  });

  // Scale ref for parabolic scaling
  const currentScaleRef = useRef(1.0);

  // Drag boundaries - coin cannot be dragged off-screen
  const DRAG_BOUNDARY_X = 2.0;
  const DRAG_BOUNDARY_Y = 2.0;

  // Animation constants
  const FLIP_DURATION = 2.0; // seconds
  const MIN_SPINS = 5; // Minimum number of full rotations
  const MAX_SPINS = 10; // Maximum number of full rotations
  const PEAK_SCALE = 0.1; // Scale increase at peak of arc
  const PEAK_HEIGHT = 1.5; // Maximum height during flip

  // Apply pan translation (move coin, no rotation)
  useEffect(() => {
    if (panData) {
      const newX = currentPositionRef.current.x + panData.deltaX;
      const newY = currentPositionRef.current.y + panData.deltaY;

      // Clamp to boundaries
      currentPositionRef.current.x = Math.max(
        -DRAG_BOUNDARY_X,
        Math.min(DRAG_BOUNDARY_X, newX)
      );
      currentPositionRef.current.y = Math.max(
        -DRAG_BOUNDARY_Y,
        Math.min(DRAG_BOUNDARY_Y, newY)
      );

      // Reset snap back when panning
      snapBackVelocityRef.current = { x: 0, y: 0, z: 0 };

      if (onPanComplete) {
        setTimeout(() => onPanComplete(), 0);
      }
    }
  }, [panData, onPanComplete]);

  // Handle touch end - trigger snap back to center
  useEffect(() => {
    if (onTouchEnd) {
      const snapBackSpeed = 2.0;

      const dx = targetPositionRef.current.x - currentPositionRef.current.x;
      const dy = targetPositionRef.current.y - currentPositionRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.01) {
        snapBackVelocityRef.current.x = (dx / distance) * snapBackSpeed;
        snapBackVelocityRef.current.y = (dy / distance) * snapBackSpeed;
        snapBackVelocityRef.current.z = 0;
      }
    }
  }, [onTouchEnd]);

  // Apply flick impulse (flipping - starts the flip animation)
  useEffect(() => {
    if (flickData && !flipAnimationRef.current.isActive) {
      // Determine outcome (50/50 chance)
      const outcome: "heads" | "tails" =
        Math.random() < 0.5 ? "heads" : "tails";

      // Get current rotation from the mesh (CUMULATIVE - additive approach)
      if (groupRef.current) {
        const currentX = currentRotationRef.current.x;
        const currentY = currentRotationRef.current.y;
        const currentZ = currentRotationRef.current.z;

        // Calculate number of spins (random between MIN and MAX)
        const numSpins = MIN_SPINS + Math.random() * (MAX_SPINS - MIN_SPINS);

        // FLAT FLOOR CONSTRAINT: Target X rotation must be multiple of π
        // Add extra spins to current rotation (ADDITIVE)
        const extraSpinsX = numSpins * Math.PI * 2;
        const targetX = currentX + extraSpinsX;
        // Normalize to nearest multiple of π
        const normalizedX = Math.round(targetX / Math.PI) * Math.PI;

        // FLAT FLOOR CONSTRAINT: Target Y rotation
        // 0 for heads, π for tails (ADDITIVE from current)
        // Normalize to 0 or π
        const normalizedY = outcome === "heads" ? 0 : Math.PI;

        // Store animation state
        flipAnimationRef.current = {
          isActive: true,
          startTime: 0, // Will be set in useFrame
          duration: FLIP_DURATION,
          startRotation: { x: currentX, y: currentY, z: currentZ },
          startPosition: {
            x: currentPositionRef.current.x,
            y: currentPositionRef.current.y,
            z: currentPositionRef.current.z,
          },
          startScale: currentScaleRef.current,
          targetRotationX: normalizedX,
          targetRotationY: normalizedY,
          targetRotationZ: 0,
          result: outcome,
        };

        console.log("[useCoinPhysics] Flip animation started:", {
          startRotation: flipAnimationRef.current.startRotation,
          targetRotation: {
            x: normalizedX,
            y: normalizedY,
            z: 0,
          },
          outcome,
        });
      }

      if (onFlickComplete) {
        setTimeout(() => onFlickComplete(), 0);
      }
    }
  }, [flickData, onFlickComplete, groupRef]);

  // Easing function for smooth animation
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Apply translations and rotations
  useFrame((state, delta) => {
    if (!groupRef.current) {
      return;
    }

    // Initialize flip animation start time
    if (
      flipAnimationRef.current.isActive &&
      flipAnimationRef.current.startTime === 0
    ) {
      flipAnimationRef.current.startTime = state.clock.elapsedTime;
    }

    // Handle flip animation
    if (flipAnimationRef.current.isActive) {
      const elapsed =
        state.clock.elapsedTime - flipAnimationRef.current.startTime;
      const progress = Math.min(elapsed / flipAnimationRef.current.duration, 1);
      const easedProgress = easeInOutCubic(progress);

      // PARABOLIC ARC: Continuous curve for Y position and Scale
      // Using sine wave: f(0) = 0, f(0.5) = peak, f(1) = 0
      const sineProgress = Math.sin(progress * Math.PI);

      // Y Position: Parabolic arc (starts at 0, peaks in middle, ends at 0)
      const yPosition = PEAK_HEIGHT * sineProgress;
      currentPositionRef.current.y =
        flipAnimationRef.current.startPosition.y + yPosition;

      // Scale: Parabolic arc (starts at 1, peaks in middle, ends at 1)
      const scale =
        flipAnimationRef.current.startScale + PEAK_SCALE * sineProgress;
      currentScaleRef.current = scale;

      // Rotation: Interpolate from start to target (ADDITIVE)
      const startRot = flipAnimationRef.current.startRotation;
      const targetRot = {
        x: flipAnimationRef.current.targetRotationX,
        y: flipAnimationRef.current.targetRotationY,
        z: flipAnimationRef.current.targetRotationZ,
      };

      // Linear interpolation for rotation
      currentRotationRef.current.x =
        startRot.x + (targetRot.x - startRot.x) * easedProgress;
      currentRotationRef.current.y =
        startRot.y + (targetRot.y - startRot.y) * easedProgress;
      currentRotationRef.current.z =
        startRot.z + (targetRot.z - startRot.z) * easedProgress;

      // X and Z positions stay constant during flip (no zoom)
      currentPositionRef.current.x = flipAnimationRef.current.startPosition.x;
      currentPositionRef.current.z = flipAnimationRef.current.startPosition.z;

      // Check if animation is complete
      if (progress >= 1) {
        console.log("[useCoinPhysics] Flip animation complete");

        // FLAT FLOOR CONSTRAINT: Ensure final rotations are exact
        currentRotationRef.current.x = targetRot.x;
        currentRotationRef.current.y = targetRot.y;
        currentRotationRef.current.z = 0;
        currentScaleRef.current = 1.0;
        currentPositionRef.current.y = flipAnimationRef.current.startPosition.y;

        // Report result
        if (onLand && flipAnimationRef.current.result) {
          onLand(flipAnimationRef.current.result);
        }

        // Reset animation state
        flipAnimationRef.current.isActive = false;
        flipAnimationRef.current.startTime = 0;
      }
    } else {
      // Apply snap back for position (only if not flipping)
      if (
        snapBackVelocityRef.current.x !== 0 ||
        snapBackVelocityRef.current.y !== 0 ||
        snapBackVelocityRef.current.z !== 0
      ) {
        // Apply snap back velocity
        currentPositionRef.current.x += snapBackVelocityRef.current.x * delta;
        currentPositionRef.current.y += snapBackVelocityRef.current.y * delta;
        currentPositionRef.current.z = 0; // Keep Z at 0

        // Check if we've reached target
        const dx = targetPositionRef.current.x - currentPositionRef.current.x;
        const dy = targetPositionRef.current.y - currentPositionRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.05) {
          currentPositionRef.current.x = targetPositionRef.current.x;
          currentPositionRef.current.y = targetPositionRef.current.y;
          currentPositionRef.current.z = 0;
          snapBackVelocityRef.current = { x: 0, y: 0, z: 0 };
        } else {
          const snapDamping = 0.95;
          snapBackVelocityRef.current.x *= Math.pow(snapDamping, delta * 60);
          snapBackVelocityRef.current.y *= Math.pow(snapDamping, delta * 60);
          snapBackVelocityRef.current.z = 0;
        }
      }
    }

    // Apply all transformations
    groupRef.current.position.x = currentPositionRef.current.x;
    groupRef.current.position.y = currentPositionRef.current.y;
    groupRef.current.position.z = currentPositionRef.current.z;

    // Apply scale
    groupRef.current.scale.set(
      currentScaleRef.current,
      currentScaleRef.current,
      currentScaleRef.current
    );

    // Apply rotations: base X rotation + flip rotations
    groupRef.current.rotation.x = baseRotationX + currentRotationRef.current.x;
    groupRef.current.rotation.y = currentRotationRef.current.y;
    groupRef.current.rotation.z = currentRotationRef.current.z;
  });
}
