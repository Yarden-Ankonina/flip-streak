import { useRef } from 'react'

export default function Coin() {
  const coinRef = useRef()

  // Coin is positioned on the ground
  // Height is 0.1, so position at y: 0.05 (half height) to rest on ground
  return (
    <mesh
      ref={coinRef}
      position={[0, 0.05, 0]}
      rotation={[0, 0, 0]} // Lying flat on the ground
    >
      {/* CylinderGeometry: radiusTop, radiusBottom, height, radialSegments */}
      {/* Height is 0.1, radius is 1 */}
      <cylinderGeometry args={[1, 1, 0.1, 64]} />
      <meshStandardMaterial 
        color="#d4af37" // Gold color for now
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )
}

