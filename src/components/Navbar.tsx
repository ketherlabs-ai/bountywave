import { Wallet, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { NotificationsPanel } from './NotificationsPanel';

interface NavbarProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export function Navbar({ onNavigate, currentView }: NavbarProps) {
  const { walletAddress, isConnecting, setShowWalletModal, disconnectWallet } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Inicio' },
    { id: 'explorer', label: 'Explorar' },
    { id: 'create', label: 'Publicar' },
    { id: 'features', label: '✨ Features' },
    { id: 'leaderboard', label: 'Ranking' },
    { id: 'wallet', label: 'Wallet' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-16">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-accent-500 to-purple-500 flex items-center justify-center shadow-glow">
                <Zap className="text-white" size={20} fill="white" />
              </div>
              <span className="text-2xl font-display font-bold text-white tracking-tight group-hover:text-primary-400 transition-colors">
                BOUNTYWAVE
              </span>
            </button>

            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all relative ${
                    currentView === item.id
                      ? 'text-white bg-white/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {walletAddress && <NotificationsPanel />}
            {walletAddress ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></div>
                  <span className="text-sm font-medium text-white">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Desconectar
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                disabled={isConnecting}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet size={18} />
                {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white hover:text-neutral-400 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-neutral-900/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-6 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                  currentView === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-4 border-t border-white/10 mt-4">
              {walletAddress ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></div>
                    <span className="text-sm font-medium text-white">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="w-full px-4 py-3 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white rounded-lg transition-all"
                  >
                    Desconectar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  disabled={isConnecting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 text-sm hover:shadow-glow transition-all"
                >
                  <Wallet size={18} />
                  {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
