import { useState, useEffect } from 'react';
import {
  getQueue,
  saveQueue,
  getBarbers,
  saveBarbers,
  getServices,
  saveServices,
  getSalonSettings,
  saveSalonSettings,
  type QueueEntry,
  type SalonSettings,
} from '../services/salonStore';
import type { Language, BarberItem, ServiceItem } from '../i18n/translations';
import '../styles/global.css';
import '../styles/variables.css';
import '../styles/OwnerSettingsScreen.css';

export const OwnerSettingsScreen = ({ onHome }: { onHome?: () => void } = {}) => {
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

  // 2. Active tab
  const [activeTab, setActiveTab] = useState<'operations' | 'roster' | 'services'>('operations');

  // 3. Stores
  const [settings, setSettings] = useState<SalonSettings>(getSalonSettings);
  const [barbers, setBarbers] = useState<BarberItem[]>(getBarbers);
  const [services, setServices] = useState<ServiceItem[]>(getServices);
  const [queue, setQueue] = useState<QueueEntry[]>(getQueue);

  // 4. Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 5. New Service Form State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceNameGu, setNewServiceNameGu] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(25);
  const [newServicePrice, setNewServicePrice] = useState(30);

  // Sync state periodically
  useEffect(() => {
    const sync = () => {
      setQueue(getQueue());
      setBarbers(getBarbers());
      setServices(getServices());
      setSettings(getSalonSettings());
    };
    window.addEventListener('storage', sync);
    window.addEventListener('css_salon_update', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('css_salon_update', sync);
    };
  }, []);

  // Compute Today's Stats
  const totalGuests = queue.length;
  const inServiceCount = queue.filter((c) =>
    ['Called', 'In Chair', 'In Progress'].includes(c.status)
  ).length;
  const completedCount = queue.filter((c) => c.status === 'Done').length;
  const noShowCount = queue.filter((c) => c.status === 'No-show').length;
  const cancelledCount = queue.filter((c) => c.status === 'Cancelled').length;
  const totalRevenue = queue
    .filter((c) => c.status === 'Done')
    .reduce((sum, c) => sum + (c.totalPrice || 0), 0);

  // Settings Handlers
  const handleToggleOpen = () => {
    const updated = { ...settings, isOpen: !settings.isOpen };
    setSettings(updated);
    saveSalonSettings(updated);
    showToast(
      updated.isOpen
        ? lang === 'gu'
          ? 'સલૂન ખોલવામાં આવ્યું — લાઈવ ફ્લોર સક્રિય છે.'
          : 'Salon marked OPEN — floor active.'
        : lang === 'gu'
        ? 'સલૂન બંધ કરવામાં આવ્યું.'
        : 'Salon marked CLOSED.'
    );
  };

  const handleToggleQueueLock = () => {
    const updated = { ...settings, isQueueLocked: !settings.isQueueLocked };
    setSettings(updated);
    saveSalonSettings(updated);
    showToast(
      updated.isQueueLocked
        ? lang === 'gu'
          ? 'ઓનલાઇન કતાર નોંધણી લોક કરવામાં આવી.'
          : 'Queue registration LOCKED by management.'
        : lang === 'gu'
        ? 'ઓનલાઇન કતાર નોંધણી અનલોક કરવામાં આવી.'
        : 'Queue registration UNLOCKED.'
    );
  };

  const handleClosingTimeChange = (timeStr: string) => {
    const updated = { ...settings, closingTime: timeStr };
    setSettings(updated);
    saveSalonSettings(updated);
  };

  const handleResetQueue = () => {
    if (
      window.confirm(
        lang === 'gu'
          ? 'શું તમે ખરેખર આજની કતાર રીસેટ કરવા માંગો છો? બધો ડેટા સાફ થઈ જશે.'
          : "Are you sure you want to reset today's queue? All active and completed tokens will be cleared."
      )
    ) {
      saveQueue([]);
      setQueue([]);
      showToast(lang === 'gu' ? 'કતાર સફળતાપૂર્વક રીસેટ થઈ.' : "Today's queue cleared.");
    }
  };

  // Barber Roster Handlers
  const handleToggleBarberAvailability = (barberId: string) => {
    const updated = barbers.map((b) =>
      b.id === barberId ? { ...b, isOnBreak: !b.isOnBreak } : b
    );
    setBarbers(updated);
    saveBarbers(updated);
    showToast(lang === 'gu' ? 'બાર્બર ઉપલબ્ધતા અપડેટ થઈ.' : 'Barber status updated.');
  };

  // Service Catalog Handlers
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newService: ServiceItem = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      nameGu: newServiceNameGu.trim() || newServiceName.trim(),
      duration: Number(newServiceDuration) || 25,
      price: Number(newServicePrice) || 30,
      priceGu: `₹${Number(newServicePrice) * 20}`,
      description: 'Signature custom salon grooming service.',
      descriptionGu: 'અમારી વિશેષ કસ્ટમ ગ્રૂમિંગ સેવા.',
    };

    const updated = [...services, newService];
    setServices(updated);
    saveServices(updated);

    setNewServiceName('');
    setNewServiceNameGu('');
    showToast(
      lang === 'gu'
        ? `નવી સેવા "${newService.nameGu}" ઉમેરવામાં આવી.`
        : `Service "${newService.name}" added to catalog.`
    );
  };

  const handleRemoveService = (serviceId: string) => {
    const updated = services.filter((s) => s.id !== serviceId);
    setServices(updated);
    saveServices(updated);
    showToast(lang === 'gu' ? 'સેવા હટાવી દેવામાં આવી.' : 'Service removed from catalog.');
  };

  return (
    <div className="settings-root">
      {/* 1. Header Nav */}
      <nav className="settings-nav">
        <button
          className="settings-back-btn"
          onClick={onHome ? onHome : () => (window.location.href = '/')}
        >
          ← {lang === 'gu' ? 'મુખ્ય પાના પર પાછા જાઓ' : 'Back to Home'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={toggleLanguage}
            className="btn-action-outline"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            {lang === 'en' ? 'ગુજરાતી' : 'English'} [{lang.toUpperCase()}]
          </button>
          <span className="settings-badge">
            {lang === 'gu' ? 'માલિક કંટ્રોલ પેનલ' : 'OWNER SETTINGS'}
          </span>
        </div>
      </nav>

      {/* 2. Main Settings Container */}
      <main className="settings-container">
        <header className="settings-header">
          <h1>{lang === 'gu' ? 'ઓનર સેટિંગ્સ & એનાલિટિક્સ' : 'OWNER SETTINGS.'}</h1>
          <p>
            {lang === 'gu'
              ? 'સલૂન કામગીરી, સ્ટાફ રોસ્ટર, સેવા કિંમતો અને દૈનિક આંકડાઓનું સંચાલન.'
              : 'Salon operations, barber roster availability, service catalog pricing, and live floor metrics.'}
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="settings-tabs-bar">
          <button
            onClick={() => setActiveTab('operations')}
            className={`settings-tab-btn ${activeTab === 'operations' ? 'active' : ''}`}
          >
            📊 {lang === 'gu' ? 'કામગીરી & આંકડા' : 'Operations & Analytics'}
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`settings-tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
          >
            💈 {lang === 'gu' ? 'બાર્બર રોસ્ટર' : 'Barber Roster'}
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`settings-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          >
            ✂️ {lang === 'gu' ? 'સેવા કેટલોગ' : 'Service Catalog'}
          </button>
        </div>

        {/* ==============================================================
            Tab 1: Operations & Live Daily Analytics
           ============================================================== */}
        {activeTab === 'operations' && (
          <div className="settings-panel">
            {/* Live Analytics Grid */}
            <div className="settings-card">
              <h2 className="settings-card-title">
                {lang === 'gu' ? "આજના લાઇવ આંકડા (Today's Analytics)" : "Today's Live Floor Metrics"}
              </h2>
              <p className="settings-card-desc">
                {lang === 'gu'
                  ? 'આજના દિવસ માટે નોંધાયેલા ગ્રાહકો અને આવકની સ્થિતિ.'
                  : 'Real-time aggregated queue volume, throughput, and revenue.'}
              </p>

              <div className="settings-stats-grid">
                <div className="settings-stat-box">
                  <div className="settings-stat-number">{totalGuests}</div>
                  <div className="settings-stat-label">
                    {lang === 'gu' ? 'કુલ નોંધાયેલ' : 'Total Check-Ins'}
                  </div>
                </div>

                <div className="settings-stat-box">
                  <div className="settings-stat-number coral">{inServiceCount}</div>
                  <div className="settings-stat-label">
                    {lang === 'gu' ? 'સેવા ચાલુ' : 'Currently in Chair'}
                  </div>
                </div>

                <div className="settings-stat-box">
                  <div className="settings-stat-number">{completedCount}</div>
                  <div className="settings-stat-label">
                    {lang === 'gu' ? 'પૂર્ણ થયેલ' : 'Served & Done'}
                  </div>
                </div>

                <div className="settings-stat-box">
                  <div className="settings-stat-number" style={{ color: 'var(--coral)' }}>
                    {noShowCount}
                  </div>
                  <div className="settings-stat-label">
                    {lang === 'gu' ? 'ગેરહાજર (No-Shows)' : 'No-Shows'}
                  </div>
                </div>

                <div className="settings-stat-box">
                  <div className="settings-stat-number" style={{ color: 'var(--cream-dim)' }}>
                    {cancelledCount}
                  </div>
                  <div className="settings-stat-label">
                    {lang === 'gu' ? 'રદ થયેલ' : 'Cancelled'}
                  </div>
                </div>

                <div className="settings-stat-box">
                  <div className="settings-stat-number">
                    {lang === 'gu' ? `₹${totalRevenue * 20}` : `$${totalRevenue}`}
                  </div>
                  <div className="settings-stat-label">
                    {lang === 'gu' ? 'અંદાજિત આવક' : 'Est. Revenue'}
                  </div>
                </div>
              </div>
            </div>

            {/* Master Queue Controls */}
            <div className="settings-card">
              <h2 className="settings-card-title">
                {lang === 'gu' ? 'સલૂન કંટ્રોલ્સ & કતાર નિયમો' : 'Salon Operating Controls & Rules'}
              </h2>
              <p className="settings-card-desc">
                {lang === 'gu'
                  ? 'સલૂન ખુલવાનો/બંધ થવાનો સમય અને ૩૦-મિનિટ કટોફ નિયમનું સંચાલન.'
                  : 'Configure operational hours, self-registration gates, and automatic closing thresholds.'}
              </p>

              <div>
                <div className="settings-field-row">
                  <div>
                    <div className="settings-field-title">
                      {lang === 'gu' ? 'સલૂન ઓપરેટિંગ સ્થિતિ (Salon Open)' : 'Salon Operating Status (Open/Closed)'}
                    </div>
                    <div className="settings-field-hint">
                      {lang === 'gu'
                        ? 'જો બંધ કરવામાં આવે, તો ગ્રાહકો કતારમાં જોડાઈ શકશે નહીં.'
                        : 'Disables all new walk-in check-ins when closed.'}
                    </div>
                  </div>
                  <label className="settings-toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.isOpen}
                      onChange={handleToggleOpen}
                    />
                    <span className="settings-slider"></span>
                  </label>
                </div>

                <div className="settings-field-row">
                  <div>
                    <div className="settings-field-title">
                      {lang === 'gu' ? 'કતાર લોક કંટ્રોલ (Lock Registration)' : 'Lock Queue Self-Registration'}
                    </div>
                    <div className="settings-field-hint">
                      {lang === 'gu'
                        ? 'તાકીદના સમયે ઓનલાઇન કતાર બંધ કરો.'
                        : 'Temporarily pause public kiosk & online check-ins during floor peak surges.'}
                    </div>
                  </div>
                  <label className="settings-toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.isQueueLocked}
                      onChange={handleToggleQueueLock}
                    />
                    <span className="settings-slider"></span>
                  </label>
                </div>

                <div className="settings-field-row">
                  <div>
                    <div className="settings-field-title">
                      {lang === 'gu' ? 'સલૂન બંધ થવાનો સમય (Closing Time)' : 'Salon Daily Closing Time'}
                    </div>
                    <div className="settings-field-hint">
                      {lang === 'gu'
                        ? '૩૦-મિનિટ કટોફ નિયમ: બંધ થવાના ૩૦ મિનિટ પહેલાં કતાર આપોઆપ બંધ થશે.'
                        : 'Rule: Online queue self-service automatically locks 30 minutes prior to this time.'}
                    </div>
                  </div>
                  <input
                    type="time"
                    value={settings.closingTime}
                    onChange={(e) => handleClosingTimeChange(e.target.value)}
                    style={{
                      backgroundColor: 'var(--forest-dark)',
                      color: 'var(--warm-cream)',
                      border: '1px solid var(--cream-line-strong)',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '1rem',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Maintenance / Queue Reset */}
            <div className="settings-card" style={{ borderColor: 'rgba(255, 118, 89, 0.4)' }}>
              <h2 className="settings-card-title" style={{ color: 'var(--coral)' }}>
                {lang === 'gu' ? 'કતાર મેઈન્ટેનન્સ (Queue Reset)' : 'Floor Maintenance & Daily Reset'}
              </h2>
              <p className="settings-card-desc">
                {lang === 'gu'
                  ? 'નવા દિવસની શરૂઆત કરવા અથવા પરીક્ષણ માટે કતાર રીસેટ કરો.'
                  : 'Clear active and past tokens for a fresh day or grading simulation.'}
              </p>
              <button onClick={handleResetQueue} className="btn-danger-outline">
                ⚠ {lang === 'gu' ? "આજની કતાર રીસેટ કરો (Clear Queue)" : "Reset Today's Queue"}
              </button>
            </div>
          </div>
        )}

        {/* ==============================================================
            Tab 2: Barber Roster Management
           ============================================================== */}
        {activeTab === 'roster' && (
          <div className="settings-panel">
            <div className="settings-card">
              <h2 className="settings-card-title">
                {lang === 'gu' ? 'માસ્ટર બાર્બર રોસ્ટર' : 'Master Stylist Roster'}
              </h2>
              <p className="settings-card-desc">
                {lang === 'gu'
                  ? 'બાર્બર સ્ટેશન, વિષયવસ્તુ અને ઉપલબ્ધતા / વિરામ મેનેજ કરો.'
                  : 'Manage stylist station assignments, specialties, and on-duty availability.'}
              </p>

              <table className="settings-table">
                <thead>
                  <tr>
                    <th>{lang === 'gu' ? 'બાર્બર' : 'Stylist'}</th>
                    <th>{lang === 'gu' ? 'સ્ટેશન' : 'Station'}</th>
                    <th>{lang === 'gu' ? 'સ્પેશિયાલિટી' : 'Specialty'}</th>
                    <th>{lang === 'gu' ? 'સ્થિતિ' : 'Duty Status'}</th>
                    <th>{lang === 'gu' ? 'એક્શન' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {barbers.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 800 }}>
                        {lang === 'gu' ? b.nameGu : b.name}
                      </td>
                      <td style={{ color: 'var(--cream-muted)' }}>
                        {lang === 'gu' ? b.stationGu : b.station}
                      </td>
                      <td style={{ color: 'var(--cream-muted)', fontSize: '0.85rem' }}>
                        {lang === 'gu' ? b.specialtyGu : b.specialty}
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: b.isOnBreak
                              ? 'rgba(255, 118, 89, 0.2)'
                              : 'rgba(217, 229, 106, 0.2)',
                            color: b.isOnBreak ? 'var(--coral)' : 'var(--acid-lime)',
                          }}
                        >
                          {b.isOnBreak
                            ? lang === 'gu'
                              ? 'વિરામ પર (On Break)'
                              : 'On Break'
                            : lang === 'gu'
                            ? 'સક્રિય (Active)'
                            : 'Active Duty'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleBarberAvailability(b.id)}
                          className="btn-action-outline"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                        >
                          {b.isOnBreak
                            ? lang === 'gu'
                              ? 'સક્રિય કરો'
                              : 'Set Active'
                            : lang === 'gu'
                            ? 'વિરામ આપો'
                            : 'Set Break'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==============================================================
            Tab 3: Service Catalog Management
           ============================================================== */}
        {activeTab === 'services' && (
          <div className="settings-panel">
            {/* Add Service Card */}
            <div className="settings-card">
              <h2 className="settings-card-title">
                {lang === 'gu' ? '+ નવી સેવા ઉમેરો' : '+ Add New Service to Catalog'}
              </h2>
              <p className="settings-card-desc">
                {lang === 'gu'
                  ? 'નવા હેરકટ અથવા ગ્રૂમિંગ પેકેજ માટે નામ, સમય અને કિંમત દાખલ કરો.'
                  : 'Define new grooming treatments, estimated durations, and pricing.'}
              </p>

              <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--cream-dim)', marginBottom: '0.3rem' }}>
                      SERVICE NAME (ENGLISH) *
                    </label>
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="e.g. Royal Hot Towel Shave"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--forest-dark)',
                        border: '1px solid var(--cream-line-strong)',
                        color: 'var(--warm-cream)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--cream-dim)', marginBottom: '0.3rem' }}>
                      SERVICE NAME (GUJARATI)
                    </label>
                    <input
                      type="text"
                      value={newServiceNameGu}
                      onChange={(e) => setNewServiceNameGu(e.target.value)}
                      placeholder="દા.ત. રોયલ હોટ ટોવેલ શેવ"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--forest-dark)',
                        border: '1px solid var(--cream-line-strong)',
                        color: 'var(--warm-cream)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--cream-dim)', marginBottom: '0.3rem' }}>
                      DURATION (MINUTES) *
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={newServiceDuration}
                      onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--forest-dark)',
                        border: '1px solid var(--cream-line-strong)',
                        color: 'var(--warm-cream)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--cream-dim)', marginBottom: '0.3rem' }}>
                      PRICE ($ / ₹) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--forest-dark)',
                        border: '1px solid var(--cream-line-strong)',
                        color: 'var(--warm-cream)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-save-settings" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                  + {lang === 'gu' ? 'સેવા ઉમેરો' : 'Add Service'}
                </button>
              </form>
            </div>

            {/* Existing Services List */}
            <div className="settings-card">
              <h2 className="settings-card-title">
                {lang === 'gu' ? 'સેવા કેટલોગ યાદી' : 'Active Service Catalog'} ({services.length})
              </h2>

              <table className="settings-table">
                <thead>
                  <tr>
                    <th>{lang === 'gu' ? 'સેવા' : 'Service'}</th>
                    <th>{lang === 'gu' ? 'સમય' : 'Duration'}</th>
                    <th>{lang === 'gu' ? 'કિંમત' : 'Price'}</th>
                    <th>{lang === 'gu' ? 'એક્શન' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700 }}>
                        <div>{lang === 'gu' ? s.nameGu : s.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--cream-muted)' }}>
                          {lang === 'gu' ? s.descriptionGu : s.description}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--acid-lime)' }}>
                        {s.duration} min
                      </td>
                      <td style={{ fontWeight: 800 }}>
                        {lang === 'gu' ? s.priceGu : `$${s.price}`}
                      </td>
                      <td>
                        <button
                          onClick={() => handleRemoveService(s.id)}
                          className="btn-action-outline danger"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                        >
                          ✕ {lang === 'gu' ? 'હટાવો' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
