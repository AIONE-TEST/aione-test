import { useEffect, useState, useRef } from "react";

interface AnimatedGlobeProps {
  size?: number;
}

const AnimatedGlobe = ({ size = 100 }: AnimatedGlobeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let currentRotation = 0;

    const drawGlobe = () => {
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size * 0.4;

      // Glow effect
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.3);
      gradient.addColorStop(0, "rgba(6, 182, 212, 0.3)");
      gradient.addColorStop(0.7, "rgba(6, 182, 212, 0.1)");
      gradient.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Globe base
      const globeGradient = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 0, centerX, centerY, radius);
      globeGradient.addColorStop(0, "rgba(6, 182, 212, 0.4)");
      globeGradient.addColorStop(0.5, "rgba(6, 182, 212, 0.2)");
      globeGradient.addColorStop(1, "rgba(0, 17, 51, 0.8)");
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = globeGradient;
      ctx.fill();

      // Globe outline
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Latitude lines
      ctx.strokeStyle = "rgba(6, 182, 212, 0.3)";
      ctx.lineWidth = 0.5;
      for (let i = -2; i <= 2; i++) {
        const y = centerY + (i * radius * 0.35);
        const lineRadius = Math.sqrt(radius * radius - Math.pow(i * radius * 0.35, 2));
        if (!isNaN(lineRadius) && lineRadius > 0) {
          ctx.beginPath();
          ctx.ellipse(centerX, y, lineRadius, lineRadius * 0.2, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Rotating longitude lines
      ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) + currentRotation;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius * Math.abs(Math.cos(angle)), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Dots representing cities/data points
      ctx.fillStyle = "rgba(6, 182, 212, 1)";
      const numDots = 20;
      for (let i = 0; i < numDots; i++) {
        const theta = (i * Math.PI * 2 / numDots) + currentRotation;
        const phi = (i * 0.5) % Math.PI;
        const x = centerX + radius * Math.sin(phi) * Math.cos(theta) * 0.8;
        const y = centerY + radius * Math.cos(phi) * 0.8;
        const dotSize = 1 + Math.sin(theta + currentRotation * 2) * 0.5;
        if (Math.cos(theta) > -0.3) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      currentRotation += 0.005;
      animationId = requestAnimationFrame(drawGlobe);
    };

    drawGlobe();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
    />
  );
};

export default AnimatedGlobe;
