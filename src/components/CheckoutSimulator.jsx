import React, { useState } from 'react';
import { CreditCard, Shield, Download, Share2, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
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

  const loadingSteps = [
    'Инициализация безопасного шлюза SpacePay...',
    'Проверка свободных координат в реестре...',
    'Перевод средств в звездные кредиты...',
    'Печать цифровой голограммы реестра...',
    'Генерация уникального сертификата...'
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

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvc(value.substring(0, 3));
  };

  const startPayment = (e) => {
    e.preventDefault();
    if (!email.trim() || !cardNumber || !cardHolder || !expiry || !cvc) {
      alert('Пожалуйста, заполните все поля формы!');
      return;
    }

    setPaymentState('loading');
    setLoadingStep(0);

    // Simulate stepping through loading tasks
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
    }, 1200);
  };

  const completePayment = () => {
    const regId = `CR-${orderDetails.coordinate}-${Math.floor(Math.random() * 90000 + 10000)}`;
    setGeneratedRegId(regId);
    setPaymentState('success');

    // Trigger cool space-themed confetti explosion!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00F0FF', '#FF007A', '#FFB800', '#ffffff', '#8B5CF6'],
    });

    // Call state updater in parent App
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
    alert('Ссылка скопирована в буфер обмена! Отправьте её получателю подарка.');
  };

  return (
    <div className="checkout-container animate-fade-in">
      {paymentState === 'form' && (
        <div className="checkout-split">
          {/* Form Side */}
          <div className="checkout-form-panel glass-card">
            <button className="btn-back-text" onClick={onBack}>
              <ArrowLeft size={16} /> Назад к редактированию
            </button>
            <h2 className="section-title text-neon-cyan">Оплата подарка</h2>
            <p className="section-sub">Заполните платежные данные для завершения регистрации.</p>

            <form onSubmit={startPayment} className="form-wrapper">
              <div className="form-group">
                <label className="info-label">Ваш E-mail (для отправки чека и PDF):</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="custom-input"
                  required
                />
              </div>

              {/* Cosmic Card Fields */}
              <div className="form-group">
                <label className="info-label">Номер карты:</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="custom-input font-mono"
                  required
                />
              </div>

              <div className="form-group">
                <label className="info-label">Имя владельца карты (латиницей):</label>
                <input
                  type="text"
                  placeholder="IVAN IVANOV"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  className="custom-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="info-label">Срок действия:</label>
                  <input
                    type="text"
                    placeholder="ММ/ГГ"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="custom-input text-center font-mono"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="info-label">CVC/CVV:</label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvc}
                    onChange={handleCvcChange}
                    className="custom-input text-center font-mono"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-glow btn-checkout">
                <CreditCard size={18} />
                <span>Оплатить {orderDetails.price.toLocaleString()} ₽</span>
              </button>
            </form>
          </div>

          {/* Interactive Card Visualizer */}
          <div className="checkout-visual-panel">
            <div className="space-card-wrapper">
              <div className="space-card glass-card">
                <div className="card-stars-overlay" />
                <div className="card-top-row">
                  <div className="card-chip" />
                  <span className="card-brand text-neon-cyan">SpacePay</span>
                </div>
                <div className="card-number font-mono">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="card-bottom-row">
                  <div className="card-holder-info">
                    <span className="card-lbl">ВЛАДЕЛЕЦ</span>
                    <span className="card-val">{cardHolder || 'IVAN IVANOV'}</span>
                  </div>
                  <div className="card-expiry-info">
                    <span className="card-lbl">СРОК</span>
                    <span className="card-val">{expiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="security-badges text-center">
              <Shield className="text-neon-cyan inline-block mr-2" size={16} />
              <span className="text-sm text-slate-400">Шифрование данных 256-бит SHA-Galaxy</span>
            </div>
          </div>
        </div>
      )}

      {paymentState === 'loading' && (
        <div className="checkout-loading-screen glass-card text-center animate-fade-in">
          <div className="loader-spinner-wrapper">
            <RefreshCw size={48} className="spinner text-neon-cyan" />
          </div>
          <h3 className="loading-headline">Регистрация в Галактическом Реестре</h3>
          <p className="loading-step-text text-neon-pink">
            {loadingSteps[loadingStep]}
          </p>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {paymentState === 'success' && (
        <div className="checkout-success-screen glass-card text-center animate-scale-up">
          <div className="success-icon-wrapper">
            <CheckCircle2 size={64} className="text-neon-cyan animate-pulse" />
          </div>
          
          <h2 className="success-headline text-neon-cyan">Поздравляем с Покупкой!</h2>
          <p className="success-sub">
            Участок <strong>{orderDetails.coordinate}</strong> на теле <strong>{orderDetails.bodyName}</strong> успешно зарегистрирован на имя <strong>{orderDetails.owner}</strong>.
          </p>

          <hr className="divider my-6" />

          {/* Share options */}
          <div className="success-actions-box">
            <h3>Подарите интерактивную ссылку с анимацией приближения:</h3>
            <p className="share-desc">Получатель откроет ссылку и увидит трехмерный полет сквозь звезды прямо к своему новому участку!</p>
            
            <div className="share-link-input-group">
              <input 
                type="text" 
                readOnly 
                value={getShareLink()} 
                className="custom-input share-url-field"
              />
              <button className="btn btn-secondary btn-copy" onClick={copyShareLink}>
                <Share2 size={16} />
                <span>Копировать</span>
              </button>
            </div>
          </div>

          <div className="success-button-row">
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Download size={16} />
              <span>Распечатать PDF</span>
            </button>
            <button className="btn btn-primary btn-glow" onClick={() => onPurchaseComplete(null, true)}>
              Вернуться на Главную
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutSimulator;
