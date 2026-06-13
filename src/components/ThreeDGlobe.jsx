import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

const bodyImages = {
  moon: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Solarsystemscope_texture_8k_moon.jpg',
  mars: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Solarsystemscope_texture_8k_mars.jpg',
  venus: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Solarsystemscope_texture_8k_venus_surface.jpg',
  stars: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Solarsystemscope_texture_8k_stars_milky_way.jpg'
};

const getBodyTheme = (bodyId) => {
  switch (bodyId) {
    case 'mars':
      return {
        glowColor: 'rgba(239, 68, 68, 0.4)',
        gridColor: '#ef4444',
        gridOpacity: 0.22,
        accent: '#ef4444',
      };
    case 'venus':
      return {
        glowColor: 'rgba(245, 158, 11, 0.4)',
        gridColor: '#f59e0b',
        gridOpacity: 0.22,
        accent: '#f59e0b',
      };
    case 'stars':
      return {
        glowColor: 'rgba(139, 92, 246, 0.45)',
        gridColor: '#8b5cf6',
        gridOpacity: 0.28,
        accent: '#8b5cf6',
      };
    default: // moon
      return {
        glowColor: 'rgba(161, 161, 170, 0.2)',
        gridColor: '#ffffff',
        gridOpacity: 0.2,
        accent: '#a1a1aa',
      };
  }
};

const getRowCode = (index) => {
  if (index < 26) return String.fromCharCode(65 + index);
  return 'A' + String.fromCharCode(65 + index - 26);
};

const parseCoord = (coord) => {
  if (!coord) return { rowIdx: null, colIdx: null };
  const [r, cStr] = coord.split('-');
  let rowIdx = 0;
  if (r.length === 1) {
    rowIdx = r.charCodeAt(0) - 65;
  } else if (r.length === 2) {
    rowIdx = 26 + r.charCodeAt(1) - 65;
  }
  const colIdx = parseInt(cStr) - 1;
  return { rowIdx, colIdx };
};

const latLonToVector3 = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
};

const createCellGeometry = (latMin, latMax, lonMin, lonMax, radius) => {
  const geom = new THREE.BufferGeometry();
  const segments = 4;
  const vertices = [];
  const indices = [];

  for (let i = 0; i <= segments; i++) {
    const lat = latMin + (latMax - latMin) * (i / segments);
    for (let j = 0; j <= segments; j++) {
      const lon = lonMin + (lonMax - lonMin) * (j / segments);
      const p = latLonToVector3(lat, lon, radius);
      vertices.push(p.x, p.y, p.z);
    }
  }

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = i * (segments + 1) + j + 1;
      const c = (i + 1) * (segments + 1) + j;
      const d = (i + 1) * (segments + 1) + j + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
};

