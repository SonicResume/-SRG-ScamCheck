import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  isAnimating: boolean;
}

const Waveform: React.FC<WaveformProps> = ({ isAnimating }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0369a1'; // Sky / Calm Blue

      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      for (let x = 0; x < width; x += 3) {
        const amplitude = isAnimating ? 20 + Math.random() * 25 : 2;
        const frequency = 0.04;
        const y = mid + Math.sin(x * frequency + offset) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      offset += 0.15;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [isAnimating]);

  return (
    <div className="w-full bg-[#b8cce0] rounded-3xl p-6 border border-[#9cb8cf] shadow-inner">
      <canvas ref={canvasRef} width={600} height={100} className="w-full h-24" />
    </div>
  );
};

export default Waveform;
