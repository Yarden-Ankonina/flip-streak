import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

export default function Coin({ swipeData }) {
  const coinRef = useRef();

  // Simple rotation animation when swiped (temporary - will be replaced with physics)
  useEffect(() => {
    if (swipeData) {
      // For now, just rotate the coin as a visual response
      // This will be replaced with physics later
      console.log("Coin received swipe data:", swipeData);
    }
  }, [swipeData]);

  // Temporary: Add a simple rotation animation when swiped
  useFrame((state, delta) => {
    if (coinRef.current && swipeData) {
      // Rotate on Z-axis (flip) based on swipe velocity
      const rotationSpeed = swipeData.velocity * 0.001;
      coinRef.current.rotation.z += rotationSpeed * delta;
    }
  });

  // Coin is positioned at origin, face-on to camera
  // Rotated 90 degrees on X-axis so the circular face is perpendicular to camera
  // This makes it look 2D/flat when viewed from the front
  return (
    <mesh
      ref={coinRef}
      position={[0, 0, 0]}
      rotation={[Math.PI / 2, 0, 0]} // Rotate to face camera (90° on X-axis)
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
  );
}
