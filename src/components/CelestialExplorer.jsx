import React, { useState, useEffect } from 'react';
import ThreeDGlobe from './ThreeDGlobe';
import TwoDMapViewer from './TwoDMapViewer';
import ProgressStepper from './ProgressStepper';
import { Compass, Award, ShieldAlert, Check, Eye, Flame, Zap, Map } from 'lucide-react';
import lunarImg from '../assets/lunar_planet.png';
import marsImg from '../assets/mars_planet.png';
import venusImg from '../assets/venus_planet.png';
import starsImg from '../assets/star_cluster.png';

const CelestialExplorer = ({ initialBodyId = 'moon', onSelectPlot, registry }) => {
  const [selectedBody, setSelectedBody] = useState(initialBodyId);
  const [selectedCoordinate, setSelectedCoordinate] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState('1');
  const [urgencyCount] = useState(() => Math.floor(Math.random() * 5) + 2); // 2-6
  const [bodyChanging, setBodyChanging] = useState(false);
  const [show2DMap, setShow2DMap] = useState(false);

  const bodyData = {
    moon: {
      name: 'Луна',
      titleLux: 'Л У Н А',
      subLux: 'СЕРЕБРЯНЫЙ СПУТНИК ЗЕМЛИ',
      emoji: '🌙',
      desc: 'Участки в районе Моря Спокойствия (Mare Tranquillitatis). Великолепный вид на Землю.',
      price: 49,
      image: lunarImg,
      glow: 'rgba(255, 255, 255, 0.12)'
    },
    mars: {
      name: 'Марс',
      titleLux: 'М А Р С',
      subLux: 'КРАСНАЯ ПЛАНЕТА • СИСТЕМА SOL',
      emoji: '🔴',
      desc: 'Секторы в долинах Маринер или вблизи вулкана Олимп. Новый рубеж человеческой цивилизации.',
      price: 69,
      image: marsImg,
      glow: 'rgba(239, 68, 68, 0.22)'
    },
    venus: {
      name: 'Венера',
      titleLux: 'В Е Н Е Р А',
      subLux: 'ПЛАНЕТА ЛЮБВИ • УТРЕННЯЯ ЗВЕЗДА',
      emoji: '🌕',
      desc: 'Участки на Земле Афродиты. Планета с плотной золотой атмосферой, названная в честь богини.',
      price: 59,
      image: venusImg,
      glow: 'rgba(245, 158, 11, 0.22)'
    },
    stars: {
      name: 'Именная Звезда',
      titleLux: 'З В Е З Д А',
      subLux: 'СОЗВЕЗДИЕ ОРИОНА • СЕКТОР МЛЕЧНОГО ПУТИ',
      emoji: '⭐',
      desc: 'Официальная именная сертификация яркой звезды с привязкой координат к вашей открытке.',
      price: 99,
      image: starsImg,
      glow: 'rgba(139, 92, 246, 0.22)'
    },
  };

  const packageOptions = {
    '1':  { size: '1 Акр',     mult: 1,    label: 'Стандарт',           popular: false },
    '4':  { size: '4 Акра',    mult: 3.65, label: 'Семейный (-10%)',     popular: false },
    '7':  { size: '7 Акров',   mult: 6.1,  label: 'Королевский (-20%)', popular: true  },
    '14': { size: '14 Акров',  mult: 11.2, label: 'Герцогство (-25%)',   popular: false },
    '21': { size: '21 Акр',    mult: 16.3, label: 'Имперский (-35%)',    popular: false },
    '49': { size: '49 Акров',  mult: 34.5, label: 'Колония (-50%)',      popular: false },
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
    return match
      ? { status: 'sold', owner: match.owner, dedication: match.dedication, date: match.date }
      : { status: 'available' };
  };

  const handleBodyChange = (id) => {
    setBodyChanging(true);
    setTimeout(() => {
      setSelectedBody(id);
      setBodyChanging(false);
    }, 250);
  };

  useEffect(() => {
    setSelectedCoordinate('S-36');
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
  const currentBody = bodyData[selectedBody];

  return (
    <div className={`explorer-container-lux theme-${selectedBody} animate-fade-in`}>

      {/* ── Progress Stepper ─────────────────────── */}
      <ProgressStepper currentPage="explore" />

      {/* ── Celestial tabs navigation ────────────── */}
      <div className="explorer-header-tabs">
        {Object.entries(bodyData).map(([id, data]) => (
          <button
            key={id}
            className={`tab-btn-lux ${selectedBody === id ? 'active' : ''}`}
            onClick={() => handleBodyChange(id)}
          >
            <span>{data.emoji}</span>
            <span>{data.name}</span>
          </button>
        ))}
      </div>

      {/* ── Main split view ──────────────────────── */}
      <div className="explorer-content-split">

        {/* Globe interactive viewer */}
        <div className="explorer-globe-viewport glass-card">
          <div className="globe-overlay-hud">
            <span className="hud-lbl">3D МАКЕТ ОБЪЕКТА (ИНТЕРАКТИВНЫЙ)</span>
            <span className="hud-sub">Вращайте глобус • Выберите координатную ячейку кликом</span>
          </div>

          <div className={`globe-body-transition ${bodyChanging ? 'fading' : ''}`} style={{ flex: 1, width: '100%' }}>
            <ThreeDGlobe
              bodyId={selectedBody}
              registry={registry}
              selectedCoordinate={selectedCoordinate}
              onSelectCoordinate={(coord) => setSelectedCoordinate(coord)}
            />
          </div>
          
          <button
            className="btn-lux btn-lux-outline mt-3"
            onClick={() => setShow2DMap(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px', color: 'white', cursor: 'pointer', width: '100%',
              zIndex: 10, position: 'relative'
            }}
          >
            <Map size={18} />
            <span>Открыть на 2D Карте</span>
          </button>
        </div>

        {/* Configurations column */}
        <div className="explorer-details-panel-lux glass-card">

          {/* Header */}
          <div className="panel-body-info text-center">
            <h1 className="lux-planet-header-title">{currentBody.titleLux}</h1>
            <p className="lux-planet-header-sub">{currentBody.subLux}</p>

            {/* Satellite photo */}
            <div
              className="lux-satellite-photo-card"
              style={{ boxShadow: `0 0 25px ${currentBody.glow}` }}
            >
              <img
                src={currentBody.image}
                alt={`${currentBody.name} High Res`}
                className="lux-satellite-photo"
              />
              <span className="photo-badge">
                <Eye size={12} />
                <span>Фотофиксация со спутника</span>
              </span>
            </div>

            <p className="body-description-lux">{currentBody.desc}</p>
          </div>

          <hr className="divider-lux" />

          {selectedCoordinate && (
            <div className="coordinate-focus-box">
              <span className="info-label">ВЫБРАННЫЕ КООРДИНАТЫ:</span>
              <h3 className="coordinate-title-lux font-mono">
                SEC: {selectedCoordinate}
              </h3>

              {status && status.status === 'sold' ? (
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
                <div className="status-box-available animate-slide-up">
                  <div className="available-success-tag">
                    <Check size={14} />
                    <span>Сектор свободен к оформлению</span>
                  </div>

                  <div className="package-picker-lux">
                    <label className="info-label">ВЫБЕРИТЕ РАЗМЕР УЧАСТКА:</label>
                    <div className="package-options-grid">
                      {Object.entries(packageOptions).map(([key, opt]) => (
                        <button
                          key={key}
                          className={`package-card-lux ${selectedPackage === key ? 'active' : ''}`}
                          onClick={() => setSelectedPackage(key)}
                        >
                          {opt.popular && (
                            <span className="pkg-popular-badge">
                              <Flame size={9} /> Топ
                            </span>
                          )}
                          <span className="pkg-card-size">{opt.size}</span>
                          <span className="pkg-card-lbl">{opt.label}</span>
                          <span className="pkg-card-price">${getPrice(selectedBody, key).toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Urgency badge */}
                  <div className="urgency-badge-lux">
                    <Zap size={13} />
                    <span>
                      <strong>{urgencyCount} человека</strong> смотрят этот сектор прямо сейчас
                    </span>
                  </div>

                  <button
                    className="btn-lux btn-lux-primary btn-full mt-4"
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
      
      {show2DMap && selectedCoordinate && (
        <TwoDMapViewer
          bodyId={selectedBody}
          registry={registry}
          selectedCoordinate={selectedCoordinate}
          onSelectCoordinate={(coord) => setSelectedCoordinate(coord)}
          onClose={() => setShow2DMap(false)}
        >
          {/* We pass the exact same configuration panel as children so it appears in 2D mode! */}
          <div className="explorer-details-panel-lux glass-card" style={{ height: '100%', overflowY: 'auto', background: 'rgba(3, 2, 10, 0.95)', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="panel-body-info text-center">
              <h1 className="lux-planet-header-title">{currentBody.titleLux}</h1>
              <p className="lux-planet-header-sub">{currentBody.subLux}</p>
            </div>
            <hr className="divider-lux" />
            <div className="coordinate-focus-box">
              <span className="info-label">ВЫБРАННЫЕ КООРДИНАТЫ:</span>
              <h3 className="coordinate-title-lux font-mono">SEC: {selectedCoordinate}</h3>
              {status && status.status === 'sold' ? (
                <div className="status-box-sold animate-slide-up">
                  <div className="sold-warning-tag"><ShieldAlert size={14} /><span>Сектор уже зарегистрирован</span></div>
                  <div className="sold-details">
                    <div className="sold-row"><span>Владелец:</span><span className="owner-val text-white">{status.owner}</span></div>
                    {status.dedication && <p className="sold-dedication-quote">« {status.dedication} »</p>}
                  </div>
                </div>
              ) : (
                <div className="status-box-available animate-slide-up">
                  <div className="available-success-tag"><Check size={14} /><span>Сектор свободен к оформлению</span></div>
                  <div className="package-picker-lux">
                    <label className="info-label">ВЫБЕРИТЕ РАЗМЕР УЧАСТКА:</label>
                    <div className="package-options-grid">
                      {Object.entries(packageOptions).map(([key, opt]) => (
                        <button key={key} className={`package-card-lux ${selectedPackage === key ? 'active' : ''}`} onClick={() => setSelectedPackage(key)}>
                          {opt.popular && <span className="pkg-popular-badge"><Flame size={9} /> Топ</span>}
                          <span className="pkg-card-size">{opt.size}</span>
                          <span className="pkg-card-lbl">{opt.label}</span>
                          <span className="pkg-card-price">${getPrice(selectedBody, key).toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="btn-lux btn-lux-primary btn-full mt-4" onClick={handleBuy}>
                    <Award size={18} /><span>Подарить этот участок</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </TwoDMapViewer>
      )}
    </div>
  );
};

export default CelestialExplorer;
