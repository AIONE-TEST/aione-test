import React, { useRef, useEffect } from "react";

interface AnimatedGlobeProps {
  size?: number;
}

const AnimatedGlobe: React.FC<AnimatedGlobeProps> = ({ size = 100 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    const pointCount = 300;

    // Generate sphere points
    const points: { theta: number; phi: number }[] = [];
    for (let i = 0; i < pointCount; i++) {
      points.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.random() * Math.PI,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      // Draw glow background
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
      gradient.addColorStop(0, "rgba(6, 182, 212, 0.15)");
      gradient.addColorStop(0.5, "rgba(6, 182, 212, 0.05)");
      gradient.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw wireframe sphere
      ctx.strokeStyle = "rgba(6, 182, 212, 0.2)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw rotating points
      rotationRef.current += 0.005;

      points.forEach((point) => {
        const rotatedTheta = point.theta + rotationRef.current;
        const x = radius * Math.sin(point.phi) * Math.cos(rotatedTheta);
        const y = radius * Math.sin(point.phi) * Math.sin(rotatedTheta);
        const z = radius * Math.cos(point.phi);

        // Only draw points on the visible side
        if (y > 0) {
          const screenX = centerX + x;
          const screenY = centerY - z;
          const alpha = 0.3 + (y / radius) * 0.7;

          ctx.fillStyle = `rgba(6, 230, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw equator line
      ctx.strokeStyle = "rgba(6, 182, 212, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="pointer-events-none"
      style={{ width: size, height: size }}
    />
  );
};

export default AnimatedGlobe;
