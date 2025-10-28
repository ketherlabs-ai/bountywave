import { useState } from 'react';
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
import FeaturesShowcase from './components/FeaturesShowcase';
import { EliteChallenge } from './components/EliteChallenge';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [viewData, setViewData] = useState<any>(null);
  const { showWalletModal, setShowWalletModal, connectWallet } = useAuth();

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
      case 'features':
        return <FeaturesShowcase />;
      case 'elite-challenge':
        return <EliteChallenge onNavigate={handleNavigate} challengeId={viewData?.challengeId} />;
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
