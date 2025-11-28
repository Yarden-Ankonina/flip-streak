import { useRef, useEffect } from "react";
import * as THREE from "three";
import { CoinGeometry } from "./CoinGeometry";
import { useCoinMaterials } from "./CoinMaterials";
import { useCoinPhysics } from "./useCoinPhysics";

interface CoinProps {
  panData: { deltaX: number; deltaY: number; x: number; y: number } | null;
  flickData: { velocity: number; direction: string; deltaY: number } | null;
  onPanComplete: () => void;
  onFlickComplete: () => void;
  onTouchEnd: (() => void) | null;
}

export default function Coin({ panData, flickData, onPanComplete, onFlickComplete, onTouchEnd }: CoinProps) {
  console.log('[Coin] Component rendering');
  
  const groupRef = useRef<THREE.Group>(null);
  
  // Base rotation: rotate 90° on X-axis to make coin lie flat, showing heads face-on
  // This rotates the coin so the heads side (at y=height/2) faces the camera
  const baseRotationX = Math.PI / 2;
  
  // Load materials (no ridges for now)
  const { headsMaterial, tailsMaterial } = useCoinMaterials();
  
  // Initialize coin to start face-on (heads showing)
  useEffect(() => {
    if (groupRef.current) {
      // Set initial rotation to be face-on (heads showing)
      // baseRotationX = Math.PI / 2 makes the coin lie flat, showing heads
      groupRef.current.rotation.x = baseRotationX;
      groupRef.current.rotation.y = 0;
      groupRef.current.rotation.z = 0;
      groupRef.current.position.set(0, 0, 0);
      
      console.log('[Coin] Group ref initialized - showing heads:', {
        position: groupRef.current.position,
        rotation: {
          x: groupRef.current.rotation.x,
          y: groupRef.current.rotation.y,
          z: groupRef.current.rotation.z,
        },
        baseRotationX,
      });
    }
  }, [baseRotationX]);

  // Use physics hook
  useCoinPhysics({
    panData,
    flickData,
    onPanComplete,
    onFlickComplete,
    onTouchEnd,
    baseRotationX,
    groupRef,
  });

  console.log('[Coin] Rendering coin geometry');
  return (
    <group ref={groupRef} rotation={[baseRotationX, 0, 0]}>
      <CoinGeometry
        headsMaterial={headsMaterial}
        tailsMaterial={tailsMaterial}
      />
    </group>
  );
}

