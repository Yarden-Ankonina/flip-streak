import { useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import headsImg from "../../assets/coins/heads.png";
import tailsImg from "../../assets/coins/tails.png";
import ridgesImg from "../../assets/coins/ridges.png";

interface CoinMaterialsProps {
  onTexturesLoaded?: (textures: {
    heads: THREE.Texture;
    tails: THREE.Texture;
    ridges: THREE.Texture;
  }) => void;
}

export function useCoinMaterials(onTexturesLoaded?: CoinMaterialsProps['onTexturesLoaded']) {
  console.log('[useCoinMaterials] Loading textures');
  const [headsTexture, tailsTexture, ridgesTexture] = useTexture([
    headsImg,
    tailsImg,
    ridgesImg,
  ]);

  useEffect(() => {
    console.log('[useCoinMaterials] Textures loaded:', {
      heads: !!headsTexture,
      tails: !!tailsTexture,
      ridges: !!ridgesTexture,
    });

    if (headsTexture && tailsTexture && ridgesTexture) {
      // Configure texture properties
      [headsTexture, tailsTexture, ridgesTexture].forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.flipY = false;
      });
      console.log('[useCoinMaterials] Textures configured successfully');
      
      if (onTexturesLoaded) {
        onTexturesLoaded({
          heads: headsTexture,
          tails: tailsTexture,
          ridges: ridgesTexture,
        });
      }
    } else {
      console.warn('[useCoinMaterials] Some textures are missing!');
    }
  }, [headsTexture, tailsTexture, ridgesTexture, onTexturesLoaded]);

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

