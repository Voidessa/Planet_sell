import React, { useState, useEffect } from 'react';
import { Sparkles, Award, MapPin, Share2, Compass, Gift } from 'lucide-react';

const GiftViewer = ({ registryId, registry, onNavigate }) => {
  const [giftData, setGiftData] = useState(null);
  const [animationStep, setAnimationStep] = useState('scan'); // 'scan', 'zoom', 'grid', 'card'
  const [planetScale, setPlanetScale] = useState(0.2);
  const [starsSpeed, setStarsSpeed] = useState('slow');

  useEffect(() => {
    // Find the record by registry ID
    const record = registry.find((item) => item.registryId === registryId);
    if (record) {
      setGiftData(record);
    } else {
      // Fallback/Mock if ID not found to prevent empty screen
      setGiftData({
        owner: 'Счастливый Обладатель',
        bodyId: 'moon',
        bodyName: 'Луна',
        coordinate: 'C-5',
        packageName: '3 Акра (Подарочный)',
        registryId: registryId || 'CR-C-5-99999',
        date: new Date().toLocaleDateString('ru-RU'),
        dedication: 'С любовью во Вселенском масштабе! Пусть этот подарок радует тебя каждую ночь, когда ты смотришь на небо.',
        theme: 'cyber'
      });
    }
  }, [registryId, registry]);

  useEffect(() => {
    if (!giftData) return;

    // Phase 1: Scanning (0 to 2 seconds)
    // Phase 2: Warp Speed Zoom (2 to 4.5 seconds)
    const warpTimer = setTimeout(() => {
      setAnimationStep('zoom');
      setStarsSpeed('fast');
      setPlanetScale(1.8);
    }, 2000);

    // Phase 3: Grid Map Lock (4.5 to 6 seconds)
    const gridTimer = setTimeout(() => {
      setAnimationStep('grid');
      setStarsSpeed('slow');
    }, 4500);

    // Phase 4: Show Gift Card Overlay (6 seconds+)
    const cardTimer = setTimeout(() => {
      setAnimationStep('card');
    }, 6000);

    return () => {
      clearTimeout(warpTimer);
      clearTimeout(gridTimer);
      clearTimeout(cardTimer);
    };
  }, [giftData]);

  if (!giftData) {
    return (
      <div className="gift-viewer-loading text-center py-20">
        <p className="text-neon-pink">Загрузка данных подарка...</p>
      </div>
    );
  }

  // Row and col index for SVG alignment helper
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const [rowLetter, colStr] = giftData.coordinate.split('-');
  const rowIdx = rows.indexOf(rowLetter);
  const colIdx = parseInt(colStr) - 1;
  
  // Calculate zoom transform coordinates based on cell index to align exactly
  const targetX = 270 - (40 + colIdx * 46 + 21);
  const targetY = 270 - (40 + rowIdx * 46 + 21);

  const getPlanetGlow = () => {
    switch (giftData.bodyId) {
      case 'mars': return 'rgba(239, 68, 68, 0.4)';
      case 'venus': return 'rgba(249, 115, 22, 0.4)';
      case 'stars': return 'rgba(252, 211, 77, 0.4)';
      default: return 'rgba(200, 200, 200, 0.3)';
    }
  };

  const getPlanetGradient = () => {
    switch (giftData.bodyId) {
      case 'mars': return 'from-red-500 to-amber-700';
      case 'venus': return 'from-orange-400 to-rose-600';
      case 'stars': return 'from-yellow-300 via-amber-400 to-amber-600';
      default: return 'from-gray-400 to-slate-600';
    }
  };

  return (
    <div className={`gift-viewer-viewport ${starsSpeed === 'fast' ? 'space-warp' : ''}`}>
      
      {/* Background warp lines (CSS Animated) */}
      {starsSpeed === 'fast' && (
        <div className="warp-lines-overlay">
          <div className="warp-line" />
          <div className="warp-line" />
          <div className="warp-line" />
          <div className="warp-line" />
          <div className="warp-line" />
        </div>
      )}

      {/* Main Dynamic Viewport */}
      <div className="cosmic-scene-wrapper">
        {/* Animated Planet Sphere */}
        {(animationStep === 'scan' || animationStep === 'zoom') && (
          <div 
            className="zooming-celestial-body-wrapper"
            style={{
              transform: `scale(${planetScale})`,
              transition: 'transform 2.5s cubic-bezier(0.7, 0, 0.3, 1)',
            }}
          >
            <div 
              className={`zooming-sphere bg-gradient-to-r ${getPlanetGradient()}`}
              style={{ 
                boxShadow: `0 0 80px ${getPlanetGlow()}, inset -30px -30px 80px rgba(0,0,0,0.9)` 
              }}
            />
            {giftData.bodyId === 'stars' && (
              <div className="pulsing-star-flares" />
            )}
          </div>
        )}

        {/* Target coordinate SVG grid appearing on zoom lock */}
        {(animationStep === 'grid' || animationStep === 'card') && (
          <div className="zoomed-grid-map-container animate-fade-in">
            <svg 
              viewBox="0 0 540 540" 
              className="zoomed-svg-map animate-zoom-map-grid"
              style={{
                // Zoom in on the targeted grid cell
                transform: `scale(3.2) translate(${targetX / 3.2}px, ${targetY / 3.2}px)`,
                transformOrigin: '270px 270px',
                transition: 'transform 1.5s ease-out'
              }}
            >
              <defs>
                <radialGradient id="zoomPlanetGlow" cx="50%" cy="50%" r="50%">
                  {giftData.bodyId === 'moon' && <stop offset="0%" stopColor="#4A5568" stopOpacity="0.5" />}
                  {giftData.bodyId === 'mars' && <stop offset="0%" stopColor="#9B2C2C" stopOpacity="0.5" />}
                  {giftData.bodyId === 'venus' && <stop offset="0%" stopColor="#C05621" stopOpacity="0.5" />}
                  {giftData.bodyId === 'stars' && <stop offset="0%" stopColor="#B7791F" stopOpacity="0.5" />}
                  <stop offset="100%" stopColor="#0B081B" stopOpacity="0.9" />
                </radialGradient>
              </defs>

              <circle cx="270" cy="270" r="230" fill="url(#zoomPlanetGlow)" />

              {/* Decorative grid */}
              {rows.map((row, r) => {
                const y = 40 + r * 46;
                return Array.from({ length: 10 }).map((_, c) => {
                  const x = 40 + c * 46;
                  const coord = `${row}-${c + 1}`;
                  const isTarget = coord === giftData.coordinate;

                  return (
                    <rect
                      key={coord}
                      x={x}
                      y={y}
                      width="42"
                      height="42"
                      rx="4"
                      fill={isTarget ? 'rgba(255, 184, 0, 0.25)' : 'rgba(255,255,255,0.02)'}
                      stroke={isTarget ? '#FFB800' : 'rgba(255,255,255,0.08)'}
                      strokeWidth={isTarget ? '2' : '1'}
                      className={isTarget ? 'gift-target-cell-glow' : ''}
                    />
                  );
                });
              })}
            </svg>

            {/* Target Crosshair HUD Overlay */}
            <div className="hud-overlay">
              <div className="hud-reticle" />
              <div className="hud-text text-neon-cyan animate-pulse">
                ЦЕЛЬ ЗАФИКСИРОВАНА: {giftData.coordinate}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Screen HUD / Scanning Overlays */}
      {animationStep === 'scan' && (
        <div className="scanning-hud glass-card">
          <Compass size={32} className="spinner text-neon-cyan mb-2" />
          <h2 className="text-lg">СКАНИРОВАНИЕ КООРДИНАТ...</h2>
          <p className="text-neon-pink font-mono text-sm mt-1">{giftData.registryId}</p>
        </div>
      )}

      {animationStep === 'zoom' && (
        <div className="scanning-hud glass-card">
          <h2 className="text-lg text-neon-cyan animate-pulse">ПОЛЕТ НА ОРБИТУ...</h2>
          <p className="text-slate-400 font-mono text-sm mt-1">Приближение к телу: {giftData.bodyName}</p>
        </div>
      )}

      {/* Gift Card and Message Overlay */}
      {animationStep === 'card' && (
        <div className="gift-message-overlay-container">
          <div className="gift-card-box glass-card animate-slide-up shadow-2xl">
            <div className="gift-card-top-icon">
              <Gift size={32} className="text-neon-pink icon-pulse" />
            </div>

            <h1 className="gift-title">Вам подарили участок космоса! 🌌</h1>
            <p className="gift-subtitle">Сектор официально зарегистрирован на ваше имя.</p>

            <div className="gift-envelope glass-card">
              <div className="envelope-label">КОМУ:</div>
              <div className="envelope-to text-neon-cyan">{giftData.owner}</div>
              
              <div className="envelope-label mt-4">ПОЗДРАВЛЕНИЕ:</div>
              <div className="envelope-message">
                « {giftData.dedication || 'Поздравляем с приобретением личного сектора во Вселенной! Пусть твои мечты сияют так же ярко, как этот участок на небосводе.'} »
              </div>
            </div>

            <div className="gift-specs-summary glass-card">
              <div className="spec-row">
                <span>Объект:</span>
                <span className="text-white">{giftData.bodyName}</span>
              </div>
              <div className="spec-row">
                <span>Координаты:</span>
                <span className="text-neon-cyan font-bold">{giftData.coordinate}</span>
              </div>
              <div className="spec-row">
                <span>Площадь:</span>
                <span className="text-white">{giftData.packageName}</span>
              </div>
              <div className="spec-row">
                <span>ID записи:</span>
                <span className="font-mono text-xs text-slate-400">{giftData.registryId}</span>
              </div>
            </div>

            <div className="gift-card-actions">
              <button 
                className="btn btn-secondary btn-full"
                onClick={() => window.print()}
              >
                Скачать бланковый сертификат (PDF)
              </button>
              <button 
                className="btn btn-primary btn-full btn-glow"
                onClick={() => onNavigate('home')}
              >
                Перейти в магазин CosmosRegistry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftViewer;
