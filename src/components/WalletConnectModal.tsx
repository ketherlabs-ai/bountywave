import { useState } from 'react';
import { X, Wallet, AlertCircle, Shield, CheckCircle } from 'lucide-react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: string) => Promise<void>;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  popular?: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'La wallet más popular para Ethereum y L2s',
    popular: true,
  },
  {
    id: 'scroll',
    name: 'Scroll Wallet',
    icon: '📜',
    description: 'Wallet nativa optimizada para Scroll L2',
    popular: true,
  },
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    icon: '🐰',
    description: 'Multi-chain con mejor UX y seguridad',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Conecta cualquier wallet móvil vía QR',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '💙',
    description: 'Wallet segura con soporte fiat',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Wallet móvil con exchange integrado',
  },
];

export function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async (walletId: string) => {
    setConnecting(true);
    setSelectedWallet(walletId);
    setError(null);

    try {
      await onConnect(walletId);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar la wallet. Verifica que esté instalada y desbloqueada.'
      );
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl shadow-glow overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
        >
          <X size={20} className="text-neutral-400" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary-500/20 rounded-xl">
              <Wallet size={28} className="text-primary-400" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white">
              Conectar Wallet
            </h2>
          </div>

          <p className="text-neutral-400 mb-6">
            Elige tu wallet preferida para acceder a BOUNTYWAVE
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-400 mb-1">Error de conexión</div>
                <div className="text-sm text-red-300">{error}</div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={connecting}
                className={`relative p-4 rounded-xl border transition-all text-left ${
                  connecting && selectedWallet === wallet.id
                    ? 'bg-primary-500/20 border-primary-500 scale-95'
                    : connecting
                    ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary-500/50 hover:scale-105'
                }`}
              >
                {wallet.popular && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-accent-400 text-neutral-900 text-xs font-bold rounded-full">
                    POPULAR
                  </div>
                )}

                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">{wallet.icon}</div>
                  <div className="font-bold text-white">{wallet.name}</div>
                </div>

                <div className="text-sm text-neutral-400">{wallet.description}</div>

                {connecting && selectedWallet === wallet.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm rounded-xl">
                    <div className="flex items-center gap-2 text-primary-400">
                      <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold">Conectando...</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-accent-400" />
              <span className="font-semibold text-white">
                ¿Por qué necesito una wallet?
              </span>
            </div>
            <div className={`transform transition-transform ${showInfo ? 'rotate-180' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"/>
              </svg>
            </div>
          </button>

          {showInfo && (
            <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-accent-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white mb-1">Control total de tus fondos</div>
                  <div className="text-sm text-neutral-400">
                    Solo tú tienes acceso a tu wallet. Nadie más puede mover tus fondos.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-accent-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white mb-1">Pagos sin intermediarios</div>
                  <div className="text-sm text-neutral-400">
                    Recibe recompensas directo a tu wallet, sin bancos ni plataformas de pago.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-accent-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white mb-1">Identidad descentralizada</div>
                  <div className="text-sm text-neutral-400">
                    Tu wallet es tu identidad Web3. No necesitas crear cuentas ni contraseñas.
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                <div className="text-sm text-neutral-300">
                  <strong className="text-white">Nota de seguridad:</strong> Nunca compartas tu frase de recuperación (seed phrase) con nadie. BOUNTYWAVE nunca te la pedirá.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
