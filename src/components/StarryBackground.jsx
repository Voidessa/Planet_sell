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
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Handle resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Initialize stars
    const initStars = () => {
      stars = [];
      const density = Math.floor((width * height) / 4000); // Responsive star count
      for (let i = 0; i < density; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.2,
          opacity: Math.random(),
          speed: Math.random() * 0.02 + 0.005,
          twinkleSpeed: Math.random() * 0.03 + 0.005,
          twinkleFactor: Math.random() > 0.5 ? 1 : -1,
        });
      }
    };

    initStars();

    // Create a shooting star
    const createShootingStar = () => {
      if (Math.random() > 0.98 && shootingStars.length < 3) {
        shootingStars.push({
          x: Math.random() * width,
          y: Math.random() * (height / 2),
          length: Math.random() * 80 + 40,
          speed: Math.random() * 8 + 4,
          angle: (Math.random() * 15 + 15) * (Math.PI / 180), // 15-30 degrees
          opacity: 1,
          thickness: Math.random() * 1.5 + 0.5,
        });
      }
    };

    // Animation Loop
    const draw = () => {
      // Clear with very slight alpha for trail effect on shooting stars
      ctx.fillStyle = 'rgba(11, 8, 27, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle nebula glow in corners
      const grad = ctx.createRadialGradient(
        width * 0.2,
        height * 0.2,
        0,
        width * 0.2,
        height * 0.2,
        Math.max(width, height) * 0.6
      );
      grad.addColorStop(0, 'rgba(88, 28, 135, 0.15)'); // deep purple
      grad.addColorStop(0.5, 'rgba(13, 27, 42, 0.05)');
      grad.addColorStop(1, 'rgba(11, 8, 27, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(
        width * 0.8,
        height * 0.8,
        0,
        width * 0.8,
        height * 0.8,
        Math.max(width, height) * 0.5
      );
      grad2.addColorStop(0, 'rgba(6, 182, 212, 0.1)'); // cyan glow
      grad2.addColorStop(0.5, 'rgba(11, 8, 27, 0.02)');
      grad2.addColorStop(1, 'rgba(11, 8, 27, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Draw and update normal stars
      stars.forEach((star) => {
        // Twinkle effect
        star.opacity += star.twinkleSpeed * star.twinkleFactor;
        if (star.opacity > 1) {
          star.opacity = 1;
          star.twinkleFactor = -1;
        } else if (star.opacity < 0.1) {
          star.opacity = 0.1;
          star.twinkleFactor = 1;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Slow drift
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      // Draw and update shooting stars
      createShootingStar();
      shootingStars.forEach((s, idx) => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.lineWidth = s.thickness;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - s.length * Math.cos(s.angle),
          s.y + s.length * Math.sin(s.angle)
        );
        ctx.stroke();

        // Update positions
        s.x += s.speed * Math.cos(s.angle);
        s.y += s.speed * Math.sin(s.angle);
        s.opacity -= 0.015;

        // Clean up finished shooting stars
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
        zIndex: -1,
        pointerEvents: 'none',
        background: '#0b081b',
      }}
    />
  );
};

export default StarryBackground;
