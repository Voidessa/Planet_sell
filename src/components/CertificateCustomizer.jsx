import React, { useState } from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import ProgressStepper from './ProgressStepper';
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
        <div className="preview-tabs-lux" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
        </div>

        {/* Previews container */}
        <div className="previews-scroll-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '72vh', overflowY: 'auto', paddingRight: '4px' }}>
          
          {/* 1. CERTIFICATE */}
          {(previewTab === 'all' || previewTab === 'cert') && (
            <div className="certificate-card-photo-lux">
              <img 
                src={lunarDeed} 
                alt="Lunar Deed / Official Certificate" 
                className="cert-photo-img animate-fade-in" 
              />
            </div>
          )}

          {/* 2. MAP VERSION */}
          {(previewTab === 'all' || previewTab === 'map') && (
            <div className="certificate-card-photo-lux">
              <img 
                src={plotInfo.bodyId === 'mars' ? marsMap : plotInfo.bodyId === 'venus' ? venusMap : lunarMap} 
                alt={`${plotInfo.bodyName} Map / Официальная Карта`} 
                className="cert-photo-img animate-fade-in" 
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CertificateCustomizer;
