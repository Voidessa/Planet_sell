import React, { useState, useEffect } from 'react';
import ThreeDGlobe from './ThreeDGlobe';
import { Compass, Gift, MailOpen } from 'lucide-react';

const GiftViewer = ({ registryId, registry, onNavigate }) => {
  const [giftData, setGiftData] = useState(null);
  const [animationStep, setAnimationStep] = useState('scan'); // 'scan', 'zoom', 'beacon', 'card'
  const [globeScale, setGlobeScale] = useState(0.2);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  const handleOpenEnvelope = () => {
    setEnvelopeOpen(true);
    if (window.playCosmosSFX) {
      window.playCosmosSFX('envelope');
    }
  };

  useEffect(() => {
    const record = registry.find((item) => item.registryId === registryId);
    if (record) {
      setGiftData(record);
    } else {
      // Fallback
      setGiftData({
        owner: 'Счастливый Владелец',
        bodyId: 'moon',
        bodyName: 'Луна',
        coordinate: 'C-5',
        packageName: '7 Акров (Королевское поместье)',
        registryId: registryId || 'CR-C-5-92044',
        date: new Date().toLocaleDateString('ru-RU'),
        dedication: 'С любовью во Вселенском масштабе! Пусть этот подарок радует тебя каждую ночь, когда ты смотришь на небо.',
        theme: 'classic-gold'
      });
    }
  }, [registryId, registry]);

  useEffect(() => {
    if (!giftData) return;

    // Steps:
    // 1. Scan (0-2s)
    // 2. Flight Zoom (2-4.5s)
    // 3. Beacon Focus (4.5-6s)
    // 4. Show sealed Envelope (6s+)
    const zoomTimer = setTimeout(() => {
      setAnimationStep('zoom');
      setGlobeScale(1.0);
    }, 2000);

    const beaconTimer = setTimeout(() => {
      setAnimationStep('beacon');
    }, 4500);

    const cardTimer = setTimeout(() => {
      setAnimationStep('card');
    }, 6000);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(beaconTimer);
      clearTimeout(cardTimer);
    };
  }, [giftData]);

  if (!giftData) {
    return (
      <div className="gift-viewer-loading text-center py-20">
        <p className="text-gold">Считывание космических координат...</p>
      </div>
    );
  }

  return (
    <div className="gift-viewer-viewport-lux">
      {/* 3D Cosmic Space Canvas/Scene */}
      <div className="cosmic-scene-wrapper-lux">
        <div 
          className="zooming-globe-container"
          style={{
            transform: `scale(${globeScale})`,
            transition: 'transform 2.5s cubic-bezier(0.7, 0, 0.3, 1)',
            width: '100%',
            height: '100%',
            maxWidth: '600px',
            maxHeight: '600px',
            margin: 'auto'
          }}
        >
          <ThreeDGlobe
            bodyId={giftData.bodyId}
            registry={registry}
            selectedCoordinate={giftData.coordinate}
            onSelectCoordinate={() => {}} // Read-only
          />
        </div>
      </div>

      {/* Cinematic Overlays */}
      {animationStep === 'scan' && (
        <div className="hud-overlay-lux glass-card animate-fade-in">
          <Compass size={24} className="spinner text-gold mb-2" />
          <h3>ОБНАРУЖЕН КОСМИЧЕСКИЙ СИГНАЛ...</h3>
          <p className="text-gold font-mono text-xs mt-1">{giftData.registryId}</p>
        </div>
      )}

      {animationStep === 'zoom' && (
        <div className="hud-overlay-lux glass-card animate-fade-in">
          <h3>ВХОД НА ОРБИТУ ОБЪЕКТА...</h3>
          <p className="text-slate-400 font-mono text-xs mt-1">Ориентация по координатам: {giftData.coordinate}</p>
        </div>
      )}

      {/* Custom Envelope / Letter Reveal */}
      {animationStep === 'card' && (
        <div className="gift-envelope-overlay-lux">
          {!envelopeOpen ? (
            <div className="envelope-closed-card glass-card animate-scale-up text-center">
              <div className="gift-envelope-seal icon-pulse">
                <Gift size={40} className="text-gold" />
              </div>
              <h2 className="text-gold-gradient text-xl font-bold mt-4">Вам прислали подарок!</h2>
              <p className="text-slate-400 text-sm mt-1 mb-6">Внутри конверта — право на собственный участок на {giftData.bodyName}.</p>
              
              <button 
                className="btn-lux btn-lux-primary btn-glow"
                onClick={handleOpenEnvelope}
              >
                <MailOpen size={16} />
                <span>Открыть поздравление</span>
              </button>
            </div>
          ) : (
            <div className="envelope-opened-card glass-card animate-slide-up">
              <div className="gift-letter-header-lux">
                <span className="letter-lbl-lux text-gold">ГАЛАКТИЧЕСКИЙ РЕЕСТР СОБСТВЕННОСТИ</span>
                <h2>Космический подарок для Вас</h2>
              </div>

              <div className="gift-letter-body-lux">
                <p className="gift-letter-intro">Настоящим подтверждается владение участком:</p>
                
                <h3 className="gift-letter-recipient text-white">{giftData.owner}</h3>
                
                <p className="gift-letter-statement">
                  присвоены уникальные координаты на теле <strong>{giftData.bodyName}</strong>.
                </p>

                <div className="gift-letter-quote">
                  <p>« {giftData.dedication || 'Поздравляем с приобретением личного сектора во Вселенной! Пусть твои мечты сияют так же приятно, как этот участок.'} »</p>
                </div>
              </div>

              <div className="gift-letter-specs-lux">
                <div className="spec-item-lux">
                  <span className="spec-lbl-lux">КООРДИНАТЫ</span>
                  <span className="spec-val-lux text-gold font-mono">{giftData.coordinate}</span>
                </div>
                <div className="spec-item-lux">
                  <span className="spec-lbl-lux">ПЛОЩАДЬ</span>
                  <span className="spec-val-lux">{giftData.packageName}</span>
                </div>
                <div className="spec-item-lux">
                  <span className="spec-lbl-lux">ЗАПИСЬ №</span>
                  <span className="spec-val-lux font-mono text-xs">{giftData.registryId}</span>
                </div>
              </div>

              {/* Referral Promotion Loop */}
              <div 
                className="referral-banner-lux glass-card animate-slide-up"
                style={{
                  marginTop: '24px',
                  padding: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#ffffff', fontWeight: '600' }}>🪐 Тоже хотите сделать космический подарок?</h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>Получите скидку <strong>15%</strong> на любой участок по реферальному промокоду получателя:</p>
                <div 
                  className="font-mono text-gold" 
                  style={{ 
                    display: 'inline-block',
                    padding: '6px 16px', 
                    background: 'rgba(3, 2, 8, 0.6)', 
                    border: '1px dashed rgba(255, 255, 255, 0.3)', 
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    letterSpacing: '1px'
                  }}
                >
                  GIFT15
                </div>
              </div>

              <div className="gift-letter-actions-lux mt-6">
                <button 
                  className="btn-lux btn-lux-secondary btn-full"
                  onClick={() => window.print()}
                >
                  Скачать PDF свидетельства
                </button>
                <button 
                  className="btn-lux btn-lux-primary btn-full btn-glow"
                  onClick={() => onNavigate('home')}
                >
                  Перейти в CosmosRegistry
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GiftViewer;
