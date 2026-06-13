import React, { useMemo, useRef, useEffect, useState } from 'react';
import { X, Award, MousePointer2 } from 'lucide-react';

const bodyImages = {
  moon: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Solarsystemscope_texture_8k_moon.jpg',
  mars: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Solarsystemscope_texture_8k_mars.jpg',
  venus: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Solarsystemscope_texture_8k_venus_surface.jpg',
  stars: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Solarsystemscope_texture_8k_stars_milky_way.jpg'
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

const getSelectedCellCoords = (centerCoord, numAcres, totalRows = 26, totalCols = 72) => {
  if (!centerCoord) return [];
  const parts = centerCoord.split('-');
  if (parts.length !== 2) return [centerCoord];
  const rCode = parts[0];
  const colVal = parseInt(parts[1]);
  if (isNaN(colVal)) return [centerCoord];

  let rowIdx = 0;
  if (rCode.length === 1) {
    rowIdx = rCode.charCodeAt(0) - 65;
  } else if (rCode.length === 2) {
    rowIdx = 26 + rCode.charCodeAt(1) - 65;
  }
  const colIdx = colVal - 1;

  let w = 1, h = 1;
  if (numAcres === 1) { w = 1; h = 1; }
  else if (numAcres === 2) { w = 2; h = 1; }
  else if (numAcres === 4) { w = 2; h = 2; }
  else if (numAcres === 6) { w = 3; h = 2; }
  else if (numAcres === 8) { w = 4; h = 2; }
  else if (numAcres === 12) { w = 4; h = 3; }

  const getRowCode = (index) => {
    if (index < 26) return String.fromCharCode(65 + index);
    return 'A' + String.fromCharCode(65 + index - 26);
  };

  const coords = [];
  for (let dr = 0; dr < h; dr++) {
    for (let dc = 0; dc < w; dc++) {
      const r = Math.min(totalRows - 1, rowIdx + dr);
      const c = (colIdx + dc) % totalCols;
      coords.push(`${getRowCode(r)}-${c + 1}`);
    }
  }
  return coords;
};

const getSoldCoords = (registry, bodyId) => {
  const sold = new Set();
  registry.filter(item => item.bodyId === bodyId).forEach(item => {
    let acres = 1;
    if (item.packageName) {
      const match = item.packageName.match(/(\d+)/);
      if (match) {
        acres = parseInt(match[1]);
      }
    }
    const coordsList = getSelectedCellCoords(item.coordinate, acres, 26, 72);
    coordsList.forEach(c => sold.add(c));
  });
  return sold;
};

const TwoDMapViewer = ({ bodyId, registry, selectedCoordinate, selectedPackage, onSelectCoordinate, onClose, children }) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  
  const CELL_SIZE = 80; // Size of each cell in pixels (decreased from 120 to show more sections)
  const TOTAL_ROWS = 26;
  const TOTAL_COLS = 72;
  const MAP_WIDTH = TOTAL_COLS * CELL_SIZE;
  const MAP_HEIGHT = TOTAL_ROWS * CELL_SIZE;

  // Toggle map-open body class for hiding header/navbar
  useEffect(() => {
    document.body.classList.add('twod-map-open');
    return () => document.body.classList.remove('twod-map-open');
  }, []);

  const numAcres = parseInt(selectedPackage || '1') || 1;

  const selectedCoordsList = useMemo(() => {
    return getSelectedCellCoords(selectedCoordinate, numAcres, TOTAL_ROWS, TOTAL_COLS);
  }, [selectedCoordinate, numAcres, TOTAL_ROWS, TOTAL_COLS]);

  const soldCoordsSet = useMemo(() => {
    return getSoldCoords(registry, bodyId);
  }, [registry, bodyId]);

  // Generate all cells
  const cells = useMemo(() => {
    const result = [];
    
    for (let r = 0; r < TOTAL_ROWS; r++) {
      for (let c = 0; c < TOTAL_COLS; c++) {
        const coord = `${getRowCode(r)}-${c + 1}`;
        const isSelected = selectedCoordsList.includes(coord);
        const isSold = soldCoordsSet.has(coord);
        
        result.push({
          id: `${r}-${c}`,
          coord,
          isSelected,
          isSold
        });
      }
    }
    return result;
  }, [selectedCoordsList, soldCoordsSet, TOTAL_ROWS, TOTAL_COLS]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Scroll to selected cell on mount
  useEffect(() => {
    if (scrollRef.current && selectedCoordinate) {
      const { rowIdx, colIdx } = parseCoord(selectedCoordinate);
      // Center the view on the selected cell
      const viewportWidth = scrollRef.current.clientWidth;
      const viewportHeight = scrollRef.current.clientHeight;
      
      const targetX = (colIdx * CELL_SIZE) + (CELL_SIZE / 2) - (viewportWidth / 2);
      const targetY = (rowIdx * CELL_SIZE) + (CELL_SIZE / 2) - (viewportHeight / 2);
      
      scrollRef.current.scrollTo({
        left: targetX,
        top: targetY,
        behavior: 'smooth'
      });
    }
  }, [selectedCoordinate]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setScrollStart({ x: scrollRef.current.scrollLeft, y: scrollRef.current.scrollTop });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent text selection
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    scrollRef.current.scrollLeft = scrollStart.x - dx;
    scrollRef.current.scrollTop = scrollStart.y - dy;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="twod-map-overlay animate-fade-in">
      {/* Header */}
      <div className="twod-map-header">
        <div>
          <h2 className="text-gold" style={{ margin: 0, fontSize: '24px' }}>ДЕТАЛЬНАЯ 2D КАРТА</h2>
          <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MousePointer2 size={14} /> Вы можете перетаскивать карту мышкой (Drag & Drop)
          </p>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          color: 'white',
          cursor: 'pointer',
          padding: '10px 20px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
        >
          <X size={20} />
          ЗАКРЫТЬ КАРТУ
        </button>
      </div>

      {/* Main Content Area (Map + Panel) */}
      <div className="twod-map-body">
        
        {/* Scrollable Viewport */}
        <div 
          ref={scrollRef}
          className="twod-map-viewport"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Massive Map Container */}
          <div style={{
            width: `${MAP_WIDTH}px`,
            height: `${MAP_HEIGHT}px`,
            backgroundImage: `url(${bodyImages[bodyId]})`,
            backgroundSize: '100% 138.46%',
            backgroundPosition: 'center',
            display: 'grid',
            gridTemplateColumns: `repeat(${TOTAL_COLS}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${TOTAL_ROWS}, ${CELL_SIZE}px)`,
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
          }}>
            {cells.map(cell => (
              <div key={cell.id} style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                border: cell.isSelected ? '3px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
                backgroundColor: cell.isSelected ? 'rgba(250, 204, 21, 0.15)' : (cell.isSold ? 'rgba(0,0,0,0.6)' : 'transparent'),
                transition: 'background-color 0.2s, border 0.2s'
              }}
              onClick={() => {
                if (onSelectCoordinate && !isDragging) {
                  onSelectCoordinate(cell.coord);
                }
              }}
              onMouseEnter={(e) => {
                if(!cell.isSelected && !isDragging) {
                  e.currentTarget.style.border = '2px solid white';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if(!cell.isSelected) {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
                  e.currentTarget.style.backgroundColor = cell.isSold ? 'rgba(0,0,0,0.6)' : 'transparent';
                }
              }}
              >
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  background: cell.isSelected ? '#facc15' : 'rgba(0,0,0,0.7)',
                  color: cell.isSelected ? 'black' : 'white',
                  padding: '2px 6px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  userSelect: 'none'
                }}>
                  {cell.coord}
                </div>

                {cell.isSold && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#ef4444'
                  }}>
                    <Award size={24} opacity={0.8} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Sidebar Menu (passed as children) */}
        {children && (
          <div className="twod-map-sidebar">
            {children}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default TwoDMapViewer;
