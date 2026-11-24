export type Language = 'en' | 'gu';

export interface ServiceItem {
  id: string;
  name: string;
  nameGu: string;
  duration: number; // in minutes
  price: number;
  priceGu: string;
  description: string;
  descriptionGu: string;
}

export interface BarberItem {
  id: string;
  name: string;
  nameGu: string;
  station: string;
  stationGu: string;
  specialty: string;
  specialtyGu: string;
  queueDepth: number;
  estWaitMinutes: number;
  avatarUrl: string;
  isOnBreak?: boolean;
  isActive?: boolean;
}

export interface TranslationDictionary {
  brand: {
    name: string;
    subname: string;
    editorialBadge: string;
    developerTag: string;
  };
  header: {
    statusOpen: string;
    statusClosed: string;
    queueActive: string;
    langButton: string;
    hoursPill: string;
    backToHome: string;
  };
  hero: {
    volume: string;
    headlineMain: string;
    headlineItalic: string;
    headlineSub: string;
    manifesto: string;
    liveWaitPill: string;
  };
  metrics: {
    peopleWaiting: string;
    peopleWaitingUnit: string;
    activeBarbers: string;
    activeBarbersUnit: string;
    estWaitTime: string;
    estWaitTimeUnit: string;
  };
  actions: {
    joinQueueButton: string;
    joinQueueSub: string;
    checkStatusButton: string;
    checkStatusPlaceholder: string;
    checkStatusHelper: string;
  };
  modal: {
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    submitButton: string;
    closeButton: string;
    sampleHint: string;
    demoNote: string;
  };
  hours: {
    title: string;
    editionTag: string;
    weekdays: string;
    weekdaysTime: string;
    weekends: string;
    weekendsTime: string;
    ruleNotice: string;
    ruleDetail: string;
  };
  editorialGallery: {
    tag: string;
    title: string;
    desc: string;
    caption1: string;
    caption2: string;
  };
  staffHub: {
    title: string;
    subtitle: string;
    tvDisplay: string;
    tvDisplayDesc: string;
    barberStation: string;
    barberStationDesc: string;
    reception: string;
    receptionDesc: string;
    settings: string;
    settingsDesc: string;
  };
  footer: {
    codeNote: string;
    copyright: string;
    botanicalNote: string;
  };
  joinQueue: {
    pageTitle: string;
    pageSubtitle: string;
    stepDetails: string;
    stepServices: string;
    stepBarber: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    phoneHint: string;
    servicesTitle: string;
    servicesSubtitle: string;
    maxServicesWarning: string;
    barberTitle: string;
    barberSubtitle: string;
    anyBarber: string;
    anyBarberSubtitle: string;
    specificBarber: string;
    summaryTitle: string;
    totalTime: string;
    totalPrice: string;
    chosenBarber: string;
    selectedServicesCount: string;
    termsNotice: string;
    submitButton: string;
    submitting: string;
    validationErrors: {
      nameRequired: string;
      phoneInvalid: string;
      serviceRequired: string;
    };
    success: {
      title: string;
      issuedToken: string;
      badge: string;
      greeting: string;
      details: string;
      estWait: string;
      position: string;
      backHomeBtn: string;
    };
  };
}
