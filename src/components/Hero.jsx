import React from 'react';
import { Rocket, ShieldCheck, Map, Users } from 'lucide-react';

const Hero = ({ onNavigate, stats }) => {
  const celestialBodies = [
    {
      id: 'moon',
      name: 'Луна',
      tagline: 'Ваш личный вид на Землю',
      color: 'from-gray-400 to-slate-600',
      glow: 'rgba(200, 200, 200, 0.3)',
      price: 'от 990 ₽ / акр',
      size: '384 400 км от Земли',
      gravity: '1.62 м/с²',
    },
    {
      id: 'mars',
      name: 'Марс',
      tagline: 'Новый рубеж человечества',
      color: 'from-red-500 to-amber-700',
      glow: 'rgba(239, 68, 68, 0.3)',
      price: 'от 1 490 ₽ / акр',
      size: '225 млн км от Земли',
      gravity: '3.71 м/с²',
    },
    {
      id: 'venus',
      name: 'Венера',
      tagline: 'Планета любви и тепла',
      color: 'from-orange-400 to-rose-600',
      glow: 'rgba(249, 115, 22, 0.3)',
      price: 'от 1 290 ₽ / акр',
      size: '108 млн км от Земли',
      gravity: '8.87 м/с²',
    },
    {
      id: 'stars',
      name: 'Звезда',
      tagline: 'Светите ярче всех во Вселенной',
      color: 'from-yellow-300 via-amber-400 to-amber-600',
      glow: 'rgba(252, 211, 77, 0.3)',
      price: 'от 2 490 ₽ / звезда',
      size: 'Созвездия Млечного Пути',
      gravity: 'Гравитация звезды',
    },
  ];

  return (
    <div className="hero-container">
      {/* Hero Header */}
      <header className="hero-header">
        <div className="badge animate-glow">
          <Rocket size={14} className="icon-pulse" />
          <span>Космический сувенир будущего</span>
        </div>
        <h1 className="hero-title">
          Подарите кусок <span className="text-neon-cyan">Вселенной</span>
        </h1>
        <p className="hero-subtitle">
          Эксклюзивные сувенирные участки на Луне, Марсе, Венере или именная звезда с официальным внесением в Галактический Реестр. Подарок, который останется навсегда.
        </p>
        <div className="hero-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => onNavigate('explore')}
          >
            <Map size={18} />
            <span>Выбрать участок</span>
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => onNavigate('registry')}
          >
            <Users size={18} />
            <span>База владельцев</span>
          </button>
        </div>
      </header>

      {/* Stats Board */}
      <section className="stats-board">
        <div className="stat-card">
          <span className="stat-num">{stats.totalSold}</span>
          <span className="stat-label">Продано секторов</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.activeOwners}</span>
          <span className="stat-label">Счастливых владельцев</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">100%</span>
          <span className="stat-label">Официальный сувенир</span>
        </div>
      </section>

      {/* Grid of Celestial Bodies */}
      <section className="planet-grid-section">
        <h2 className="section-title">Выберите космическое тело</h2>
        <div className="planet-cards-grid">
          {celestialBodies.map((body) => (
            <div 
              key={body.id} 
              className="planet-card glass-card"
              onClick={() => onNavigate('explore', { bodyId: body.id })}
            >
              {/* Planetary Sphere Animation */}
              <div className="sphere-wrapper">
                <div 
                  className={`sphere bg-gradient-to-r ${body.color}`}
                  style={{ boxShadow: `0 0 40px ${body.glow}, inset -15px -15px 40px rgba(0,0,0,0.8)` }}
                />
                <div className="sphere-orbit" />
              </div>

              <div className="planet-card-content">
                <h3>{body.name}</h3>
                <p className="planet-tagline">{body.tagline}</p>
                
                <div className="planet-specs">
                  <div className="spec-row">
                    <span>Дистанция:</span>
                    <span>{body.size}</span>
                  </div>
                  <div className="spec-row">
                    <span>Сила тяжести:</span>
                    <span>{body.gravity}</span>
                  </div>
                </div>

                <div className="planet-footer">
                  <span className="price-tag text-neon-pink">{body.price}</span>
                  <button className="btn btn-small btn-glow">
                    Выбрать
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badge Section */}
      <section className="trust-section glass-card">
        <div className="trust-item">
          <ShieldCheck size={32} className="text-neon-cyan" />
          <div>
            <h4>Пожизненная регистрация</h4>
            <p>Ваше имя вносится в локальную базу данных CosmosRegistry навсегда. Координаты никогда не дублируются.</p>
          </div>
        </div>
        <div className="trust-item">
          <ShieldCheck size={32} className="text-neon-pink" />
          <div>
            <h4>Уникальный подарок</h4>
            <p>Вы получаете электронный интерактивный сертификат с вашей открыткой, 3D зум-анимацией участка и PDF для печати.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
