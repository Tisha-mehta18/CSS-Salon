import { useState } from 'react';
import { en } from '../i18n/en';
import { gu } from '../i18n/gu';
import {
  getServices,
  getBarbers,
  getSalonSettings,
  isOnlineQueueAllowed,
} from '../services/salonStore';
import type { Language } from '../i18n/translations';
import '../styles/global.css';
import '../styles/variables.css';
import '../styles/JoinQueueScreen.css';

export const JoinQueueScreen = ({ onHome }: { onHome?: () => void } = {}) => {
  const savedLang = localStorage.getItem('css_salon_lang');
  const lang: Language = savedLang === 'gu' ? 'gu' : 'en';
  const t = lang === 'en' ? en : gu;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBarber, setSelectedBarber] = useState('any');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const availableServices = getServices();
  const availableBarbers = getBarbers();

  const toggleService = (id: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const totalTime = availableServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.duration, 0);

  const totalPrice = availableServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const barber = availableBarbers.find((b) => b.id === selectedBarber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const queueCheck = isOnlineQueueAllowed(getSalonSettings());
    if (!queueCheck.allowed) {
      setError(queueCheck.reason || 'Queue registration is currently closed.');
      return;
    }

    if (!name.trim()) {
      setError(t.joinQueue.validationErrors.nameRequired);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError(t.joinQueue.validationErrors.phoneInvalid);
      return;
    }

    if (selectedServices.length === 0) {
      setError(t.joinQueue.validationErrors.serviceRequired);
      return;
    }

    const existingQueue = JSON.parse(
      localStorage.getItem('css_salon_queue') || '[]'
    );

    // Rule 4: Duplicate active phone prevention
    const cleanPhone = phone.trim();
    const duplicate = existingQueue.find(
      (c: any) =>
        ['Waiting', 'Called', 'In Chair', 'In Progress'].includes(c.status) &&
        c.phone === cleanPhone
    );
    if (duplicate) {
      setError(
        lang === 'gu'
          ? `આ ફોન નંબર સાથે પહેલેથી સક્રિય ટિકિટ છે (${duplicate.token}).`
          : `A customer with this phone number already has an active ticket (${duplicate.token}).`
      );
      return;
    }

    setError('');

    const newToken = `CSS-${Math.floor(100 + Math.random() * 900)}`;

    const queueEntry = {
      token: newToken,
      name: name.trim(),
      phone: phone.trim(),
      services: selectedServices,
      barber: selectedBarber,
      totalTime,
      totalPrice,
      status: 'Waiting',
      createdAt: new Date().toISOString(),
    };

    existingQueue.push(queueEntry);

    localStorage.setItem('css_salon_queue', JSON.stringify(existingQueue));

    setToken(newToken);
  };

  // Success screen
  if (token) {
    return (
      <div className="join-queue-root">
        <div className="success-card-editorial">
          <span className="success-badge">{t.joinQueue.success.badge}</span>
          <h1 className="success-title">{t.joinQueue.success.title}</h1>
          <p>{t.joinQueue.success.greeting} {name}</p>

          <div className="token-hero-box">
            <span className="token-label-small">{t.joinQueue.success.issuedToken}</span>
            <div className="token-number-giant">{token}</div>
          </div>

          <p>{t.joinQueue.success.details}</p>

          <div className="success-meta-row">
            <div className="success-meta-item">
              <span className="success-meta-label">{t.joinQueue.success.estWait}</span>
              <span className="success-meta-val">
                {selectedBarber === 'any' ? '15–30' : barber?.estWaitMinutes ?? 15} min
              </span>
            </div>
            <div className="success-meta-item">
              <span className="success-meta-label">{t.joinQueue.success.position}</span>
              <span className="success-meta-val">Next available</span>
            </div>
          </div>

          <button
            className="btn-submit-queue"
            onClick={() => (onHome ? onHome() : (window.location.href = '/'))}
          >
            {t.joinQueue.success.backHomeBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="join-queue-root">
      <nav className="join-nav">
        <button className="btn-nav-back" onClick={() => (onHome ? onHome() : (window.location.href = '/'))}>
          ← {t.header.backToHome}
        </button>
        <div className="join-brand-badge">
          <strong>{t.brand.name}</strong> — {t.brand.subname}
        </div>
      </nav>

      <main className="join-main-container">
        <header className="join-header-banner">
          <span className="join-issue-tag">CSS / WALK-IN REGISTRATION</span>
          <h1 className="join-page-title">{t.joinQueue.pageTitle}</h1>
          <p className="join-page-subtitle">{t.joinQueue.pageSubtitle}</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="join-grid-layout">
            <div className="join-form-sections">
              {/* Guest Details */}
              <section>
                <h2>{t.joinQueue.stepDetails}</h2>

                <div className="details-inputs-grid">
                  <div className="form-field-group">
                    <label className="form-input-label">{t.joinQueue.fullNameLabel}</label>
                    <input
                      className="form-text-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.joinQueue.fullNamePlaceholder}
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="form-input-label">{t.joinQueue.phoneLabel}</label>
                    <input
                      className="form-text-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder={t.joinQueue.phonePlaceholder}
                      inputMode="numeric"
                    />
                    <small>{t.joinQueue.phoneHint}</small>
                  </div>
                </div>
              </section>

              {/* Services */}
              <section>
                <h2>{t.joinQueue.servicesTitle}</h2>
                <p>{t.joinQueue.servicesSubtitle}</p>
                <p>{selectedServices.length}/3</p>

                <div className="services-selection-container">
                  {availableServices.map((service) => {
                    const selected = selectedServices.includes(service.id);

                    return (
                      <button
                        type="button"
                        key={service.id}
                        className={`service-select-card ${selected ? 'selected' : ''}`}
                        onClick={() => toggleService(service.id)}
                      >
                        <div className="service-card-left">
                          <span className="service-checkbox">{selected ? '✓' : ''}</span>
                          <div>
                            <h3 className="service-info-title">
                              {lang === 'gu' ? service.nameGu : service.name}
                            </h3>
                            <p className="service-info-desc">
                              {lang === 'gu' ? service.descriptionGu : service.description}
                            </p>
                          </div>
                        </div>

                        <div className="service-card-right">
                          <span className="service-price-tag">₹{service.price}</span>
                          <span className="service-duration-tag">{service.duration} min</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Barber selection */}
              <section>
                <h2>{t.joinQueue.barberTitle}</h2>
                <p>{t.joinQueue.barberSubtitle}</p>

                <div className="barber-selection-container">
                  <button
                    type="button"
                    className={`any-barber-hero-card ${selectedBarber === 'any' ? 'selected' : ''}`}
                    onClick={() => setSelectedBarber('any')}
                  >
                    <h3 className="any-barber-title">{t.joinQueue.anyBarber}</h3>
                    <p className="any-barber-sub">{t.joinQueue.anyBarberSubtitle}</p>
                  </button>

                  <div className="barber-cards-grid">
                    {availableBarbers.map((b) => (
                      <button
                        type="button"
                        key={b.id}
                        className={`barber-select-card ${selectedBarber === b.id ? 'selected' : ''}`}
                        onClick={() => setSelectedBarber(b.id)}
                      >
                        <img className="barber-avatar" src={b.avatarUrl} alt={b.name} />
                        <h3 className="barber-card-name">{b.name}</h3>
                        <p className="barber-card-station">
                          {lang === 'gu' ? b.stationGu : b.station}
                        </p>
                        <p className="barber-card-specialty">
                          {lang === 'gu' ? b.specialtyGu : b.specialty}
                        </p>
                        <span className="barber-wait-badge">
                          ~{b.estWaitMinutes} min
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {error && <p className="error-message">{error}</p>}
            </div>

            {/* Live summary */}
            <aside className="join-summary-column">
              <div className="summary-editorial-box">
                <span className="summary-header-tag">CSS / LIVE</span>
                <h2 className="summary-title">{t.joinQueue.summaryTitle}</h2>

                <div className="summary-selected-list">
                  {availableServices.filter((s) => selectedServices.includes(s.id)).map((s) => (
                    <div className="summary-item-row" key={s.id}>
                      <span className="summary-item-name">
                        {lang === 'gu' ? s.nameGu : s.name}
                      </span>
                      <span className="summary-item-price">₹{s.price}</span>
                    </div>
                  ))}
                  {selectedServices.length === 0 && <p>No services selected</p>}
                </div>

                <div className="summary-totals-block">
                  <div className="summary-stat-row">
                    <span className="summary-stat-label">{t.joinQueue.totalTime}</span>
                    <span className="summary-stat-val">{totalTime} min</span>
                  </div>
                  <div className="summary-stat-row">
                    <span className="summary-stat-label">{t.joinQueue.totalPrice}</span>
                    <span className="summary-stat-val total-price">₹{totalPrice}</span>
                  </div>
                  <div className="summary-stat-row">
                    <span className="summary-stat-label">{t.joinQueue.chosenBarber}</span>
                    <span className="summary-stat-val">
                      {selectedBarber === 'any' ? t.joinQueue.anyBarber : barber?.name}
                    </span>
                  </div>
                </div>

                <p className="summary-terms-notice">{t.joinQueue.termsNotice}</p>

                <button type="submit" className="btn-submit-queue">
                  {t.joinQueue.submitButton}
                </button>
              </div>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
};