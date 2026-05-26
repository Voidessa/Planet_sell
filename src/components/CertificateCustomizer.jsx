import React, { useState } from 'react';
import { ChevronRight, Award } from 'lucide-react';

const CertificateCustomizer = ({ plotInfo, onBack, onProceed }) => {
  const [ownerName, setOwnerName] = useState('');
  const [dedication, setDedication] = useState('');
  const [theme, setTheme] = useState('classic-gold'); // 'classic-gold', 'minimal-onyx'

  const handleProceed = (e) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      alert('Пожалуйста, введите имя владельца участка!');
      return;
    }

    onProceed({
      ...plotInfo,
      owner: ownerName,
      dedication: dedication,
      theme: theme,
    });
  };

  const getThemeClass = () => {
    return theme === 'minimal-onyx' ? 'cert-lux-onyx' : 'cert-lux-gold';
  };

  return (
    <div className="customizer-container-lux animate-fade-in">
      
      {/* Input controls form */}
      <div className="customizer-form-lux glass-card">
        <h2 className="text-gold-gradient text-2xl font-bold">Оформление подарка</h2>
        <p className="section-sub">Заполните детали, которые будут напечатаны на именном свидетельстве.</p>

        <form onSubmit={handleProceed} className="form-wrapper-lux">
          <div className="form-group-lux">
            <label className="info-label-lux">КОМУ ПОДАРИТЬ (ИМЯ НА СЕРТИФИКАТЕ):</label>
            <input
              type="text"
              placeholder="Например: Александра Смирнова"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="lux-input"
              maxLength={36}
              required
            />
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

          <div className="form-group-lux">
            <label className="info-label-lux">СТИЛЬ ОФОРМЛЕНИЯ:</label>
            <div className="theme-selector-lux">
              <button
                type="button"
                className={`theme-btn-lux ${theme === 'classic-gold' ? 'active' : ''}`}
                onClick={() => setTheme('classic-gold')}
              >
                Классическое Золото (Кремовый)
              </button>
              <button
                type="button"
                className={`theme-btn-lux ${theme === 'minimal-onyx' ? 'active' : ''}`}
                onClick={() => setTheme('minimal-onyx')}
              >
                Космический Оникс (Черный)
              </button>
            </div>
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
              <span className="text-gold">{plotInfo.price.toLocaleString()} ₽</span>
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

      {/* Live Preview Certificate Display */}
      <div className="customizer-preview-lux">
        <span className="preview-label-lux">ВИЗУАЛЬНЫЙ ПРЕДПРОСМОТР СЕРТИФИКАТА</span>
        
        <div className={`certificate-card-lux ${getThemeClass()} shadow-2xl`}>
          <div className="cert-lux-border-outer" />
          <div className="cert-lux-border-inner" />
          
          <div className="cert-lux-content">
            <div className="cert-lux-header">
              <span className="cert-lux-registry">GALACTIC LAND REGISTRY</span>
              <span className="cert-lux-title">СВИДЕТЕЛЬСТВО О СОБСТВЕННОСТИ</span>
            </div>

            <div className="cert-lux-body">
              <p className="cert-lux-intro">Настоящим подтверждается внесение записи в международный реестр:</p>
              
              <h2 className="cert-lux-owner">
                {ownerName.trim() ? ownerName : 'Александра Смирнова'}
              </h2>

              <p className="cert-lux-statement">
                является законным владельцем сувенирного участка на небесном теле
              </p>

              <h3 className="cert-lux-body-name">
                {plotInfo.bodyName}
              </h3>

              <div className="cert-lux-specs">
                <div className="spec-item-lux">
                  <span className="spec-lbl-lux">КООРДИНАТЫ</span>
                  <span className="spec-val-lux">{plotInfo.coordinate}</span>
                </div>
                <div className="spec-item-lux">
                  <span className="spec-lbl-lux">ПЛОЩАДЬ</span>
                  <span className="spec-val-lux">{plotInfo.packageName.split(' ')[0]} Акр(ов)</span>
                </div>
                <div className="spec-item-lux">
                  <span className="spec-lbl-lux">РЕЕСТР №</span>
                  <span className="spec-val-lux">CR-{plotInfo.coordinate}-9401</span>
                </div>
              </div>

              {dedication.trim() && (
                <div className="cert-lux-dedication">
                  <p>« {dedication} »</p>
                </div>
              )}
            </div>

            <div className="cert-lux-footer">
              <div className="cert-lux-date">
                <span>ДАТА РЕГИСТРАЦИИ</span>
                <span className="date-val-lux">{new Date().toLocaleDateString('ru-RU')}</span>
              </div>
              
              {/* Gold Hologram Seal */}
              <div className="cert-lux-seal">
                <Award size={26} />
                <span>REGISTRY SEAL</span>
              </div>

              <div className="cert-lux-signature">
                <div className="sig-line-lux" />
                <span>Secretary General of Registry</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateCustomizer;
