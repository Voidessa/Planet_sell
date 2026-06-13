import React, { useState, useEffect } from 'react';
import StarryBackground from './components/StarryBackground';
import AmbientBackground from './components/AmbientBackground';
import Hero from './components/Hero';
import CelestialExplorer from './components/CelestialExplorer';
import CertificateCustomizer from './components/CertificateCustomizer';
import CheckoutSimulator from './components/CheckoutSimulator';
import RegistryDatabase from './components/RegistryDatabase';
import GiftViewer from './components/GiftViewer';
import AmbientAudio from './components/AmbientAudio';
import LiveActivityFeed from './components/LiveActivityFeed';
import { Compass, Database, Home, Globe, ChevronLeft, ChevronRight } from 'lucide-react';

const MOCK_REGISTRY_KEY = 'cosmos_registry_records_usd';

const INITIAL_MOCK_REGISTRY = [
  {
    owner: 'Нил Армстронг',
    bodyId: 'moon',
    bodyName: 'Луна',
    coordinate: 'A-3',
    packageName: '14 Акров (Герцогство)',
    price: 549,
    registryId: 'CR-A-3-88204',
    date: '20.07.1969',
    dedication: 'Один маленький шаг для человека, но гигантский скачок для всего человечества.',
    theme: 'classic-gold',
  },
  {
    owner: 'Илон Маск',
    bodyId: 'mars',
    bodyName: 'Марс',
    coordinate: 'D-8',
    packageName: '49 Акров (Суверенная колония)',
    price: 1699,
    registryId: 'CR-D-8-44109',
    date: '14.03.2002',
    dedication: 'Я бы хотел умереть на Марсе, но только не от удара о поверхность.',
    theme: 'minimal-onyx',
  },
  {
    owner: 'Юрий Гагарин',
    bodyId: 'moon',
    bodyName: 'Луна',
    coordinate: 'G-2',
    packageName: '7 Акров (Королевское поместье)',
    price: 299,
    registryId: 'CR-G-2-12044',
    date: '12.04.1961',
    dedication: 'Облетев Землю в корабле-спутнике, я увидел, как прекрасна наша планета. Люди, будем хранить и приумножать эту красоту!',
    theme: 'classic-gold',
  },
  {
    owner: 'Алексей и Мария',
    bodyId: 'stars',
    bodyName: 'Именная Звезда',
    coordinate: 'E-5',
    packageName: '4 Акра (Семейное владение)',
    price: 179,
    registryId: 'CR-E-5-30012',
    date: '14.02.2025',
    dedication: 'Наша любовь горит ярче всех созвездий во Вселенной. Эта звезда принадлежит тебе, моя любимая.',
    theme: 'classic-gold',
  },
];

