import { useState, useEffect } from 'react';
import {
  getQueue,
  saveQueue,
  getBarbers,
  calculateWaitTime,
  type QueueEntry,
} from '../services/salonStore';
import { DUMMY_SERVICES } from '../data/dummySalon';
import type { Language } from '../i18n/translations';
import '../styles/global.css';
import '../styles/variables.css';

export const MyStatusScreen = ({ onHome }: { onHome: () => void }) => {
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

  const [search, setSearch] = useState('');
  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync entry when queue updates in background
  useEffect(() => {
    const syncStatus = () => {
      if (!entry) return;
      const latestQueue = getQueue();
      const fresh = latestQueue.find((q) => q.token === entry.token);
      if (fresh) {
        setEntry(fresh);
      }
    };
    window.addEventListener('storage', syncStatus);
    window.addEventListener('css_salon_update', syncStatus);
    const interval = setInterval(syncStatus, 2000);
    return () => {
      window.removeEventListener('storage', syncStatus);
      window.removeEventListener('css_salon_update', syncStatus);
      clearInterval(interval);
    };
  }, [entry]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queue = getQueue();
    const cleanSearch = search.trim().toLowerCase();

    const found = queue.find(
      (q) =>
        q.token.toLowerCase() === cleanSearch ||
        q.phone.replace(/\D/g, '') === cleanSearch.replace(/\D/g, '')
    );

    if (found) {
      setEntry(found);
      setError('');
    } else {
      setEntry(null);
      setError(
        lang === 'gu'
          ? 'કોઈ કતાર એન્ટ્રી મળી નથી. તમારો ટોકન અથવા ફોન નંબર તપાસો.'
          : 'No queue ticket found. Please check your token ID or phone number.'
      );
    }
  };

  const handleCancelSpot = () => {
    if (!entry) return;
    if (
      window.confirm(
        lang === 'gu'
          ? 'શું તમે ખરેખર તમારી કતાર ટિકિટ રદ કરવા માંગો છો?'
          : 'Are you sure you want to cancel your queue spot?'
      )
    ) {
      const queue = getQueue();
      const updated = queue.map((c) =>
        c.token === entry.token ? { ...c, status: 'Cancelled' as const } : c
      );
      saveQueue(updated);
      setEntry({ ...entry, status: 'Cancelled' });
      setToastMessage(lang === 'gu' ? 'તમારો વારો રદ કરવામાં આવ્યો છે.' : 'Your spot has been cancelled.');
    }
  };

  const formatServices = (services: string[] = []): string => {
    if (!services || services.length === 0) return 'Standard Cut';
    return services
      .map((s) => {
        const match = DUMMY_SERVICES.find((ds) => ds.id === s || ds.name === s);
        return match ? (lang === 'gu' ? match.nameGu : match.name) : s;
      })
      .join(', ');
  };

  const formatBarber = (barberVal: string): string => {
    if (!barberVal || barberVal.toLowerCase() === 'any') {
      return lang === 'gu' ? 'કોઈપણ ઉપલબ્ધ બાર્બર' : 'Any Available Barber';
    }
    const barbers = getBarbers();
    const match = barbers.find(
      (b) => b.id === barberVal || b.name.toLowerCase() === barberVal.toLowerCase()
    );
    return match ? (lang === 'gu' ? match.nameGu : match.name) : barberVal;
  };

  const currentWaitEst = entry ? calculateWaitTime(getQueue(), getBarbers(), entry.token) : 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFF9F0',
        color: '#173D32',
        padding: '30px 20px 60px',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          maxWidth: '750px',
          margin: '0 auto 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onHome}
          style={{
            background: 'none',
            border: 'none',
            color: '#173D32',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← {lang === 'gu' ? 'મુખ્ય પાના પર પાછા જાઓ' : 'Back to Atelier Home'}
        </button>

        <button
          onClick={toggleLanguage}
          style={{
            background: 'transparent',
            border: '1px solid #173D32',
            borderRadius: '20px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            color: '#173D32',
          }}
        >
          {lang === 'en' ? 'ગુજરાતી' : 'English'} [{lang.toUpperCase()}]
        </button>
      </div>

      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.15em',
            color: '#FF7659',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          {lang === 'gu' ? 'લાઇવ ટિકિટ ટ્રેકિંગ' : 'LIVE TICKET TRACKER'}
        </span>
        <h1
          style={{
            fontSize: 'clamp(36px, 7vw, 64px)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: '15px',
          }}
        >
          {lang === 'gu' ? 'મારો સ્ટેટસ.' : 'MY STATUS.'}
        </h1>

        <p style={{ color: '#445D55', marginBottom: '30px', fontSize: '16px' }}>
          {lang === 'gu'
            ? 'તમારી લાઈવ કતાર સ્થિતિ જોવા માટે ટોકન નંબર અથવા ફોન નંબર દાખલ કરો.'
            : 'Enter your Token ID (e.g. CSS-123) or 10-digit mobile number to track your place in line.'}
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              lang === 'gu' ? 'દા.ત. CSS-123 અથવા 9876543210' : 'e.g. CSS-123 or 10-digit phone number'
            }
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '16px',
              border: '2px solid #173D32',
              backgroundColor: 'transparent',
              marginBottom: '15px',
              boxSizing: 'border-box',
              borderRadius: '8px',
              color: '#173D32',
              outline: 'none',
            }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#173D32',
              color: '#FFF9F0',
              border: 'none',
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {lang === 'gu' ? 'સ્થિતિ તપાસો' : 'CHECK MY STATUS'}
          </button>
        </form>

        {error && (
          <p
            style={{
              color: '#FF7659',
              marginTop: '15px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}
          >
            ⚠ {error}
          </p>
        )}

        {/* Live Ticket Card */}
        {entry && (
          <div
            style={{
              marginTop: '35px',
              padding: '30px',
              border: '3px solid #173D32',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 30px rgba(23, 61, 50, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '20px',
                borderBottom: '1px solid #E5E1D8',
                paddingBottom: '15px',
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#FF7659',
                    letterSpacing: '0.1em',
                  }}
                >
                  {lang === 'gu' ? 'ટોકન નંબર' : 'TOKEN ISSUED'}
                </span>
                <div
                  style={{
                    fontSize: 'clamp(32px, 6vw, 48px)',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    color: '#173D32',
                  }}
                >
                  {entry.token}
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '8px 18px',
                    borderRadius: '30px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor:
                      entry.status === 'Called'
                        ? '#FF7659'
                        : entry.status === 'In Chair' || entry.status === 'In Progress'
                        ? '#D9E56A'
                        : entry.status === 'Done'
                        ? '#445D55'
                        : entry.status === 'No-show' || entry.status === 'Cancelled'
                        ? '#FF7659'
                        : '#173D32',
                    color:
                      entry.status === 'In Chair' || entry.status === 'In Progress'
                        ? '#173D32'
                        : '#FFFFFF',
                  }}
                >
                  ● {entry.status}
                </span>
              </div>
            </div>

            {/* Alert if Called */}
            {entry.status === 'Called' && (
              <div
                style={{
                  backgroundColor: '#FFF2EE',
                  border: '2px solid #FF7659',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  color: '#173D32',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#FF7659' }}>
                  🔔 {lang === 'gu' ? 'તમારો વારો આવ્યો છે!' : 'YOUR TURN HAS ARRIVED!'}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '14px' }}>
                  {lang === 'gu'
                    ? 'કૃપા કરીને તરત જ તમારા સ્ટાઈલિશના સ્ટેશન પર પધારો. (૧૦-મિનિટ નિયમ)'
                    : 'Please proceed immediately to your assigned stylist station. 10-minute grace period applies.'}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                fontSize: '15px',
              }}
            >
              <div>
                <strong style={{ color: '#738A82' }}>{lang === 'gu' ? 'ગ્રાહક' : 'Guest'}:</strong>
                <div style={{ fontWeight: 700, fontSize: '17px' }}>{entry.name}</div>
              </div>

              <div>
                <strong style={{ color: '#738A82' }}>{lang === 'gu' ? 'સ્ટાઈલિશ' : 'Stylist'}:</strong>
                <div style={{ fontWeight: 700, fontSize: '17px' }}>{formatBarber(entry.barber)}</div>
              </div>

              <div>
                <strong style={{ color: '#738A82' }}>
                  {lang === 'gu' ? 'અંદાજિત સમય' : 'Est. Wait Time'}:
                </strong>
                <div style={{ fontWeight: 700, fontSize: '17px', color: '#FF7659' }}>
                  {entry.status === 'Waiting'
                    ? `~${currentWaitEst} min`
                    : entry.status === 'Called'
                    ? 'Calling now!'
                    : entry.status === 'In Chair'
                    ? 'In Chair'
                    : 'Completed'}
                </div>
              </div>

              <div>
                <strong style={{ color: '#738A82' }}>{lang === 'gu' ? 'કિંમત' : 'Total Price'}:</strong>
                <div style={{ fontWeight: 700, fontSize: '17px' }}>₹{entry.totalPrice}</div>
              </div>
            </div>

            <div style={{ marginTop: '18px', paddingTop: '15px', borderTop: '1px solid #E5E1D8' }}>
              <strong style={{ color: '#738A82' }}>{lang === 'gu' ? 'પસંદ કરેલ સેવાઓ' : 'Selected Services'}:</strong>
              <div style={{ marginTop: '4px', fontWeight: 600 }}>{formatServices(entry.services)}</div>
            </div>

            {/* Cancel Spot Button if still waiting */}
            {entry.status === 'Waiting' && (
              <div style={{ marginTop: '25px', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={handleCancelSpot}
                  style={{
                    background: 'transparent',
                    border: '1px solid #FF7659',
                    color: '#FF7659',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ✕ {lang === 'gu' ? 'મારો વારો રદ કરો' : 'Cancel My Spot'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#173D32',
            color: '#FFF9F0',
            padding: '12px 20px',
            borderRadius: '30px',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};
