import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Coin from "./components/coin/Coin";
import InstallPrompt from "./components/InstallPrompt";
import Header from "./components/Header";
import ResultCounter from "./components/ResultCounter";
import FlipButton from "./components/FlipButton";
import { useSwipeGesture } from "./hooks/useSwipeGesture";
import "./App.css";

// Settings state (will be moved to Zustand store in future)
type FlipMethod = "swipe" | "button";

function App() {
  console.log('[App] Component rendering');
  
  const [panData, setPanData] = useState<{ deltaX: number; deltaY: number; x: number; y: number } | null>(null);
  const [flickData, setFlickData] = useState<{ velocity: number; direction: string; deltaY: number } | null>(null);
  const [lastActionTime, setLastActionTime] = useState<number | null>(null);
  // Initialize with null - will be set when coin lands
  const [coinResult, setCoinResult] = useState<"heads" | "tails" | null>(null);
  // Flip method setting (default to "swipe", can be changed in settings panel in future)
  const [flipMethod, setFlipMethod] = useState<FlipMethod>("swipe");
  const [isFlipping, setIsFlipping] = useState(false);
  
  const handleCoinLand = (result: "heads" | "tails") => {
    console.log('[App] Coin landed with result:', result);
    setCoinResult(result);
  };

  const handlePan = (panInfo: { deltaX: number; deltaY: number; x: number; y: number }) => {
    console.log('[App] handlePan called:', panInfo);
    setPanData(panInfo);
    setLastActionTime(Date.now());
  };

  const handlePanComplete = () => {
    console.log('[App] handlePanComplete called');
    setPanData(null);
  };

  const handleFlick = (flickInfo: { velocity: number; direction: string; deltaY: number }) => {
    if (isFlipping) return; // Prevent multiple flips
    console.log('[App] handleFlick called:', flickInfo);
    setIsFlipping(true);
    setFlickData(flickInfo);
    setLastActionTime(Date.now());
  };
  
  const handleButtonFlip = () => {
    if (isFlipping) return; // Prevent multiple flips
    console.log('[App] handleButtonFlip called');
    setIsFlipping(true);
    // Simulate a medium-velocity flick for button press
    setFlickData({ velocity: 500, direction: "up", deltaY: -100 });
    setLastActionTime(Date.now());
  };

  const handleFlickComplete = () => {
    console.log('[App] handleFlickComplete called');
    setFlickData(null);
    // Reset flipping state after a delay to allow animation to complete
    setTimeout(() => {
      setIsFlipping(false);
    }, 2100); // Slightly longer than flip duration
  };

  const handleTouchEnd = () => {
    console.log('[App] handleTouchEnd called');
    // Trigger snap back to center in coin component
    setPanData({ deltaX: 0, deltaY: 0, x: 0, y: 0, snapBack: true } as any);
  };

  console.log('[App] Setting up swipe gesture hook');
  const { containerRef, onMouseDown, onMouseUp, onMouseMove } = useSwipeGesture(
    handlePan,
    handleFlick,
    handleTouchEnd
  );
  console.log('[App] Swipe gesture hook initialized:', { 
    hasContainerRef: !!containerRef.current,
    hasMouseHandlers: !!(onMouseDown && onMouseUp && onMouseMove)
  });

  return (
      <div
        ref={containerRef}
        className="app-container"
        onMouseDown={flipMethod === "swipe" ? onMouseDown : undefined}
        onMouseUp={flipMethod === "swipe" ? onMouseUp : undefined}
        onMouseMove={flipMethod === "swipe" ? onMouseMove : undefined}
        style={{ touchAction: flipMethod === "swipe" ? "none" : "auto" }}
      >
      <Header />
      <Canvas
        camera={{ position: [0, 0, 4], fov: 60 }}
        shadows
        dpr={[1, 2]} // Device pixel ratio for mobile optimization
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        onCreated={(state) => {
          console.log('[App] Canvas created:', {
            camera: state.camera.position,
            scene: state.scene.children.length,
          });
        }}
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
        <Suspense fallback={
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[1, 1, 0.1, 64]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        }>
          <Coin
            panData={panData}
            flickData={flickData}
            onPanComplete={handlePanComplete}
            onFlickComplete={handleFlickComplete}
            onTouchEnd={panData && 'snapBack' in panData ? handleTouchEnd : null}
            onLand={handleCoinLand}
          />
        </Suspense>
      </Canvas>

      {/* Debug info */}
      {lastActionTime && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
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
          {panData && (
            <>
              Pan: X:{panData.deltaX.toFixed(3)} Y:{panData.deltaY.toFixed(3)}
              <br />
            </>
          )}
          <small>Touch & drag to move • Swipe up to flip</small>
        </div>
      )}

      {/* PWA Install Prompt - hidden for now */}
      {/* <InstallPrompt /> */}
      
      {/* Flip Button - shown when flipMethod is "button" */}
      {flipMethod === "button" && (
        <FlipButton onClick={handleButtonFlip} disabled={isFlipping} />
      )}
      
      {/* Result Counter */}
      <ResultCounter result={coinResult} />
    </div>
  );
}

export default App;

