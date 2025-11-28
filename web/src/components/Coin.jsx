import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CylinderGeometry, MeshStandardMaterial } from 'three'

export default function Coin() {
  const coinRef = useRef()

  // Subtle idle rotation animation
  useFrame((state, delta) => {
    if (coinRef.current) {
      // Gentle rotation on Y-axis for idle animation
      coinRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh
      ref={coinRef}
      position={[0, 2, 0]}
      rotation={[Math.PI / 2, 0, 0]} // Rotate to lay flat (coin orientation)
    >
      {/* CylinderGeometry: radiusTop, radiusBottom, height, radialSegments */}
      <cylinderGeometry args={[1, 1, 0.1, 32]} />
      <meshStandardMaterial 
        color="#d4af37" // Gold color for now
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )
}

