import React, { useState, useEffect } from 'react';
import ThreeDGlobe from './ThreeDGlobe';
import { Compass, Award, ShieldAlert, Check } from 'lucide-react';

const CelestialExplorer = ({ initialBodyId = 'moon', onSelectPlot, registry }) => {
  const [selectedBody, setSelectedBody] = useState(initialBodyId);
  const [selectedCoordinate, setSelectedCoordinate] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState('1'); // '1', '7', '50'

  const bodyData = {
    moon: { name: 'Луна', desc: 'Участки в районе Моря Спокойствия (Mare Tranquillitatis). Вид на Землю включен.', price: 1490 },
    mars: { name: 'Марс', desc: 'Секторы в долинах Маринер или вблизи вулкана Олимп. Новый дом человечества.', price: 2190 },
    venus: { name: 'Венера', desc: 'Участки на Земле Афродиты. Планета, названная в честь богини любви.', price: 1890 },
    stars: { name: 'Именная Звезда', desc: 'Сертификация яркой звезды в созвездии Ориона с вашим именем.', price: 3490 },
  };

  const packageOptions = {
    '1': { size: '1 Акр', mult: 1, label: 'Стандартный участок' },
    '7': { size: '7 Акров', mult: 4.8, label: 'Королевское поместье (-30%)' },
    '50': { size: '50 Акров', mult: 22.5, label: 'Собственное Государство (-55%)' },
  };

  const getPrice = (body, pkg) => {
    const base = bodyData[body].price;
    const { mult } = packageOptions[pkg];
    return Math.floor(base * mult);
  };

  // Get status of selected coordinate
  const getCoordinateStatus = () => {
    if (!selectedCoordinate) return null;
    const match = registry.find(
      (item) => item.bodyId === selectedBody && item.coordinate === selectedCoordinate
    );
    return match ? { status: 'sold', owner: match.owner, dedication: match.dedication, date: match.date } : { status: 'available' };
  };

  useEffect(() => {
    // Auto-select a nice initial coordinate when body changes (e.g. C-5)
    setSelectedCoordinate('C-5');
  }, [selectedBody]);

  const handleBuy = () => {
    const status = getCoordinateStatus();
    if (!selectedCoordinate || (status && status.status === 'sold')) return;

    onSelectPlot({
      bodyId: selectedBody,
      bodyName: bodyData[selectedBody].name,
      coordinate: selectedCoordinate,
      package: selectedPackage,
      packageName: `${packageOptions[selectedPackage].size} (${packageOptions[selectedPackage].label})`,
      price: getPrice(selectedBody, selectedPackage),
      description: bodyData[selectedBody].desc,
    });
  };

  const status = getCoordinateStatus();

  return (
    <div className="explorer-container-lux animate-fade-in">
      
      {/* 1. Celestial Header Selector */}
      <div className="explorer-header-tabs glass-card">
        {Object.entries(bodyData).map(([id, data]) => (
          <button
            key={id}
            className={`tab-btn-lux ${selectedBody === id ? 'active' : ''}`}
            onClick={() => setSelectedBody(id)}
          >
            {data.name}
          </button>
        ))}
      </div>

      {/* 2. Main Split: 3D Globe + Clean Panel */}
      <div className="explorer-content-split">
        
        {/* Globe Side */}
        <div className="explorer-globe-viewport glass-card">
          <div className="globe-overlay-hud">
            <span className="hud-lbl">3D МАКЕТ ОБЪЕКТА (ИНТЕРАКТИВНЫЙ)</span>
            <span className="hud-sub">Зажмите и тяните для вращения • Кликните на сферу для выбора участка</span>
          </div>

          <ThreeDGlobe
            bodyId={selectedBody}
            registry={registry}
            selectedCoordinate={selectedCoordinate}
            onSelectCoordinate={(coord) => setSelectedCoordinate(coord)}
          />
        </div>

        {/* Panel Side */}
        <div className="explorer-details-panel-lux glass-card">
          <div className="panel-body-info">
            <h2 className="text-gold-gradient text-2xl font-bold">{bodyData[selectedBody].name}</h2>
            <p className="body-description-lux">{bodyData[selectedBody].desc}</p>
          </div>

          <hr className="divider-lux" />

          {/* Coordinate Detail Block */}
          {selectedCoordinate && (
            <div className="coordinate-focus-box">
              <span className="info-label">ВЫБРАННЫЙ СЕКТОР:</span>
              <h3 className="coordinate-title-lux font-mono text-neon-gold">
                COORD: {selectedCoordinate} ({selectedBody === 'stars' ? 'RA/DEC' : 'LAT/LON'})
              </h3>

              {status && status.status === 'sold' ? (
                // Sold Info
                <div className="status-box-sold animate-slide-up">
                  <div className="sold-warning-tag">
                    <ShieldAlert size={14} />
                    <span>Участок Занят</span>
                  </div>
                  <div className="sold-details">
                    <div className="sold-row">
                      <span>Владелец:</span>
                      <span className="owner-val text-white">{status.owner}</span>
                    </div>
                    {status.dedication && (
                      <p className="sold-dedication-quote">« {status.dedication} »</p>
                    )}
                  </div>
                  <p className="note-text-lux mt-2">Координаты уже закреплены. Пожалуйста, поверните глобус и выберите другую точку.</p>
                </div>
              ) : (
                // Available Selection
                <div className="status-box-available animate-slide-up">
                  <div className="available-success-tag">
                    <Check size={14} />
                    <span>Доступен к регистрации</span>
                  </div>

                  {/* Clean Package Picker */}
                  <div className="package-picker-lux">
                    <label className="info-label">ВЫБЕРИТЕ РАЗМЕР УЧАСТКА:</label>
                    <div className="package-options-column">
                      {Object.entries(packageOptions).map(([key, opt]) => (
                        <button
                          key={key}
                          className={`package-btn-lux ${selectedPackage === key ? 'active' : ''}`}
                          onClick={() => setSelectedPackage(key)}
                        >
                          <div className="pkg-left">
                            <span className="pkg-size">{opt.size}</span>
                            <span className="pkg-lbl">{opt.label}</span>
                          </div>
                          <span className="pkg-price">{getPrice(selectedBody, key).toLocaleString()} ₽</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    className="btn-lux btn-lux-primary btn-full btn-glow mt-4" 
                    onClick={handleBuy}
                  >
                    <Award size={18} />
                    <span>Подарить этот участок</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CelestialExplorer;
