import React, { useState } from 'react';
import { Search, MapPin, Database, Award } from 'lucide-react';

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

  return (
    <div className="registry-container-lux animate-fade-in">
      <header className="registry-header-lux text-center">
        <div className="luxury-badge">
          <Database size={12} className="mr-1" />
          <span>Архив Галактических Записей</span>
        </div>
        <h1 className="hero-title-lux font-medium">Официальный реестр собственников</h1>
        <p className="hero-desc-lux max-w-xl mx-auto">
          Публичный реестр зарегистрированных секторов. Найдите запись по имени владельца или по координатам.
        </p>
      </header>

      {/* Luxury search controller */}
      <div className="registry-controls-lux glass-card">
        <div className="search-bar-lux">
          <Search size={16} className="search-icon-lux" />
          <input
            type="text"
            placeholder="Имя владельца, координаты (A-3) или № записи..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lux-input-search"
          />
        </div>

        <div className="filter-tabs-lux">
          {['all', 'moon', 'mars', 'venus', 'stars'].map((body) => {
            const labels = { all: 'Все объекты', moon: 'Луна', mars: 'Марс', venus: 'Венера', stars: 'Звезды' };
            return (
              <button
                key={body}
                className={`filter-tab-lux ${filterBody === body ? 'active' : ''}`}
                onClick={() => setFilterBody(body)}
              >
                {labels[body]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ledger Results */}
      <div className="registry-results-lux">
        {filteredRegistry.length > 0 ? (
          <div className="ledger-table glass-card">
            <div className="ledger-header-row">
              <span>Свидетельство</span>
              <span>Космическое тело</span>
              <span>Координаты</span>
              <span>Собственник</span>
              <span>Дата</span>
              <span>Действие</span>
            </div>

            {filteredRegistry.map((record) => (
              <div key={record.registryId} className="ledger-body-row animate-slide-up">
                <span className="font-mono text-gold text-xs">{record.registryId}</span>
                <span className="text-white font-medium">{record.bodyName}</span>
                <span className="font-mono text-gold">{record.coordinate}</span>
                <span className="text-white font-semibold">{record.owner}</span>
                <span className="text-slate-400 text-xs">{record.date}</span>
                <button 
                  className="btn-lux btn-lux-secondary btn-small"
                  onClick={() => onLocatePlot(record.bodyId, record.coordinate)}
                >
                  <MapPin size={12} className="text-gold" />
                  <span>На карте</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results-lux glass-card text-center">
            <p className="text-slate-400">Записи не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistryDatabase;