const GlobeInner = ({ bodyId, registry, onSelectCoordinate, selectedCoordinate }) => {
  const texture = useLoader(THREE.TextureLoader, bodyImages[bodyId] || bodyImages.moon);
  const theme = useMemo(() => getBodyTheme(bodyId), [bodyId]);
  
  const sphereRef = useRef();
  const controlsRef = useRef();
  
  const [hoveredCell, setHoveredCell] = useState(null);
  
  // Grid Lines
  const gridGeo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const radius = 1.002; 
    for (let lat = -90; lat <= 90; lat += 5) {
      for (let lon = -180; lon < 180; lon += 5) {
        const p1 = latLonToVector3(lat, lon, radius);
        const p2 = latLonToVector3(lat, lon + 5, radius);
        vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }
    for (let lon = -180; lon < 180; lon += 5) {
      for (let lat = -90; lat < 90; lat += 5) {
        const p1 = latLonToVector3(lat, lon, radius);
        const p2 = latLonToVector3(lat + 5, lon, radius);
        vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  const handlePointerMove = (e) => {
    e.stopPropagation();
    // Convert world point to local point to account for group rotation
    const localPoint = e.object.worldToLocal(e.point.clone()).normalize();
    const lat = 90 - Math.acos(localPoint.y) * (180 / Math.PI);
    let lon = Math.atan2(localPoint.z, -localPoint.x) * (180 / Math.PI) - 180;
    if (lon < -180) lon += 360; 

    const rowIdx = Math.floor((lat + 90) / 5);
    const colIdx = Math.floor((lon + 180) / 5);

    const r = Math.max(0, Math.min(35, rowIdx));
    const c = Math.max(0, Math.min(71, colIdx));

    const rowCode = getRowCode(r);
    const colCode = c + 1;
    const coord = `${rowCode}-${colCode}`;
    
    if (coord !== hoveredCell) setHoveredCell(coord);
  };
  
  const handleClick = (e) => {
    e.stopPropagation();
    if (hoveredCell) {
      onSelectCoordinate(hoveredCell);
    }
  };

  const renderCellHighlight = (coord, color, opacity, scaleRadius) => {
    const { rowIdx, colIdx } = parseCoord(coord);
    if (rowIdx === null) return null;
    const latMin = -90 + rowIdx * 5;
    const lonMin = -180 + colIdx * 5;
    const geo = createCellGeometry(latMin, latMin + 5, lonMin, lonMin + 5, scaleRadius);
    return (
      <mesh geometry={geo}>
        <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>
    );
  };

  const glowMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, theme.glowColor);
    gradient.addColorStop(0.5, theme.glowColor.replace(/[\d.]+\)$/g, '0.1)'));
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending });
  }, [theme]);

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} />

      <group rotation={[0.3, 0, 0]}>
        <sprite scale={[2.8, 2.8, 1]} material={glowMaterial} />

        <mesh 
          ref={sphereRef} 
          onPointerMove={handlePointerMove} 
          onPointerOut={() => setHoveredCell(null)}
          onClick={handleClick}
        >
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial map={texture} roughness={0.8} metalness={0.1} />
        </mesh>

        <lineSegments geometry={gridGeo}>
          <lineBasicMaterial color={theme.gridColor} transparent opacity={theme.gridOpacity} />
        </lineSegments>

        {registry.filter(r => r.bodyId === bodyId).map(record => (
          <React.Fragment key={record.registryId}>
            {renderCellHighlight(record.coordinate, theme.accent, 0.4, 1.003)}
          </React.Fragment>
        ))}

        {hoveredCell && renderCellHighlight(hoveredCell, '#ffffff', 0.3, 1.004)}

        {selectedCoordinate && renderCellHighlight(selectedCoordinate, theme.accent, 0.6, 1.005)}
        
        {selectedCoordinate && (() => {
          const { rowIdx, colIdx } = parseCoord(selectedCoordinate);
          if (rowIdx === null) return null;
          const latCenter = -90 + rowIdx * 5 + 2.5;
          const lonCenter = -180 + colIdx * 5 + 2.5;
          const pos = latLonToVector3(latCenter, lonCenter, 1.005);
          return (
            <Html position={[pos.x, pos.y, pos.z]} center distanceFactor={2.5}>
              <div style={{
                background: 'rgba(3, 2, 10, 0.9)',
                border: `1px solid ${theme.accent}`,
                padding: '4px 8px',
                borderRadius: '6px',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }}>
                SECTOR {selectedCoordinate}
              </div>
            </Html>
          )
        })()}
      </group>

      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        minDistance={1.05}
        maxDistance={5}
        autoRotate={!hoveredCell}
        autoRotateSpeed={0.5}
        rotateSpeed={0.5}
      />
    </>
  );
};

const ThreeDGlobe = (props) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '380px', position: 'relative', cursor: 'grab' }}>
      <Canvas 
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ touchAction: 'none' }}
      >
        <React.Suspense fallback={null}>
          <GlobeInner {...props} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeDGlobe;
