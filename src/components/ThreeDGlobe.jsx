import React, { useRef, useEffect, useState } from 'react';

const ThreeDGlobe = ({ bodyId, registry, onSelectCoordinate, selectedCoordinate }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotation = useRef({ yaw: 0, pitch: 0.3 }); // yaw is longitude, pitch is latitude
  const autoRotate = useRef(true);
  const hoverCoord = useRef(null);

  // Define some fixed pre-owned coordinates on the sphere
  // Each celestial body gets a specific set of sectors mapped to lat/lon ranges
  const sectors = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Map row/col grid cell to lat/lon bounds
  // Lat: -60 to 60 degrees. Lon: -180 to 180 degrees.
  const getCellBounds = (row, col) => {
    const rowIdx = rows.indexOf(row);
    const colIdx = col - 1;
    
    const latMin = -60 + rowIdx * 12;
    const latMax = latMin + 12;
    
    const lonMin = -180 + colIdx * 36;
    const lonMax = lonMin + 36;

    return { latMin, latMax, lonMin, lonMax };
  };

  // Check if grid cell has been purchased
  const getCellOwner = (coord) => {
    return registry.find(item => item.bodyId === bodyId && item.coordinate === coord);
  };

  // Colors config based on body
  const getBodyTheme = () => {
    switch (bodyId) {
      case 'mars':
        return {
          baseColor: 'rgba(155, 44, 44, 0.85)',
          glowColor: 'rgba(239, 68, 68, 0.45)',
          gridColor: 'rgba(239, 68, 68, 0.15)',
          detailColor: 'rgba(254, 178, 178, 0.3)',
          gradient: ['#6B1D1D', '#9B2C2C', '#C53030']
        };
      case 'venus':
        return {
          baseColor: 'rgba(192, 86, 33, 0.85)',
          glowColor: 'rgba(249, 115, 22, 0.45)',
          gridColor: 'rgba(249, 115, 22, 0.15)',
          detailColor: 'rgba(254, 215, 170, 0.3)',
          gradient: ['#7B341E', '#C05621', '#DD6B20']
        };
      case 'stars':
        return {
          baseColor: 'rgba(40, 20, 95, 0.85)',
          glowColor: 'rgba(139, 92, 246, 0.45)',
          gridColor: 'rgba(139, 92, 246, 0.2)',
          detailColor: 'rgba(233, 213, 255, 0.4)',
          gradient: ['#2E1065', '#5B21B6', '#7C3AED']
        };
      default: // moon
        return {
          baseColor: 'rgba(74, 85, 104, 0.85)',
          glowColor: 'rgba(200, 200, 200, 0.3)',
          gridColor: 'rgba(255, 255, 255, 0.08)',
          detailColor: 'rgba(255, 255, 255, 0.2)',
          gradient: ['#1A202C', '#4A5568', '#718096']
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

    // Handle resize
    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight || 500;
      }
    };
    window.addEventListener('resize', handleResize);

    // 3D Point projection math
    const project = (lat, lon) => {
      // Convert degrees to radians
      const radLat = (lat * Math.PI) / 180;
      const radLon = (lon * Math.PI) / 180;

      // 3D Sphere Coordinates
      let x = radius * Math.cos(radLat) * Math.sin(radLon);
      let y = radius * Math.sin(radLat);
      let z = radius * Math.cos(radLat) * Math.cos(radLon);

      // Rotate around X-axis (Pitch)
      const cosPitch = Math.cos(rotation.current.pitch);
      const sinPitch = Math.sin(rotation.current.pitch);
      let y1 = y * cosPitch - z * sinPitch;
      let z1 = y * sinPitch + z * cosPitch;

      // Rotate around Y-axis (Yaw)
      const cosYaw = Math.cos(rotation.current.yaw);
      const sinYaw = Math.sin(rotation.current.yaw);
      let x2 = x * cosYaw + z1 * sinYaw;
      let z2 = -x * sinYaw + z1 * cosYaw;

      return {
        x: cx + x2,
        y: cy - y1,
        z: z2, // positive is front facing, negative is back facing
        normalX: x2 / radius,
        normalY: y1 / radius,
        normalZ: z2 / radius
      };
    };

    // Draw a grid cell projected on 3D
    const drawCell = (row, col, fillStyle, strokeStyle, strokeWidth = 1) => {
      const { latMin, latMax, lonMin, lonMax } = getCellBounds(row, col);

      // Project corners
      const p1 = project(latMin, lonMin);
      const p2 = project(latMin, lonMax);
      const p3 = project(latMax, lonMax);
      const p4 = project(latMax, lonMin);

      // Only draw if front-facing (average z > 0)
      const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
      if (avgZ <= 5) return; // Hide back-facing coordinates

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

    // Draw golden coordinates beacon
    const drawBeacon = (lat, lon, label) => {
      const base = project(lat, lon);
      if (base.z <= 0) return;

      const beaconHeight = 55;
      const top = {
        x: base.x + base.normalX * beaconHeight,
        y: base.y - base.normalY * beaconHeight
      };

      // Draw light beam
      const beamGrad = ctx.createLinearGradient(base.x, base.y, top.x, top.y);
      beamGrad.addColorStop(0, 'rgba(212, 175, 55, 0.85)'); // Warm gold
      beamGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
      
      ctx.beginPath();
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 3;
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();

      // Pulsing gold rings at base
      const pulseRadius = (Date.now() / 15) % 15;
      ctx.beginPath();
      ctx.arc(base.x, base.y, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(212, 175, 55, ${1 - pulseRadius / 15})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Flare point at top
      ctx.beginPath();
      ctx.arc(top.x, top.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow

      // Draw luxury text tag
      ctx.fillStyle = 'rgba(11, 8, 27, 0.85)';
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 1;
      const textWidth = ctx.measureText(label).width + 16;
      
      ctx.beginPath();
      ctx.roundRect(top.x - textWidth / 2, top.y - 30, textWidth, 20, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d4af37';
      ctx.font = '500 10px Space Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, top.x, top.y - 17);
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Auto-rotation when idle
      if (autoRotate.current && !isDragging) {
        rotation.current.yaw += 0.002;
      }

      const theme = getBodyTheme();

      // 1. Draw outer planetary glow corona (luxury aesthetic)
      const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.15);
      outerGlow.addColorStop(0, theme.glowColor);
      outerGlow.addColorStop(1, 'rgba(3, 2, 10, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw base shaded planetary sphere
      const baseGrad = ctx.createRadialGradient(
        cx - radius * 0.25,
        cy - radius * 0.25,
        radius * 0.15,
        cx,
        cy,
        radius
      );
      baseGrad.addColorStop(0, theme.gradient[2]);
      baseGrad.addColorStop(0.5, theme.gradient[1]);
      baseGrad.addColorStop(1, theme.gradient[0]);
      
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = baseGrad;
      ctx.fill();

      // 3. Draw latitude & longitude lines on the sphere
      ctx.strokeStyle = theme.gridColor;
      ctx.lineWidth = 0.5;

      // Draw latitude circles
      for (let lat = -60; lat <= 60; lat += 20) {
        ctx.beginPath();
        for (let lon = -180; lon <= 180; lon += 5) {
          const pt = project(lat, lon);
          if (pt.z > 0) {
            if (lon === -180) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      // Draw longitude meridians
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        for (let lat = -70; lat <= 70; lat += 5) {
          const pt = project(lat, lon);
          if (pt.z > 0) {
            if (lat === -70) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      // 4. Draw craters (Moon) or landscape highlights
      if (bodyId === 'moon') {
        const craters = [
          { lat: 10, lon: -30, r: 15 },
          { lat: -25, lon: 40, r: 25 },
          { lat: -45, lon: -10, r: 18 },
          { lat: 35, lon: 70, r: 12 },
          { lat: -5, lon: 100, r: 20 },
        ];
        craters.forEach(crater => {
          const pt = project(crater.lat, crater.lon);
          if (pt.z > 5) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, crater.r * (pt.z / radius), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fill();
            ctx.strokeStyle = theme.detailColor;
            ctx.stroke();
          }
        });
      }

      // 5. Draw sectors/plots in registry (Sold = elegant deep violet gradient)
      rows.forEach(row => {
        cols.forEach(col => {
          const coord = `${row}-${col}`;
          const isSelected = selectedCoordinate === coord;
          const soldRecord = getCellOwner(coord);

          if (soldRecord) {
            // Elegant premium violet/pink fill for sold
            drawCell(
              row, 
              col, 
              'rgba(139, 92, 246, 0.28)', // Translucent violet
              'rgba(139, 92, 246, 0.55)', // Violet border
              1.2
            );
          }

          if (isSelected) {
            // Shiny gold coordinates boundary
            drawCell(
              row, 
              col, 
              'rgba(212, 175, 55, 0.3)', // Translucent gold fill
              '#d4af37', // Gold border
              2.5
            );
          }
        });
      });

      // 6. Draw active beacon
      if (selectedCoordinate) {
        const [rowLetter, colStr] = selectedCoordinate.split('-');
        const { latMin, latMax, lonMin, lonMax } = getCellBounds(rowLetter, parseInt(colStr));
        const centerLat = (latMin + latMax) / 2;
        const centerLon = (lonMin + lonMax) / 2;
        drawBeacon(centerLat, centerLon, selectedCoordinate);
      }

      // 7. Draw spherical shading gradient overlay (adds depth)
      const shadowGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.8,
        cx,
        cy,
        radius
      );
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(0.8, 'rgba(3, 2, 10, 0.4)');
      shadowGrad.addColorStop(1, 'rgba(3, 2, 10, 0.95)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer golden thin luxury orbit rings
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
  }, [bodyId, registry, selectedCoordinate]);

  // Click handler to select sector under cursor
  const handleCanvasClick = (e) => {
    // Check if drag was minimal to count as click
    if (autoRotate.current) autoRotate.current = false;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const radius = Math.min(width, height) * 0.38;
    const cx = width / 2;
    const cy = height / 2;

    // Verify click is within spherical disk bounds
    const dx = clickX - cx;
    const dy = clickY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) return;

    // Convert screen coordinates back to rough sphere latitude/longitude
    // Based on orthographic projection inversions
    const x = dx;
    const y = -dy; // Flip Y
    const z = Math.sqrt(radius * radius - x * x - y * y);

    // Apply inverse rotations
    // Rotate Y (Pitch) inverse, then X (Yaw) inverse
    const cosPitch = Math.cos(rotation.current.pitch);
    const sinPitch = Math.sin(rotation.current.pitch);
    const cosYaw = Math.cos(rotation.current.yaw);
    const sinYaw = Math.sin(rotation.current.yaw);

    // Un-rotate Yaw
    const z1 = z * cosYaw - x * sinYaw;
    const x1 = z * sinYaw + x * cosYaw;

    // Un-rotate Pitch
    const ySphere = y * cosPitch + z1 * sinPitch;
    const zSphere = -y * sinPitch + z1 * cosPitch;

    // Convert back to latitude and longitude in degrees
    const lat = Math.asin(ySphere / radius) * (180 / Math.PI);
    const lon = Math.atan2(x1, zSphere) * (180 / Math.PI);

    if (isNaN(lat) || isNaN(lon)) return;

    // Match to closest cell bounds
    let matchedRow = 'E';
    let matchedCol = 5;

    // Find row matching latitude
    for (let r = 0; r < rows.length; r++) {
      const latMin = -60 + r * 12;
      const latMax = latMin + 12;
      if (lat >= latMin && lat <= latMax) {
        matchedRow = rows[r];
        break;
      }
    }

    // Find col matching longitude
    for (let c = 1; c <= 10; c++) {
      const lonMin = -180 + (c - 1) * 36;
      const lonMax = lonMin + 36;
      if (lon >= lonMin && lon <= lonMax) {
        matchedCol = c;
        break;
      }
    }

    const targetCoord = `${matchedRow}-${matchedCol}`;
    onSelectCoordinate(targetCoord);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    autoRotate.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // Adjust sensitivity
    rotation.current.yaw += dx * 0.005;
    // Constrain pitch to avoid flipping upside down
    rotation.current.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotation.current.pitch + dy * 0.005));

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobiles
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
