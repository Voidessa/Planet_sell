import React, { useState } from 'react';
import { Shield, Download, Share2, ArrowLeft, RefreshCw, MailOpen, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

const CheckoutSimulator = ({ orderDetails, onBack, onPurchaseComplete }) => {
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [paymentState, setPaymentState] = useState('form'); // 'form', 'loading', 'success'
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedRegId, setGeneratedRegId] = useState('');
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  const loadingSteps = [
    'Подключение к защищенному шлюзу...',
    'Резервирование координат в звездной базе...',
    'Проведение транзакции...',
    'Наложение цифровой гербовой печати...',
    'Свидетельство успешно сгенерировано.'
  ];

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(value.substring(0, 19));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiry(value.substring(0, 5));
  };

  const startPayment = (e) => {
    e.preventDefault();
    if (!email.trim() || !cardNumber || !cardHolder || !expiry || !cvc) {
      alert('Пожалуйста, заполните все поля!');
      return;
    }

    setPaymentState('loading');
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          completePayment();
          return prev;
        }
      });
    }, 1100);
  };

  const completePayment = () => {
    const regId = `CR-${orderDetails.coordinate}-${Math.floor(Math.random() * 90000 + 10000)}`;
    setGeneratedRegId(regId);
    setPaymentState('success');

    // Trigger soft, gold/silver stardust confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#d4af37', '#f9f6ee', '#ffffff', '#e5c060'],
    });

    onPurchaseComplete({
      ...orderDetails,
      email: email,
      registryId: regId,
      date: new Date().toLocaleDateString('ru-RU'),
    });
  };

  const getShareLink = () => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?gift=${generatedRegId}`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareLink());
    alert('Ссылка скопирована! Отправьте её получателю подарка.');
  };

  return (
    <div className="checkout-container-lux animate-fade-in">
      {paymentState === 'form' && (
        <div className="checkout-split-lux">
          
          {/* Form Side */}
          <div className="checkout-form-panel-lux glass-card">
            <button className="btn-back-lux" onClick={onBack}>
              <ArrowLeft size={14} /> Назад к оформлению
            </button>
            <h2 className="text-gold-gradient text-2xl font-bold">Оплата заказа</h2>
            <p className="section-sub">Защищенное оформление сувенирного права собственности.</p>

            <form onSubmit={startPayment} className="form-wrapper-lux">
              <div className="form-group-lux">
                <label className="info-label-lux">ВАШ E-MAIL (ДЛЯ ПОЛУЧЕНИЯ СВИДЕТЕЛЬСТВА):</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="lux-input"
                  required
                />
              </div>

              <div className="form-group-lux">
                <label className="info-label-lux">НОМЕР БАНКОВСКОЙ КАРТЫ:</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="lux-input font-mono"
                  required
                />
              </div>

              <div className="form-group-lux">
                <label className="info-label-lux">ИМЯ НА КАРТЕ (ЛАТИНИЦЕЙ):</label>
                <input
                  type="text"
                  placeholder="IVAN IVANOV"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  className="lux-input"
                  required
                />
              </div>

              <div className="form-row-lux">
                <div className="form-group-lux">
                  <label className="info-label-lux">СРОК ДЕЙСТВИЯ:</label>
                  <input
                    type="text"
                    placeholder="ММ/ГГ"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="lux-input text-center font-mono"
                    required
                  />
                </div>
                <div className="form-group-lux">
                  <label className="info-label-lux">CVC/CVV КОД:</label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                    className="lux-input text-center font-mono"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-lux btn-lux-primary btn-full btn-glow mt-4">
                <Lock size={16} />
                <span>Оплатить {orderDetails.price.toLocaleString()} ₽</span>
              </button>
            </form>
          </div>

          {/* Secure Details Side */}
          <div className="checkout-info-panel-lux glass-card">
            <h3>Детали покупки</h3>
            <div className="checkout-summary-box">
              <div className="summary-row-lux">
                <span>Космический объект:</span>
                <span>{orderDetails.bodyName}</span>
              </div>
              <div className="summary-row-lux">
                <span>Координаты участка:</span>
                <span className="font-mono text-gold">{orderDetails.coordinate}</span>
              </div>
              <div className="summary-row-lux">
                <span>Площадь:</span>
                <span>{orderDetails.packageName}</span>
              </div>
              <div className="summary-row-lux">
                <span>Владелец:</span>
                <span className="text-white">{orderDetails.owner}</span>
              </div>
            </div>

            <div className="checkout-protection-badge">
              <Shield className="text-gold" size={24} />
              <div>
                <h4>Безопасность платежей</h4>
                <p>Все транзакции шифруются и проводятся по международному стандарту безопасности PCI DSS.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentState === 'loading' && (
        <div className="checkout-loading-lux glass-card text-center animate-fade-in">
          <RefreshCw size={40} className="spinner text-gold mb-4" />
          <h3>Внесение в Галактический Реестр</h3>
          <p className="text-gold mt-2 font-mono text-sm">{loadingSteps[loadingStep]}</p>
        </div>
      )}

      {paymentState === 'success' && (
        <div className="checkout-success-lux text-center animate-scale-up">
          
          {/* Interactive 3D Envelope Opening Animation */}
          {!envelopeOpen ? (
            <div className="envelope-animation-container glass-card">
              <div className="envelope-seal-wrapper icon-pulse">
                <MailOpen size={48} className="text-gold" />
              </div>
              <h2 className="text-gold-gradient text-2xl font-bold mt-4">Подарок успешно создан!</h2>
              <p className="text-slate-400 mt-1 mb-6">Мы запечатали свидетельство в виртуальный золотой конверт.</p>
              
              <button 
                className="btn-lux btn-lux-primary btn-glow"
                onClick={() => setEnvelopeOpen(true)}
              >
                <span>Открыть конверт</span>
              </button>
            </div>
          ) : (
            // Opened Letter
            <div className="opened-gift-letter-container glass-card animate-slide-up">
              <div className="gold-letter-header">
                <span className="letter-registry">COSMOS REGISTRY</span>
                <h2>Поздравляем с приобретением!</h2>
              </div>
              
              <p className="letter-text">
                Участок <strong>{orderDetails.coordinate}</strong> на теле <strong>{orderDetails.bodyName}</strong> официально зарегистрирован на имя <strong>{orderDetails.owner}</strong>.
              </p>

              <div className="gift-letter-details">
                <div className="letter-row">
                  <span>Объект:</span>
                  <span>{orderDetails.bodyName}</span>
                </div>
                <div className="letter-row">
                  <span>Координаты:</span>
                  <span className="font-mono text-gold">{orderDetails.coordinate}</span>
                </div>
                <div className="letter-row">
                  <span>Идентификатор Реестра:</span>
                  <span className="font-mono text-xs">{generatedRegId}</span>
                </div>
              </div>

              <hr className="divider-lux" />

              <div className="letter-sharing-box">
                <h4>Подарите ссылку с 3D-полетом к планете:</h4>
                <p className="share-desc">Получатель откроет её и увидит эффектное приближение к своему участку.</p>
                <div className="share-link-row-lux">
                  <input 
                    type="text" 
                    readOnly 
                    value={getShareLink()} 
                    className="lux-input share-input-lux"
                  />
                  <button className="btn-lux btn-lux-secondary" onClick={copyShareLink}>
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              <div className="letter-actions-lux mt-6">
                <button className="btn-lux btn-lux-secondary" onClick={() => window.print()}>
                  <Download size={14} />
                  <span>Печать PDF</span>
                </button>
                <button className="btn-lux btn-lux-primary btn-glow" onClick={() => onPurchaseComplete(null, true)}>
                  Вернуться на главную
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckoutSimulator;
