import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import headsImg from "../assets/coins/heads.png";
import tailsImg from "../assets/coins/tails.png";
import ridgesImg from "../assets/coins/ridges.png";

export default function Coin({
  panData,
  flickData,
  onPanComplete,
  onFlickComplete,
  onTouchEnd,
}) {
  const coinRef = useRef();
  const groupRef = useRef();

  // Load textures - useTexture works with Suspense
  let headsTexture, tailsTexture, ridgesTexture;
  try {
    [headsTexture, tailsTexture, ridgesTexture] = useTexture([
      headsImg,
      tailsImg,
      ridgesImg,
    ]);
    console.log("Textures loaded:", {
      headsTexture,
      tailsTexture,
      ridgesTexture,
    });
  } catch (error) {
    console.error("Texture loading error:", error);
    // Textures will be null, coin will render with fallback colors
  }

  // Configure textures
  useEffect(() => {
    if (headsTexture && tailsTexture && ridgesTexture) {
      // Set texture properties
      [headsTexture, tailsTexture, ridgesTexture].forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.flipY = false;
      });
    }
  }, [headsTexture, tailsTexture, ridgesTexture]);

  // Base rotation: face-on to camera (90° on X-axis)
  const baseRotationX = Math.PI / 2;

  // Current rotation values (direct rotation for panning)
  const currentRotationRef = useRef({ x: 0, y: 0, z: 0 });

  // Target rotation for snap back (always returns to base)
  const targetRotationRef = useRef({ x: 0, y: 0, z: 0 });

  // Rotation velocities for flipping (only applied on flick)
  const flipVelocityXRef = useRef(0);
  const flipVelocityYRef = useRef(0);
  const flipVelocityZRef = useRef(0);

  // Snap back velocity
  const snapBackVelocityRef = useRef({ x: 0, y: 0, z: 0 });

  // Apply pan rotation (direct rotation, no velocity - Pokemon TCG style)
  useEffect(() => {
    if (panData && !panData.snapBack) {
      // Directly apply rotation deltas (no velocity accumulation)
      // This allows smooth panning/rotation of the coin
      currentRotationRef.current.x += panData.rotationX;
      currentRotationRef.current.y += panData.rotationY;
      currentRotationRef.current.z += panData.rotationZ;

      // Reset snap back when panning
      snapBackVelocityRef.current = { x: 0, y: 0, z: 0 };

      if (onPanComplete) {
        setTimeout(() => onPanComplete(), 0);
      }
    }
  }, [panData, onPanComplete]);

  // Handle touch end - trigger snap back
  useEffect(() => {
    if (onTouchEnd) {
      // When touch ends, start snap back animation
      // Calculate velocity needed to return to base
      const snapBackSpeed = 2.0; // radians per second

      const dx = targetRotationRef.current.x - currentRotationRef.current.x;
      const dy = targetRotationRef.current.y - currentRotationRef.current.y;
      const dz = targetRotationRef.current.z - currentRotationRef.current.z;

      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance > 0.01) {
        // Normalize direction and apply speed
        snapBackVelocityRef.current.x = (dx / distance) * snapBackSpeed;
        snapBackVelocityRef.current.y = (dy / distance) * snapBackSpeed;
        snapBackVelocityRef.current.z = (dz / distance) * snapBackSpeed;
      }
    }
  }, [onTouchEnd]);

  // Apply flick impulse (flipping - only this starts the flip animation)
  useEffect(() => {
    if (flickData) {
      // Convert flick velocity to rotational impulses on all axes
      // This creates a realistic multi-axis flip
      const baseImpulse = flickData.velocity * 0.08;

      // Y-axis: main flip rotation
      flipVelocityYRef.current += baseImpulse;

      // Z-axis: spinning rotation
      flipVelocityZRef.current += baseImpulse * 0.6;

      // X-axis: slight tilt for realism
      flipVelocityXRef.current += baseImpulse * 0.3;

      if (onFlickComplete) {
        setTimeout(() => onFlickComplete(), 0);
      }
    }
  }, [flickData, onFlickComplete]);

  // Apply rotations
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Apply snap back (only if not flipping and not panning)
      const hasFlipVelocity =
        Math.abs(flipVelocityXRef.current) > 0.01 ||
        Math.abs(flipVelocityYRef.current) > 0.01 ||
        Math.abs(flipVelocityZRef.current) > 0.01;

      if (
        !hasFlipVelocity &&
        (snapBackVelocityRef.current.x !== 0 ||
          snapBackVelocityRef.current.y !== 0 ||
          snapBackVelocityRef.current.z !== 0)
      ) {
        // Apply snap back velocity
        currentRotationRef.current.x += snapBackVelocityRef.current.x * delta;
        currentRotationRef.current.y += snapBackVelocityRef.current.y * delta;
        currentRotationRef.current.z += snapBackVelocityRef.current.z * delta;

        // Check if we've reached target (with some damping near the end)
        const dx = targetRotationRef.current.x - currentRotationRef.current.x;
        const dy = targetRotationRef.current.y - currentRotationRef.current.y;
        const dz = targetRotationRef.current.z - currentRotationRef.current.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 0.05) {
          // Close enough, snap to target
          currentRotationRef.current.x = targetRotationRef.current.x;
          currentRotationRef.current.y = targetRotationRef.current.y;
          currentRotationRef.current.z = targetRotationRef.current.z;
          snapBackVelocityRef.current = { x: 0, y: 0, z: 0 };
        } else {
          // Continue moving towards target
          const snapDamping = 0.95;
          snapBackVelocityRef.current.x *= Math.pow(snapDamping, delta * 60);
          snapBackVelocityRef.current.y *= Math.pow(snapDamping, delta * 60);
          snapBackVelocityRef.current.z *= Math.pow(snapDamping, delta * 60);
        }
      }

      // Apply flip velocities (only active after flick)
      if (flipVelocityXRef.current !== 0) {
        currentRotationRef.current.x += flipVelocityXRef.current * delta;

        const damping = 0.97;
        flipVelocityXRef.current *= Math.pow(damping, delta * 60);

        if (Math.abs(flipVelocityXRef.current) < 0.01) {
          flipVelocityXRef.current = 0;
        }
      }

      if (flipVelocityYRef.current !== 0) {
        currentRotationRef.current.y += flipVelocityYRef.current * delta;

        const damping = 0.98;
        flipVelocityYRef.current *= Math.pow(damping, delta * 60);

        if (Math.abs(flipVelocityYRef.current) < 0.01) {
          flipVelocityYRef.current = 0;
        }
      }

      if (flipVelocityZRef.current !== 0) {
        currentRotationRef.current.z += flipVelocityZRef.current * delta;

        const damping = 0.96;
        flipVelocityZRef.current *= Math.pow(damping, delta * 60);

        if (Math.abs(flipVelocityZRef.current) < 0.01) {
          flipVelocityZRef.current = 0;
        }
      }

      // Apply all rotations: base X rotation + current rotations
      groupRef.current.rotation.x =
        baseRotationX + currentRotationRef.current.x;
      groupRef.current.rotation.y = currentRotationRef.current.y;
      groupRef.current.rotation.z = currentRotationRef.current.z;
    }
  });

  // Create geometry with proper UV mapping for different textures
  const radius = 1;
  const height = 0.1;
  const radialSegments = 64;

  // Coin starts face-on to camera
  return (
    <group ref={groupRef} rotation={[baseRotationX, 0, 0]}>
      {/* Top face (heads) */}
      <mesh position={[0, height / 2, 0]} rotation={[0, 0, 0]}>
        <circleGeometry args={[radius, radialSegments]} />
        <meshStandardMaterial
          map={headsTexture || null}
          metalness={0.8}
          roughness={0.2}
          color={headsTexture ? undefined : "#d4af37"}
        />
      </mesh>

      {/* Bottom face (tails) */}
      <mesh position={[0, -height / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <circleGeometry args={[radius, radialSegments]} />
        <meshStandardMaterial
          map={tailsTexture || null}
          metalness={0.8}
          roughness={0.2}
          color={tailsTexture ? undefined : "#d4af37"}
        />
      </mesh>

      {/* Side/Edge (ridges) */}
      <mesh ref={coinRef}>
        <cylinderGeometry
          args={[radius, radius, height, radialSegments, 1, true]}
        />
        <meshStandardMaterial
          map={ridgesTexture || null}
          metalness={0.8}
          roughness={0.2}
          color={ridgesTexture ? undefined : "#b8941f"}
        />
      </mesh>
    </group>
  );
}
