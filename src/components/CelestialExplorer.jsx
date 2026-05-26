import React, { useState, useEffect } from 'react';
import ThreeDGlobe from './ThreeDGlobe';
import { Compass, Award, ShieldAlert, Check } from 'lucide-react';

const CelestialExplorer = ({ initialBodyId = 'moon', onSelectPlot, registry }) => {
  const [selectedBody, setSelectedBody] = useState(initialBodyId);
  const [selectedCoordinate, setSelectedCoordinate] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState('1'); // '1', '4', '7', '14', '21', '49'

  const bodyData = {
    moon: { name: 'Луна', desc: 'Участки в районе Моря Спокойствия (Mare Tranquillitatis). Вид на Землю включен.', price: 49 },
    mars: { name: 'Марс', desc: 'Секторы в долинах Маринер или вблизи вулкана Олимп. Новый дом человечества.', price: 69 },
    venus: { name: 'Венера', desc: 'Участки на Земле Афродиты. Планета, названная в честь богини любви.', price: 59 },
    stars: { name: 'Именная Звезда', desc: 'Сертификация яркой звезды в созвездии Ориона с вашим именем.', price: 99 },
  };

  const packageOptions = {
    '1': { size: '1 Акр', mult: 1, label: 'Стандартный участок' },
    '4': { size: '4 Акра', mult: 3.65, label: 'Семейное владение (-10%)' },
    '7': { size: '7 Акров', mult: 6.1, label: 'Королевское поместье (-20%)' },
    '14': { size: '14 Акров', mult: 11.2, label: 'Герцогство (-25%)' },
    '21': { size: '21 Акр', mult: 16.3, label: 'Имперский сектор (-35%)' },
    '49': { size: '49 Акров', mult: 34.5, label: 'Суверенная колония (-50%)' },
  };

  const getPrice = (body, pkg) => {
    const base = bodyData[body].price;
    const { mult } = packageOptions[pkg];
    return Math.floor(base * mult);
  };

  const getCoordinateStatus = () => {
    if (!selectedCoordinate) return null;
    const match = registry.find(
      (item) => item.bodyId === selectedBody && item.coordinate === selectedCoordinate
    );
    return match ? { status: 'sold', owner: match.owner, dedication: match.dedication, date: match.date } : { status: 'available' };
  };

  useEffect(() => {
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
      {/* 1. Celestial Header tabs */}
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

      {/* 2. Main split view */}
      <div className="explorer-content-split">
        
        {/* Globe interactive viewer */}
        <div className="explorer-globe-viewport glass-card">
          <div className="globe-overlay-hud">
            <span className="hud-lbl">3D МАКЕТ ОБЪЕКТА (ИНТЕРАКТИВНЫЙ)</span>
            <span className="hud-sub">Вращайте глобус • Выберите координатную ячейку кликом</span>
          </div>

          <ThreeDGlobe
            bodyId={selectedBody}
            registry={registry}
            selectedCoordinate={selectedCoordinate}
            onSelectCoordinate={(coord) => setSelectedCoordinate(coord)}
          />
        </div>

        {/* Configurations column */}
        <div className="explorer-details-panel-lux glass-card">
          <div className="panel-body-info">
            <h2 className="text-gold-gradient text-2xl font-bold">{bodyData[selectedBody].name}</h2>
            <p className="body-description-lux">{bodyData[selectedBody].desc}</p>
          </div>

          <hr className="divider-lux" />

          {selectedCoordinate && (
            <div className="coordinate-focus-box">
              <span className="info-label">ВЫБРАННЫЕ КООРДИНАТЫ:</span>
              <h3 className="coordinate-title-lux font-mono text-gold">
                SEC: {selectedCoordinate}
              </h3>

              {status && status.status === 'sold' ? (
                // Sold Block
                <div className="status-box-sold animate-slide-up">
                  <div className="sold-warning-tag">
                    <ShieldAlert size={14} />
                    <span>Сектор уже зарегистрирован</span>
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
                </div>
              ) : (
                // Available Block
                <div className="status-box-available animate-slide-up">
                  <div className="available-success-tag">
                    <Check size={14} />
                    <span>Сектор свободен к оформлению</span>
                  </div>

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
                          <span className="pkg-price">${getPrice(selectedBody, key).toLocaleString()}</span>
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
