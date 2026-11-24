import { useState, useEffect } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { JoinQueueScreen } from './screens/JoinQueueScreen';
import { MyStatusScreen } from './screens/MyStatusScreen';
import { ReceptionScreen } from './screens/ReceptionScreen';
import { BarberViewScreen } from './screens/BarberViewScreen';
import { TVDisplayScreen } from './screens/TVDisplayScreen';
import { OwnerSettingsScreen } from './screens/OwnerSettingsScreen';

export type Screen =
  | 'home'
  | 'join'
  | 'status'
  | 'reception'
  | 'barber'
  | 'tv'
  | 'settings';

function getInitialScreen(): Screen {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  const valid: Screen[] = [
    'home',
    'join',
    'status',
    'reception',
    'barber',
    'tv',
    'settings',
  ];
  if (valid.includes(hash as Screen)) {
    return hash as Screen;
  }
  return 'home';
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen);

  // Sync hash changes
  useEffect(() => {
    const handleHash = () => {
      setCurrentScreen(getInitialScreen());
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    if (screen === 'home') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.location.hash = screen;
    }
  };

  if (currentScreen === 'join') {
    return <JoinQueueScreen onHome={() => navigateTo('home')} />;
  }

  if (currentScreen === 'status') {
    return <MyStatusScreen onHome={() => navigateTo('home')} />;
  }

  if (currentScreen === 'reception') {
    return <ReceptionScreen onHome={() => navigateTo('home')} />;
  }

  if (currentScreen === 'barber') {
    return <BarberViewScreen onHome={() => navigateTo('home')} />;
  }

  if (currentScreen === 'tv') {
    return <TVDisplayScreen onHome={() => navigateTo('home')} />;
  }

  if (currentScreen === 'settings') {
    return <OwnerSettingsScreen onHome={() => navigateTo('home')} />;
  }

  return (
    <HomeScreen
      onJoinQueue={() => navigateTo('join')}
      onCheckStatus={() => navigateTo('status')}
      onReception={() => navigateTo('reception')}
      onBarber={() => navigateTo('barber')}
      onTV={() => navigateTo('tv')}
      onSettings={() => navigateTo('settings')}
    />
  );
}

export default App;
