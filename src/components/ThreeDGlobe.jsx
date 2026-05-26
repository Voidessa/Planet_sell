import React, { useRef, useEffect, useState } from 'react';

const ThreeDGlobe = ({ bodyId, registry, onSelectCoordinate, selectedCoordinate }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotation = useRef({ yaw: 0, pitch: 0.3 }); // yaw is longitude, pitch is latitude
  const autoRotate = useRef(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Map grid coordinate (e.g. A-3) to lat/lon degrees
  const getCellBounds = (row, col) => {
    const rowIdx = rows.indexOf(row);
    const colIdx = col - 1;
    
    // Grid maps between -60 to 60 Lat, and -180 to 180 Lon
    const latMin = -60 + rowIdx * 12;
    const latMax = latMin + 12;
    
    const lonMin = -180 + colIdx * 36;
    const lonMax = lonMin + 36;

    return { latMin, latMax, lonMin, lonMax };
  };

  const getCellOwner = (coord) => {
    return registry.find(item => item.bodyId === bodyId && item.coordinate === coord);
  };

  // Luxury Oklch colors and details
  const getBodyTheme = () => {
    switch (bodyId) {
      case 'mars':
        return {
          glowColor: 'rgba(239, 68, 68, 0.35)',
          gridColor: 'rgba(255, 255, 255, 0.12)',
          gradient: ['#1e0505', '#4c0505', '#991b1b', '#ef4444'], // Deep rust to bright red
          halo: 'oklch(62% 0.22 25)'
        };
      case 'venus':
        return {
          glowColor: 'rgba(245, 158, 11, 0.35)',
          gridColor: 'rgba(255, 255, 255, 0.12)',
          gradient: ['#1c0c02', '#451a03', '#9a3412', '#ea580c'], // Amber and gold volcanic shades
          halo: 'oklch(70% 0.18 50)'
        };
      case 'stars':
        return {
          glowColor: 'rgba(139, 92, 246, 0.35)',
          gridColor: 'rgba(255, 255, 255, 0.16)',
          gradient: ['#0f052d', '#1e0a45', '#3b0764', '#6b21a8'], // Deep indigo space void
          halo: 'oklch(60% 0.28 300)'
        };
      default: // moon
        return {
          glowColor: 'rgba(255, 255, 255, 0.22)',
          gridColor: 'rgba(255, 255, 255, 0.14)',
          gradient: ['#090d16', '#1e293b', '#334155', '#cbd5e1'], // Rich slates and bright lunar silver
          halo: 'oklch(80% 0.02 200)'
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

    // 3D Math projections
    const project = (lat, lon) => {
      const radLat = (lat * Math.PI) / 180;
      const radLon = (lon * Math.PI) / 180;

      let x = radius * Math.cos(radLat) * Math.sin(radLon);
      let y = radius * Math.sin(radLat);
      let z = radius * Math.cos(radLat) * Math.cos(radLon);

      // Pitch (X-rotation)
      const cosPitch = Math.cos(rotation.current.pitch);
      const sinPitch = Math.sin(rotation.current.pitch);
      let y1 = y * cosPitch - z * sinPitch;
      let z1 = y * sinPitch + z * cosPitch;

      // Yaw (Y-rotation)
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

    // Draw a coordinate sector mapped in 3D
    const drawCell = (row, col, fillStyle, strokeStyle, strokeWidth = 1) => {
      const { latMin, latMax, lonMin, lonMax } = getCellBounds(row, col);

      const p1 = project(latMin, lonMin);
      const p2 = project(latMin, lonMax);
      const p3 = project(latMax, lonMax);
      const p4 = project(latMax, lonMin);

      // Hide if on back side
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

      const beaconHeight = 60;
      const top = {
        x: base.x + base.normalX * beaconHeight,
        y: base.y - base.normalY * beaconHeight
      };

      // Golden vertical beacon ray
      const beamGrad = ctx.createLinearGradient(base.x, base.y, top.x, top.y);
      beamGrad.addColorStop(0, '#d4af37');
      beamGrad.addColorStop(0.3, 'rgba(212, 175, 55, 0.4)');
      beamGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
      
      ctx.beginPath();
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 4;
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();

      // Pulsing gold beacon base
      const pulse = (Date.now() / 12) % 20;
      ctx.beginPath();
      ctx.arc(base.x, base.y, pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(212, 175, 55, ${1 - pulse / 20})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Top flare spark
      ctx.beginPath();
      ctx.arc(top.x, top.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset canvas shadows

      // Coordinates Floating Card
      ctx.fillStyle = 'rgba(3, 2, 10, 0.9)';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1;
      const labelText = `SECTOR ${label}`;
      const textWidth = ctx.measureText(labelText).width + 20;
      
      ctx.beginPath();
      ctx.roundRect(top.x - textWidth / 2, top.y - 32, textWidth, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d4af37';
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

      // 1. Planetary corona glow
      const corona = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.2);
      corona.addColorStop(0, theme.glowColor);
      corona.addColorStop(0.5, 'rgba(212, 175, 55, 0.03)');
      corona.addColorStop(1, 'rgba(3, 2, 10, 0)');
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. Base Sphere render with deep gradients
      const baseGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      baseGrad.addColorStop(0, theme.gradient[3]);
      baseGrad.addColorStop(0.3, theme.gradient[2]);
      baseGrad.addColorStop(0.7, theme.gradient[1]);
      baseGrad.addColorStop(1, theme.gradient[0]);
      
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = baseGrad;
      ctx.fill();

      // 3. Grid coordinates system (All boundaries drawn clearly as requested!)
      rows.forEach(row => {
        cols.forEach(col => {
          const coord = `${row}-${col}`;
          const isSelected = selectedCoordinate === coord;
          const isHovered = hoveredCell === coord;
          const soldRecord = getCellOwner(coord);

          let fill = 'rgba(255, 255, 255, 0.01)';
          let stroke = theme.gridColor;
          let lineWidth = 0.55;

          if (soldRecord) {
            // Pre-owned sectors: Rose-violet translucent gradient
            fill = 'rgba(139, 92, 246, 0.28)';
            stroke = 'rgba(139, 92, 246, 0.7)'; // Highly visible border
            lineWidth = 1.3;
          }

          if (isHovered) {
            // Hovered sectors: Glowing white border
            fill = 'rgba(255, 255, 255, 0.08)';
            stroke = 'rgba(255, 255, 255, 0.7)';
            lineWidth = 1.6;
          }

          if (isSelected) {
            // Selected sector: Gold border
            fill = 'rgba(212, 175, 55, 0.32)';
            stroke = '#d4af37';
            lineWidth = 2.5;
          }

          // Draw the projected cell boundaries
          drawCell(row, col, fill, stroke, lineWidth);
        });
      });

      // 4. Detailed craters (for Moon only, adds luxury realism)
      if (bodyId === 'moon') {
        const craters = [
          { lat: 15, lon: -40, r: 18 },
          { lat: -30, lon: 35, r: 28 },
          { lat: -50, lon: -15, r: 20 },
          { lat: 40, lon: 65, r: 14 },
          { lat: -10, lon: 110, r: 24 },
        ];
        craters.forEach(cr => {
          const pt = project(cr.lat, cr.lon);
          if (pt.z > 5) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, cr.r * (pt.z / radius), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
            ctx.stroke();
          }
        });
      }

      // 5. Active Golden Coordinate Beacon
      if (selectedCoordinate) {
        const [rowLetter, colStr] = selectedCoordinate.split('-');
        const { latMin, latMax, lonMin, lonMax } = getCellBounds(rowLetter, parseInt(colStr));
        const centerLat = (latMin + latMax) / 2;
        const centerLon = (lonMin + lonMax) / 2;
        drawBeacon(centerLat, centerLon, selectedCoordinate);
      }

      // 6. Deep spherical shadowing (Adds intense 3D realism to sphere edge)
      const shadowGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.75,
        cx,
        cy,
        radius
      );
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(0.75, 'rgba(3, 2, 10, 0.55)');
      shadowGrad.addColorStop(1, 'rgba(3, 2, 10, 0.98)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Golden orbits outline
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
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
  }, [bodyId, registry, selectedCoordinate, hoveredCell]);

  // Translate screen coordinate to globe sector coords
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
    
    // If outside the planet circle, return null
    if (dist > radius) return null;

    const x = dx;
    const y = -dy;
    const z = Math.sqrt(radius * radius - x * x - y * y);

    const cosPitch = Math.cos(rotation.current.pitch);
    const sinPitch = Math.sin(rotation.current.pitch);
    const cosYaw = Math.cos(rotation.current.yaw);
    const sinYaw = Math.sin(rotation.current.yaw);

    const z1 = z * cosYaw - x * sinYaw;
    const x1 = z * sinYaw + x * cosYaw;

    const ySphere = y * cosPitch + z1 * sinPitch;
    const zSphere = -y * sinPitch + z1 * cosPitch;

    const lat = Math.asin(ySphere / radius) * (180 / Math.PI);
    const lon = Math.atan2(x1, zSphere) * (180 / Math.PI);

    if (isNaN(lat) || isNaN(lon)) return null;

    let matchedRow = 'E';
    let matchedCol = 5;

    for (let r = 0; r < rows.length; r++) {
      const latMin = -60 + r * 12;
      const latMax = latMin + 12;
      if (lat >= latMin && lat <= latMax) {
        matchedRow = rows[r];
        break;
      }
    }

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
    // Coordinate Hover highlight tracking
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
