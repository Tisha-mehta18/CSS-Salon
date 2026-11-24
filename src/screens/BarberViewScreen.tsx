import { useState, useEffect } from 'react';
import {
  getQueue,
  saveQueue,
  getBarbers,
  toggleBarberBreak,
  playChime,
  type QueueEntry,
} from '../services/salonStore';
import { DUMMY_SERVICES } from '../data/dummySalon';
import type { Language, BarberItem } from '../i18n/translations';
import '../styles/global.css';
import '../styles/variables.css';
import '../styles/BarberViewScreen.css';

export const BarberViewScreen = ({ onHome }: { onHome?: () => void } = {}) => {
  // 1. Language state
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('css_salon_lang');
    return saved === 'gu' ? 'gu' : 'en';
  });

  const toggleLanguage = () => {
    const next: Language = lang === 'en' ? 'gu' : 'en';
    setLang(next);
    localStorage.setItem('css_salon_lang', next);
  };

  // 2. Barbers and active station selection
  const [barbers, setBarbers] = useState<BarberItem[]>(getBarbers);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('barber-1');

  // 3. Queue state
  const [queue, setQueue] = useState<QueueEntry[]>(getQueue);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 4. Sync on external storage or same-tab events
  useEffect(() => {
    const syncState = () => {
      setQueue(getQueue());
      setBarbers(getBarbers());
    };
    window.addEventListener('storage', syncState);
    window.addEventListener('css_salon_update', syncState);
    const interval = setInterval(syncState, 2000);
    return () => {
      window.removeEventListener('storage', syncState);
      window.removeEventListener('css_salon_update', syncState);
      clearInterval(interval);
    };
  }, []);

  const activeBarber = barbers.find((b) => b.id === selectedBarberId) || barbers[0];

  // 5. Active customer in this barber's chair
  const activeCustomer = queue.find(
    (c) =>
      ['Called', 'In Chair', 'In Progress'].includes(c.status) &&
      (c.assignedBarber === activeBarber.id ||
        c.assignedBarber === activeBarber.name ||
        c.barber === activeBarber.id ||
        c.barber.toLowerCase() === activeBarber.name.toLowerCase() ||
        c.barber.toLowerCase() === activeBarber.name.split(' ')[0].toLowerCase())
  );

  // 6. Waiting queue for this barber (specific + any)
  const waitingForThisBarber = queue.filter(
    (c) =>
      c.status === 'Waiting' &&
      (c.barber === activeBarber.id ||
        c.barber.toLowerCase() === activeBarber.name.toLowerCase() ||
        c.barber.toLowerCase() === activeBarber.name.split(' ')[0].toLowerCase() ||
        c.barber.toLowerCase() === 'any')
  );

  // 7. Actions: Break Toggle
  const handleToggleBreak = () => {
    const updated = toggleBarberBreak(activeBarber.id);
    setBarbers(updated);
    const currentStatus = updated.find((b) => b.id === activeBarber.id)?.isOnBreak;
    showToast(
      currentStatus
        ? lang === 'gu'
          ? `${activeBarber.nameGu} હવે ૧૫ મિનિટના વિરામ પર છે.`
          : `${activeBarber.name} is now on break. Routing paused.`
        : lang === 'gu'
        ? `${activeBarber.nameGu} સેવા માટે પાછા આવ્યા છે.`
        : `${activeBarber.name} resumed duty. Station active.`
    );
  };

  // 8. Actions: Call Next Customer
  const handleCallNext = () => {
    if (activeBarber.isOnBreak) {
      showToast(
        lang === 'gu'
          ? 'સ્ટેશન વિરામ પર છે. ગ્રાહકને બોલાવવા માટે પહેલા વિરામ પૂર્ણ કરો.'
          : 'Station is currently on break. Resume duty before calling next client.'
      );
      return;
    }

    if (activeCustomer) {
      showToast(
        lang === 'gu'
          ? 'ખુરશીમાં પહેલેથી ગ્રાહક છે. પહેલા તે સેવા પૂર્ણ કરો.'
          : 'Chair is already occupied. Finish current session first.'
      );
      return;
    }

    // FCFS candidate
    const candidateIndex = queue.findIndex(
      (c) =>
        c.status === 'Waiting' &&
        (c.barber === activeBarber.id ||
          c.barber.toLowerCase() === activeBarber.name.toLowerCase() ||
          c.barber.toLowerCase() === activeBarber.name.split(' ')[0].toLowerCase() ||
          c.barber.toLowerCase() === 'any')
    );

    if (candidateIndex === -1) {
      showToast(
        lang === 'gu'
          ? 'તમારા સ્ટેશન માટે કોઈ પ્રતીક્ષારત ગ્રાહક નથી.'
          : 'No waiting customers match your station queue.'
      );
      return;
    }

    const candidate = queue[candidateIndex];
    const updated = [...queue];
    updated[candidateIndex] = {
      ...candidate,
      status: 'Called',
      assignedBarber: activeBarber.id,
    };

    saveQueue(updated);
    setQueue(updated);
    playChime();

    showToast(
      lang === 'gu'
        ? `ટોકન ${candidate.token} (${candidate.name}) ને બોલાવવામાં આવ્યા!`
        : `Calling ${candidate.token} (${candidate.name}) to station!`
    );
  };

  // 9. Actions: Start Service (Customer Seated)
  const handleStartService = () => {
    if (!activeCustomer) return;
    const updated = queue.map((c) =>
      c.token === activeCustomer.token
        ? {
            ...c,
            status: 'In Chair' as const,
            startedAt: new Date().toISOString(),
          }
        : c
    );
    saveQueue(updated);
    setQueue(updated);
    showToast(
      lang === 'gu'
        ? `ગ્રાહક ખુરશી પર બેઠા — સર્વિસ શરૂ થઈ!`
        : `Client seated — haircut started!`
    );
  };

  // 10. Actions: Complete Cut
  const handleFinishCut = () => {
    if (!activeCustomer) return;
    const updated = queue.map((c) =>
      c.token === activeCustomer.token
        ? {
            ...c,
            status: 'Done' as const,
            completedAt: new Date().toISOString(),
          }
        : c
    );
    saveQueue(updated);
    setQueue(updated);
    showToast(
      lang === 'gu'
        ? `કટિંગ પૂર્ણ! ટોકન ${activeCustomer.token} મુક્ત થયું.`
        : `Service finished! Chair is now free for next client.`
    );
  };

  // 11. Actions: Mark No-Show
  const handleMarkNoShow = () => {
    if (!activeCustomer) return;
    const updated = queue.map((c) =>
      c.token === activeCustomer.token
        ? {
            ...c,
            status: 'No-show' as const,
          }
        : c
    );
    saveQueue(updated);
    setQueue(updated);
    showToast(
      lang === 'gu'
        ? `ટોકન ${activeCustomer.token} ગેરહાજર નોંધાયું.`
        : `Customer ${activeCustomer.token} marked as No-Show. Chair freed.`
    );
  };

  const formatServices = (services: string[] = []): string => {
    if (!services || services.length === 0) return 'Standard Haircut';
    return services
      .map((s) => {
        const match = DUMMY_SERVICES.find((ds) => ds.id === s || ds.name === s);
        return match ? (lang === 'gu' ? match.nameGu : match.name) : s;
      })
      .join(', ');
  };

  return (
    <div className="barber-view-root">
      {/* 1. Barber Top Nav */}
      <nav className="barber-nav">
        <div className="barber-nav-left">
          <button
            className="barber-back-btn"
            onClick={onHome ? onHome : () => (window.location.href = '/')}
          >
            ← {lang === 'gu' ? 'મુખ્ય પાના પર પાછા જાઓ' : 'Back to Home'}
          </button>

          {/* Station Switcher Tabs */}
          <div className="barber-station-selector">
            {barbers.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBarberId(b.id)}
                className={`barber-tab-btn ${
                  selectedBarberId === b.id ? 'active' : ''
                }`}
              >
                {lang === 'gu' ? b.nameGu : b.name}
              </button>
            ))}
          </div>
        </div>

        <div className="barber-nav-right">
          {/* Break Toggle */}
          <button
            onClick={handleToggleBreak}
            className={`barber-break-toggle-btn ${
              activeBarber.isOnBreak ? 'break-active' : 'working'
            }`}
          >
            {activeBarber.isOnBreak
              ? lang === 'gu'
                ? '▶ વિરામ પૂર્ણ કરો (Resume)'
                : '▶ Resume Duty'
              : lang === 'gu'
              ? '⏸ ૧૫-મિનિટ વિરામ લો'
              : '⏸ Take 15-min Break'}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="btn-action-outline"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            {lang === 'en' ? 'ગુજરાતી' : 'English'} [{lang.toUpperCase()}]
          </button>
        </div>
      </nav>

      {/* 2. Main Station Container */}
      <main className="barber-container">
        <div
          className={`barber-hero-card ${
            activeBarber.isOnBreak
              ? 'on-break'
              : activeCustomer
              ? 'in-session'
              : ''
          }`}
        >
          {/* Station Header */}
          <div className="barber-hero-header">
            <div className="barber-info-group">
              <h1>{lang === 'gu' ? activeBarber.nameGu : activeBarber.name}</h1>
              <div className="barber-station-subtag">
                {lang === 'gu' ? activeBarber.stationGu : activeBarber.station} •{' '}
                {lang === 'gu' ? activeBarber.specialtyGu : activeBarber.specialty}
              </div>
            </div>

            <div>
              <span
                className={`barber-live-status-pill ${
                  activeBarber.isOnBreak
                    ? 'status-break'
                    : activeCustomer
                    ? 'status-chair'
                    : 'status-available'
                }`}
              >
                {activeBarber.isOnBreak
                  ? lang === 'gu'
                    ? '● વિરામ પર (On Break)'
                    : '● On Break'
                  : activeCustomer
                  ? activeCustomer.status === 'Called'
                    ? lang === 'gu'
                      ? '● બોલાવેલ (Called)'
                      : '● Calling Guest'
                    : lang === 'gu'
                    ? '● કટિંગ ચાલુ (In Chair)'
                    : '● Cut in Progress'
                  : lang === 'gu'
                  ? '○ ખુરશી ઉપલબ્ધ (Ready)'
                  : '○ Station Ready'}
              </span>
            </div>
          </div>

          {/* Station Centerpiece: Active Customer / Calling / Empty */}
          {activeBarber.isOnBreak ? (
            <div className="empty-chair-box" style={{ borderColor: 'var(--coral)' }}>
              <h2 className="empty-chair-title" style={{ color: 'var(--coral)' }}>
                {lang === 'gu' ? 'સ્ટેશન વિરામ પર છે' : 'Station is Paused on Break'}
              </h2>
              <p className="empty-chair-desc">
                {lang === 'gu'
                  ? 'આ સ્ટેશન પર નવી કતાર ફાળવણી થોભાવેલ છે. ગ્રાહકોને બોલાવવા માટે "Resume Duty" બટન દબાવો.'
                  : 'New customer routing to your chair is currently paused. Click "Resume Duty" at the top when you are ready to cut.'}
              </p>
            </div>
          ) : activeCustomer ? (
            <div
              className={`session-display-box ${
                activeCustomer.status === 'Called' ? 'pulse-calling' : ''
              }`}
            >
              <div className="session-badge-row">
                <span
                  className={`session-state-tag ${
                    activeCustomer.status === 'Called' ? 'calling' : ''
                  }`}
                >
                  {activeCustomer.status === 'Called'
                    ? lang === 'gu'
                      ? '● બોલાવેલ — ગ્રાહક પહોંચવાની પ્રતીક્ષા (૧૦-મિનિટ નિયમ)'
                      : '● CALLED — Waiting for client to reach chair (10-min window)'
                    : lang === 'gu'
                    ? '✓ ખુરશી પર સક્રિય — સર્વિસ પ્રગતિમાં છે'
                    : '✓ ACTIVE IN CHAIR — Haircut in Progress'}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--cream-dim)',
                  }}
                >
                  📞 {activeCustomer.phone}
                </span>
              </div>

              <div className="session-cust-hero">
                <div className="session-token-huge">{activeCustomer.token}</div>
                <div className="session-cust-details">
                  <h2>{activeCustomer.name}</h2>
                  <p>
                    ✂️ {formatServices(activeCustomer.services)} • Est.{' '}
                    {activeCustomer.totalTime} min • ₹{activeCustomer.totalPrice}
                  </p>
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="session-actions-row">
                {activeCustomer.status === 'Called' ? (
                  <>
                    <button
                      onClick={handleStartService}
                      className="btn-session-primary"
                    >
                      {lang === 'gu'
                        ? '✓ ગ્રાહક બેઠા — સર્વિસ શરૂ કરો'
                        : '✓ Client Seated (Start Cut)'}
                    </button>
                    <button
                      onClick={handleMarkNoShow}
                      className="btn-session-danger"
                    >
                      ✕ {lang === 'gu' ? 'ગેરહાજર (No-Show)' : 'Mark No-Show'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFinishCut}
                      className="btn-session-primary"
                      style={{ backgroundColor: 'var(--acid-lime)' }}
                    >
                      ✓ {lang === 'gu' ? 'સર્વિસ પૂર્ણ કરો અને ખુરશી મુક્ત કરો' : 'Finish Cut & Free Chair'}
                    </button>
                    <button
                      onClick={handleMarkNoShow}
                      className="btn-session-danger"
                    >
                      ✕ {lang === 'gu' ? 'ગેરહાજર' : 'No-Show'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-chair-box">
              <h2 className="empty-chair-title">
                {lang === 'gu'
                  ? 'ખુરશી તમારા આગલા ગ્રાહક માટે તૈયાર છે.'
                  : 'Chair is ready for your next customer.'}
              </h2>
              <p className="empty-chair-desc">
                {lang === 'gu'
                  ? 'કતારમાંથી આગલા પાત્ર ગ્રાહકને તમારા સ્ટેશન પર બોલાવવા નીચેનું બટન દબાવો.'
                  : 'Press the button below to call the next guest in your line or from the general pool.'}
              </p>

              <button
                onClick={handleCallNext}
                disabled={waitingForThisBarber.length === 0}
                className="btn-call-next-giant"
              >
                <span>
                  {waitingForThisBarber.length > 0
                    ? lang === 'gu'
                      ? 'આગલા ગ્રાહકને બોલાવો'
                      : 'Call Next Customer'
                    : lang === 'gu'
                    ? 'કોઈ ગ્રાહક પ્રતીક્ષામાં નથી'
                    : 'Queue Clear — No Clients Waiting'}
                </span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Lower Section: Up Next in Queue */}
        <section className="barber-queue-section">
          <div className="barber-queue-header">
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--acid-lime)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                {lang === 'gu' ? 'આગામી લાઇન' : 'UPCOMING TICKETS'}
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                {lang === 'gu'
                  ? `તમારા સ્ટેશન માટે આગળ (${waitingForThisBarber.length})`
                  : `Next In Line For Your Station (${waitingForThisBarber.length})`}
              </h2>
            </div>
          </div>

          {waitingForThisBarber.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--forest-green)',
                border: '1px dashed var(--cream-line)',
                padding: '2.5rem',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                color: 'var(--cream-muted)',
              }}
            >
              <p style={{ fontWeight: 700, color: 'var(--warm-cream)', marginBottom: '0.25rem' }}>
                {lang === 'gu'
                  ? 'તમારા સ્ટેશન માટે કોઈ ગ્રાહક પ્રતીક્ષામાં નથી.'
                  : 'No customers currently queued for this station.'}
              </p>
              <p style={{ fontSize: '0.85rem' }}>
                {lang === 'gu'
                  ? 'વિરામ લો અથવા રિસેપ્શનને વોક-ઇન નોંધણીમાં મદદ કરો!'
                  : 'Great work! Take a breath or review walk-ins at reception.'}
              </p>
            </div>
          ) : (
            <div className="barber-queue-cards-grid">
              {waitingForThisBarber.map((customer, idx) => (
                <div key={customer.token} className="barber-queue-card">
                  <div className="barber-queue-top">
                    <span className="barber-queue-token">
                      #{idx + 1} • {customer.token}
                    </span>
                    <span className="barber-queue-wait">
                      ~{customer.totalTime}m
                    </span>
                  </div>
                  <div>
                    <div className="barber-queue-name">{customer.name}</div>
                    <div className="barber-queue-services">
                      {formatServices(customer.services)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color:
                        customer.barber === 'any'
                          ? 'var(--acid-lime)'
                          : 'var(--coral)',
                    }}
                  >
                    {customer.barber === 'any'
                      ? lang === 'gu'
                        ? 'કોઈપણ બાર્બર પૂલ'
                        : 'Any Barber Pool'
                      : lang === 'gu'
                      ? 'ખાસ તમને વિનંતી કરી'
                      : 'Requested You Specifically'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="reception-toast" role="status">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
