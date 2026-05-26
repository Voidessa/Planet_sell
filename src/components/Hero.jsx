import React, { useState, useEffect } from 'react';
import { Compass, Shield, Award, ChevronDown } from 'lucide-react';

const INTRO_CACHE_KEY = 'cosmos_registry_intro_seen';

const Hero = ({ onNavigate, stats }) => {
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(0);

  // Check if intro has already been shown in this browser session
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem(INTRO_CACHE_KEY);
    if (!hasSeenIntro) {
      setShowIntro(true);
      sessionStorage.setItem(INTRO_CACHE_KEY, 'true');
    }
  }, []);

  // Intro steps
  useEffect(() => {
    if (!showIntro) return;

    const timer1 = setTimeout(() => setIntroStep(1), 2200);
    const timer2 = setTimeout(() => setIntroStep(2), 4400);
    const timer3 = setTimeout(() => {
      setShowIntro(false);
    }, 6600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [showIntro]);

  if (showIntro) {
    return (
      <div className="luxury-intro-viewport">
        {introStep === 0 && (
          <h2 className="intro-text animate-fade-in">Каждый вечер мы смотрим на небо...</h2>
        )}
        {introStep === 1 && (
          <h2 className="intro-text animate-fade-in">Там, среди миллиардов звезд...</h2>
        )}
        {introStep === 2 && (
          <h2 className="intro-text animate-fade-in">Есть одна, которая горит только для тебя.</h2>
        )}
      </div>
    );
  }

  return (
    <div className="luxury-hero animate-fade-in">
      {/* Cinematic Main Section */}
      <section className="hero-landing-pane">
        <div className="hero-glow-back" />
        
        {/* Animated Background 3D Planet */}
        <div className="hero-ambient-planet-wrapper">
          <div className="hero-ambient-planet" />
          <div className="hero-ambient-ring" />
        </div>

        <div className="hero-landing-content">
          <div className="luxury-badge">
            <span>Исключительные права на вечность</span>
          </div>
          <h1 className="hero-title-lux">
            Подарите <br />
            <span className="text-gold-gradient">кусочек Вселенной</span>
          </h1>
          <p className="hero-desc-lux">
            Уникальный романтический подарок: сертифицированное владение участком на Луне, Марсе или именной звездой. Официальная запись в Галактический Реестр.
          </p>
          
          <div className="hero-actions-lux">
            <button 
              className="btn-lux btn-lux-primary"
              onClick={() => onNavigate('explore')}
            >
              <Compass size={18} />
              <span>Начать исследование</span>
            </button>
            <button 
              className="btn-lux btn-lux-secondary"
              onClick={() => {
                document.getElementById('details-pane').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Подробнее</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Details Section / Scroll Down */}
      <section id="details-pane" className="hero-details-pane">
        <div className="stats-luxury-row">
          <div className="stat-lux-card glass-card">
            <span className="stat-lux-num">{stats.totalSold}</span>
            <span className="stat-lux-label">Зарегистрировано участков</span>
          </div>
          <div className="stat-lux-card glass-card">
            <span className="stat-lux-num">{stats.activeOwners}</span>
            <span className="stat-lux-label">Владельцев по всему миру</span>
          </div>
          <div className="stat-lux-card glass-card">
            <span className="stat-lux-num">100%</span>
            <span className="stat-lux-label">Гарантия уникальности</span>
          </div>
        </div>

        {/* Feature Pitch Cards */}
        <div className="feature-pitch-grid">
          <div className="feature-lux-card glass-card">
            <Award size={36} className="text-gold" />
            <h3>Сертификат с золотым тиснением</h3>
            <p>Уникальный документ с вашими координатами, именем владельца и официальной сургучной печатью-голограммой реестра.</p>
          </div>

          <div className="feature-lux-card glass-card">
            <Compass size={36} className="text-gold" />
            <h3>3D-Полет к участку</h3>
            <p>Получатель открывает интерактивную ссылку и совершает захватывающий 3D полет сквозь галактику прямо к своим координатам.</p>
          </div>

          <div className="feature-lux-card glass-card">
            <Shield size={36} className="text-gold" />
            <h3>Пожизненный реестр</h3>
            <p>Запись навсегда закрепляется за вами в локальной базе данных CosmosRegistry, гарантируя исключение двойных продаж.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
