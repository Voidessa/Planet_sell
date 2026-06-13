import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, X } from 'lucide-react';

const NAMES = [
  'Amirxon', 'shoxruh_99', 'jasur_bek', 'dilshod_gentra', 'sardor_uzb',
  'Kamola', 'madina_cosmo', 'Shahzoda', 'Laylo', 'nigora_astro', 'user_rayhon',
  'nilufar_star', 'aziza_uz', 'Bobur', 'farruh_galaxy', 'bekzod_space',
  'user_doston', 'ulugbek_77', 'zilola_sky', 'nodira_g', 'abbos_orbit',
  'javohir_uz', 'sevara_nova', 'umid_astro', 'ozodbek_uzb', 'malika_astro',
  'zulfiya_star', 'nodir_cosmo', 'barno_uz', 'otabek_88', 'gulnora_space',
];

const CITIES = [
  'Ташкента', 'Самарканда', 'Бухары', 'Андижана', 'Намангана', 'Ферганы',
  'Карши', 'Нукуса', 'Коканда', 'Ургенча', 'Маргилана', 'Джизака', 'Термеза',
  'Алмалыка', 'Чирчика',
];

const PLANETS = [
  { id: 'moon',  name: 'Луну',           emoji: '🌙' },
  { id: 'mars',  name: 'Марс',           emoji: '🔴' },
  { id: 'venus', name: 'Венеру',         emoji: '🌕' },
  { id: 'stars', name: 'Именную Звезду', emoji: '⭐' },
];

/* Price map for each planet/package */
const PRICES = [49, 69, 99, 149, 179, 299, 549];

const getMinutesAgo = () => Math.floor(Math.random() * 14) + 1;

const LiveActivityFeed = () => {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);

  const triggerNotification = useCallback(() => {
    const randomName   = NAMES[Math.floor(Math.random() * NAMES.length)];
    const randomCity   = CITIES[Math.floor(Math.random() * CITIES.length)];
    const randomPlanet = PLANETS[Math.floor(Math.random() * PLANETS.length)];
    const randomPrice  = PRICES[Math.floor(Math.random() * PRICES.length)];
    const minutesAgo   = getMinutesAgo();

    setNotification({ name: randomName, city: randomCity, planet: randomPlanet, price: randomPrice, minutesAgo });
    setVisible(true);

    setTimeout(() => setVisible(false), 6000);
  }, []);

  useEffect(() => {
    // First toast after 4 seconds (was 8)
    const initialTimer = setTimeout(triggerNotification, 4000);
    // Subsequent every 20 seconds
    const interval = setInterval(triggerNotification, 20000);
    return () => { clearTimeout(initialTimer); clearInterval(interval); };
  }, [triggerNotification]);

  /* Always keep DOM mounted — only animate opacity/transform */
  return (
    <div
      className={`live-activity-toast glass-card ${visible ? 'visible-toast' : ''}`}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        width: '320px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'rgba(12, 10, 20, 0.88)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.6), 0 0 15px rgba(10,186,181,0.15)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease',
        transform: visible ? 'translateY(0)' : 'translateY(110px)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'all' : 'none',
      }}
      aria-live="polite"
    >
      {/* Icon */}
      <div style={{
        background: 'rgba(10,186,181,0.15)',
        border: '1px solid rgba(10,186,181,0.3)',
        width: 40, height: 40,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <ShoppingBag size={16} className="text-gold" />
      </div>

      {/* Text */}
      {notification && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#22c55e', boxShadow: '0 0 6px #22c55e',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Новый заказ • {notification.minutesAgo} мин. назад
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#f8fafc', lineHeight: 1.4 }}>
            <strong>{notification.name}</strong> из {notification.city} приобрёл(а){' '}
            {notification.planet.emoji} <strong>{notification.planet.name}</strong>{' '}
            за <strong style={{ color: 'oklch(76% 0.14 195)' }}>${notification.price}</strong>
          </p>
        </div>
      )}

      {/* Close */}
      <button
        onClick={() => setVisible(false)}
        style={{
          background: 'none', border: 'none',
          color: '#475569', cursor: 'pointer',
          padding: '2px', display: 'flex',
          alignItems: 'center', alignSelf: 'flex-start',
        }}
        aria-label="Закрыть"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default LiveActivityFeed;
