import { useEffect, useState, useRef } from "react";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

const AnimatedGlobe = () => {
  const ref = useRef<THREE.Points>(null);

  // Génération des points simulant des continents
  const particles = useMemo(() => {
    const count = 4000; // Nombre de points
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    let index = 0;
    for (let i = 0; i < count * 2; i++) {
      // Distribution sphérique uniforme
      const y = 1 - (i / (count * 2 - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      // Simulation de continents simple :
      // On utilise des fonctions sinusoïdales combinées pour créer des "zones" denses et des "océans" vides
      const noise = Math.sin(x * 5) * Math.cos(y * 5) + Math.sin(z * 4 + x * 2) * 0.5 + Math.cos(y * 10) * 0.2;

      // Seuil pour décider si c'est la terre ou la mer (on ne garde que les points "terre")
      if (noise > 0.1 && index < count) {
        positions[index * 3] = x * 2.5; // Rayon du globe
        positions[index * 3 + 1] = y * 2.5;
        positions[index * 3 + 2] = z * 2.5;

        // Couleur Tech/Cyan avec variations
        colors[index * 3] = 0.1; // R
        colors[index * 3 + 1] = 0.8; // G
        colors[index * 3 + 2] = 1.0; // B

        index++;
      }
    }

    // On coupe le tableau à la taille réelle des points générés
    return {
      positions: positions.slice(0, index * 3),
      colors: colors.slice(0, index * 3),
    };
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.002; // Rotation lente de la terre
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1; // Légère inclinaison
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 6]}>
      <Points ref={ref} positions={particles.positions} colors={particles.colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {/* Noyau central léger pour donner du volume */}
      <mesh>
        <sphereGeometry args={[2.4, 32, 32]} />
        <meshBasicMaterial color="#001133" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

export default AnimatedGlobe;
