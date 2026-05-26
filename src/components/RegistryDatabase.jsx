import React, { useState } from 'react';
import { Search, MapPin, Gift, Calendar, Database } from 'lucide-react';

const RegistryDatabase = ({ registry, onLocatePlot }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBody, setFilterBody] = useState('all');

  const filteredRegistry = registry.filter((item) => {
    const matchesSearch = 
      item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.coordinate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.registryId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBody = filterBody === 'all' || item.bodyId === filterBody;

    return matchesSearch && matchesBody;
  });

  const getBodyBadgeClass = (bodyId) => {
    switch (bodyId) {
      case 'moon': return 'badge-moon';
      case 'mars': return 'badge-mars';
      case 'venus': return 'badge-venus';
      case 'stars': return 'badge-star';
      default: return '';
    }
  };

  return (
    <div className="registry-container animate-fade-in">
      <header className="registry-header text-center">
        <div className="badge animate-glow inline-flex items-center">
          <Database size={14} className="mr-1" />
          <span>Публичный блокчейн-реестр</span>
        </div>
        <h1 className="hero-title font-medium">Галактический Реестр Владельцев</h1>
        <p className="hero-subtitle">
          База данных официально зарегистрированных участков. Проверьте координаты или найдите владельцев космических тел.
        </p>
      </header>

      {/* Search and Filters */}
      <div className="registry-controls glass-card">
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Поиск по имени владельца, координатам (например, A-3) или № сертификата..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-pills">
          <button
            className={`pill-btn ${filterBody === 'all' ? 'active-pill' : ''}`}
            onClick={() => setFilterBody('all')}
          >
            Все объекты
          </button>
          <button
            className={`pill-btn ${filterBody === 'moon' ? 'active-pill' : ''}`}
            onClick={() => setFilterBody('moon')}
          >
            Луна
          </button>
          <button
            className={`pill-btn ${filterBody === 'mars' ? 'active-pill' : ''}`}
            onClick={() => setFilterBody('mars')}
          >
            Марс
          </button>
          <button
            className={`pill-btn ${filterBody === 'venus' ? 'active-pill' : ''}`}
            onClick={() => setFilterBody('venus')}
          >
            Венера
          </button>
          <button
            className={`pill-btn ${filterBody === 'stars' ? 'active-pill' : ''}`}
            onClick={() => setFilterBody('stars')}
          >
            Звезды
          </button>
        </div>
      </div>

      {/* Registry Grid */}
      <div className="registry-results">
        {filteredRegistry.length > 0 ? (
          <div className="registry-grid">
            {filteredRegistry.map((record) => (
              <div key={record.registryId} className="registry-card glass-card animate-scale-up">
                <div className="card-top">
                  <span className={`body-badge ${getBodyBadgeClass(record.bodyId)}`}>
                    {record.bodyName}
                  </span>
                  <span className="registry-id">{record.registryId}</span>
                </div>

                <div className="card-body">
                  <h3 className="owner-name text-neon-cyan">{record.owner}</h3>
                  
                  <div className="specs-list">
                    <div className="spec-item">
                      <MapPin size={14} className="text-slate-400" />
                      <span>Координаты: <strong>{record.coordinate}</strong></span>
                    </div>
                    <div className="spec-item">
                      <Gift size={14} className="text-slate-400" />
                      <span>Площадь: <strong>{record.packageName}</strong></span>
                    </div>
                    <div className="spec-item">
                      <Calendar size={14} className="text-slate-400" />
                      <span>Дата покупки: <span>{record.date}</span></span>
                    </div>
                  </div>

                  {record.dedication && (
                    <div className="card-dedication">
                      <p className="dedication-quote-sm">« {record.dedication} »</p>
                    </div>
                  )}
                </div>

                <div className="card-footer-action">
                  <button 
                    className="btn btn-secondary btn-full btn-small"
                    onClick={() => onLocatePlot(record.bodyId, record.coordinate)}
                  >
                    <MapPin size={14} className="text-neon-cyan" />
                    <span>Показать на карте</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results glass-card text-center py-16">
            <p className="text-lg text-slate-400">Секторы не найдены по вашему запросу</p>
            <p className="text-sm text-slate-500 mt-2">Попробуйте изменить поисковой запрос или сбросить фильтры.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistryDatabase;
