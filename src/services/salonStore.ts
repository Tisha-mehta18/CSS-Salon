import { DUMMY_BARBERS, DUMMY_SERVICES } from '../data/dummySalon';
import type { BarberItem, ServiceItem } from '../i18n/translations';

export interface QueueEntry {
  token: string;
  name: string;
  phone: string;
  services: string[];
  barber: string;
  assignedBarber?: string;
  totalTime: number;
  totalPrice: number;
  status: 'Waiting' | 'Called' | 'In Chair' | 'In Progress' | 'Done' | 'No-show' | 'Cancelled';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface SalonSettings {
  isOpen: boolean;
  isQueueLocked: boolean;
  closingTime: string; // e.g. "20:00"
  autoCloseMinutesBefore: number; // 30
}

const DEFAULT_SETTINGS: SalonSettings = {
  isOpen: true,
  isQueueLocked: false,
  closingTime: '20:00',
  autoCloseMinutesBefore: 30,
};

// Dispatch event so same-tab components update in real-time
const notifyListeners = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('css_salon_update'));
  }
};

// Queue Store
export const getQueue = (): QueueEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('css_salon_queue');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveQueue = (queue: QueueEntry[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('css_salon_queue', JSON.stringify(queue));
  notifyListeners();
};

// Barbers Store
export const getBarbers = (): BarberItem[] => {
  if (typeof window === 'undefined') return DUMMY_BARBERS;
  try {
    const raw = localStorage.getItem('css_salon_barbers');
    if (!raw) {
      localStorage.setItem('css_salon_barbers', JSON.stringify(DUMMY_BARBERS));
      return DUMMY_BARBERS;
    }
    return JSON.parse(raw);
  } catch {
    return DUMMY_BARBERS;
  }
};

export const saveBarbers = (barbers: BarberItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('css_salon_barbers', JSON.stringify(barbers));
  notifyListeners();
};

export const toggleBarberBreak = (barberId: string): BarberItem[] => {
  const current = getBarbers();
  const updated = current.map((b) =>
    b.id === barberId ? { ...b, isOnBreak: !b.isOnBreak } : b
  );
  saveBarbers(updated);
  return updated;
};

// Services Store
export const getServices = (): ServiceItem[] => {
  if (typeof window === 'undefined') return DUMMY_SERVICES;
  try {
    const raw = localStorage.getItem('css_salon_services');
    if (!raw) {
      localStorage.setItem('css_salon_services', JSON.stringify(DUMMY_SERVICES));
      return DUMMY_SERVICES;
    }
    return JSON.parse(raw);
  } catch {
    return DUMMY_SERVICES;
  }
};

export const saveServices = (services: ServiceItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('css_salon_services', JSON.stringify(services));
  notifyListeners();
};

// Settings Store
export const getSalonSettings = (): SalonSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem('css_salon_settings');
    if (!raw) {
      localStorage.setItem('css_salon_settings', JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSalonSettings = (settings: SalonSettings): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('css_salon_settings', JSON.stringify(settings));
  notifyListeners();
};

// Check if online queue registration is allowed (rule: closed 30 mins before closing time)
export const isOnlineQueueAllowed = (settings: SalonSettings): { allowed: boolean; reason?: string } => {
  if (!settings.isOpen) {
    return { allowed: false, reason: 'Salon is currently closed.' };
  }
  if (settings.isQueueLocked) {
    return { allowed: false, reason: 'Queue registration is locked by front desk.' };
  }

  // Parse closing time
  try {
    const now = new Date();
    const [closeHour, closeMinute] = settings.closingTime.split(':').map(Number);
    const closingDate = new Date();
    closingDate.setHours(closeHour, closeMinute, 0, 0);

    const diffMinutes = (closingDate.getTime() - now.getTime()) / (1000 * 60);
    if (diffMinutes <= settings.autoCloseMinutesBefore && diffMinutes >= 0) {
      return {
        allowed: false,
        reason: `Queue registration automatically closes ${settings.autoCloseMinutesBefore} minutes prior to closing (${settings.closingTime}) so all waiting guests can be served.`,
      };
    }
  } catch {
    // If invalid format, allow
  }

  return { allowed: true };
};

// Web Audio API Pleasant 2-Tone Chime
export const playChime = (): void => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Tone 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.28, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.55);

    // Tone 2: A5 (880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.22);
    gain2.gain.setValueAtTime(0.32, ctx.currentTime + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.22);
    osc2.stop(ctx.currentTime + 0.85);
  } catch (err) {
    console.warn('Audio chime playback omitted:', err);
  }
};

// Accurate Dynamic Wait-Time Calculation
export const calculateWaitTime = (
  queue: QueueEntry[],
  barbers: BarberItem[],
  customerToken: string
): number => {
  const custIndex = queue.findIndex((c) => c.token === customerToken);
  if (custIndex === -1) return 0;
  const cust = queue[custIndex];
  if (cust.status === 'In Chair' || cust.status === 'In Progress') return 0;
  if (cust.status !== 'Waiting' && cust.status !== 'Called') return 0;

  const activeBarbers = barbers.filter((b) => !b.isOnBreak && b.isActive !== false);
  const activeCount = Math.max(1, activeBarbers.length);

  // If waiting for a specific barber
  if (cust.barber !== 'any') {
    const assignedBarber = barbers.find(
      (b) => b.id === cust.barber || b.name.toLowerCase() === cust.barber.toLowerCase()
    );
    let totalMins = 0;
    const inChair = queue.find(
      (c) =>
        ['In Chair', 'In Progress', 'Called'].includes(c.status) &&
        (c.assignedBarber === cust.barber || c.barber === cust.barber)
    );
    if (inChair) totalMins += 15;

    for (let i = 0; i < custIndex; i++) {
      const ahead = queue[i];
      if (
        ahead.status === 'Waiting' &&
        (ahead.barber === cust.barber ||
          (assignedBarber && ahead.barber === assignedBarber.id) ||
          (assignedBarber && ahead.barber.toLowerCase() === assignedBarber.name.toLowerCase()))
      ) {
        totalMins += ahead.totalTime || 30;
      }
    }
    return Math.max(5, totalMins || 15);
  }

  // Any barber general pool
  let totalWorkload = 0;
  for (let i = 0; i < custIndex; i++) {
    if (queue[i].status === 'Waiting') {
      totalWorkload += queue[i].totalTime || 30;
    }
  }
  const estimate = Math.ceil(totalWorkload / activeCount);
  return Math.max(5, estimate || 15);
};
