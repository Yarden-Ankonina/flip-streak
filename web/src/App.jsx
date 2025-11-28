import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Coin from "./components/Coin";
import { useSwipeGesture } from "./hooks/useSwipeGesture";
import "./App.css";

function App() {
  const [dragData, setDragData] = useState(null);
  const [flickData, setFlickData] = useState(null);
  const [lastActionTime, setLastActionTime] = useState(null);

  const handleDrag = (dragInfo) => {
    setDragData(dragInfo);
    setLastActionTime(Date.now());
  };

  const handleDragComplete = () => {
    setDragData(null);
  };

  const handleFlick = (flickInfo) => {
    setFlickData(flickInfo);
    setLastActionTime(Date.now());
  };

  const handleFlickComplete = () => {
    setFlickData(null);
  };

  const swipeHandlers = useSwipeGesture(handleDrag, handleFlick);

  return (
    <div
      className="app-container"
      {...swipeHandlers}
      style={{ touchAction: "none" }}
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
        <Coin
          dragData={dragData}
          flickData={flickData}
          onDragComplete={handleDragComplete}
          onFlickComplete={handleFlickComplete}
        />
      </Canvas>

      {/* Debug info */}
      {lastActionTime && (
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
            zIndex: 1000,
          }}
        >
          {flickData && (
            <>
              Flick: {flickData.direction} ({flickData.velocity.toFixed(0)}{" "}
              px/s)
              <br />
            </>
          )}
          {dragData && (
            <>
              Drag: {dragData.deltaAngle.toFixed(3)} rad
              <br />
            </>
          )}
          <small>Drag to spin • Flick up/down to flip</small>
        </div>
      )}
    </div>
  );
}

export default App;
