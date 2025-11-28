import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

export default function Coin({ dragData, flickData, onDragComplete, onFlickComplete }) {
  const coinRef = useRef();
  // Rotation around Z-axis (spinning on table)
  const spinVelocityRef = useRef(0);
  // Rotation around X-axis (flipping up/down)
  const flipVelocityRef = useRef(0);

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
      // Convert flick velocity to flip rotation (around X-axis)
      // Flick up = positive rotation, flick down = negative
      const flipImpulse = (flickData.direction === 'up' ? 1 : -1) * flickData.velocity * 0.02;
      flipVelocityRef.current += flipImpulse;
      
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
        coinRef.current.rotation.z += spinVelocityRef.current * delta;
        
        // Damping for spin
        const spinDamping = 0.96;
        spinVelocityRef.current *= Math.pow(spinDamping, delta * 60);
        
        if (Math.abs(spinVelocityRef.current) < 0.01) {
          spinVelocityRef.current = 0;
        }
      }
      
      // Apply flip rotation (X-axis) - flipping up/down
      if (flipVelocityRef.current !== 0) {
        coinRef.current.rotation.x += flipVelocityRef.current * delta;
        
        // Damping for flip
        const flipDamping = 0.97;
        flipVelocityRef.current *= Math.pow(flipDamping, delta * 60);
        
        if (Math.abs(flipVelocityRef.current) < 0.01) {
          flipVelocityRef.current = 0;
        }
      }
    }
  });

  // Coin starts face-on to camera
  return (
    <mesh
      ref={coinRef}
      position={[0, 0, 0]}
      rotation={[Math.PI / 2, 0, 0]} // Start face-on (90° on X-axis)
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
