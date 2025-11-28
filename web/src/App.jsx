import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import Coin from './components/Coin'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Canvas
        camera={{ position: [0, 2, 3], fov: 60 }}
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
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        
        {/* The Coin - only this moves */}
        <Coin />
      </Canvas>
    </div>
  )
}

export default App
