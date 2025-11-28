import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

export default function Coin({ panData, flickData, onPanComplete, onFlickComplete }) {
  const coinRef = useRef();
  // Base rotation: face-on to camera (90° on X-axis)
  const baseRotationX = Math.PI / 2;
  
  // Current rotation values (direct rotation for panning)
  const currentRotationRef = useRef({ x: 0, y: 0, z: 0 });
  
  // Rotation velocities for flipping (only applied on flick)
  const flipVelocityXRef = useRef(0);
  const flipVelocityYRef = useRef(0);
  const flipVelocityZRef = useRef(0);

  // Apply pan rotation (direct rotation, no velocity - Pokemon TCG style)
  useEffect(() => {
    if (panData) {
      // Directly apply rotation deltas (no velocity accumulation)
      // This allows smooth panning/rotation of the coin
      currentRotationRef.current.x += panData.rotationX;
      currentRotationRef.current.y += panData.rotationY;
      currentRotationRef.current.z += panData.rotationZ;
      
      if (onPanComplete) {
        setTimeout(() => onPanComplete(), 0);
      }
    }
  }, [panData, onPanComplete]);

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
    if (coinRef.current) {
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
