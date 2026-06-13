import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    text: '«Подарил жене участок на Марсе — она плакала от счастья. Самый необычный подарок за 10 лет!»',
    author: 'Amirxon T.',
    city: 'Ташкент',
    planet: '🔴 Марс',
    stars: 5,
  },
  {
    text: '«Мой парень назвал звезду в созвездии Ориона в честь нашей годовщины. Это невероятно романтично!»',
    author: 'Shahzoda R.',
    city: 'Самарканд',
    planet: '⭐ Именная Звезда',
    stars: 5,
  },
  {
    text: '«Сертификат распечатал и вставил в рамку — смотрится как настоящий государственный документ. Все друзья в шоке!»',
    author: 'Jasur_bek',
    city: 'Бухара',
    planet: '🌙 Луна',
    stars: 5,
  },
  {
    text: '«Оформил за 5 минут. 3D-анимация когда жена открыла ссылку — она была в слезах. Рекомендую всем!»',
    author: 'Sardor U.',
    city: 'Фергана',
    planet: '🌕 Венера',
    stars: 5,
  },
];

const SocialProofBanner = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveIdx(prev => (prev + 1) % REVIEWS.length);
        setFading(false);
      }, 300);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const review = REVIEWS[activeIdx];

  return (
    <div className="social-proof-banner glass-card">
      {/* Stars row */}
      <div className="spb-stars">
        {Array.from({ length: review.stars }).map((_, i) => (
          <Star key={i} size={13} fill="oklch(76% 0.14 195)" stroke="none" />
        ))}
        <span className="spb-planet-tag">{review.planet}</span>
      </div>

      {/* Quote */}
      <p className={`spb-quote ${fading ? 'spb-fade-out' : 'spb-fade-in'}`}>
        {review.text}
      </p>

      {/* Author */}
      <div className="spb-author">
        <div className="spb-avatar">
          {review.author.charAt(0).toUpperCase()}
        </div>
        <div className="spb-author-info">
          <span className="spb-author-name">{review.author}</span>
          <span className="spb-author-city">{review.city}</span>
        </div>
      </div>

      {/* Dots */}
      <div className="spb-dots">
        {REVIEWS.map((_, i) => (
          <button
            key={i}
            className={`spb-dot ${i === activeIdx ? 'active' : ''}`}
            onClick={() => { setFading(true); setTimeout(() => { setActiveIdx(i); setFading(false); }, 200); }}
            aria-label={`Отзыв ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SocialProofBanner;
