import React, { useState, useEffect } from 'react';
import StarryBackground from './components/StarryBackground';
import Hero from './components/Hero';
import CelestialExplorer from './components/CelestialExplorer';
import CertificateCustomizer from './components/CertificateCustomizer';
import CheckoutSimulator from './components/CheckoutSimulator';
import RegistryDatabase from './components/RegistryDatabase';
import GiftViewer from './components/GiftViewer';
import { Compass, Database, Home, Globe } from 'lucide-react';

const MOCK_REGISTRY_KEY = 'cosmos_registry_records';

const INITIAL_MOCK_REGISTRY = [
  {
    owner: 'Нил Армстронг',
    bodyId: 'moon',
    bodyName: 'Луна',
    coordinate: 'A-3',
    packageName: '12 Акров (Королевский)',
    price: 7490,
    registryId: 'CR-A-3-88204',
    date: '20.07.1969',
    dedication: 'Один маленький шаг для человека, но гигантский скачок для всего человечества.',
    theme: 'gold',
  },
  {
    owner: 'Илон Маск',
    bodyId: 'mars',
    bodyName: 'Марс',
    coordinate: 'D-8',
    packageName: '50 Акров (Имперский)',
    price: 24990,
    registryId: 'CR-D-8-44109',
    date: '14.03.2002',
    dedication: 'Я бы хотел умереть на Марсе, но только не от удара о поверхность.',
    theme: 'cyber',
  },
  {
    owner: 'Юрий Гагарин',
    bodyId: 'moon',
    bodyName: 'Луна',
    coordinate: 'G-2',
    packageName: '7 Акров (Семейный)',
    price: 4990,
    registryId: 'CR-G-2-12044',
    date: '12.04.1961',
    dedication: 'Облетев Землю в корабле-спутнике, я увидел, как прекрасна наша планета. Люди, будем хранить и приумножать эту красоту, а не разрушать ее!',
    theme: 'stellar',
  },
  {
    owner: 'Алексей и Мария',
    bodyId: 'stars',
    bodyName: 'Звезда',
    coordinate: 'E-5',
    packageName: '3 Акра (Подарочный)',
    price: 3490,
    registryId: 'CR-E-5-30012',
    date: '14.02.2025',
    dedication: 'Наша любовь горит ярче всех созвездий во Вселенной. Эта звезда принадлежит тебе, моя любимая.',
    theme: 'stellar',
  },
];

function App() {
  const [page, setPage] = useState('home'); // 'home', 'explore', 'customizer', 'checkout', 'registry', 'gift-viewer'
  const [registry, setRegistry] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null); // Selected plot from explorer
  const [customizedOrder, setCustomizedOrder] = useState(null); // Customized certificate info
  const [selectedBodyId, setSelectedBodyId] = useState('moon'); // Body ID selected for redirection
  const [giftIdParam, setGiftIdParam] = useState(null);

  // Initialize registry from LocalStorage or mock data
  useEffect(() => {
    const savedRegistry = localStorage.getItem(MOCK_REGISTRY_KEY);
    if (savedRegistry) {
      setRegistry(JSON.parse(savedRegistry));
    } else {
      setRegistry(INITIAL_MOCK_REGISTRY);
      localStorage.setItem(MOCK_REGISTRY_KEY, JSON.stringify(INITIAL_MOCK_REGISTRY));
    }

    // Check URL parameters for ?gift=CR-XX-XXXXX
    const params = new URLSearchParams(window.location.search);
    const giftId = params.get('gift');
    if (giftId) {
      setGiftIdParam(giftId);
      setPage('gift-viewer');
    }
  }, []);

  // Sync state changes back to LocalStorage
  const handleAddNewPurchase = (newRecord) => {
    const updated = [newRecord, ...registry];
    setRegistry(updated);
    localStorage.setItem(MOCK_REGISTRY_KEY, JSON.stringify(updated));
  };

  const handleNavigate = (targetPage, options = {}) => {
    if (options.bodyId) {
      setSelectedBodyId(options.bodyId);
    }
    
    // Clear temp states on page switch
    if (targetPage === 'home' || targetPage === 'explore') {
      setSelectedPlot(null);
      setCustomizedOrder(null);
    }
    
    setPage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLocatePlotOnMap = (bodyId, coordinate) => {
    setSelectedBodyId(bodyId);
    setPage('explore');
    // Scroll slightly to let them see explorer
    setTimeout(() => {
      const cellElement = document.querySelector('.celestial-svg-grid');
      if (cellElement) {
        cellElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Get statistics
  const getStats = () => {
    const totalSold = registry.length;
    // Calculate unique owners
    const owners = new Set(registry.map(item => item.owner));
    return {
      totalSold,
      activeOwners: owners.size
    };
  };

  return (
    <div className="app-layout">
      {/* Dynamic Star Background on Canvas */}
      <StarryBackground />

      {/* Main Glowing Header Navigation */}
      {page !== 'gift-viewer' && (
        <nav className="main-navbar glass-card">
          <div className="nav-logo" onClick={() => handleNavigate('home')}>
            <Globe className="logo-icon text-neon-cyan" />
            <span className="logo-text">Cosmos<span className="text-neon-pink">Registry</span></span>
          </div>

          <div className="nav-links">
            <button 
              className={`nav-link-btn ${page === 'home' ? 'active-link' : ''}`}
              onClick={() => handleNavigate('home')}
            >
              <Home size={16} />
              <span>Главная</span>
            </button>
            <button 
              className={`nav-link-btn ${page === 'explore' ? 'active-link' : ''}`}
              onClick={() => handleNavigate('explore')}
            >
              <Compass size={16} />
              <span>Исследовать</span>
            </button>
            <button 
              className={`nav-link-btn ${page === 'registry' ? 'active-link' : ''}`}
              onClick={() => handleNavigate('registry')}
            >
              <Database size={16} />
              <span>Реестр</span>
            </button>
          </div>
        </nav>
      )}

      {/* Dynamic Render Pages */}
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

      {/* Main Footer */}
      {page !== 'gift-viewer' && (
        <footer className="main-footer glass-card">
          <p>© 2026 CosmosRegistry Inc. Все права защищены.</p>
          <p className="footer-note">Услуга является сувенирным/подарочным продуктом. Записи хранятся в частном блокчейн-реестре.</p>
        </footer>
      )}
    </div>
  );
}

export default App;
