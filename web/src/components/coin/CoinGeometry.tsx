import { useRef } from "react";
import * as THREE from "three";

interface CoinGeometryProps {
  radius?: number;
  height?: number;
  radialSegments?: number;
  headsMaterial?: React.ReactNode;
  tailsMaterial?: React.ReactNode;
}

export function CoinGeometry({ 
  radius = 1, 
  height = 0.1, 
  radialSegments = 64,
  headsMaterial,
  tailsMaterial,
}: CoinGeometryProps) {
  // Ensure 1:1 aspect ratio - coin should be perfectly circular
  // Using equal radius for top and bottom to maintain circular shape
  return (
    <>
      {/* Top face (heads) - positioned on top, rotated to face camera */}
      <mesh position={[0, height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow={false} receiveShadow={false}>
        <circleGeometry args={[radius, radialSegments]} />
        {headsMaterial}
      </mesh>
      
      {/* Bottom face (tails) - positioned on bottom, rotated to face away */}
      <mesh position={[0, -height / 2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow={false} receiveShadow={false}>
        <circleGeometry args={[radius, radialSegments]} />
        {tailsMaterial}
      </mesh>
      
      {/* Edge/rim - gives the coin thickness/width, maintains 1:1 ratio */}
      <mesh castShadow={false} receiveShadow={false}>
        <cylinderGeometry args={[radius, radius, height, radialSegments, 1, true]} />
        <meshStandardMaterial
          color="#b8941f"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </>
  );
}

