import { useState, useEffect } from 'react';
import { en } from '../i18n/en';
import { gu } from '../i18n/gu';
import {
  getQueue,
  getBarbers,
  getSalonSettings,
} from '../services/salonStore';
import type { Language } from '../i18n/translations';
import '../styles/global.css';
import '../styles/HomeScreen.css';

export const HomeScreen = ({
  onJoinQueue,
  onCheckStatus,
  onReception,
  onBarber,
  onTV,
  onSettings,
}: {
  onJoinQueue: () => void;
  onCheckStatus: () => void;
  onReception?: () => void;
  onBarber?: () => void;
  onTV?: () => void;
  onSettings?: () => void;
}) => {
  // 1. Language state with localStorage persistence
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('css_salon_lang');
    return saved === 'gu' ? 'gu' : 'en';
  });

  const t = lang === 'en' ? en : gu;

  const toggleLanguage = () => {
    const nextLang: Language = lang === 'en' ? 'gu' : 'en';
    setLang(nextLang);
    localStorage.setItem('css_salon_lang', nextLang);
  };

  // 2. Real-time digital clock state
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live salon store metrics
  const [salonQueue, setSalonQueue] = useState(getQueue);
  const [salonBarbers, setSalonBarbers] = useState(getBarbers);
  const [salonSettings, setSalonSettings] = useState(getSalonSettings);

  useEffect(() => {
    const sync = () => {
      setSalonQueue(getQueue());
      setSalonBarbers(getBarbers());
      setSalonSettings(getSalonSettings());
    };
    window.addEventListener('storage', sync);
    window.addEventListener('css_salon_update', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('css_salon_update', sync);
    };
  }, []);

  const liveWaitingCount = salonQueue.filter((c) => c.status === 'Waiting').length;
  const liveActiveBarbers = salonBarbers.filter((b) => !b.isOnBreak && b.isActive !== false).length;
  const liveAvgWait = liveWaitingCount > 0 ? Math.ceil((liveWaitingCount * 20) / Math.max(1, liveActiveBarbers)) : 5;

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. Status lookup & toast state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

     const handleJoinQueueClick = () => {
    onJoinQueue();
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tokenInput.trim()) {
      showToast(
        lang === 'en'
          ? 'Please enter a Token ID or 10-digit phone number'
          : 'કૃપા કરીને ટોકન નંબર અથવા ૧૦ આંકડાનો ફોન નંબર દાખલ કરો'
      );
      return;
    }

    onCheckStatus();
  };

  const handlePortalClick = (portalName: string) => {
    showToast(
      lang === 'en'
        ? `Atelier Portal "${portalName}" is planned for upcoming lab phases.`
        : `એટેલિયર પોર્ટલ "${portalName}" આગામી તબક્કામાં સક્રિય થશે.`
    );
  };

  return (
    <div className="editorial-root">
      {/* ====================================================================
          1. Slim Minimal Navbar
         ==================================================================== */}
      <nav className="editorial-nav">
        <div className="nav-brand-group">
          <span className="nav-brand-logo">{t.brand.name}</span>
          <span className="nav-brand-sub">— {t.brand.subname}</span>
        </div>

        <div className="nav-center-status">
          <div className="nav-live-pill">
            <span
              className="nav-live-dot"
              style={{
                backgroundColor: salonSettings.isOpen ? 'var(--acid-lime)' : 'var(--coral)',
              }}
            ></span>
            <span>
              {salonSettings.isOpen ? t.header.statusOpen : t.header.statusClosed} •{' '}
              {salonSettings.isQueueLocked
                ? lang === 'gu'
                  ? 'કતાર લોક છે'
                  : 'Queue Locked'
                : t.header.queueActive}
            </span>
          </div>
          <span className="nav-hours-note">{t.header.hoursPill}</span>
        </div>

        <div className="nav-controls">
          <div className="nav-clock" title="Atelier Clock">
            {currentTime || '09:00:00 AM'}
          </div>

          <button
            onClick={toggleLanguage}
            className="nav-lang-btn"
            title="Switch Language / ભાષા બદલો"
          >
            <span>{t.header.langButton}</span>
            <span style={{ color: 'var(--acid-lime)' }}>[{lang.toUpperCase()}]</span>
          </button>
        </div>
      </nav>

      {/* ====================================================================
          2. Dramatic Split Hero Section
         ==================================================================== */}
      <section className="split-hero-section">
        {/* Left Column: Oversized Dominant Typography & Actions */}
        <div className="hero-left-column">
          <div>
            <div className="hero-editorial-issue">
              <span className="hero-issue-line"></span>
              <span>{t.hero.volume}</span>
            </div>

            {/* Oversized Dominant Typography */}
            <div className="hero-headline-wrap">
              <h1 className="hero-display-line">
                {t.hero.headlineMain}
                <span className="hero-serif-italic">{t.hero.headlineItalic}</span>
              </h1>
              <span className="hero-display-sub">{t.hero.headlineSub}</span>
            </div>

            <p className="hero-manifesto-text">{t.hero.manifesto}</p>

            {/* Primary Action Block */}
            <div className="hero-action-block">
              <div className="hero-cta-row">
                <button
                  onClick={handleJoinQueueClick}
                  className="btn-editorial-coral"
                  id="join-queue-button"
                >
                  <span>{t.actions.joinQueueButton}</span>
                  <span className="arrow">→</span>
                </button>
                <span className="cta-sub-caption">{t.actions.joinQueueSub}</span>
              </div>

              {/* Minimalist Inline Status Lookup */}
              <form onSubmit={handleLookupSubmit} className="hero-inline-lookup">
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder={t.actions.checkStatusPlaceholder}
                  className="lookup-input-minimal"
                />
                <button type="submit" className="btn-lookup-minimal">
                  {t.actions.checkStatusButton}
                </button>
              </form>
            </div>
          </div>

          {/* Asymmetrical Editorial Stats Ticker */}
          <div className="hero-editorial-stats">
            <div className="stat-item">
              <span className="stat-number">
                {liveWaitingCount < 10 ? `0${liveWaitingCount}` : liveWaitingCount}
              </span>
              <span className="stat-label">{t.metrics.peopleWaiting}</span>
            </div>

            <div className="stat-item">
              <span className="stat-number">
                {liveActiveBarbers < 10 ? `0${liveActiveBarbers}` : liveActiveBarbers}
              </span>
              <span className="stat-label">{t.metrics.activeBarbers}</span>
            </div>

            <div className="stat-item">
              <span className="stat-number lime">~{liveAvgWait}M</span>
              <span className="stat-label">{t.metrics.estWaitTime}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dominant Botanical Salon Photography */}
        <div className="hero-right-column">
          <div className="hero-photo-wrapper">
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85"
              alt="CSS Botanical Salon Atelier"
              className="hero-main-photo"
            />
            <div className="hero-photo-scrim"></div>

            {/* Floating Editorial Badges */}
            <div className="badge-floating-lime">
              <span>● {t.hero.liveWaitPill}</span>
            </div>

            <div className="badge-floating-coral">
              <div className="floating-caption-tag">{t.hours.editionTag}</div>
              <p className="floating-caption-desc">{t.brand.editorialBadge}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. Editorial Hours & 30-Minute Closing Rule Spread
         ==================================================================== */}
      <section className="editorial-hours-spread">
        <div className="hours-media-side">
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=85"
            alt="Artisanal Hairdressing"
            className="hours-photo"
          />
          <div className="hours-media-caption">
            {t.editorialGallery.caption1}
          </div>
        </div>

        <div className="hours-content-side">
          <span className="hours-section-tag">{t.hours.editionTag}</span>
          <h2 className="hours-section-title">{t.hours.title}</h2>

          <div className="hours-table-editorial">
            <div className="hours-row">
              <span className="hours-day-label">{t.hours.weekdays}</span>
              <span className="hours-time-val">{t.hours.weekdaysTime}</span>
            </div>
            <div className="hours-row">
              <span className="hours-day-label">{t.hours.weekends}</span>
              <span className="hours-time-val">{t.hours.weekendsTime}</span>
            </div>
          </div>

          {/* Prominent Architectural 30-Minute Cutoff Callout */}
          <div className="cutoff-alert-block">
            <span className="cutoff-badge">Queue Operating Rule</span>
            <h3 className="cutoff-text-bold">{t.hours.ruleNotice}</h3>
            <p className="cutoff-text-sub">{t.hours.ruleDetail}</p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. Atelier Floor Portals (Minimal Editorial Index)
         ==================================================================== */}
      <section className="editorial-portals-section">
        <div className="portals-header-wrap">
          <h2 className="portals-title-big">{t.staffHub.title}</h2>
          <span className="portals-subtitle">{t.staffHub.subtitle}</span>
        </div>

        <div className="portals-index-grid">
          <button
            onClick={() => (onTV ? onTV() : handlePortalClick(t.staffHub.tvDisplay))}
            className="portal-index-card"
          >
            <span className="portal-num">INDEX 01 / BROADCAST</span>
            <h3 className="portal-name">{t.staffHub.tvDisplay}</h3>
            <p className="portal-desc">{t.staffHub.tvDisplayDesc}</p>
            <span className="portal-route-tag">/tv</span>
          </button>

          <button
            onClick={() => (onBarber ? onBarber() : handlePortalClick(t.staffHub.barberStation))}
            className="portal-index-card"
          >
            <span className="portal-num">INDEX 02 / STATION</span>
            <h3 className="portal-name">{t.staffHub.barberStation}</h3>
            <p className="portal-desc">{t.staffHub.barberStationDesc}</p>
            <span className="portal-route-tag">/barber</span>
          </button>

          <button
            onClick={() => onReception ? onReception() : handlePortalClick(t.staffHub.reception)}
            className="portal-index-card"
          >
            <span className="portal-num">INDEX 03 / COMMAND</span>
            <h3 className="portal-name">{t.staffHub.reception}</h3>
            <p className="portal-desc">{t.staffHub.receptionDesc}</p>
            <span className="portal-route-tag">/reception</span>
          </button>

          <button
            onClick={() => (onSettings ? onSettings() : handlePortalClick(t.staffHub.settings))}
            className="portal-index-card"
          >
            <span className="portal-num">INDEX 04 / ATELIER</span>
            <h3 className="portal-name">{t.staffHub.settings}</h3>
            <p className="portal-desc">{t.staffHub.settingsDesc}</p>
            <span className="portal-route-tag">/settings</span>
          </button>
        </div>
      </section>

      {/* ====================================================================
          5. Minimal Editorial Footer
         ==================================================================== */}
      <footer className="editorial-footer">
        <div>
          <p className="footer-dev-humor">{t.footer.codeNote}</p>
          <p className="footer-copy">{t.footer.copyright}</p>
        </div>
        <div style={{ color: 'var(--cream-dim)', fontSize: '0.8125rem' }}>
          {t.footer.botanicalNote}
        </div>
      </footer>

      {/* ====================================================================
          6. Editorial Check Status Modal Dialog
         ==================================================================== */}
      {isModalOpen && (
        <div className="editorial-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="editorial-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-issue-tag">TICKET LOOKUP</div>
            <h3 className="editorial-modal-title">{t.modal.title}</h3>
            <p className="editorial-modal-sub">{t.modal.subtitle}</p>

            <form onSubmit={handleLookupSubmit} className="editorial-modal-form">
              <label className="editorial-modal-label">{t.modal.inputLabel}</label>
              <input
                type="text"
                autoFocus
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder={t.modal.inputPlaceholder}
                className="editorial-modal-input"
              />

              <div className="editorial-modal-hint">{t.modal.sampleHint}</div>

              <div className="editorial-modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-modal-dismiss"
                >
                  {t.modal.closeButton}
                </button>
                <button type="submit" className="btn-editorial-coral" style={{ flex: 1 }}>
                  <span>{t.modal.submitButton}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          Toast Notice Popup
         ==================================================================== */}
      {toastMessage && (
        <div className="editorial-toast" role="alert">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
