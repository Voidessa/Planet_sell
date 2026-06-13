import React, { useState } from 'react';
import { Shield, Download, Share2, ArrowLeft, RefreshCw, MailOpen, Lock, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import ProgressStepper from './ProgressStepper';

const CheckoutSimulator = ({ orderDetails, onBack, onPurchaseComplete }) => {
  const [email, setEmail]           = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvc, setCvc]               = useState('');

  const [paymentState, setPaymentState] = useState('form'); // 'form' | 'loading' | 'success'
  const [loadingStep, setLoadingStep]   = useState(0);
  const [generatedRegId, setGeneratedRegId] = useState('');
  const [envelopeOpen, setEnvelopeOpen]     = useState(false);
  const [formError, setFormError]           = useState('');

  // Marketing Upsells
  const [alienInsurance, setAlienInsurance]         = useState(false);
  const [cylinderTube, setCylinderTube]             = useState(false);
  const [terraformingLicense, setTerraformingLicense] = useState(false);

  // Promo Code State
  const [promoInput, setPromoInput]     = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError]     = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Field errors
  const [errors, setErrors] = useState({});

  const getSubtotal = () => {
    let price = orderDetails.price;
    if (alienInsurance)     price += 5;
    if (cylinderTube)       price += 15;
    if (terraformingLicense) price += 9;
    return price;
  };

  const getDiscountAmount = () => Math.floor(getSubtotal() * discountPercent);
  const getTotalPrice     = () => getSubtotal() - getDiscountAmount();

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (code === 'COSMOS20') {
      setDiscountPercent(0.20);
      setPromoSuccess('Промокод COSMOS20 применен! Скидка 20%');
      setPromoError('');
      if (window.playCosmosSFX) window.playCosmosSFX('click');
    } else if (code === 'GIFT15' || code === 'COSMOS15') {
      setDiscountPercent(0.15);
      setPromoSuccess('Промокод применен! Скидка 15%');
      setPromoError('');
      if (window.playCosmosSFX) window.playCosmosSFX('click');
    } else {
      setPromoError('Неверный или истекший промокод');
      setPromoSuccess('');
    }
  };

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

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Введите корректный e-mail';
    const rawCard = cardNumber.replace(/\s/g, '');
    if (!rawCard || rawCard.length < 16)
      newErrors.cardNumber = 'Введите 16-значный номер карты';
    if (!cardHolder.trim())
      newErrors.cardHolder = 'Введите имя держателя карты';
    if (!expiry || expiry.length < 5)
      newErrors.expiry = 'Введите срок (ММ/ГГ)';
    if (!cvc || cvc.length < 3)
      newErrors.cvc = 'Введите 3-значный CVC';
    return newErrors;
  };

  const startPayment = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormError('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    setErrors({});
    setFormError('');
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

    if (window.playCosmosSFX) window.playCosmosSFX('purchase');

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
      price: getTotalPrice(),
      date: new Date().toLocaleDateString('ru-RU'),
    });
  };

  const handleOpenEnvelope = () => {
    setEnvelopeOpen(true);
    if (window.playCosmosSFX) window.playCosmosSFX('envelope');
  };

  const getShareLink = () => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?gift=${generatedRegId}`;
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareLink());
    } catch {
      /* fallback: do nothing */
    }
    const btn = document.getElementById('copy-share-btn');
    if (btn) { btn.textContent = '✓ Скопировано!'; setTimeout(() => { btn.textContent = ''; }, 2000); }
  };

  /* Tiffany accent color for checkboxes */
  const tiffanyAccent = 'rgba(255, 255, 255, 0.9)';

  return (
    <div className="checkout-container-lux animate-fade-in">
      {paymentState === 'form' && (
        <div className="checkout-split-lux">

          {/* ── Form Side ─────────────────────────── */}
          <div className="checkout-form-panel-lux glass-card">
            <button className="btn-back-lux" onClick={onBack}>
              <ArrowLeft size={14} /> Назад к оформлению
            </button>

            {/* Progress stepper */}
            <ProgressStepper 
              currentPage="checkout"
              onStepClick={(step) => {
                if (step === 'customizer') onBack();
                if (step === 'explore') onBack(); // Will go back to customizer, then user can go back again, or we can just go back once. Actually Checkout only has onBack which goes to customizer.
              }}
            />

            <h2 className="text-gold-gradient text-2xl font-bold" style={{ marginTop: '8px' }}>Оплата заказа</h2>
            <p className="section-sub">Защищенное оформление сувенирного права собственности.</p>

            <form onSubmit={startPayment} className="form-wrapper-lux" noValidate>

              {/* Email */}
              <div className="form-group-lux">
                <label className="info-label-lux">ВАШ E-MAIL (ДЛЯ ПОЛУЧЕНИЯ СВИДЕТЕЛЬСТВА):</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                  className={`lux-input ${errors.email ? 'input-error' : ''}`}
                />
                {errors.email && <div className="form-error-lux"><AlertCircle size={13}/><span>{errors.email}</span></div>}
              </div>

              {/* Card number */}
              <div className="form-group-lux">
                <label className="info-label-lux">НОМЕР БАНКОВСКОЙ КАРТЫ:</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className={`lux-input font-mono ${errors.cardNumber ? 'input-error' : ''}`}
                />
                {errors.cardNumber && <div className="form-error-lux"><AlertCircle size={13}/><span>{errors.cardNumber}</span></div>}
              </div>

              {/* Card holder */}
              <div className="form-group-lux">
                <label className="info-label-lux">ИМЯ НА КАРТЕ (ЛАТИНИЦЕЙ):</label>
                <input
                  type="text"
                  placeholder="IVAN IVANOV"
                  value={cardHolder}
                  onChange={(e) => { setCardHolder(e.target.value.toUpperCase()); setErrors(prev => ({ ...prev, cardHolder: '' })); }}
                  className={`lux-input ${errors.cardHolder ? 'input-error' : ''}`}
                />
                {errors.cardHolder && <div className="form-error-lux"><AlertCircle size={13}/><span>{errors.cardHolder}</span></div>}
              </div>

              {/* Expiry + CVC */}
              <div className="form-row-lux">
                <div className="form-group-lux">
                  <label className="info-label-lux">СРОК ДЕЙСТВИЯ:</label>
                  <input
                    type="text"
                    placeholder="ММ/ГГ"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className={`lux-input text-center font-mono ${errors.expiry ? 'input-error' : ''}`}
                  />
                  {errors.expiry && <div className="form-error-lux"><AlertCircle size={13}/><span>{errors.expiry}</span></div>}
                </div>
                <div className="form-group-lux">
                  <label className="info-label-lux">CVC/CVV КОД:</label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvc}
                    onChange={(e) => { setCvc(e.target.value.replace(/\D/g, '').substring(0, 3)); setErrors(prev => ({ ...prev, cvc: '' })); }}
                    className={`lux-input text-center font-mono ${errors.cvc ? 'input-error' : ''}`}
                  />
                  {errors.cvc && <div className="form-error-lux"><AlertCircle size={13}/><span>{errors.cvc}</span></div>}
                </div>
              </div>

              {/* Upsells */}
              <div className="checkout-upsells-section">
                <label className="info-label-lux">ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ:</label>

                {[
                  { state: alienInsurance,      setter: setAlienInsurance,      icon: '👽', title: 'Страховка от пришельцев', desc: 'Шуточный сертификат защиты',            price: '+$5' },
                  { state: cylinderTube,         setter: setCylinderTube,         icon: '📦', title: 'Космический тубус-капсула', desc: 'Подарочный металлический тубус',       price: '+$15' },
                  { state: terraformingLicense,  setter: setTerraformingLicense,  icon: '🚀', title: 'Лицензия на терраформирование', desc: 'Право освоения и посадки растений', price: '+$9' },
                ].map(({ state, setter, icon, title, desc, price }) => (
                  <label key={title} className="upsell-checkbox-card glass-card">
                    <input
                      type="checkbox"
                      checked={state}
                      onChange={(e) => {
                        setter(e.target.checked);
                        if (window.playCosmosSFX) window.playCosmosSFX('click');
                      }}
                      style={{ accentColor: tiffanyAccent }}
                    />
                    <div className="upsell-card-body">
                      <span className="upsell-title">{icon} {title}</span>
                      <span className="upsell-desc">{desc}</span>
                    </div>
                    <span className="upsell-price">{price}</span>
                  </label>
                ))}
              </div>

              {/* Promo Code */}
              <div className="promo-code-box">
                <label className="info-label-lux">АКТИВИРОВАТЬ ПРОМОКОД:</label>
                <div className="promo-row">
                  <input
                    type="text"
                    placeholder="Например: COSMOS20"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="lux-input promo-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    className="btn-lux btn-lux-secondary promo-btn"
                    onClick={handleApplyPromo}
                  >
                    Применить
                  </button>
                </div>
                {promoError   && <p className="promo-msg promo-msg-err">{promoError}</p>}
                {promoSuccess && <p className="promo-msg promo-msg-ok">{promoSuccess}</p>}
              </div>

              {/* Global form error */}
              {formError && (
                <div className="form-error-lux form-error-global">
                  <AlertCircle size={14} />
                  <span>{formError}</span>
                </div>
              )}

              <button type="submit" className="btn-lux btn-lux-primary btn-full btn-glow mt-4">
                <Lock size={16} />
                <span>Оплатить ${getTotalPrice().toLocaleString()}</span>
              </button>
            </form>
          </div>

          {/* ── Secure Details Side ──────────────────── */}
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

              <hr className="divider-lux" style={{ margin: '14px 0 10px 0' }} />

              <div className="summary-row-lux">
                <span>Базовая стоимость:</span>
                <span>${orderDetails.price.toLocaleString()}</span>
              </div>
              {alienInsurance && (
                <div className="summary-row-lux animate-slide-up">
                  <span>Страховка от пришельцев:</span>
                  <span>+$5</span>
                </div>
              )}
              {cylinderTube && (
                <div className="summary-row-lux animate-slide-up">
                  <span>Металлический тубус:</span>
                  <span>+$15</span>
                </div>
              )}
              {terraformingLicense && (
                <div className="summary-row-lux animate-slide-up">
                  <span>Лицензия терраформирования:</span>
                  <span>+$9</span>
                </div>
              )}
              {discountPercent > 0 && (
                <div className="summary-row-lux animate-slide-up" style={{ color: '#22c55e' }}>
                  <span>Скидка ({discountPercent * 100}%):</span>
                  <span>-${getDiscountAmount().toLocaleString()}</span>
                </div>
              )}

              <hr className="divider-lux" style={{ margin: '10px 0' }} />

              <div className="summary-row-lux" style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                <span>Итого к оплате:</span>
                <span className="text-gold">${getTotalPrice().toLocaleString()}</span>
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

          {!envelopeOpen ? (
            <div className="envelope-animation-container glass-card">
              <div className="envelope-seal-wrapper icon-pulse">
                <MailOpen size={48} className="text-gold" />
              </div>
              <h2 className="text-gold-gradient text-2xl font-bold mt-4">Подарок успешно создан!</h2>
              <p className="text-slate-400 mt-1 mb-6">Мы запечатали свидетельство в виртуальный золотой конверт.</p>

              <button
                className="btn-lux btn-lux-primary btn-glow"
                onClick={handleOpenEnvelope}
              >
                <span>Открыть конверт</span>
              </button>
            </div>
          ) : (
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
                  <button
                    id="copy-share-btn"
                    className="btn-lux btn-lux-secondary"
                    onClick={copyShareLink}
                  >
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
