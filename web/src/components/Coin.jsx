import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

export default function Coin({ dragData, flickData, onDragComplete, onFlickComplete }) {
  const coinRef = useRef();
  // Base rotation: face-on to camera (90° on X-axis)
  const baseRotationX = Math.PI / 2;
  
  // Rotation velocities for each axis
  const spinVelocityRef = useRef(0); // Z-axis (spinning)
  const flipVelocityRef = useRef(0); // Y-axis (flipping up/down)
  const tiltVelocityRef = useRef(0); // X-axis (additional tilt)
  
  // Current rotation values (in addition to base)
  const currentRotationRef = useRef({ x: 0, y: 0, z: 0 });

  // Apply drag rotation (spinning)
  useEffect(() => {
    if (dragData) {
      // Convert drag angle to spin velocity
      // The drag gives us deltaAngle, convert to velocity
      const spinImpulse = dragData.deltaAngle * 10; // Scale for feel
      spinVelocityRef.current += spinImpulse;
      
      if (onDragComplete) {
        setTimeout(() => onDragComplete(), 0);
      }
    }
  }, [dragData, onDragComplete]);

  // Apply flick impulse (flipping)
  useEffect(() => {
    if (flickData) {
      // Convert flick velocity to flip rotation (around Y-axis for vertical flip)
      // Flick up = positive rotation, flick down = negative
      // Increased multiplier for more visible flip effect
      const flipImpulse = (flickData.direction === 'up' ? 1 : -1) * flickData.velocity * 0.08;
      flipVelocityRef.current += flipImpulse;
      
      // Also add a slight tilt on X-axis for more dynamic flip
      const tiltImpulse = (flickData.direction === 'up' ? -1 : 1) * flickData.velocity * 0.02;
      tiltVelocityRef.current += tiltImpulse;
      
      if (onFlickComplete) {
        setTimeout(() => onFlickComplete(), 0);
      }
    }
  }, [flickData, onFlickComplete]);

  // Apply rotations with damping
  useFrame((state, delta) => {
    if (coinRef.current) {
      // Apply spin rotation (Z-axis) - spinning on table
      if (spinVelocityRef.current !== 0) {
        currentRotationRef.current.z += spinVelocityRef.current * delta;
        
        // Damping for spin
        const spinDamping = 0.96;
        spinVelocityRef.current *= Math.pow(spinDamping, delta * 60);
        
        if (Math.abs(spinVelocityRef.current) < 0.01) {
          spinVelocityRef.current = 0;
        }
      }
      
      // Apply flip rotation (Y-axis) - flipping up/down
      if (flipVelocityRef.current !== 0) {
        currentRotationRef.current.y += flipVelocityRef.current * delta;
        
        // Damping for flip
        const flipDamping = 0.98;
        flipVelocityRef.current *= Math.pow(flipDamping, delta * 60);
        
        if (Math.abs(flipVelocityRef.current) < 0.01) {
          flipVelocityRef.current = 0;
        }
      }
      
      // Apply tilt rotation (X-axis) - additional tilt during flip
      if (tiltVelocityRef.current !== 0) {
        currentRotationRef.current.x += tiltVelocityRef.current * delta;
        
        // Damping for tilt (stronger damping to return to base)
        const tiltDamping = 0.95;
        tiltVelocityRef.current *= Math.pow(tiltDamping, delta * 60);
        
        if (Math.abs(tiltVelocityRef.current) < 0.01) {
          tiltVelocityRef.current = 0;
        }
        
        // Return X rotation to base over time
        if (Math.abs(currentRotationRef.current.x) > 0.01) {
          currentRotationRef.current.x *= 0.98;
        } else {
          currentRotationRef.current.x = 0;
        }
      }
      
      // Apply all rotations: base X rotation + current rotations
      coinRef.current.rotation.x = baseRotationX + currentRotationRef.current.x;
      coinRef.current.rotation.y = currentRotationRef.current.y;
      coinRef.current.rotation.z = currentRotationRef.current.z;
    }
  });

  // Coin starts face-on to camera
  return (
    <mesh
      ref={coinRef}
      position={[0, 0, 0]}
      rotation={[baseRotationX, 0, 0]} // Start face-on (90° on X-axis)
    >
      <cylinderGeometry args={[1, 1, 0.1, 64]} />
      <meshStandardMaterial
        color="#d4af37"
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}
