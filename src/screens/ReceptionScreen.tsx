import { useState, useEffect } from 'react';
import {
  getQueue,
  saveQueue as persistQueue,
  getBarbers,
  getServices,
  playChime,
  type QueueEntry,
} from '../services/salonStore';
import type { Language, BarberItem, ServiceItem } from '../i18n/translations';
import '../styles/global.css';
import '../styles/variables.css';
import '../styles/ReceptionScreen.css';

export const ReceptionScreen = ({ onHome }: { onHome?: () => void } = {}) => {
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

  // 2. State from store
  const [queue, setQueue] = useState<QueueEntry[]>(getQueue);
  const [barbers, setBarbers] = useState<BarberItem[]>(getBarbers);
  const [services, setServices] = useState<ServiceItem[]>(getServices);

  // Sync state across tabs and same-tab components
  useEffect(() => {
    const syncState = () => {
      setQueue(getQueue());
      setBarbers(getBarbers());
      setServices(getServices());
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

  // 3. Search and Toast
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to persist queue
  const saveQueue = (newQueue: QueueEntry[]) => {
    setQueue(newQueue);
    persistQueue(newQueue);
  };

  // 4. Quick Walk-in Form State
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinServices, setWalkinServices] = useState<string[]>([]);
  const [walkinBarber, setWalkinBarber] = useState('any');
  const [walkinError, setWalkinError] = useState('');

  const toggleWalkinService = (serviceId: string) => {
    setWalkinServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, serviceId];
    });
  };

  // 5. Computed lists
  const waitingCustomers = queue.filter((c) => c.status === 'Waiting');
  const filteredWaiting = waitingCustomers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.token.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  const activeCount = queue.filter((c) =>
    ['In Chair', 'In Progress', 'Called'].includes(c.status)
  ).length;

  const doneCount = queue.filter((c) => c.status === 'Done').length;

  // 6. Barber Helper
  const getActiveCustomerForBarber = (barberId: string, barberName: string) => {
    return queue.find(
      (c) =>
        ['In Chair', 'In Progress', 'Called'].includes(c.status) &&
        (c.assignedBarber === barberId ||
          c.assignedBarber === barberName ||
          c.barber === barberId ||
          c.barber.toLowerCase() === barberName.toLowerCase() ||
          c.barber.toLowerCase() === barberName.split(' ')[0].toLowerCase())
    );
  };

  // 7. Actions: Call Next
  const callNext = (barberId: string, barberName: string) => {
    const currentActive = getActiveCustomerForBarber(barberId, barberName);
    if (currentActive) {
      showToast(
        lang === 'gu'
          ? `${barberName} પહેલેથી ${currentActive.token} ની સેવા કરી રહ્યા છે.`
          : `${barberName} is already serving ${currentActive.token} (${currentActive.name}).`
      );
      return;
    }

    // FCFS: Find first waiting customer matching this barber or 'any'
    const candidateIndex = queue.findIndex(
      (c) =>
        c.status === 'Waiting' &&
        (c.barber === barberId ||
          c.barber.toLowerCase() === barberName.toLowerCase() ||
          c.barber.toLowerCase() === barberName.split(' ')[0].toLowerCase() ||
          c.barber.toLowerCase() === 'any')
    );

    if (candidateIndex === -1) {
      showToast(
        lang === 'gu'
          ? `${barberName} માટે કોઈ પ્રતીક્ષારત ગ્રાહક મળ્યા નથી.`
          : `No waiting customer found for ${barberName}.`
      );
      return;
    }

    const candidate = queue[candidateIndex];
    const updated = [...queue];
    updated[candidateIndex] = {
      ...candidate,
      status: 'In Chair' as const,
      assignedBarber: barberId,
    };

    saveQueue(updated);
    playChime();
    showToast(
      lang === 'gu'
        ? `${candidate.token} (${candidate.name}) ને ${barberName} ની ચેર પર બોલાવ્યા!`
        : `Called ${candidate.token} (${candidate.name}) to ${barberName}'s chair!`
    );
  };

  // 8. Actions: Mark Done
  const markDone = (token: string) => {
    const updated = queue.map((c) =>
      c.token === token ? { ...c, status: 'Done' as const } : c
    );
    saveQueue(updated);
    showToast(
      lang === 'gu'
        ? `ટોકન ${token} ની સેવા પૂર્ણ થઈ.`
        : `Service marked as Done for ${token}.`
    );
  };

  // 9. Actions: Mark No-Show
  const markNoShow = (token: string) => {
    const updated = queue.map((c) =>
      c.token === token ? { ...c, status: 'No-show' as const } : c
    );
    saveQueue(updated);
    showToast(
      lang === 'gu'
        ? `ટોકન ${token} ગેરહાજર (No-Show) તરીકે નોંધાયેલ.`
        : `Marked ticket ${token} as No-Show.`
    );
  };

  // 10. Actions: Cancel
  const markCancel = (token: string) => {
    const updated = queue.map((c) =>
      c.token === token ? { ...c, status: 'Cancelled' as const } : c
    );
    saveQueue(updated);
    showToast(
      lang === 'gu'
        ? `ટોકન ${token} રદ કરવામાં આવ્યું.`
        : `Cancelled ticket ${token}.`
    );
  };

  // 11. Add Walk-In Submit
  const handleAddWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    setWalkinError('');

    if (!walkinName.trim()) {
      setWalkinError(
        lang === 'gu'
          ? 'ગ્રાહકનું નામ દાખલ કરવું ફરજિયાત છે.'
          : 'Customer name is required.'
      );
      return;
    }

    const cleanPhone = walkinPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setWalkinError(
        lang === 'gu'
          ? 'કૃપા કરીને માન્ય ૧૦ આંકડાનો ફોન નંબર દાખલ કરો.'
          : 'Please enter a valid 10-digit phone number.'
      );
      return;
    }

    // Rule 4: Prevent duplicate active phone numbers across Waiting, Called, In Chair
    const duplicate = queue.find(
      (c) =>
        ['Waiting', 'Called', 'In Chair', 'In Progress'].includes(c.status) &&
        c.phone.replace(/\D/g, '') === cleanPhone
    );
    if (duplicate) {
      setWalkinError(
        lang === 'gu'
          ? `આ ફોન નંબર સાથે પહેલેથી સક્રિય ટિકિટ છે (${duplicate.token}).`
          : `A customer with this phone number already has an active ticket (${duplicate.token}).`
      );
      return;
    }

    if (walkinServices.length === 0) {
      setWalkinError(
        lang === 'gu'
          ? 'કૃપા કરીને ઓછામાં ઓછી ૧ સેવા પસંદ કરો.'
          : 'Please select at least 1 service.'
      );
      return;
    }

    // Calculate totals
    const totalTime = services
      .filter((s) => walkinServices.includes(s.id))
      .reduce((sum, s) => sum + s.duration, 0);

    const totalPrice = services
      .filter((s) => walkinServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);

    // Generate unique token
    let newToken = `CSS-${Math.floor(100 + Math.random() * 900)}`;
    while (queue.some((c) => c.token === newToken)) {
      newToken = `CSS-${Math.floor(100 + Math.random() * 900)}`;
    }

    const newEntry: QueueEntry = {
      token: newToken,
      name: walkinName.trim(),
      phone: cleanPhone,
      services: walkinServices,
      barber: walkinBarber,
      totalTime,
      totalPrice,
      status: 'Waiting',
      createdAt: new Date().toISOString(),
    };

    const updated = [...queue, newEntry];
    saveQueue(updated);

    // Reset inputs
    setWalkinName('');
    setWalkinPhone('');
    setWalkinServices([]);
    setWalkinBarber('any');

    showToast(
      lang === 'gu'
        ? `વોક-ઇન ઉમેરાયું! ટોકન: ${newToken} (${newEntry.name})`
        : `Walk-in added! Token: ${newToken} (${newEntry.name})`
    );
  };

  // Helper formatting
  const formatServices = (servicesList: string[] = []): string => {
    if (!servicesList || servicesList.length === 0) return 'Standard Cut';
    return servicesList
      .map((s) => {
        const match = services.find((ds) => ds.id === s || ds.name === s);
        return match ? (lang === 'gu' ? match.nameGu : match.name) : s;
      })
      .join(', ');
  };

  const formatBarberName = (barberVal: string): string => {
    if (!barberVal || barberVal.toLowerCase() === 'any') {
      return lang === 'gu' ? 'કોઈપણ બાર્બર' : 'Any Barber';
    }
    const match = barbers.find(
      (b) => b.id === barberVal || b.name.toLowerCase() === barberVal.toLowerCase()
    );
    return match ? (lang === 'gu' ? match.nameGu : match.name) : barberVal;
  };

  return (
    <div className="reception-root">
      {/* 1. Reception Nav */}
      <nav className="reception-nav">
        <button
          className="reception-back-btn"
          onClick={onHome ? onHome : () => (window.location.href = '/')}
        >
          ← {lang === 'gu' ? 'મુખ્ય પાના પર પાછા જાઓ' : 'Back to Atelier Home'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={toggleLanguage}
            className="btn-action-outline"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            {lang === 'en' ? 'ગુજરાતી' : 'English'} [{lang.toUpperCase()}]
          </button>
          <span className="reception-badge">
            {lang === 'gu' ? 'કમાન્ડ ડેસ્ક' : 'RECEPTION COMMAND'}
          </span>
        </div>
      </nav>

      {/* 2. Main Content */}
      <main className="reception-container">
        {/* Header with Stats */}
        <header className="reception-header">
          <div className="reception-title-group">
            <h1>{lang === 'gu' ? 'રિસેપ્શન કમાન્ડ ડેસ્ક' : 'RECEPTION DASHBOARD.'}</h1>
            <p>
              {lang === 'gu'
                ? 'કતાર સંચાલન, સ્ટાફ વિતરણ અને તાત્કાલિક વોક-ઇન નોંધણી.'
                : 'Live queue triage, station allocation, and expedited walk-in registration.'}
            </p>
          </div>

          <div className="reception-stats-row">
            <div className="reception-stat-pill">
              <span className="reception-stat-val">{waitingCustomers.length}</span>
              <span className="reception-stat-lbl">
                {lang === 'gu' ? 'પ્રતીક્ષામાં' : 'Waiting in Queue'}
              </span>
            </div>
            <div className="reception-stat-pill">
              <span className="reception-stat-val coral">{activeCount}</span>
              <span className="reception-stat-lbl">
                {lang === 'gu' ? 'ચેર પર સક્રિય' : 'In Chair Active'}
              </span>
            </div>
            <div className="reception-stat-pill">
              <span className="reception-stat-val">{doneCount}</span>
              <span className="reception-stat-lbl">
                {lang === 'gu' ? 'આજે પૂર્ણ થયેલ' : 'Completed Today'}
              </span>
            </div>
          </div>
        </header>

        {/* Master Barber Stations Grid */}
        <section className="barber-cards-section">
          <span className="section-label">
            {lang === 'gu' ? 'સક્રિય સ્ટેશન્સ' : 'STATION CHAIR ALLOCATION'}
          </span>
          <h2 className="section-title">
            {lang === 'gu' ? 'માસ્ટર બાર્બર સ્ટેશન્સ' : 'Master Barber Stations'}
          </h2>

          <div className="reception-barbers-grid">
            {barbers.map((barber) => {
              const activeCust = getActiveCustomerForBarber(barber.id, barber.name);
              const isOccupied = Boolean(activeCust);
              const hasEligibleWaiting = waitingCustomers.some(
                (c) =>
                  c.barber === barber.id ||
                  c.barber.toLowerCase() === barber.name.toLowerCase() ||
                  c.barber.toLowerCase() === barber.name.split(' ')[0].toLowerCase() ||
                  c.barber.toLowerCase() === 'any'
              );

              return (
                <div
                  key={barber.id}
                  className={`reception-barber-card ${isOccupied ? 'occupied' : ''}`}
                >
                  <div>
                    <div className="barber-card-top">
                      <div>
                        <h3 className="barber-name-text">
                          {lang === 'gu' ? barber.nameGu : barber.name}
                        </h3>
                        <div className="barber-station-sub">
                          {lang === 'gu' ? barber.stationGu : barber.station}
                        </div>
                      </div>
                      <span
                        className={`barber-status-badge ${
                          isOccupied ? 'busy' : 'available'
                        }`}
                      >
                        {isOccupied
                          ? lang === 'gu'
                            ? '● વ્યસ્ત'
                            : '● In Chair'
                          : lang === 'gu'
                          ? '○ ઉપલબ્ધ'
                          : '○ Available'}
                      </span>
                    </div>

                    {isOccupied && activeCust ? (
                      <div className="in-chair-box">
                        <div className="in-chair-tag">
                          {lang === 'gu' ? 'ચેર પર ગ્રાહક' : 'Active In Chair'}
                        </div>
                        <div className="in-chair-customer">
                          {activeCust.token} — {activeCust.name}
                        </div>
                        <div className="in-chair-services">
                          {formatServices(activeCust.services)}
                        </div>
                        <div className="in-chair-actions">
                          <button
                            onClick={() => markDone(activeCust.token)}
                            className="btn-chair-action btn-chair-done"
                          >
                            ✓ {lang === 'gu' ? 'પૂર્ણ કરો' : 'Mark Done'}
                          </button>
                          <button
                            onClick={() => markNoShow(activeCust.token)}
                            className="btn-chair-action btn-chair-noshow"
                          >
                            ✕ {lang === 'gu' ? 'ગેરહાજર' : 'No-Show'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '1.25rem 0',
                          color: 'var(--cream-muted)',
                          fontSize: '0.85rem',
                          fontStyle: 'italic',
                        }}
                      >
                        {lang === 'gu'
                          ? 'ખુરશી ખાલી છે — આગલા ગ્રાહકને બોલાવવા તૈયાર.'
                          : 'Station ready — chair available for next guest.'}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => callNext(barber.id, barber.name)}
                    disabled={isOccupied || !hasEligibleWaiting}
                    className="btn-call-next"
                  >
                    <span>{lang === 'gu' ? 'આગળનો બોલાવો' : 'Call Next Guest'}</span>
                    <span>→</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Split Grid: Waiting List (Left) + Walk-In Form (Right) */}
        <div className="reception-split-grid">
          {/* Left Column: Waiting List */}
          <div className="waiting-list-section">
            <div className="waiting-list-controls">
              <div>
                <span className="section-label">
                  {lang === 'gu' ? 'લાઈવ કતાર' : 'ACTIVE QUEUE'}
                </span>
                <h2 className="section-title" style={{ marginBottom: 0 }}>
                  {lang === 'gu' ? 'પ્રતીક્ષા યાદી' : 'Waiting Lounge'} (
                  {filteredWaiting.length})
                </h2>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  lang === 'gu'
                    ? 'ટોકન, નામ કે ફોન શોધો...'
                    : 'Search token, name or phone...'
                }
                className="waiting-search-input"
              />
            </div>

            {filteredWaiting.length === 0 ? (
              <div className="empty-waiting-box">
                <p
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    color: 'var(--warm-cream)',
                  }}
                >
                  {lang === 'gu'
                    ? 'પ્રતીક્ષામાં કોઈ નથી — વોક-ઇન સીધા પ્રવેશી શકે છે!'
                    : 'No one waiting — floor clear!'}
                </p>
                <p style={{ fontSize: '0.85rem' }}>
                  {lang === 'gu'
                    ? 'નવા ગ્રાહકને ઉમેરવા માટે જમણી બાજુના ફોર્મનો ઉપયોગ કરો.'
                    : 'Use the fast entry form on the right to register new walk-in clients.'}
                </p>
              </div>
            ) : (
              <div className="waiting-items-stack">
                {filteredWaiting.map((customer) => (
                  <div key={customer.token} className="waiting-item-card">
                    <div className="waiting-item-left">
                      <span className="waiting-token-pill">{customer.token}</span>
                      <div>
                        <div className="waiting-cust-name">{customer.name}</div>
                        <div className="waiting-cust-meta">
                          <span>📞 {customer.phone}</span> •{' '}
                          <span>💈 {formatBarberName(customer.barber)}</span>
                          <div>
                            ✂️ {formatServices(customer.services)} (
                            {customer.totalTime}m)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="waiting-item-actions">
                      <button
                        onClick={() => markNoShow(customer.token)}
                        className="btn-action-outline danger"
                        title="Mark as No-Show after 10-minute grace period"
                      >
                        {lang === 'gu' ? 'ગેરહાજર' : 'No-Show'}
                      </button>
                      <button
                        onClick={() => markCancel(customer.token)}
                        className="btn-action-outline danger"
                        title="Cancel customer registration"
                      >
                        {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Quick Walk-in Form */}
          <div className="walkin-form-card">
            <span className="section-label">
              {lang === 'gu' ? 'સ્પીડ એન્ટ્રી' : 'FRONT DESK DISPATCH'}
            </span>
            <h2>{lang === 'gu' ? 'ઝડપી વોક-ઇન નોંધણી' : 'Fast Walk-In Entry'}</h2>
            <p>
              {lang === 'gu'
                ? 'નવા આવનાર ગ્રાહકની વિગત ભરીને તાત્કાલિક ટોકન આપો.'
                : 'Instantly check in walk-in clients and issue a queue token.'}
            </p>

            {walkinError && (
              <div className="walkin-error-alert" role="alert">
                ⚠ {walkinError}
              </div>
            )}

            <form onSubmit={handleAddWalkin} className="walkin-inputs-form">
              <div>
                <label className="walkin-field-label">
                  {lang === 'gu' ? 'ગ્રાહકનું પૂરું નામ' : 'Customer Full Name'} *
                </label>
                <input
                  type="text"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder={
                    lang === 'gu' ? 'દા.ત. રાહુલ શર્મા' : 'e.g. Jordan Hayes'
                  }
                  className="walkin-input"
                />
              </div>

              <div>
                <label className="walkin-field-label">
                  {lang === 'gu' ? '૧૦ આંકડાનો ફોન નંબર' : '10-Digit Mobile Phone'} *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={walkinPhone}
                  onChange={(e) =>
                    setWalkinPhone(e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="9876543210"
                  className="walkin-input"
                />
              </div>

              <div>
                <label className="walkin-field-label">
                  {lang === 'gu'
                    ? 'સેવાઓ પસંદ કરો (મહત્તમ ૩)'
                    : 'Select Services (Max 3)'}{' '}
                  *
                </label>
                <div className="walkin-services-chips">
                  {services.map((s) => {
                    const isSelected = walkinServices.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleWalkinService(s.id)}
                        className={`walkin-service-chip ${
                          isSelected ? 'selected' : ''
                        }`}
                      >
                        {lang === 'gu' ? s.nameGu : s.name} ({s.duration}m)
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="walkin-field-label">
                  {lang === 'gu' ? 'પસંદગીના બાર્બર' : 'Stylist Preference'}
                </label>
                <select
                  value={walkinBarber}
                  onChange={(e) => setWalkinBarber(e.target.value)}
                  className="walkin-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="any">
                    {lang === 'gu'
                      ? 'કોઈપણ ઉપલબ્ધ બાર્બર (ઝડપી)'
                      : 'Any Available Stylist (Fastest)'}
                  </option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {lang === 'gu' ? b.nameGu : b.name} (
                      {lang === 'gu' ? b.stationGu : b.station})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-add-walkin">
                + {lang === 'gu' ? 'કતારમાં ઉમેરો' : 'Issue Token & Add to Line'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="reception-toast" role="status">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
