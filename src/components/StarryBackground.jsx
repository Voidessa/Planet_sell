import React, { useEffect, useRef } from 'react';

const StarryBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let stars = [];
    let shootingStars = [];
    let nebulaTime = 0;
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    const initStars = () => {
      stars = [];
      const density = Math.floor((width * height) / 3000);
      for (let i = 0; i < density; i++) {
        // Multi-colored stars: pure white, light gold, soft lavender
        const starColorType = Math.random();
        let color = 'rgba(255, 255, 255, ';
        if (starColorType > 0.85) {
          color = 'rgba(212, 175, 55, '; // Gold stars
        } else if (starColorType > 0.7) {
          color = 'rgba(196, 181, 253, '; // Lavender stars
        }

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.6 + 0.3,
          opacity: Math.random(),
          speed: Math.random() * 0.015 + 0.005,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleFactor: Math.random() > 0.5 ? 1 : -1,
          colorBase: color
        });
      }
    };

    initStars();

    const createShootingStar = () => {
      if (Math.random() > 0.985 && shootingStars.length < 3) {
        shootingStars.push({
          x: Math.random() * width,
          y: Math.random() * (height / 2),
          length: Math.random() * 90 + 40,
          speed: Math.random() * 6 + 4,
          angle: (Math.random() * 15 + 15) * (Math.PI / 180),
          opacity: 1,
          thickness: Math.random() * 1.2 + 0.4,
        });
      }
    };

    const draw = () => {
      // Clear with slight trail for shooting stars
      ctx.fillStyle = 'rgba(3, 2, 10, 0.18)';
      ctx.fillRect(0, 0, width, height);

      nebulaTime += 0.001;

      // 1. Dynamic breathing nebula clouds (luxury gradient layers)
      const neb1X = width * 0.25 + Math.sin(nebulaTime * 0.7) * 80;
      const neb1Y = height * 0.3 + Math.cos(nebulaTime * 0.5) * 80;
      const neb1Grad = ctx.createRadialGradient(
        neb1X, neb1Y, 0,
        neb1X, neb1Y, Math.max(width, height) * 0.55
      );
      neb1Grad.addColorStop(0, 'rgba(88, 28, 135, 0.14)'); // Royal violet
      neb1Grad.addColorStop(0.5, 'rgba(15, 13, 26, 0.04)');
      neb1Grad.addColorStop(1, 'rgba(3, 2, 10, 0)');
      ctx.fillStyle = neb1Grad;
      ctx.fillRect(0, 0, width, height);

      const neb2X = width * 0.75 + Math.cos(nebulaTime * 0.6) * 100;
      const neb2Y = height * 0.75 + Math.sin(nebulaTime * 0.8) * 100;
      const neb2Grad = ctx.createRadialGradient(
        neb2X, neb2Y, 0,
        neb2X, neb2Y, Math.max(width, height) * 0.45
      );
      neb2Grad.addColorStop(0, 'rgba(212, 175, 55, 0.06)'); // Soft gold stardust
      neb2Grad.addColorStop(0.5, 'rgba(3, 2, 10, 0.02)');
      neb2Grad.addColorStop(1, 'rgba(3, 2, 10, 0)');
      ctx.fillStyle = neb2Grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw static background stars
      stars.forEach((star) => {
        star.opacity += star.twinkleSpeed * star.twinkleFactor;
        if (star.opacity > 0.9) {
          star.opacity = 0.9;
          star.twinkleFactor = -1;
        } else if (star.opacity < 0.15) {
          star.opacity = 0.15;
          star.twinkleFactor = 1;
        }

        ctx.fillStyle = `${star.colorBase}${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Slow cosmic drift
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      // 3. Shooting stars
      createShootingStar();
      shootingStars.forEach((s, idx) => {
        ctx.strokeStyle = `rgba(212, 175, 55, ${s.opacity})`; // Glowing gold trajectories
        ctx.lineWidth = s.thickness;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - s.length * Math.cos(s.angle),
          s.y + s.length * Math.sin(s.angle)
        );
        ctx.stroke();

        s.x += s.speed * Math.cos(s.angle);
        s.y += s.speed * Math.sin(s.angle);
        s.opacity -= 0.015;

        if (s.opacity <= 0 || s.x > width || s.y > height) {
          shootingStars.splice(idx, 1);
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -2,
        pointerEvents: 'none',
        background: '#03020a',
      }}
    />
  );
};

export default StarryBackground;
