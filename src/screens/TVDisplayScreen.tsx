import { useState, useEffect, useRef } from 'react';
import {
  getQueue,
  getBarbers,
  calculateWaitTime,
  playChime,
  type QueueEntry,
} from '../services/salonStore';
import { DUMMY_SERVICES } from '../data/dummySalon';
import type { Language, BarberItem } from '../i18n/translations';
import '../styles/global.css';
import '../styles/variables.css';
import '../styles/TVDisplayScreen.css';

export const TVDisplayScreen = ({ onHome }: { onHome?: () => void } = {}) => {
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

  // 2. Real-time digital clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  // 3. Queue and Barbers State
  const [queue, setQueue] = useState<QueueEntry[]>(getQueue);
  const [barbers, setBarbers] = useState<BarberItem[]>(getBarbers);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const prevCalledTokensRef = useRef<string[]>([]);

  // 4. Sync State and Audio Chime on New Call
  useEffect(() => {
    const syncState = () => {
      const latestQueue = getQueue();
      const latestBarbers = getBarbers();

      // Check if new customer is 'Called' to trigger audio chime
      const currentlyCalledTokens = latestQueue
        .filter((c) => c.status === 'Called')
        .map((c) => c.token);

      const hasNewCall = currentlyCalledTokens.some(
        (t) => !prevCalledTokensRef.current.includes(t)
      );

      if (hasNewCall && !isMuted) {
        playChime();
      }
      prevCalledTokensRef.current = currentlyCalledTokens;

      setQueue(latestQueue);
      setBarbers(latestBarbers);
    };

    window.addEventListener('storage', syncState);
    window.addEventListener('css_salon_update', syncState);
    const interval = setInterval(syncState, 2000);
    return () => {
      window.removeEventListener('storage', syncState);
      window.removeEventListener('css_salon_update', syncState);
      clearInterval(interval);
    };
  }, [isMuted]);

  // 5. Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // 6. Active customer for each barber station
  const getActiveCustomerForBarber = (barber: BarberItem) => {
    return queue.find(
      (c) =>
        ['Called', 'In Chair', 'In Progress'].includes(c.status) &&
        (c.assignedBarber === barber.id ||
          c.assignedBarber === barber.name ||
          c.barber === barber.id ||
          c.barber.toLowerCase() === barber.name.toLowerCase() ||
          c.barber.toLowerCase() === barber.name.split(' ')[0].toLowerCase())
    );
  };

  // 7. Waiting Queue (Up Next)
  const waitingCustomers = queue.filter((c) => c.status === 'Waiting');
  const activeCount = queue.filter((c) =>
    ['Called', 'In Chair', 'In Progress'].includes(c.status)
  ).length;

  const formatServices = (services: string[] = []): string => {
    if (!services || services.length === 0) return 'Standard Haircut';
    return services
      .map((s) => {
        const match = DUMMY_SERVICES.find((ds) => ds.id === s || ds.name === s);
        return match ? (lang === 'gu' ? match.nameGu : match.name) : s;
      })
      .join(', ');
  };

  const formatBarberName = (barberVal: string): string => {
    if (!barberVal || barberVal.toLowerCase() === 'any') {
      return lang === 'gu' ? 'કોઈપણ ઉપલબ્ધ' : 'Any Stylist';
    }
    const match = barbers.find(
      (b) => b.id === barberVal || b.name.toLowerCase() === barberVal.toLowerCase()
    );
    return match ? (lang === 'gu' ? match.nameGu : match.name) : barberVal;
  };

  return (
    <div className="tv-root">
      {/* 1. Top Broadcast Header */}
      <header className="tv-header">
        <div className="tv-brand-block">
          <button
            onClick={onHome ? onHome : () => (window.location.href = '/')}
            className="tv-ctrl-btn"
            title="Return to Salon Main"
          >
            ← {lang === 'gu' ? 'હોમ' : 'Home'}
          </button>
          <div className="tv-logo-big">CSS</div>
          <div className="tv-brand-tagline">
            <div>Cascading Style Salon</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--acid-lime)' }}>
              {lang === 'gu' ? 'લાઈવ ડિસ્પ્લે વોલબોર્ડ' : 'Live Floor Display Wallboard'}
            </div>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="tv-header-metrics">
          <div className="tv-metric-pill">
            <span className="tv-metric-val">{waitingCustomers.length}</span>
            <span className="tv-metric-lbl">
              {lang === 'gu' ? 'પ્રતીક્ષામાં' : 'Waiting'}
            </span>
          </div>

          <div className="tv-metric-pill">
            <span className="tv-metric-val coral">{activeCount}</span>
            <span className="tv-metric-lbl">
              {lang === 'gu' ? 'સેવામાં' : 'In Service'}
            </span>
          </div>

          <div className="tv-clock-block">
            {currentTime} • <span style={{ fontSize: '0.9rem', color: 'var(--cream-dim)' }}>{currentDate}</span>
          </div>
        </div>

        {/* Discreet TV Controls */}
        <div className="tv-controls-group">
          <button
            onClick={() => {
              if (isMuted) {
                setIsMuted(false);
                playChime();
              } else {
                setIsMuted(true);
              }
            }}
            className="tv-ctrl-btn"
            title={isMuted ? 'Unmute Audio Chime' : 'Mute Audio Chime'}
          >
            {isMuted ? '🔇 Unmute Chime' : '🔔 Audio Chime ON'}
          </button>

          <button onClick={toggleLanguage} className="tv-ctrl-btn">
            {lang === 'en' ? 'ગુજરાતી' : 'English'} [{lang.toUpperCase()}]
          </button>

          <button onClick={toggleFullscreen} className="tv-ctrl-btn" title="Toggle Fullscreen">
            ⛶ Fullscreen
          </button>
        </div>
      </header>

      {/* 2. Main 2-Column TV Split Grid */}
      <main className="tv-main-grid">
        {/* Left Column: Now Calling & In Chair Stations */}
        <section>
          <div className="tv-column-title">
            <span>
              {lang === 'gu'
                ? 'હાલમાં સેવા ચાલુ & બોલાવેલ'
                : 'NOW SERVING & NOW CALLING'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--cream-dim)' }}>
              {lang === 'gu' ? 'માસ્ટર સ્ટેશન્સ' : 'Master Stations'}
            </span>
          </div>

          <div className="tv-stations-grid">
            {barbers.map((barber) => {
              const activeCust = getActiveCustomerForBarber(barber);
              const isCalling = activeCust?.status === 'Called';
              const isInChair = activeCust && !isCalling;
              const isEmpty = !activeCust && !barber.isOnBreak;

              return (
                <div
                  key={barber.id}
                  className={`tv-station-card ${
                    isCalling
                      ? 'calling'
                      : isInChair
                      ? 'in-chair'
                      : isEmpty
                      ? 'empty-chair'
                      : ''
                  }`}
                >
                  <div className="tv-station-left">
                    <span className="tv-station-num">
                      {lang === 'gu' ? barber.stationGu : barber.station}
                    </span>
                    <h2 className="tv-barber-name">
                      {lang === 'gu' ? barber.nameGu : barber.name}
                    </h2>

                    {activeCust ? (
                      <div>
                        <div className="tv-cust-name-lg">{activeCust.name}</div>
                        <div className="tv-cust-services">
                          ✂️ {formatServices(activeCust.services)}
                        </div>
                      </div>
                    ) : barber.isOnBreak ? (
                      <div style={{ color: 'var(--coral)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                        {lang === 'gu' ? '⏸ વિરામ પર છે' : '⏸ Station on 15-min Break'}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--cream-dim)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                        {lang === 'gu' ? '○ ખુરશી ઉપલબ્ધ છે' : '○ Station Ready — Chair Available'}
                      </div>
                    )}
                  </div>

                  <div className="tv-station-right">
                    {activeCust ? (
                      <>
                        <div
                          className={`tv-token-giant ${
                            isCalling ? 'calling-token' : ''
                          }`}
                        >
                          {activeCust.token}
                        </div>
                        <span
                          className={`tv-status-badge ${
                            isCalling ? 'calling' : 'in-chair'
                          }`}
                        >
                          {isCalling
                            ? lang === 'gu'
                              ? '● વારો આવ્યો છે (Now Calling)'
                              : '● NOW CALLING'
                            : lang === 'gu'
                            ? '● સેવામાં છે (In Chair)'
                            : '● IN CHAIR'}
                        </span>
                      </>
                    ) : (
                      <span className="tv-status-badge available">
                        {barber.isOnBreak
                          ? lang === 'gu'
                            ? 'વિરામ (Break)'
                            : 'On Break'
                          : lang === 'gu'
                          ? 'તૈયાર (Ready)'
                          : 'Available'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Up Next In Line */}
        <section className="tv-upnext-board">
          <div className="tv-column-title">
            <span>{lang === 'gu' ? 'આગામી વારો' : 'UP NEXT IN LINE'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--acid-lime)' }}>
              {waitingCustomers.length} {lang === 'gu' ? 'પ્રતીક્ષામાં' : 'in queue'}
            </span>
          </div>

          {waitingCustomers.length === 0 ? (
            <div className="tv-empty-queue">
              <h3 style={{ fontSize: '1.4rem', color: 'var(--warm-cream)', marginBottom: '0.5rem' }}>
                {lang === 'gu' ? 'બધા ગ્રાહકો સેવામાં છે!' : 'Queue is Clear!'}
              </h3>
              <p style={{ fontSize: '0.95rem' }}>
                {lang === 'gu'
                  ? 'કોઈ પ્રતીક્ષા નથી — તરત જ રિસેપ્શન પર પધારો.'
                  : 'Zero wait right now — walk straight up to reception to get styled.'}
              </p>
            </div>
          ) : (
            <div className="tv-queue-list">
              {waitingCustomers.slice(0, 7).map((customer, idx) => {
                const waitEst = calculateWaitTime(queue, barbers, customer.token);
                return (
                  <div
                    key={customer.token}
                    className={`tv-queue-row ${idx === 0 ? 'next-first' : ''}`}
                  >
                    <div className="tv-queue-row-left">
                      <span className="tv-queue-pos">#{idx + 1}</span>
                      <div>
                        <div className="tv-queue-token">{customer.token}</div>
                        <div className="tv-queue-name">{customer.name}</div>
                      </div>
                    </div>

                    <div className="tv-queue-row-right">
                      <span className="tv-queue-wait">~{waitEst} min</span>
                      <span className="tv-queue-barber-tag">
                        💈 {formatBarberName(customer.barber)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* 3. Ambient Bottom Bilingual News Ticker */}
      <footer className="tv-ticker-bar">
        <span className="tv-ticker-label">
          {lang === 'gu' ? 'જાહેરાત' : 'BULLETIN'}
        </span>
        <div className="tv-ticker-content">
          {lang === 'gu'
            ? 'કાસ્કેડિંગ સ્ટાઇલ સલૂનમાં આપનું સ્વાગત છે • કૃપા કરીને તમારું ટોકન બોલાવવામાં આવે ત્યારે ૧૦ મિનિટમાં તમારા સ્ટેશન પર પહોંચવું • ઓનલાઇન કતાર બંધ થવાના ૩૦ મિનિટ પહેલાં બંધ થશે • અસુવિધા બદલ આભાર.'
            : 'Welcome to CSS — Cascading Style Salon • Please proceed to your station when your token is called (10-minute grace window applies) • Online queue registration automatically closes 30 minutes before closing time • Clean cuts, zero overflow.'}
        </div>
      </footer>
    </div>
  );
};