function App() {
  const [page, setPage] = useState('home');
  const [registry, setRegistry] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [customizedOrder, setCustomizedOrder] = useState(null);
  const [selectedBodyId, setSelectedBodyId] = useState('moon');
  const [giftIdParam, setGiftIdParam] = useState(null);

  useEffect(() => {
    const savedRegistry = localStorage.getItem(MOCK_REGISTRY_KEY);
    if (savedRegistry) {
      setRegistry(JSON.parse(savedRegistry));
    } else {
      setRegistry(INITIAL_MOCK_REGISTRY);
      localStorage.setItem(MOCK_REGISTRY_KEY, JSON.stringify(INITIAL_MOCK_REGISTRY));
    }

    const params = new URLSearchParams(window.location.search);
    const giftId = params.get('gift');
    const pageParam = params.get('page');
    
    if (giftId) {
      setGiftIdParam(giftId);
      setPage('gift-viewer');
    } else if (pageParam) {
      setPage(pageParam);
    }

    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setPage(e.state.page);
        if (e.state.bodyId) setSelectedBodyId(e.state.bodyId);
      } else {
        setPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const bindGlassTilt = () => {
      // Disable glass tilt/glare effect on touch/coarse-pointer devices to prevent mobile jitter
      const isTouchDevice = 
        ('ontouchstart' in window) || 
        (navigator.maxTouchPoints > 0) || 
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      
      if (isTouchDevice) return;

      const cards = document.querySelectorAll(
        '.glass-card:not(.main-navbar):not(.main-footer), .planet-card, .hiw-step-card, .feature-lux-card, .stat-lux-card'
      );
      cards.forEach(card => {
        if (card.dataset.tiltBound) return;
        card.dataset.tiltBound = 'true';

        const handleMouseMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -9;
          const rotateY = ((x - centerX) / centerX) * 9;
          
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
          
          const percentX = (x / rect.width) * 100;
          const percentY = (y / rect.height) * 100;
          card.style.setProperty('--glare-x', `${percentX}%`);
          card.style.setProperty('--glare-y', `${percentY}%`);
        };

        const handleMouseLeave = () => {
          card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
          card.style.setProperty('--glare-x', '50%');
          card.style.setProperty('--glare-y', '50%');
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    bindGlassTilt();
    
    const observer = new MutationObserver(bindGlassTilt);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [page]);

  const handleAddNewPurchase = (newRecord) => {
    const updated = [newRecord, ...registry];
    setRegistry(updated);
    localStorage.setItem(MOCK_REGISTRY_KEY, JSON.stringify(updated));
  };

  const handleNavigate = (targetPage, options = {}) => {
    if (options.bodyId) {
      setSelectedBodyId(options.bodyId);
    }
    
    if (targetPage === 'home' || targetPage === 'explore') {
      setSelectedPlot(null);
      setCustomizedOrder(null);
    }
    
    setPage(targetPage);
    window.history.pushState({ page: targetPage, bodyId: options.bodyId || selectedBodyId }, '', `?page=${targetPage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLocatePlotOnMap = (bodyId, coordinate) => {
    setSelectedBodyId(bodyId);
    setPage('explore');
    setTimeout(() => {
      const cellElement = document.querySelector('.explorer-globe-viewport');
      if (cellElement) {
        cellElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const getStats = () => {
    const totalSold = registry.length;
    const owners = new Set(registry.map(item => item.owner));
    return {
      totalSold,
      activeOwners: owners.size
    };
  };

  return (
    <div className="app-layout">
      <AmbientBackground />
      <StarryBackground />

      {page !== 'gift-viewer' && (
        <nav className="main-navbar glass-card">
          <div className="nav-logo-group" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="nav-logo" onClick={() => handleNavigate('home')}>
              <Globe className="logo-icon text-gold" />
              <span className="logo-text">Cosmos<span className="text-gold">Registry</span></span>
            </div>
            
            <div className="nav-arrows" style={{ display: 'flex', gap: '4px' }}>
              <button 
                className="nav-link-btn" 
                onClick={() => window.history.back()}
                style={{ padding: '6px', minHeight: 'auto' }}
                title="Назад"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                className="nav-link-btn" 
                onClick={() => window.history.forward()}
                style={{ padding: '6px', minHeight: 'auto' }}
                title="Вперед"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="nav-links">
            <button 
              className={`nav-link-btn ${page === 'home' ? 'active-link' : ''}`}
              onClick={() => handleNavigate('home')}
            >
              <Home size={14} />
              <span>Главная</span>
            </button>
            <button 
              className={`nav-link-btn ${page === 'explore' ? 'active-link' : ''}`}
              onClick={() => handleNavigate('explore')}
            >
              <Compass size={14} />
              <span>Исследовать</span>
            </button>
            <button 
              className={`nav-link-btn ${page === 'registry' ? 'active-link' : ''}`}
              onClick={() => handleNavigate('registry')}
            >
              <Database size={14} />
              <span>Реестр</span>
            </button>
            <AmbientAudio />
          </div>
        </nav>
      )}

      <main className="content-container">
        {page === 'home' && (
          <Hero 
            onNavigate={handleNavigate} 
            stats={getStats()} 
          />
        )}

        {page === 'explore' && (
          <CelestialExplorer
            initialBodyId={selectedBodyId}
            registry={registry}
            onSelectPlot={(plot) => {
              setSelectedPlot(plot);
              setPage('customizer');
            }}
          />
        )}

        {page === 'customizer' && selectedPlot && (
          <CertificateCustomizer
            plotInfo={selectedPlot}
            onBack={() => setPage('explore')}
            onProceed={(order) => {
              setCustomizedOrder(order);
              setPage('checkout');
            }}
          />
        )}

        {page === 'checkout' && customizedOrder && (
          <CheckoutSimulator
            orderDetails={customizedOrder}
            onBack={() => setPage('customizer')}
            onPurchaseComplete={(newRecord, returnToHome = false) => {
              if (newRecord) {
                handleAddNewPurchase(newRecord);
              }
              if (returnToHome) {
                handleNavigate('home');
              }
            }}
          />
        )}

        {page === 'registry' && (
          <RegistryDatabase
            registry={registry}
            onLocatePlot={handleLocatePlotOnMap}
          />
        )}

        {page === 'gift-viewer' && giftIdParam && (
          <GiftViewer
            registryId={giftIdParam}
            registry={registry}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {page !== 'gift-viewer' && (
        <footer className="main-footer glass-card">
          <p>© 2026 CosmosRegistry Inc. Все права защищены.</p>
          <p className="footer-note">Услуга является сувенирным/подарочным продуктом. Записи хранятся в частном блокчейн-реестре.</p>
        </footer>
      )}

      <LiveActivityFeed />
    </div>
  );
}

export default App;
