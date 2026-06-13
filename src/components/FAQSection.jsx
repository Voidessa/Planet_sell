import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      q: "Действительно ли я юридически владею этой землей?",
      a: "Все записи о праве владения вносятся в наш частный международный реестр CosmosRegistry. С юридической точки зрения это сувенирный и символический подарок, так как согласно Договору о космосе ООН 1967 года, небесные тела не могут быть приватизированы государствами. Однако, владение именным сектором в нашем реестре — это уникальный романтический жест, который закрепляет координаты за вами навсегда."
    },
    {
      q: "Как получатель увидит свой космический подарок?",
      a: "После покупки вы получаете секретную интерактивную ссылку. Получатель перейдет по ней и увидит эффектную 3D-анимацию: полет сквозь галактику к выбранной планете и приближение прямо к его координатной ячейке, где загорится персональный маяк. Там же он сможет открыть виртуальный конверт с вашим личным пожеланием и скачать свидетельство."
    },
    {
      q: "Могу ли я выбрать конкретные координаты на планете?",
      a: "Да! Наша интерактивная 3D-карта позволяет вам вращать планеты и выбирать любой свободный сектор в сетке координат кликом. Если сектор свободен, вы можете мгновенно зарезервировать его на имя вашего близкого человека."
    },
    {
      q: "Что именно входит в комплект при заказе?",
      a: "В комплект входит: мгновенное внесение записи в глобальную базу CosmosRegistry, пожизненный доступ к интерактивной 3D-карте с маяком, цифровое свидетельство в ультра-высоком разрешении для печати (с золотым тиснением и вашим поздравлением) и ссылка на интерактивный полет."
    },
    {
      q: "Какие есть гарантии возврата средств?",
      a: "Мы уверены в качестве нашего продукта на 100%. Если подарок по какой-то причине не подошел вам или получателю, просто напишите нам в течение 30 дней после оформления. Мы аннулируем запись в реестре и вернем полную стоимость покупки на вашу карту."
    }
  ];

  const toggleAccordion = (index) => {
    // Play subtle hover/click sound if audio initialized
    if (window.playCosmosSFX) {
      window.playCosmosSFX('click');
    }
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section-lux animate-fade-in">
      <div className="text-center mb-10">
        <div className="luxury-badge mb-3">
          <span>Полезная информация</span>
        </div>
        <h2 className="section-title text-gold-gradient" style={{ margin: 0 }}>Часто задаваемые вопросы</h2>
        <p className="section-sub" style={{ marginTop: '8px' }}>Всё, что вы хотели знать о покупке космической собственности</p>
      </div>

      <div className="faq-accordion-container">
        {faqData.map((item, index) => {
          const isOpen = activeIndex === index;
          return (
            <div 
              key={index} 
              className={`faq-item-lux glass-card ${isOpen ? 'active' : ''}`}
              style={{
                marginBottom: '16px',
                overflow: 'hidden',
                borderRadius: '8px',
                border: isOpen ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.05)',
                background: isOpen ? '#1e1e2a' : '#161622',
              }}
            >
              <button
                className="faq-question-btn"
                onClick={() => toggleAccordion(index)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 24px',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <HelpCircle size={16} className={isOpen ? "text-gold" : "text-slate-400"} />
                  <span>{item.q}</span>
                </div>
                <ChevronDown 
                  size={16} 
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    color: isOpen ? 'oklch(76% 0.14 195)' : '#94a3b8'
                  }}
                />
              </button>

              <div
                className="faq-answer-wrapper"
                style={{
                  maxHeight: isOpen ? '300px' : '0px',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  opacity: isOpen ? 1 : 0,
                  overflow: 'hidden',
                }}
              >
                <p 
                  style={{
                    padding: '0 24px 20px 52px',
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    color: '#94a3b8',
                  }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQSection;
