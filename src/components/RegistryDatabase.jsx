import React, { useState } from 'react';
import { Search, MapPin, Database, Award, ChevronLeft, ChevronRight, X } from 'lucide-react';

const PLANET_EMOJI = { moon: '🌙', mars: '🔴', venus: '🌕', stars: '⭐' };
const PAGE_SIZE = 8;

const RegistryDatabase = ({ registry, onLocatePlot }) => {
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterBody, setFilterBody]   = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filteredRegistry = registry.filter((item) => {
    const matchesSearch =
      item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.coordinate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.registryId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBody = filterBody === 'all' || item.bodyId === filterBody;
    return matchesSearch && matchesBody;
  });

  const totalPages    = Math.max(1, Math.ceil(filteredRegistry.length / PAGE_SIZE));
  const safePage      = Math.min(currentPage, totalPages);
  const pageItems     = filteredRegistry.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(1); };
  const handleFilter = (val) => { setFilterBody(val); setCurrentPage(1); };

  return (
    <div className="registry-container-lux animate-fade-in">
      <header className="registry-header-lux text-center">
        <div className="luxury-badge">
          <Database size={12} style={{ marginRight: 4 }} />
          <span>Архив Галактических Записей</span>
        </div>
        <h1 className="hero-title-lux font-medium">Официальный реестр собственников</h1>
        <p className="hero-desc-lux" style={{ maxWidth: 560, margin: '0 auto' }}>
          Публичный реестр зарегистрированных секторов. Найдите запись по имени владельца или по координатам.
        </p>
      </header>

      {/* Search + filter */}
      <div className="registry-controls-lux glass-card">
        <div className="search-bar-lux">
          <Search size={16} className="search-icon-lux" />
          <input
            type="text"
            placeholder="Имя владельца, координаты (A-3) или № записи..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="lux-input-search"
          />
        </div>

        <div className="filter-tabs-lux">
          {['all', 'moon', 'mars', 'venus', 'stars'].map((body) => {
            const labels = { all: 'Все объекты', moon: '🌙 Луна', mars: '🔴 Марс', venus: '🌕 Венера', stars: '⭐ Звезды' };
            return (
              <button
                key={body}
                className={`filter-tab-lux ${filterBody === body ? 'active' : ''}`}
                onClick={() => handleFilter(body)}
              >
                {labels[body]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="registry-results-lux">
        {pageItems.length > 0 ? (
          <>
            <div className="ledger-table glass-card">
              <div className="ledger-header-row">
                <span>Свидетельство</span>
                <span>Объект</span>
                <span>Координаты</span>
                <span>Собственник</span>
                <span>Дата</span>
                <span>Действие</span>
              </div>

              {pageItems.map((record) => (
                <div
                  key={record.registryId}
                  className="ledger-body-row animate-slide-up"
                  onClick={() => setSelectedRecord(record)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="font-mono text-gold text-xs">{record.registryId}</span>
                  <span className="text-white font-medium">
                    {PLANET_EMOJI[record.bodyId] || ''} {record.bodyName}
                  </span>
                  <span className="font-mono text-gold">{record.coordinate}</span>
                  <span className="text-white font-semibold">{record.owner}</span>
                  <span className="text-slate-400 text-xs">{record.date}</span>
                  <button
                    className="btn-lux btn-lux-secondary btn-small"
                    onClick={(e) => { e.stopPropagation(); onLocatePlot(record.bodyId, record.coordinate); }}
                  >
                    <MapPin size={12} className="text-gold" />
                    <span>На карте</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="registry-pagination">
                <button
                  className="btn-lux btn-lux-secondary btn-small"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="pagination-info">
                  Страница {safePage} из {totalPages}
                  &nbsp;·&nbsp;
                  {filteredRegistry.length} записей
                </span>
                <button
                  className="btn-lux btn-lux-secondary btn-small"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-results-lux glass-card text-center">
            <p className="text-slate-400">Записи не найдены</p>
          </div>
        )}
      </div>

      {/* Side panel modal for record details */}
      {selectedRecord && (
        <div className="registry-detail-overlay" onClick={() => setSelectedRecord(null)}>
          <div
            className="registry-detail-panel glass-card animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rdp-header">
              <div>
                <span className="luxury-badge" style={{ marginBottom: 8 }}>
                  {PLANET_EMOJI[selectedRecord.bodyId]} {selectedRecord.bodyName}
                </span>
                <h3 className="rdp-title">{selectedRecord.owner}</h3>
              </div>
              <button className="rdp-close-btn" onClick={() => setSelectedRecord(null)} aria-label="Закрыть">
                <X size={18} />
              </button>
            </div>

            <div className="rdp-rows">
              {[
                { label: 'Реестровый №',   value: selectedRecord.registryId },
                { label: 'Координаты',      value: selectedRecord.coordinate },
                { label: 'Площадь участка', value: selectedRecord.packageName },
                { label: 'Дата регистрации',value: selectedRecord.date },
                { label: 'Стоимость',       value: selectedRecord.price ? `$${selectedRecord.price.toLocaleString()}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="rdp-row">
                  <span className="rdp-label">{label}</span>
                  <span className="rdp-value">{value}</span>
                </div>
              ))}
            </div>

            {selectedRecord.dedication && (
              <div className="rdp-dedication">
                <Award size={14} className="text-gold" style={{ flexShrink: 0 }} />
                <p>«{selectedRecord.dedication}»</p>
              </div>
            )}

            <button
              className="btn-lux btn-lux-primary btn-full btn-glow"
              style={{ marginTop: 16 }}
              onClick={() => { setSelectedRecord(null); onLocatePlot(selectedRecord.bodyId, selectedRecord.coordinate); }}
            >
              <MapPin size={14} />
              <span>Показать на 3D-карте</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistryDatabase;
