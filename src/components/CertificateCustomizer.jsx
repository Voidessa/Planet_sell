import React, { useState } from 'react';
import { ChevronRight, Award, AlertCircle } from 'lucide-react';
import ProgressStepper from './ProgressStepper';
import lunarImg from '../assets/lunar_planet.png';
import marsImg from '../assets/mars_planet.png';
import venusImg from '../assets/venus_planet.png';
import lunarDeed from '../assets/lunar_deed.jpg';
import lunarMap from '../assets/lunar_map.jpg';
import marsMap from '../assets/mars_map.jpg';
import venusMap from '../assets/venus_map.jpg';

const CertificateCustomizer = ({ plotInfo, onBack, onProceed }) => {
  const [ownerName, setOwnerName]   = useState('');
  const [dedication, setDedication] = useState('');
  const [theme, setTheme]           = useState('classic-gold');
  const [nameError, setNameError]   = useState('');
  const [previewTab, setPreviewTab] = useState('all'); // 'all', 'cert', 'map'
  const [usePhotoMockup, setUsePhotoMockup] = useState(true); // Default to photo mockup mode!

  const handleProceed = (e) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      setNameError('Пожалуйста, введите имя владельца участка');
      return;
    }
    setNameError('');
    onProceed({
      ...plotInfo,
      owner: ownerName,
      dedication: dedication,
      theme: theme,
    });
  };

  // Helper functions for translation and coordinates mapping
  const getCoordinateCoords = (coord) => {
    if (!coord) return { x: 50, y: 50 };
    let hash1 = 0;
    let hash2 = 0;
    for (let i = 0; i < coord.length; i++) {
      hash1 = coord.charCodeAt(i) + ((hash1 << 5) - hash1);
      hash2 = coord.charCodeAt(i) * 17 + ((hash2 << 3) - hash2);
    }
    // Keep target point between 32% and 68% of the sphere width
    const x = 32 + (Math.abs(hash1) % 36);
    const y = 32 + (Math.abs(hash2) % 36);
    return { x, y };
  };

  const getAcres = (packageName) => {
    if (!packageName) return '1';
    const match = packageName.match(/\d+/);
    return match ? match[0] : '1';
  };

  const getPlanetNameUz = (bodyName) => {
    if (bodyName === 'Луна') return 'OY';
    if (bodyName === 'Марс') return 'MARS';
    if (bodyName === 'Венера') return 'VENERA';
    return bodyName.toUpperCase();
  };

  const getPlanetNameUzIn = (bodyName) => {
    if (bodyName === 'Луна') return 'Oydagi';
    if (bodyName === 'Марс') return 'Marsdagi';
    if (bodyName === 'Венера') return 'Veneradagi';
    return `${bodyName}dagi`;
  };

  const getPlanetNameEn = (bodyName) => {
    if (bodyName === 'Луна') return 'LUNAR';
    if (bodyName === 'Марс') return 'MARS';
    if (bodyName === 'Венера') return 'VENUS';
    return bodyName.toUpperCase();
  };

  const getPlanetNameEnOn = (bodyName) => {
    if (bodyName === 'Луна') return "Luna, Earth's Moon";
    if (bodyName === 'Марс') return 'Mars';
    if (bodyName === 'Венера') return 'Venus';
    return bodyName;
  };

  const mapPos = getCoordinateCoords(plotInfo.coordinate);
  const acres = getAcres(plotInfo.packageName);
  const acresTextEn = acres === '1' ? '1 ACRE' : `${acres} ACRES`;

  const THEMES = [
    { key: 'classic-gold',  label: '🏅 Классическое Золото' }
  ];

  return (
    <div className="customizer-container-lux animate-fade-in">

      {/* ── Input controls form ──────────────────── */}
      <div className="customizer-form-lux glass-card">

        {/* Progress stepper */}
        <ProgressStepper 
          currentPage="customizer" 
          onStepClick={(step) => {
            if (step === 'explore') onBack();
          }}
        />

        <h2 className="text-gold-gradient text-2xl font-bold" style={{ marginTop: '8px' }}>Оформление подарка</h2>
        <p className="section-sub">Заполните детали, которые будут напечатаны на именном свидетельстве.</p>

        <form onSubmit={handleProceed} className="form-wrapper-lux">
          <div className="form-group-lux">
            <label className="info-label-lux">КОМУ ПОДАРИТЬ (ИМЯ НА СЕРТИФИКАТЕ):</label>
            <input
              type="text"
              placeholder="Например: GULNOZA ABDULLAEVA"
              value={ownerName}
              onChange={(e) => { setOwnerName(e.target.value); if (nameError) setNameError(''); }}
              className={`lux-input ${nameError ? 'input-error' : ''}`}
              maxLength={36}
            />
            {nameError && (
              <div className="form-error-lux">
                <AlertCircle size={13} />
                <span>{nameError}</span>
              </div>
            )}
          </div>

          <div className="form-group-lux">
            <label className="info-label-lux">ЛИЧНОЕ ПОЗДРАВЛЕНИЕ / ОТКРЫТКА:</label>
            <textarea
              placeholder="Напишите теплые пожелания... (например: 'Пусть эта звезда напоминает тебе о наших самых ярких моментах. Люблю тебя.')"
              value={dedication}
              onChange={(e) => setDedication(e.target.value)}
              className="lux-textarea"
              maxLength={150}
              rows={4}
            />
            <span className="char-counter-lux">{dedication.length}/150 символов</span>
          </div>

          <div className="order-summary-lux">
            <div className="summary-row-lux">
              <span>Сектор регистрации:</span>
              <span className="text-gold font-mono">{plotInfo.coordinate} ({plotInfo.bodyName})</span>
            </div>
            <div className="summary-row-lux">
              <span>Размер участка:</span>
              <span>{plotInfo.packageName}</span>
            </div>
            <div className="summary-row-lux font-bold-lux">
              <span>Итого:</span>
              <span className="text-gold">${plotInfo.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="form-actions-lux">
            <button type="button" className="btn-lux btn-lux-secondary" onClick={onBack}>
              Назад
            </button>
            <button type="submit" className="btn-lux btn-lux-primary btn-glow">
              <span>К оплате</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* ── Live Preview Certificate ─────────────── */}
      <div className="customizer-preview-lux animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="preview-header-lux">
          <span className="preview-label-lux">ВЫ ПОЛУЧИТЕ КОМПЛЕКТ ИЗ 2-Х ДОКУМЕНТОВ (A3)</span>
          <AlertCircle size={14} className="text-slate-500" />
        </div>

        {/* Tab Switcher */}
        <div className="preview-tabs-lux" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              type="button" 
              className={`preview-tab-btn ${previewTab === 'all' ? 'active' : ''}`}
              onClick={() => setPreviewTab('all')}
            >
              Все (2)
            </button>
            <button 
              type="button" 
              className={`preview-tab-btn ${previewTab === 'cert' ? 'active' : ''}`}
              onClick={() => setPreviewTab('cert')}
            >
              Сертификат
            </button>
            <button 
              type="button" 
              className={`preview-tab-btn ${previewTab === 'map' ? 'active' : ''}`}
              onClick={() => setPreviewTab('map')}
            >
              Карта
            </button>
          </div>

          <button
            type="button"
            className={`preview-tab-btn ${usePhotoMockup ? 'active' : ''}`}
            onClick={() => setUsePhotoMockup(!usePhotoMockup)}
            style={{
              borderColor: 'var(--gold-text)',
              color: usePhotoMockup ? 'var(--bg-dark)' : 'var(--gold-text)',
              backgroundColor: usePhotoMockup ? 'var(--gold-text)' : 'transparent',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              padding: '6px 12px'
            }}
          >
            {usePhotoMockup ? '📷 Фото-превью' : '📝 Макет текста'}
          </button>
        </div>

        {/* Previews container */}
        <div className="previews-scroll-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '72vh', overflowY: 'auto', paddingRight: '4px' }}>
          
          {/* 1. CERTIFICATE */}
          {(previewTab === 'all' || previewTab === 'cert') && (
            <div className={usePhotoMockup ? "certificate-card-photo-lux" : "certificate-card-lux"}>
              {usePhotoMockup ? (
                <img 
                  src={lunarDeed} 
                  alt="Lunar Deed / Official Certificate" 
                  className="cert-photo-img animate-fade-in" 
                />
              ) : (
                <div className="cert-ornate-border">
                  <div className="cert-parchment-sheet">
                    <div className="cert-double-border-container">
                      
                      <div className="cert-watermark-container-new">
                        <img 
                          src={plotInfo.bodyId === 'moon' ? lunarImg : plotInfo.bodyId === 'mars' ? marsImg : venusImg} 
                          alt="Watermark" 
                          className="cert-watermark-img-new" 
                        />
                      </div>
                      
                      <div className="cert-main-content-new">
                        <div className="cert-header-eng">
                          REGISTERED CLAIM & DEED
                          <br />
                          FOR {getPlanetNameEn(plotInfo.bodyName)} PROPERTY
                        </div>
                        <div className="cert-divider-line" />
                        <div className="cert-area-text">LAND AREA: {acresTextEn}</div>
                        <div className="cert-divider-line" />
                        <div className="cert-intro-text">
                          Be it known and proclaimed to all that
                        </div>
                        <div className="cert-owner-name-new">
                          {ownerName.trim() ? ownerName.toUpperCase() : 'GULNOZA ABDULLAEVA'}
                        </div>
                        <div className="cert-body-statement">
                          is recorded as the true legal owner of the property located at <strong>{plotInfo.coordinate}</strong> as designated on {getPlanetNameEnOn(plotInfo.bodyName)}.
                        </div>
                        
                        <div className="cert-footer-new">
                          <div className="cert-footer-left-new">
                            RECORDED IN «INTERNATIONAL<br/>DATABASE OF PLANETS, STARS &<br/>EXTRATERRESTRIAL LAND CLAIMS»<br/>BY STARS INTERNATIONAL LLC
                          </div>
                          
                          <div className="cert-footer-right-new">
                            <div style={{ marginBottom: '0.4cqi' }}>CERTIFICATE No: CR-{plotInfo.coordinate}-9401</div>
                            <div>DATE: {new Date().toLocaleDateString('ru-RU')}</div>
                            <div className="cert-blue-seal-stamp">
                              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                                <circle cx="50" cy="50" r="44" fill="none" stroke="#1b75bb" strokeWidth="2.5" />
                                <circle cx="50" cy="50" r="37" fill="none" stroke="#1b75bb" strokeWidth="1" strokeDasharray="3,1.5" />
                                <circle cx="50" cy="50" r="30" fill="none" stroke="#1b75bb" strokeWidth="1.5" />
                                
                                <path id="seal-text-path-en" d="M 50,14 A 36,36 0 1,1 49.9,14" fill="none" />
                                <text fill="#1b75bb" fontSize="5.5" fontWeight="bold" fontFamily="Courier New, monospace" letterSpacing="0.1">
                                  <textPath href="#seal-text-path-en" startOffset="0%">
                                    * STARS INTERNATIONAL REGISTRY * OFFICIAL RECORD CLAIM
                                  </textPath>
                                </text>
                                
                                <text x="50" y="47" textAnchor="middle" fill="#1b75bb" fontSize="9" fontWeight="bold" fontFamily="Georgia, serif" letterSpacing="1">OFFICIAL</text>
                                <text x="50" y="58" textAnchor="middle" fill="#1b75bb" fontSize="8" fontWeight="bold" fontFamily="Georgia, serif" letterSpacing="1">SEAL</text>
                                <line x1="26" y1="50" x2="74" y2="50" stroke="#1b75bb" strokeWidth="1.2" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. MAP VERSION */}
          {(previewTab === 'all' || previewTab === 'map') && (
            <div className={usePhotoMockup ? "certificate-card-photo-lux" : "certificate-card-lux"}>
              {usePhotoMockup ? (
                <img 
                  src={plotInfo.bodyId === 'mars' ? marsMap : plotInfo.bodyId === 'venus' ? venusMap : lunarMap} 
                  alt={`${plotInfo.bodyName} Map / Официальная Карта`} 
                  className="cert-photo-img animate-fade-in" 
                />
              ) : (
                <div className="cert-ornate-border">
                  <div className="cert-parchment-sheet">
                    <div className="cert-double-border-container">
                      
                      <div className="cert-main-content-new">
                        <div className="cert-map-title">
                          {plotInfo.bodyName === 'Луна' ? 'Oy Kartasi' : plotInfo.bodyName === 'Марс' ? 'Mars Kartasi' : 'Venera Kartasi'}
                        </div>
                        <div className="cert-divider-line" style={{ width: '40%', margin: '0.5cqi 0' }} />
                        
                        <div className="cert-map-globe-wrapper">
                          <img 
                            src={plotInfo.bodyId === 'moon' ? lunarImg : plotInfo.bodyId === 'mars' ? marsImg : venusImg} 
                            alt="Planet Map" 
                            className="cert-map-globe-image" 
                          />
                          
                          <svg viewBox="0 0 100 100" className="cert-map-grid-overlay">
                            {/* Latitudes */}
                            <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(212, 198, 172, 0.35)" strokeWidth="0.4" strokeDasharray="1,1"/>
                            <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(212, 198, 172, 0.35)" strokeWidth="0.4" strokeDasharray="1,1"/>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(212, 198, 172, 0.35)" strokeWidth="0.4" strokeDasharray="1,1"/>
                            
                            {/* Longitudes */}
                            <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(212, 198, 172, 0.35)" strokeWidth="0.4" strokeDasharray="1,1"/>
                            <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(212, 198, 172, 0.35)" strokeWidth="0.4" strokeDasharray="1,1"/>
                            <line x1="18" y1="18" x2="82" y2="82" stroke="rgba(212, 198, 172, 0.35)" strokeWidth="0.4" strokeDasharray="1,1"/>
                            <line x1="18" y1="82" x2="82" y2="18" stroke="rgba(212, 198, 172, 0.35)" strokeWidth="0.4" strokeDasharray="1,1"/>
                            
                            {/* Red Dot (Target Point) */}
                            <circle cx={mapPos.x} cy={mapPos.y} r="2.2" fill="#ef4444" stroke="#faf6eb" strokeWidth="0.5" />
                            <circle cx={mapPos.x} cy={mapPos.y} r="4.5" fill="none" stroke="#ef4444" strokeWidth="0.4" className="animate-ping" style={{ transformOrigin: `${mapPos.x}px ${mapPos.y}px` }} />
                            
                            {/* Pointer Red Arrow */}
                            <path 
                              d={`M ${mapPos.x - 14} ${mapPos.y + 11} Q ${mapPos.x - 10} ${mapPos.y + 10}, ${mapPos.x - 5} ${mapPos.y + 4}`} 
                              stroke="#ef4444" 
                              strokeWidth="1.8" 
                              fill="none" 
                              markerEnd="url(#arrow-marker)"
                            />
                            
                            <defs>
                              <marker id="arrow-marker" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
                              </marker>
                            </defs>
                          </svg>
                        </div>

                        <div className="cert-map-info-box">
                          <div className="cert-map-info-item">
                            <span className="cert-map-info-lbl">Sektor / Sector</span>
                            <span className="cert-map-info-val">{plotInfo.coordinate}</span>
                          </div>
                          <div className="cert-map-info-item">
                            <span className="cert-map-info-lbl">Planeta / Planet</span>
                            <span className="cert-map-info-val">
                              {plotInfo.bodyName === 'Луна' ? 'LUNA / OY' : plotInfo.bodyName === 'Марс' ? 'MARS' : 'VENUS / VENERA'}
                            </span>
                          </div>
                          <div className="cert-map-info-item">
                            <span className="cert-map-info-lbl">Egalik / Owner</span>
                            <span className="cert-map-info-val">
                              {ownerName.trim() ? ownerName.toUpperCase() : 'GULNOZA ABDULLAEVA'}
                            </span>
                          </div>
                        </div>

                        <div className="cert-footer-new" style={{ marginTop: '0.2cqi' }}>
                          <div className="cert-footer-left-new" style={{ fontSize: '0.8cqi' }}>
                            COSMOGRAPHIC MAP OF {getPlanetNameEn(plotInfo.bodyName)} SECTOR registry reference.
                            <br />
                            OFFICIAL LAND CLAIM PLOT RECORD AND LOCATION TRACKING.
                          </div>
                          <div className="cert-footer-right-new" style={{ fontSize: '0.8cqi' }}>
                            <div style={{ marginBottom: '0.3cqi' }}>REF No: MAP-{plotInfo.coordinate}-9401</div>
                            <div>MAP SCALE: 1:45,000,000</div>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CertificateCustomizer;
