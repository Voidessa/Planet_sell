import React, { useEffect, useRef, useState } from 'react';
import { Compass, Award, Shield, Gift, Star, ChevronRight } from 'lucide-react';
import lunarImg from '../assets/lunar_planet.png';
import marsImg from '../assets/mars_planet.png';
import venusImg from '../assets/venus_planet.png';
import starsImg from '../assets/star_cluster.png';
import FAQSection from './FAQSection';
import SocialProofBanner from './SocialProofBanner';

import heroImg from '../assets/hero_bg.png';

/* Animated counter hook */
const useCountUp = (target, duration = 1800, trigger = false) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, trigger]);
  return value;
};

const Hero = ({ onNavigate, stats }) => {
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const splineRef = useRef(null);

  useEffect(() => {
    const spline = splineRef.current;
    if (!spline) return;

    const setupSplineViewer = () => {
      try {
        const sr = spline.shadowRoot;
        if (sr) {
          // 1. Inject style to hide Spline branding via CSS (non-laggy)
          if (!sr.querySelector('#hide-spline-logo')) {
            const style = document.createElement('style');
            style.id = 'hide-spline-logo';
            style.textContent = '#logo, a[href*="spline.design"] { display:none!important; opacity:0!important; pointer-events:none!important; }';
            sr.appendChild(style);
          }

          // 2. Intercept and block wheel events on canvas to prevent zoom
          const canvas = sr.querySelector('canvas');
          if (canvas && !canvas.dataset.zoomDisabled) {
            canvas.dataset.zoomDisabled = 'true';
            
            // capture: true intercepts the event before it reaches Spline's wheel listeners
            canvas.addEventListener('wheel', (e) => {
              e.stopImmediatePropagation();
            }, { capture: true, passive: true });

            // Block mobile touch pinch-to-zoom gestures as well
            canvas.addEventListener('touchmove', (e) => {
              if (e.touches.length > 1) {
                e.stopImmediatePropagation();
              }
            }, { capture: true, passive: true });
          }
        }
      } catch (e) { /* cross-origin shadow root, ignore */ }
    };

    // Try once on mount and once on load
    setupSplineViewer();
    spline.addEventListener('load', setupSplineViewer);
    // Single delayed attempt for slow loads
    const timer = setTimeout(setupSplineViewer, 2000);

    return () => {
      spline.removeEventListener('load', setupSplineViewer);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const countSold   = useCountUp(stats.totalSold + 1847,   1800, statsVisible);
  const countOwners = useCountUp(stats.activeOwners + 923, 2000, statsVisible);

  const celestialBodies = [
    {
      id: 'moon',
      name: 'Луна',
      tagline: 'Ваш личный вид на Землю',
      image: lunarImg,
      glow: 'rgba(255, 255, 255, 0.15)',
      price: '$49',
      dist: '384 400 км от Земли',
    },
    {
      id: 'mars',
      name: 'Марс',
      tagline: 'Новый рубеж человечества',
      image: marsImg,
      glow: 'rgba(239, 68, 68, 0.25)',
      price: '$69',
      dist: '225 млн км от Земли',
    },
    {
      id: 'venus',
      name: 'Венера',
      tagline: 'Планета вечной любви',
      image: venusImg,
      glow: 'rgba(245, 158, 11, 0.25)',
      price: '$59',
      dist: '108 млн км от Земли',
    },
    {
      id: 'stars',
      name: 'Звезда',
      tagline: 'Именное созвездие на небе',
      image: starsImg,
      glow: 'rgba(139, 92, 246, 0.25)',
      price: '$99',
      dist: 'Млечный Путь',
    },
  ];

  const HOW_IT_WORKS = [
    {
      step: '01',
      icon: Compass,
      title: 'Выберите небесное тело',
      desc: 'Исследуйте интерактивную 3D-карту и выберите свободный сектор на Луне, Марсе, Венере или именную звезду.',
    },
    {
      step: '02',
      icon: Award,
      title: 'Персонализируйте подарок',
      desc: 'Введите имя получателя, напишите личное поздравление и выберите стиль именного свидетельства.',
    },
    {
      step: '03',
      icon: Gift,
      title: 'Подарите Вселенную',
      desc: 'Отправьте интерактивную ссылку — получатель совершит 3D-полёт к своему участку и откроет конверт с сюрпризом.',
    },
  ];

  return (
    <div className="luxury-hero animate-fade-in">
      {/* ── Cinematic hero section ─────────────────────────── */}
      <section className="hero-landing-pane" style={{ backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#000' }}>
        <div className="hero-grid-overlay" />
        <div className="hero-planet-halo" />

        <div className="hero-landing-content">
          <div className="luxury-badge">
            <Star size={11} style={{ marginRight: 6 }} />
            <span>Исключительные права на вечность</span>
          </div>
          <h1 className="hero-title-lux">
            Подарите кусочек <span className="metallic-text">Вселенной</span>
          </h1>
          <p className="hero-desc-lux">
            Уникальный романтический подарок: сертифицированное владение участком на Луне, Марсе или именной звездой. Официальная запись в Галактический Реестр.
          </p>

          <div className="hero-actions-lux">
            <button
              className="btn-lux btn-lux-primary btn-glow"
              onClick={() => onNavigate('explore')}
            >
              <Compass size={16} />
              <span>Начать исследование</span>
            </button>
            <button
              className="btn-lux btn-lux-secondary"
              onClick={() => {
                document.getElementById('planet-selector-section').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Выбрать планету</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Social Proof Banner ────────────────────────────── */}
      <SocialProofBanner />

      {/* ── Planet Cards Grid ─────────────────────────────── */}
      <section id="planet-selector-section" className="planet-grid-section">
        <h2 className="section-title text-gold-gradient">Выберите небесное тело</h2>
        <div className="planet-cards-grid">
          {celestialBodies.map((body) => (
            <div
              key={body.id}
              className="planet-card glass-card"
              onClick={() => onNavigate('explore', { bodyId: body.id })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onNavigate('explore', { bodyId: body.id })}
            >
              <div
                className="planet-card-img-wrapper"
                style={{ boxShadow: `0 0 35px ${body.glow}` }}
              >
                <img
                  src={body.image}
                  alt={body.name}
                  className="planet-card-image"
                />
              </div>

              <div className="planet-card-content">
                <h3 className="font-serif text-lg">{body.name}</h3>
                <p className="planet-tagline">{body.tagline}</p>

                <div className="planet-specs">
                  <div className="spec-row">
                    <span>Дистанция:</span>
                    <span>{body.dist}</span>
                  </div>
                </div>

                <div className="planet-footer">
                  <span className="price-tag text-gold">от {body.price}</span>
                  <button className="btn-lux btn-lux-secondary btn-small">
                    Выбрать
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="how-it-works-section">
        <div className="text-center hiw-header">
          <div className="luxury-badge" style={{ marginBottom: '16px' }}>
            <span>Простой процесс</span>
          </div>
          <h2 className="section-title text-gold-gradient">Как это работает</h2>
          <p className="section-sub">Три шага до идеального космического подарка</p>
        </div>

        <div className="hiw-steps-grid">
          {HOW_IT_WORKS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="hiw-step-card glass-card">
                <div className="hiw-step-num">{item.step}</div>
                <div className="hiw-icon-circle">
                  <Icon size={24} className="text-gold" />
                </div>
                <h3 className="hiw-step-title">{item.title}</h3>
                <p className="hiw-step-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Stats + Features ─────────────────────────────── */}
      <section className="hero-details-pane">
        <div className="stats-luxury-row" ref={statsRef}>
          <div className="stat-lux-card glass-card">
            <span className="stat-lux-num">{countSold.toLocaleString()}+</span>
            <span className="stat-lux-label">Зарегистрировано участков</span>
          </div>
          <div className="stat-lux-card glass-card">
            <span className="stat-lux-num">{countOwners.toLocaleString()}+</span>
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
            <Award size={32} className="text-gold" />
            <h3>Сертификат с тиснением</h3>
            <p>Уникальный документ с вашими координатами, именем владельца и официальной сургучной печатью-голограммой реестра.</p>
          </div>

          <div className="feature-lux-card glass-card">
            <Compass size={32} className="text-gold" />
            <h3>3D-Полет к участку</h3>
            <p>Получатель открывает интерактивную ссылку и совершает захватывающий 3D полет сквозь галактику прямо к своим координатам.</p>
          </div>

          <div className="feature-lux-card glass-card">
            <Shield size={32} className="text-gold" />
            <h3>Пожизненный реестр</h3>
            <p>Запись навсегда закрепляется за вами в локальной базе данных CosmosRegistry, гарантируя исключение двойных продаж.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section Accordion */}
      <FAQSection />
    </div>
  );
};

export default Hero;
