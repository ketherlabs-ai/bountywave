import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { Navbar } from './components/Navbar';
import { Landing } from './components/Landing';
import { Explorer } from './components/Explorer';
import { CreateBounty } from './components/CreateBounty';
import { BountyDetail } from './components/BountyDetail';
import { Wallet } from './components/Wallet';
import { Leaderboard } from './components/Leaderboard';
import { WalletConnectModal } from './components/WalletConnectModal';
import { NotificationPermissionBanner } from './components/NotificationsPanel';
import { UserProfile } from './components/UserProfile';
import { HallOfFame } from './components/HallOfFame';
import SupabaseLogin from './components/SupabaseLogin';
import { supabase } from './lib/supabase';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [viewData, setViewData] = useState<any>(null);
  const { showWalletModal, setShowWalletModal, connectWallet } = useAuth();

  // --- VERIFICAR SESIÓN SUPABASE ---
  const [isReady, setIsReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
      setIsReady(true);
    });
  }, []);

  if (!isReady) return <div>Cargando...</div>;

  const handleNavigate = (view: string, data?: any) => {
    setCurrentView(view);
    setViewData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Landing onNavigate={handleNavigate} />;
      case 'explorer':
        return <Explorer onNavigate={handleNavigate} />;
      case 'create':
        return <CreateBounty onNavigate={handleNavigate} />;
      case 'bounty':
        return <BountyDetail bountyId={viewData?.bountyId} onNavigate={handleNavigate} />;
      case 'wallet':
        return <Wallet onNavigate={handleNavigate} />;
      case 'leaderboard':
        return <Leaderboard onNavigate={handleNavigate} />;
      case 'profile':
        return <UserProfile profileId={viewData?.profileId} onNavigate={handleNavigate} />;
      case 'hall-of-fame':
        return <HallOfFame onNavigate={handleNavigate} />;
      default:
        return <Landing onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-neutral-950">
        <Navbar onNavigate={handleNavigate} currentView={currentView} />
        {renderView()}
      </div>

      {/* Aquí agregas el panel flotante de login si NO hay sesión */}
      {!hasSession && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 360,
            height: '100vh',
            background: 'rgba(32,32,32,0.95)',
            padding: '32px 24px',
            zIndex: 1000,
            boxShadow: '0 0 32px #222'
          }}
        >
          <SupabaseLogin />
        </div>
      )}

      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={connectWallet}
      />
      <NotificationPermissionBanner />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <AppContent />
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
