import React, { useState } from 'react';
import { Edit3, CheckCircle, ChevronRight, Award } from 'lucide-react';

const CertificateCustomizer = ({ plotInfo, onBack, onProceed }) => {
  const [ownerName, setOwnerName] = useState('');
  const [dedication, setDedication] = useState('');
  const [theme, setTheme] = useState('cyber'); // 'cyber', 'gold', 'stellar'

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
    switch (theme) {
      case 'gold': return 'cert-theme-gold';
      case 'stellar': return 'cert-theme-stellar';
      default: return 'cert-theme-cyber';
    }
  };

  return (
    <div className="customizer-container animate-fade-in">
      {/* Configuration Form */}
      <div className="customizer-form glass-card">
        <h2 className="section-title text-neon-cyan">Оформление Сертификата</h2>
        <p className="section-sub">Заполните данные для создания именного сувенирного свидетельства о владении.</p>

        <form onSubmit={handleProceed} className="form-wrapper">
          <div className="form-group">
            <label className="info-label">Имя владельца (на кого оформить):</label>
            <input
              type="text"
              placeholder="Например: Александра Смирнова"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="custom-input"
              maxLength={40}
              required
            />
          </div>

          <div className="form-group">
            <label className="info-label">Поздравление / Открытка (по желанию):</label>
            <textarea
              placeholder="Напишите теплые слова... (например: 'Моей любимой звездочке! Пусть этот кусочек Луны напоминает тебе о моей бесконечной любви.')"
              value={dedication}
              onChange={(e) => setDedication(e.target.value)}
              className="custom-textarea"
              maxLength={150}
              rows={4}
            />
            <span className="char-counter">{dedication.length}/150 символов</span>
          </div>

          <div className="form-group">
            <label className="info-label">Стиль бланка сертификата:</label>
            <div className="theme-selector-grid">
              <button
                type="button"
                className={`theme-opt cyber-opt ${theme === 'cyber' ? 'selected-theme' : ''}`}
                onClick={() => setTheme('cyber')}
              >
                <span>Кибер-Неон</span>
              </button>
              <button
                type="button"
                className={`theme-opt gold-opt ${theme === 'gold' ? 'selected-theme' : ''}`}
                onClick={() => setTheme('gold')}
              >
                <span>Имперское Золото</span>
              </button>
              <button
                type="button"
                className={`theme-opt stellar-opt ${theme === 'stellar' ? 'selected-theme' : ''}`}
                onClick={() => setTheme('stellar')}
              >
                <span>Звездная Пыль</span>
              </button>
            </div>
          </div>

          <div className="form-summary glass-card">
            <div className="summary-row">
              <span>Сектор:</span>
              <span className="text-neon-cyan">{plotInfo.coordinate} ({plotInfo.bodyName})</span>
            </div>
            <div className="summary-row">
              <span>Площадь:</span>
              <span>{plotInfo.packageName}</span>
            </div>
            <div className="summary-row font-bold">
              <span>Итого к оплате:</span>
              <span className="text-neon-pink">{plotInfo.price.toLocaleString()} ₽</span>
            </div>
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn btn-secondary" onClick={onBack}>
              Назад к карте
            </button>
            <button type="submit" className="btn btn-primary btn-glow">
              <span>К оплате</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview Certificate */}
      <div className="customizer-preview">
        <h3 className="preview-label">
          <Edit3 size={14} /> Предпросмотр в реальном времени
        </h3>
        
        <div className={`certificate-card ${getThemeClass()} shadow-2xl`}>
          {/* Certificate Borders & Background Glows */}
          <div className="cert-border-outer" />
          <div className="cert-border-inner" />
          
          <div className="cert-content">
            <div className="cert-header">
              <span className="cert-registry-title">GALACTIC LAND REGISTRY</span>
              <span className="cert-doc-type">СЕРТИФИКАТ НА ВЛАДЕНИЕ</span>
            </div>

            <div className="cert-body">
              <p className="cert-intro">Настоящим подтверждается, что запись внесена в Галактический Реестр</p>
              
              <h2 className="cert-owner-name">
                {ownerName.trim() ? ownerName : 'Имя Получателя'}
              </h2>

              <p className="cert-statement">
                является законным владельцем сувенирного участка на небесном теле
              </p>

              <h3 className="cert-body-name">
                {plotInfo.bodyName}
              </h3>

              <div className="cert-specs-grid">
                <div className="cert-spec-item">
                  <span className="spec-lbl">КООРДИНАТЫ</span>
                  <span className="spec-val text-glow">{plotInfo.coordinate}</span>
                </div>
                <div className="cert-spec-item">
                  <span className="spec-lbl">ПЛОЩАДЬ</span>
                  <span className="spec-val">{plotInfo.packageName.split(' ')[0]} Акр(ов)</span>
                </div>
                <div className="cert-spec-item">
                  <span className="spec-lbl">РЕГИСТРАЦИОННЫЙ №</span>
                  <span className="spec-val">CR-{plotInfo.coordinate}-{Math.floor(Math.random() * 90000 + 10000)}</span>
                </div>
              </div>

              {dedication.trim() && (
                <div className="cert-dedication-box">
                  <p className="cert-dedication-text">« {dedication} »</p>
                </div>
              )}
            </div>

            <div className="cert-footer">
              <div className="cert-signature">
                <div className="sig-line" />
                <span>Генеральный Секретарь реестра</span>
              </div>
              
              {/* Holographic Seal */}
              <div className="cert-hologram">
                <Award size={32} className="holo-icon" />
                <span className="holo-text">OFFICIAL SEAL</span>
              </div>

              <div className="cert-date">
                <span>ДАТА РЕГИСТРАЦИИ</span>
                <span className="date-val">{new Date().toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateCustomizer;
