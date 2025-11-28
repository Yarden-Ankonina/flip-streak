import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Coin from "./components/Coin";
import { useSwipeGesture } from "./hooks/useSwipeGesture";
import "./App.css";

function App() {
  const [swipeData, setSwipeData] = useState(null);

  const handleSwipe = (swipeInfo) => {
    console.log("Swipe detected:", swipeInfo);
    setSwipeData(swipeInfo);
    // TODO: Apply physics impulse to coin
  };

  const swipeHandlers = useSwipeGesture(handleSwipe);

  return (
    <div
      className="app-container"
      {...swipeHandlers}
      style={{ touchAction: "none" }} // Prevent default touch behaviors
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 60 }}
        shadows
        dpr={[1, 2]} // Device pixel ratio for mobile optimization
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.4} />

        {/* Environment for better reflections (will use HDRI later) */}
        <Environment preset="sunset" />

        {/* Ground plane */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* The Coin - only this moves */}
        <Coin swipeData={swipeData} />
      </Canvas>

      {/* Debug info (remove later) */}
      {swipeData && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            color: "white",
            background: "rgba(0,0,0,0.5)",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "12px",
          }}
        >
          Swipe: {swipeData.velocity.toFixed(0)} px/s
        </div>
      )}
    </div>
  );
}

export default App;
