import { useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import headsImg from "../../assets/coins/heads-corgi.png";
import tailsImg from "../../assets/coins/tails-corgi.png";

interface CoinMaterialsProps {
  onTexturesLoaded?: (textures: {
    heads: THREE.Texture;
    tails: THREE.Texture;
  }) => void;
}

export function useCoinMaterials(onTexturesLoaded?: CoinMaterialsProps['onTexturesLoaded']) {
  console.log('[useCoinMaterials] Loading textures');
  const [headsTexture, tailsTexture] = useTexture([
    headsImg,
    tailsImg,
  ]);

  useEffect(() => {
    console.log('[useCoinMaterials] Textures loaded:', {
      heads: !!headsTexture,
      tails: !!tailsTexture,
    });

    if (headsTexture && tailsTexture) {
      // Configure texture properties
      [headsTexture, tailsTexture].forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.flipY = false;
      });
      console.log('[useCoinMaterials] Textures configured successfully');
      
      if (onTexturesLoaded) {
        onTexturesLoaded({
          heads: headsTexture,
          tails: tailsTexture,
        });
      }
    } else {
      console.warn('[useCoinMaterials] Some textures are missing!');
    }
  }, [headsTexture, tailsTexture, onTexturesLoaded]);

  return {
    headsMaterial: (
      <meshStandardMaterial
        map={headsTexture}
        metalness={0.8}
        roughness={0.2}
      />
    ),
    tailsMaterial: (
      <meshStandardMaterial
        map={tailsTexture}
        metalness={0.8}
        roughness={0.2}
      />
    ),
  };
}

