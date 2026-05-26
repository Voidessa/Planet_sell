import React, { useState, useEffect } from 'react';
import { HelpCircle, Globe, Award, Sparkles, MapPin } from 'lucide-react';

const CelestialExplorer = ({ initialBodyId = 'moon', onSelectPlot, registry }) => {
  const [selectedBody, setSelectedBody] = useState(initialBodyId);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState('1'); // '1', '3', '7', '12', '50'

  // Pricing config based on body and package
  const priceConfig = {
    moon: { base: 990, name: 'Луна', desc: 'Участок в Море Спокойствия (Mare Tranquillitatis)' },
    mars: { base: 1490, name: 'Марс', desc: 'Равнина Утопия (Utopia Planitia), вблизи горы Олимп' },
    venus: { base: 1290, name: 'Венера', desc: 'Земля Афродиты (Aphrodite Terra)' },
    stars: { base: 2490, name: 'Звезда', desc: 'Звезда в созвездии Ориона' },
  };

  const packageMultiplier = {
    '1': { mult: 1, discount: 0, label: '1 Акр (Базовый)' },
    '3': { mult: 2.2, discount: 25, label: '3 Акра (Подарочный)' },
    '7': { mult: 4.5, discount: 35, label: '7 Акров (Семейный)' },
    '12': { mult: 6.8, discount: 45, label: '12 Акров (Королевский)' },
    '50': { mult: 22, discount: 55, label: '50 Акров (Имперский)' },
  };

  const getPrice = (body, pkg) => {
    const base = priceConfig[body].base;
    const { mult } = packageMultiplier[pkg];
    return Math.floor(base * mult);
  };

  // Generate grid coordinates for SVG map (10x10 grid)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const cols = Array.from({ length: 10 }, (_, i) => i + 1);

  // Check if a cell is sold
  const getCellStatus = (coord) => {
    const soldPlot = registry.find(
      (item) => item.bodyId === selectedBody && item.coordinate === coord
    );
    return soldPlot ? { status: 'sold', owner: soldPlot.owner, dedication: soldPlot.dedication, date: soldPlot.date } : { status: 'available' };
  };

  // Reset selected cell when switching celestial body
  useEffect(() => {
    setSelectedCell(null);
  }, [selectedBody]);

  const handleCellClick = (coord) => {
    const statusInfo = getCellStatus(coord);
    if (statusInfo.status === 'sold') {
      setSelectedCell({ coord, ...statusInfo });
    } else {
      setSelectedCell({ coord, status: 'available' });
    }
  };

  const handleBuy = () => {
    if (!selectedCell || selectedCell.status === 'sold') return;

    onSelectPlot({
      bodyId: selectedBody,
      bodyName: priceConfig[selectedBody].name,
      coordinate: selectedCell.coord,
      package: selectedPackage,
      packageName: packageMultiplier[selectedPackage].label,
      price: getPrice(selectedBody, selectedPackage),
      description: priceConfig[selectedBody].desc,
    });
  };

  return (
    <div className="explorer-container">
      {/* Sidebar Controls */}
      <div className="explorer-sidebar glass-card animate-fade-in">
        <div className="tab-menu">
          {Object.entries(priceConfig).map(([id, cfg]) => (
            <button
              key={id}
              className={`tab-btn ${selectedBody === id ? 'active-tab' : ''}`}
              onClick={() => setSelectedBody(id)}
            >
              {cfg.name}
            </button>
          ))}
        </div>

        <div className="planet-info-panel">
          <h2 className="planet-title text-neon-cyan">
            {priceConfig[selectedBody].name}
          </h2>
          <p className="planet-desc">{priceConfig[selectedBody].desc}</p>
          
          <hr className="divider" />

          {/* Grid Selection Info / Details */}
          {!selectedCell ? (
            <div className="info-placeholder">
              <Globe className="icon-pulse text-neon-cyan" size={40} />
              <p>Выберите любой сектор на интерактивной координатной карте справа</p>
            </div>
          ) : selectedCell.status === 'sold' ? (
            <div className="owner-detail-card animate-slide-up">
              <div className="status-badge sold-badge">Сектор Продан</div>
              <h3 className="coord-title">{selectedCell.coord}</h3>
              <div className="owner-info">
                <span className="info-label">Владелец:</span>
                <span className="owner-name text-neon-pink">{selectedCell.owner}</span>
              </div>
              <div className="owner-info">
                <span className="info-label">Дата регистрации:</span>
                <span>{selectedCell.date}</span>
              </div>
              {selectedCell.dedication && (
                <div className="dedication-quote">
                  <p className="quote-text">« {selectedCell.dedication} »</p>
                </div>
              )}
              <p className="info-note">Этот участок уже внесен в реестр. Пожалуйста, выберите свободный сектор (выделенный голубым).</p>
            </div>
          ) : (
            <div className="purchase-config-card animate-slide-up">
              <div className="status-badge available-badge">Сектор Свободен</div>
              <h3 className="coord-title text-neon-cyan">{selectedCell.coord}</h3>
              
              <div className="package-selector">
                <label className="info-label">Размер участка:</label>
                <div className="package-grid">
                  {Object.entries(packageMultiplier).map(([pkgId, details]) => (
                    <button
                      key={pkgId}
                      className={`package-btn ${selectedPackage === pkgId ? 'active-pkg' : ''}`}
                      onClick={() => setSelectedPackage(pkgId)}
                    >
                      <span className="pkg-lbl">{pkgId} Акриков</span>
                      {details.discount > 0 && (
                        <span className="pkg-disc">-{details.discount}%</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Стоимость:</span>
                  <span className="price-num text-neon-pink">
                    {getPrice(selectedBody, selectedPackage).toLocaleString()} ₽
                  </span>
                </div>
                <div className="price-sub">
                  <Sparkles size={12} className="text-neon-cyan" />
                  <span>Пожизненный сертификат и 3D-открытка включены</span>
                </div>
              </div>

              <button className="btn btn-primary btn-full btn-glow" onClick={handleBuy}>
                <Award size={18} />
                <span>Оформить подарок</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Map Viewer */}
      <div className="explorer-map-view glass-card animate-fade-in">
        <div className="map-header">
          <div className="map-legend">
            <span className="legend-item"><span className="legend-color avail-color" />Свободно</span>
            <span className="legend-item"><span className="legend-color sold-color" />Продано</span>
            <span className="legend-item"><span className="legend-color selected-color" />Выбрано</span>
          </div>
          <div className="map-title-label">
            <MapPin size={16} className="text-neon-cyan" />
            <span>Секторная Сетка Координат ({priceConfig[selectedBody].name})</span>
          </div>
        </div>

        {/* SVG Grid Map */}
        <div className="svg-map-wrapper">
          <div className="svg-container">
            <svg 
              viewBox="0 0 540 540" 
              className="celestial-svg-grid"
            >
              {/* Background Planet Texture / Glow */}
              <defs>
                <radialGradient id="planetGlow" cx="50%" cy="50%" r="50%">
                  {selectedBody === 'moon' && (
                    <>
                      <stop offset="0%" stopColor="#4A5568" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0B081B" stopOpacity="0.8" />
                    </>
                  )}
                  {selectedBody === 'mars' && (
                    <>
                      <stop offset="0%" stopColor="#9B2C2C" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0B081B" stopOpacity="0.8" />
                    </>
                  )}
                  {selectedBody === 'venus' && (
                    <>
                      <stop offset="0%" stopColor="#C05621" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0B081B" stopOpacity="0.8" />
                    </>
                  )}
                  {selectedBody === 'stars' && (
                    <>
                      <stop offset="0%" stopColor="#B7791F" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0B081B" stopOpacity="0.9" />
                    </>
                  )}
                </radialGradient>
              </defs>

              {/* Central Planet Sphere (Visual background) */}
              <circle cx="270" cy="270" r="230" fill="url(#planetGlow)" />
              {selectedBody === 'stars' ? (
                // Draw some constellations in SVG background
                <g stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3">
                  <line x1="100" y1="100" x2="180" y2="150" />
                  <line x1="180" y1="150" x2="250" y2="130" />
                  <line x1="250" y1="130" x2="320" y2="200" />
                  <line x1="320" y1="200" x2="410" y2="180" />
                  <line x1="270" y1="350" x2="380" y2="400" />
                  <line x1="150" y1="380" x2="200" y2="450" />
                </g>
              ) : (
                // Draw circular craters/seas for planets
                <g fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1">
                  <circle cx="270" cy="270" r="160" />
                  <circle cx="270" cy="270" r="90" />
                  <circle cx="200" cy="200" r="45" fill="rgba(255,255,255,0.02)" />
                  <circle cx="340" cy="320" r="30" fill="rgba(255,255,255,0.01)" />
                  <circle cx="310" cy="180" r="15" fill="rgba(255,255,255,0.015)" />
                </g>
              )}

              {/* Grid cells */}
              {rows.map((row, rIdx) => {
                const y = 40 + rIdx * 46;
                return cols.map((col, cIdx) => {
                  const x = 40 + cIdx * 46;
                  const coord = `${row}-${col}`;
                  const statusInfo = getCellStatus(coord);
                  const isSelected = selectedCell?.coord === coord;
                  
                  // Style colors based on status
                  let fill = 'rgba(6, 182, 212, 0.04)';
                  let stroke = 'rgba(6, 182, 212, 0.2)';
                  let cursor = 'pointer';

                  if (statusInfo.status === 'sold') {
                    fill = 'rgba(236, 72, 153, 0.25)'; // Sold pink
                    stroke = 'rgba(236, 72, 153, 0.5)';
                  }
                  if (isSelected) {
                    fill = statusInfo.status === 'sold' 
                      ? 'rgba(236, 72, 153, 0.45)' 
                      : 'rgba(6, 182, 212, 0.3)';
                    stroke = '#ffffff';
                  }

                  return (
                    <g 
                      key={coord} 
                      onClick={() => handleCellClick(coord)}
                      style={{ cursor }}
                      className="grid-group"
                    >
                      <rect
                        x={x}
                        y={y}
                        width="42"
                        height="42"
                        rx="4"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isSelected ? '2' : '1'}
                        className={`map-cell-rect ${isSelected ? 'selected-cell-anim' : ''}`}
                      />
                      <text
                        x={x + 21}
                        y={y + 26}
                        fill="rgba(255,255,255,0.3)"
                        fontSize="10"
                        textAnchor="middle"
                        pointerEvents="none"
                        fontFamily="Space Grotesk, sans-serif"
                      >
                        {coord}
                      </text>
                    </g>
                  );
                });
              })}

              {/* Outer circular frame overlay */}
              <circle cx="270" cy="270" r="255" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              {/* Decorative crosshairs */}
              <line x1="270" y1="5" x2="270" y2="15" stroke="rgba(0,240,255,0.6)" strokeWidth="2" />
              <line x1="270" y1="525" x2="270" y2="535" stroke="rgba(0,240,255,0.6)" strokeWidth="2" />
              <line x1="5" y1="270" x2="15" y2="270" stroke="rgba(0,240,255,0.6)" strokeWidth="2" />
              <line x1="525" y1="270" x2="535" y2="270" stroke="rgba(0,240,255,0.6)" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelestialExplorer;
