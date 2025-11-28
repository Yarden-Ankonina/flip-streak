import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import Coin from './components/Coin'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Canvas
        camera={{ position: [0, 3, 5], fov: 50 }}
        shadows
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />
        
        {/* Environment for better reflections (will use HDRI later) */}
        <Environment preset="sunset" />
        
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        
        {/* The Coin */}
        <Coin />
        
        {/* Camera controls for testing (remove in production) */}
        <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
      </Canvas>
    </div>
  )
}

export default App
