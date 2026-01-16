import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

const AnimatedGlobe = () => {
  const ref = useRef<THREE.Points>(null);

  // Rétablissement de la structure originale des points
  const particles = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Pour les continents, on utilise une image de map alpha si possible,
    // sinon on simule des clusters de points denses.
    for (let i = 0; i < count; i++) {
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);

      const x = 2.5 * Math.sin(phi) * Math.cos(theta);
      const y = 2.5 * Math.sin(phi) * Math.sin(theta);
      const z = 2.5 * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Logique de couleur originale (Cyan Terminator)
      colors[i * 3] = 0.03; // R
      colors[i * 3 + 1] = 0.9; // G
      colors[i * 3 + 2] = 1.0; // B
    }
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.0015;
      ref.current.rotation.z += 0.0005;
    }
  });

  return (
    <group>
      <Points ref={ref} positions={particles.positions} colors={particles.colors} stride={3}>
        <PointMaterial
          transparent
          vertexColors
          size={0.025}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {/* Halo de protection original */}
      <mesh>
        <sphereGeometry args={[2.51, 32, 32]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.05} wireframe />
      </mesh>
    </group>
  );
};

export default AnimatedGlobe;
