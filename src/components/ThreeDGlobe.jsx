import React, { useRef, useEffect, useState } from 'react';

const ThreeDGlobe = ({ bodyId, registry, onSelectCoordinate, selectedCoordinate }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotation = useRef({ yaw: 0, pitch: 0.3 });
  const autoRotate = useRef(true);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [surfaceFeatures, setSurfaceFeatures] = useState([]);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Generate static surface details for rotation when body changes
  useEffect(() => {
    const features = [];
    const count = bodyId === 'stars' ? 180 : 120;
    for (let i = 0; i < count; i++) {
      features.push({
        lat: Math.random() * 160 - 80, // -80 to 80
        lon: Math.random() * 360 - 180, // -180 to 180
        size: Math.random() * (bodyId === 'moon' ? 4.5 : 2.5) + 0.8,
        opacity: Math.random() * 0.35 + 0.1,
        shade: Math.random() > 0.5 ? 'rgba(0,0,0,' : 'rgba(255,255,255,'
      });
    }
    setSurfaceFeatures(features);
  }, [bodyId]);

  const getCellBounds = (row, col) => {
    const rowIdx = rows.indexOf(row);
    const colIdx = col - 1;
    
    const latMin = -60 + rowIdx * 12;
    const latMax = latMin + 12;
    
    const lonMin = -180 + colIdx * 36;
    const lonMax = lonMin + 36;

    return { latMin, latMax, lonMin, lonMax };
  };

  const getCellOwner = (coord) => {
    return registry.find(item => item.bodyId === bodyId && item.coordinate === coord);
  };

  // Color config based on Burgundy/Deep Space accent
  const getBodyTheme = () => {
    switch (bodyId) {
      case 'mars':
        return {
          glowColor: 'rgba(239, 68, 68, 0.4)',
          gridColor: 'rgba(255, 255, 255, 0.22)',
          gradient: ['#3f0712', '#881337', '#e11d48', '#ffe4e6'],
          accent: 'oklch(44% 0.18 20)' // Burgundy
        };
      case 'venus':
        return {
          glowColor: 'rgba(245, 158, 11, 0.4)',
          gridColor: 'rgba(255, 255, 255, 0.22)',
          gradient: ['#451a03', '#9a3412', '#d97706', '#fef3c7'],
          accent: 'oklch(44% 0.18 20)'
        };
      case 'stars':
        return {
          glowColor: 'rgba(139, 92, 246, 0.45)',
          gridColor: 'rgba(255, 255, 255, 0.28)',
          gradient: ['#1e1b4b', '#4c1d95', '#7c3aed', '#c084fc'],
          accent: 'oklch(55% 0.28 300)' // Cosmic purple
        };
      default: // moon
        return {
          glowColor: 'rgba(255, 255, 255, 0.25)',
          gridColor: 'rgba(255, 255, 255, 0.28)',
          gradient: ['#0f172a', '#334155', '#64748b', '#f8fafc'],
          accent: 'oklch(44% 0.18 20)'
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight || 500);

    const radius = Math.min(width, height) * 0.38;
    const cx = width / 2;
    const cy = height / 2;

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight || 500;
      }
    };
    window.addEventListener('resize', handleResize);

    const project = (lat, lon) => {
      const radLat = (lat * Math.PI) / 180;
      const radLon = (lon * Math.PI) / 180;

      let x = radius * Math.cos(radLat) * Math.sin(radLon);
      let y = radius * Math.sin(radLat);
      let z = radius * Math.cos(radLat) * Math.cos(radLon);

      const cosPitch = Math.cos(rotation.current.pitch);
      const sinPitch = Math.sin(rotation.current.pitch);
      let y1 = y * cosPitch - z * sinPitch;
      let z1 = y * sinPitch + z * cosPitch;

      const cosYaw = Math.cos(rotation.current.yaw);
      const sinYaw = Math.sin(rotation.current.yaw);
      let x2 = x * cosYaw + z1 * sinYaw;
      let z2 = -x * sinYaw + z1 * cosYaw;

      return {
        x: cx + x2,
        y: cy - y1,
        z: z2,
        normalX: x2 / radius,
        normalY: y1 / radius,
        normalZ: z2 / radius
      };
    };

    const drawCell = (row, col, fillStyle, strokeStyle, strokeWidth = 1) => {
      const { latMin, latMax, lonMin, lonMax } = getCellBounds(row, col);

      const p1 = project(latMin, lonMin);
      const p2 = project(latMin, lonMax);
      const p3 = project(latMax, lonMax);
      const p4 = project(latMax, lonMin);

      const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
      if (avgZ <= 2) return;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();

      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }
    };

    const drawBeacon = (lat, lon, label) => {
      const base = project(lat, lon);
      if (base.z <= 0) return;

      const beaconHeight = 65;
      const top = {
        x: base.x + base.normalX * beaconHeight,
        y: base.y - base.normalY * beaconHeight
      };

      // Premium burgundy light beam
      const beamGrad = ctx.createLinearGradient(base.x, base.y, top.x, top.y);
      beamGrad.addColorStop(0, 'oklch(44% 0.18 20)'); // Burgundy accent
      beamGrad.addColorStop(0.3, 'rgba(128, 0, 32, 0.4)');
      beamGrad.addColorStop(1, 'rgba(128, 0, 32, 0)');
      
      ctx.beginPath();
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 4;
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();

      const pulse = (Date.now() / 12) % 20;
      ctx.beginPath();
      ctx.arc(base.x, base.y, pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(128, 0, 32, ${1 - pulse / 20})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(top.x, top.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'oklch(44% 0.18 20)';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Burgundy Floating Coordinate tag
      ctx.fillStyle = 'rgba(3, 2, 10, 0.9)';
      ctx.strokeStyle = 'oklch(44% 0.18 20)';
      ctx.lineWidth = 1;
      const labelText = `SECTOR ${label}`;
      const textWidth = ctx.measureText(labelText).width + 20;
      
      ctx.beginPath();
      ctx.roundRect(top.x - textWidth / 2, top.y - 32, textWidth, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'oklch(65% 0.14 20)'; // Soft rose burgundy text
      ctx.font = 'bold 10px Space Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labelText, top.x, top.y - 18);
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (autoRotate.current && !isDragging) {
        rotation.current.yaw += 0.0015;
      }

      const theme = getBodyTheme();

      // 1. Corona
      const corona = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.25);
      corona.addColorStop(0, theme.glowColor);
      corona.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      corona.addColorStop(1, 'rgba(3, 2, 10, 0)');
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 2. Base Sphere render with bright gradients
      const baseGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.15,
        cx,
        cy,
        radius
      );
      baseGrad.addColorStop(0, theme.gradient[3]);
      baseGrad.addColorStop(0.3, theme.gradient[2]);
      baseGrad.addColorStop(0.75, theme.gradient[1]);
      baseGrad.addColorStop(1, theme.gradient[0]);
      
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = baseGrad;
      ctx.fill();

      // 3. Dynamic surface procedural texturing (makes planets look stunningly detailed)
      surfaceFeatures.forEach(feat => {
        const pt = project(feat.lat, feat.lon);
        if (pt.z > 2) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, feat.size * (pt.z / radius), 0, Math.PI * 2);
          ctx.fillStyle = `${feat.shade}${feat.opacity})`;
          ctx.fill();

          if (bodyId === 'moon' && feat.size > 2.5) {
            // Draw rim light highlights for lunar craters
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, feat.size * (pt.z / radius), 0, Math.PI);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
            ctx.stroke();
          }
        }
      });

      // 4. Grid coordinates system (Visually clear boundaries)
      rows.forEach(row => {
        cols.forEach(col => {
          const coord = `${row}-${col}`;
          const isSelected = selectedCoordinate === coord;
          const isHovered = hoveredCell === coord;
          const soldRecord = getCellOwner(coord);

          let fill = 'rgba(255, 255, 255, 0.02)';
          let stroke = theme.gridColor;
          let lineWidth = 0.8;

          if (soldRecord) {
            fill = 'rgba(128, 0, 32, 0.28)'; // Translucent burgundy
            stroke = 'rgba(128, 0, 32, 0.85)'; // Burgundy border
            lineWidth = 1.5;
          }

          if (isHovered) {
            fill = 'rgba(255, 255, 255, 0.15)';
            stroke = '#ffffff';
            lineWidth = 2.0;
          }

          if (isSelected) {
            fill = 'rgba(128, 0, 32, 0.32)';
            stroke = 'oklch(44% 0.18 20)'; // Burgundy select line
            lineWidth = 3.0;
          }

          drawCell(row, col, fill, stroke, lineWidth);
        });
      });

      // 5. Active Golden Coordinate Beacon
      if (selectedCoordinate) {
        const [rowLetter, colStr] = selectedCoordinate.split('-');
        const { latMin, latMax, lonMin, lonMax } = getCellBounds(rowLetter, parseInt(colStr));
        const centerLat = (latMin + latMax) / 2;
        const centerLon = (lonMin + lonMax) / 2;
        drawBeacon(centerLat, centerLon, selectedCoordinate);
      }

      // 6. Spherical shadow (for 3D lit sphere edge)
      const shadowGrad = ctx.createRadialGradient(
        cx - radius * 0.4,
        cy - radius * 0.4,
        radius * 0.85,
        cx,
        cy,
        radius
      );
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(0.85, 'rgba(3, 2, 10, 0.28)');
      shadowGrad.addColorStop(1, 'rgba(3, 2, 10, 0.65)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer gold orbit ring
      ctx.strokeStyle = 'rgba(128, 0, 32, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [bodyId, registry, selectedCoordinate, hoveredCell, surfaceFeatures]);

  // MATHEMATICALLY CORRECT INVERSE ROTATION (Y-Yaw, X-Pitch) to map click precisely to lat/lon bounds
  const getCellFromScreen = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) * 0.38;
    const cx = width / 2;
    const cy = height / 2;

    const dx = clickX - cx;
    const dy = clickY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > radius) return null;

    // Projected coordinates relative to sphere center
    const Xr = dx;
    const Yr = -dy; // Screen Y goes down, Cartesian Y goes up
    const Zr = Math.sqrt(radius * radius - Xr * Xr - Yr * Yr);

    const cosPitch = Math.cos(rotation.current.pitch);
    const sinPitch = Math.sin(rotation.current.pitch);
    const cosYaw = Math.cos(rotation.current.yaw);
    const sinYaw = Math.sin(rotation.current.yaw);

    // 1. Un-rotate Yaw around Y-axis by (-yaw)
    const X1 = Xr * cosYaw - Zr * sinYaw;
    const Y1 = Yr;
    const Z1 = Xr * sinYaw + Zr * cosYaw;

    // 2. Un-rotate Pitch around X-axis by (-pitch)
    const X = X1;
    const Y = Y1 * cosPitch + Z1 * sinPitch;
    const Z = -Y1 * sinPitch + Z1 * cosPitch;

    // Convert cartesian coordinates back to degrees latitude and longitude
    const lat = Math.asin(Y / radius) * (180 / Math.PI);
    const lon = Math.atan2(X, Z) * (180 / Math.PI);

    if (isNaN(lat) || isNaN(lon)) return null;

    let matchedRow = 'E';
    let matchedCol = 5;

    // Match calculated Latitude to row bounds
    for (let r = 0; r < rows.length; r++) {
      const latMin = -60 + r * 12;
      const latMax = latMin + 12;
      if (lat >= latMin && lat <= latMax) {
        matchedRow = rows[r];
        break;
      }
    }

    // Match calculated Longitude to column bounds
    for (let c = 1; c <= 10; c++) {
      const lonMin = -180 + (c - 1) * 36;
      const lonMax = lonMin + 36;
      if (lon >= lonMin && lon <= lonMax) {
        matchedCol = c;
        break;
      }
    }

    return `${matchedRow}-${matchedCol}`;
  };

  const handleCanvasClick = (e) => {
    const matchedCell = getCellFromScreen(e.clientX, e.clientY);
    if (matchedCell) {
      onSelectCoordinate(matchedCell);
    }
  };

  const handleMouseMove = (e) => {
    const matchedCell = getCellFromScreen(e.clientX, e.clientY);
    setHoveredCell(matchedCell);

    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    rotation.current.yaw += dx * 0.005;
    rotation.current.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotation.current.pitch + dy * 0.005));

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    autoRotate.current = false;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      autoRotate.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;

    rotation.current.yaw += dx * 0.007;
    rotation.current.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotation.current.pitch + dy * 0.007));

    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '380px', position: 'relative', cursor: isDragging ? 'grabbing' : 'grab' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
};

export default ThreeDGlobe;
