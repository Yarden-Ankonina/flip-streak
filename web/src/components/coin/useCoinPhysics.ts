import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CoinPhysicsState {
  currentPosition: { x: number; y: number; z: number };
  targetPosition: { x: number; y: number; z: number };
  currentRotation: { x: number; y: number; z: number };
  flipVelocity: { x: number; y: number; z: number };
  snapBackVelocity: { x: number; y: number; z: number };
}

interface UseCoinPhysicsProps {
  panData: { deltaX: number; deltaY: number; x: number; y: number } | null;
  flickData: { velocity: number; direction: string; deltaY: number } | null;
  onPanComplete: () => void;
  onFlickComplete: () => void;
  onTouchEnd: (() => void) | null;
  baseRotationX: number;
  groupRef: React.RefObject<THREE.Group>;
}

export function useCoinPhysics({
  panData,
  flickData,
  onPanComplete,
  onFlickComplete,
  onTouchEnd,
  baseRotationX,
  groupRef,
}: UseCoinPhysicsProps) {
  // Current position (translation only, no rotation from panning)
  const currentPositionRef = useRef({ x: 0, y: 0, z: 0 });
  
  // Target position for snap back (always returns to center)
  const targetPositionRef = useRef({ x: 0, y: 0, z: 0 });
  
  // Rotation velocities for flipping (only applied on flick)
  const flipVelocityXRef = useRef(0);
  const flipVelocityYRef = useRef(0);
  const flipVelocityZRef = useRef(0);
  
  // Current rotation (only from flipping, not from panning)
  const currentRotationRef = useRef({ x: 0, y: 0, z: 0 });
  
  // Snap back velocity for position
  const snapBackVelocityRef = useRef({ x: 0, y: 0, z: 0 });
  
  // Track if flip was active in previous frame (for auto-center detection)
  const wasFlippingRef = useRef(false);
  
  // Landing physics
  const gravityRef = useRef(-9.81); // Gravity acceleration
  const verticalVelocityRef = useRef(0); // Vertical (Y) velocity for falling
  const isLandedRef = useRef(false);
  const landingZPosition = -2; // Coin lands at this Z position (back of screen)

  // Apply pan translation (move coin, no rotation)
  useEffect(() => {
    if (panData) {
      console.log('[useCoinPhysics] Pan data received:', panData);
      currentPositionRef.current.x += panData.deltaX;
      currentPositionRef.current.y += panData.deltaY;
      console.log('[useCoinPhysics] Position updated:', currentPositionRef.current);
      
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
      const dz = targetPositionRef.current.z - currentPositionRef.current.z;
      
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance > 0.01) {
        snapBackVelocityRef.current.x = (dx / distance) * snapBackSpeed;
        snapBackVelocityRef.current.y = (dy / distance) * snapBackSpeed;
        snapBackVelocityRef.current.z = (dz / distance) * snapBackSpeed;
      }
    }
  }, [onTouchEnd]);

  // Apply flick impulse (flipping - only this starts the flip animation)
  useEffect(() => {
    if (flickData) {
      console.log('[useCoinPhysics] Flick data received:', flickData);
      // Reduced base impulse for less overall movement
      const baseImpulse = flickData.velocity * 0.04; // Reduced from 0.08
      
      // Focus on Y-axis (up/down flip) - main rotation
      flipVelocityYRef.current += baseImpulse;
      // Reduced Z-axis rotation (spinning)
      flipVelocityZRef.current += baseImpulse * 0.3; // Reduced from 0.6
      // Minimal X-axis rotation (tilt)
      flipVelocityXRef.current += baseImpulse * 0.1; // Reduced from 0.3
      
      // Start falling (gravity) when flip begins
      verticalVelocityRef.current = 0.5; // Initial upward velocity
      isLandedRef.current = false;
      
      console.log('[useCoinPhysics] Flip velocities set:', {
        x: flipVelocityXRef.current,
        y: flipVelocityYRef.current,
        z: flipVelocityZRef.current,
      });
      
      if (onFlickComplete) {
        setTimeout(() => onFlickComplete(), 0);
      }
    }
  }, [flickData, onFlickComplete]);

  // Apply translations and rotations
  useFrame((state, delta) => {
    if (!groupRef.current) {
      console.warn('[useCoinPhysics] useFrame: groupRef.current is null!');
      return;
    }
    
    // Log first few frames
    if (state.clock.elapsedTime < 0.1) {
      console.log('[useCoinPhysics] useFrame running:', {
        elapsedTime: state.clock.elapsedTime,
        delta,
        hasGroup: !!groupRef.current,
      });
    }
    
    // Apply snap back for position (only if not flipping)
    const hasFlipVelocity = Math.abs(flipVelocityXRef.current) > 0.01 || 
                             Math.abs(flipVelocityYRef.current) > 0.01 || 
                             Math.abs(flipVelocityZRef.current) > 0.01;
    
    if (!hasFlipVelocity && (snapBackVelocityRef.current.x !== 0 || 
                             snapBackVelocityRef.current.y !== 0 || 
                             snapBackVelocityRef.current.z !== 0)) {
      // Apply snap back velocity
      currentPositionRef.current.x += snapBackVelocityRef.current.x * delta;
      currentPositionRef.current.y += snapBackVelocityRef.current.y * delta;
      currentPositionRef.current.z += snapBackVelocityRef.current.z * delta;
      
      // Check if we've reached target
      const dx = targetPositionRef.current.x - currentPositionRef.current.x;
      const dy = targetPositionRef.current.y - currentPositionRef.current.y;
      const dz = targetPositionRef.current.z - currentPositionRef.current.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance < 0.05) {
        currentPositionRef.current.x = targetPositionRef.current.x;
        currentPositionRef.current.y = targetPositionRef.current.y;
        currentPositionRef.current.z = targetPositionRef.current.z;
        snapBackVelocityRef.current = { x: 0, y: 0, z: 0 };
      } else {
        const snapDamping = 0.95;
        snapBackVelocityRef.current.x *= Math.pow(snapDamping, delta * 60);
        snapBackVelocityRef.current.y *= Math.pow(snapDamping, delta * 60);
        snapBackVelocityRef.current.z *= Math.pow(snapDamping, delta * 60);
      }
    }
    
    // Apply flip velocities (only active after flick)
    // Heavier damping for more weight feel (higher damping = heavier feel)
    if (flipVelocityXRef.current !== 0) {
      currentRotationRef.current.x += flipVelocityXRef.current * delta;
      const damping = 0.99; // Increased from 0.97 for heavier feel
      flipVelocityXRef.current *= Math.pow(damping, delta * 60);
      if (Math.abs(flipVelocityXRef.current) < 0.01) {
        flipVelocityXRef.current = 0;
      }
    }
    
    if (flipVelocityYRef.current !== 0) {
      currentRotationRef.current.y += flipVelocityYRef.current * delta;
      const damping = 0.995; // Increased from 0.98 for heavier feel
      flipVelocityYRef.current *= Math.pow(damping, delta * 60);
      if (Math.abs(flipVelocityYRef.current) < 0.01) {
        flipVelocityYRef.current = 0;
      }
    }
    
    if (flipVelocityZRef.current !== 0) {
      currentRotationRef.current.z += flipVelocityZRef.current * delta;
      const damping = 0.99; // Increased from 0.96 for heavier feel
      flipVelocityZRef.current *= Math.pow(damping, delta * 60);
      if (Math.abs(flipVelocityZRef.current) < 0.01) {
        flipVelocityZRef.current = 0;
      }
    }
    
    // Check if flip has completed (was flipping, now stopped) and trigger auto-center
    const allVelocitiesZero = Math.abs(flipVelocityXRef.current) < 0.01 && 
                              Math.abs(flipVelocityYRef.current) < 0.01 && 
                              Math.abs(flipVelocityZRef.current) < 0.01;
    
    // If coin has landed, trigger auto-center after a short delay
    if (isLandedRef.current && allVelocitiesZero) {
      // Coin has landed, start auto-center back to center position
      const snapBackSpeed = 2.0;
      const dx = targetPositionRef.current.x - currentPositionRef.current.x;
      const dy = targetPositionRef.current.y - currentPositionRef.current.y;
      const dz = targetPositionRef.current.z - currentPositionRef.current.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance > 0.01) {
        snapBackVelocityRef.current.x = (dx / distance) * snapBackSpeed;
        snapBackVelocityRef.current.y = (dy / distance) * snapBackSpeed;
        snapBackVelocityRef.current.z = (dz / distance) * snapBackSpeed;
      }
      
      // Reset landing state when starting to move back
      if (distance > 0.05) {
        isLandedRef.current = false;
        verticalVelocityRef.current = 0;
      }
    }
    
    // If we were flipping and now all velocities are zero (but not landed yet), flip completed
    if (wasFlippingRef.current && allVelocitiesZero && !isLandedRef.current) {
      // Flip animation completed but coin hasn't landed yet (still falling)
      // Don't auto-center yet, wait for landing
    }
    
    // Update flip state for next frame
    wasFlippingRef.current = hasFlipVelocity;
    
    // Apply landing physics (gravity and falling)
    if (!isLandedRef.current && (hasFlipVelocity || verticalVelocityRef.current !== 0)) {
      // Apply gravity
      verticalVelocityRef.current += gravityRef.current * delta;
      
      // Update Y position (falling)
      currentPositionRef.current.y += verticalVelocityRef.current * delta;
      
      // Move coin back in Z as it falls (toward landing position)
      const zDiff = landingZPosition - currentPositionRef.current.z;
      if (Math.abs(zDiff) > 0.01) {
        currentPositionRef.current.z += zDiff * 0.3 * delta; // Smooth movement toward landing position
      }
      
      // Check if coin has landed (reached ground level)
      const groundLevel = 0; // Ground plane is at y=0
      if (currentPositionRef.current.y <= groundLevel && verticalVelocityRef.current < 0) {
        // Landed!
        currentPositionRef.current.y = groundLevel;
        verticalVelocityRef.current = 0;
        isLandedRef.current = true;
        
        // Stop all flip velocities when landed
        flipVelocityXRef.current = 0;
        flipVelocityYRef.current = 0;
        flipVelocityZRef.current = 0;
        
        // Ensure coin is at landing Z position
        currentPositionRef.current.z = landingZPosition;
        
        console.log('[useCoinPhysics] Coin landed at:', {
          x: currentPositionRef.current.x,
          y: currentPositionRef.current.y,
          z: currentPositionRef.current.z,
        });
      }
    }
    
    // Apply all transformations
    groupRef.current.position.x = currentPositionRef.current.x;
    groupRef.current.position.y = currentPositionRef.current.y;
    groupRef.current.position.z = currentPositionRef.current.z;
    
    // Apply rotations: base X rotation + flip rotations
    groupRef.current.rotation.x = baseRotationX + currentRotationRef.current.x;
    groupRef.current.rotation.y = currentRotationRef.current.y;
    groupRef.current.rotation.z = currentRotationRef.current.z;
  });
}

