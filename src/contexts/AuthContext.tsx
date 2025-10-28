import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  walletAddress: string | null;
  userId: string | null;
  isConnecting: boolean;
  showWalletModal: boolean;
  setShowWalletModal: (show: boolean) => void;
  connectWallet: (walletType?: string) => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedWallet = localStorage.getItem('wallet_address');
    const storedUserId = localStorage.getItem('user_id');

    if (storedWallet && storedUserId) {
      setWalletAddress(storedWallet);
      setUserId(storedUserId);
    }
  }, []);

  const connectWallet = async (walletType: string = 'metamask') => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('No se detectó ninguna wallet. Por favor, instala MetaMask, Rabby u otra wallet compatible.');
      }

      let provider = window.ethereum;

      if (walletType === 'coinbase' && window.ethereum?.providers) {
        provider = window.ethereum.providers.find((p: any) => p.isCoinbaseWallet);
        if (!provider) throw new Error('Coinbase Wallet no está instalada');
      } else if (walletType === 'metamask' && window.ethereum?.providers) {
        provider = window.ethereum.providers.find((p: any) => p.isMetaMask && !p.isBraveWallet);
        if (!provider) provider = window.ethereum;
      }

      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No se pudo obtener la cuenta. Por favor, desbloquea tu wallet.');
      }

      const address = accounts[0];

      const chainId = await provider.request({ method: 'eth_chainId' });
      const scrollChainId = '0x82750';

      if (chainId !== scrollChainId) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: scrollChainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: scrollChainId,
                  chainName: 'Scroll',
                  nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://rpc.scroll.io'],
                  blockExplorerUrls: ['https://scrollscan.com']
                }],
              });
            } catch (addError) {
              throw new Error('No se pudo agregar la red Scroll. Por favor, agrégala manualmente.');
            }
          } else if (switchError.code === 4001) {
            throw new Error('Cambio de red cancelado por el usuario');
          } else {
            throw switchError;
          }
        }
      }

      // Creación de perfil corregida para Supabase v2
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', address)
        .maybeSingle();

      let profileId: string;

      if (existingProfile) {
        profileId = existingProfile.id;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No hay sesión de usuario en Supabase. Debes iniciar sesión antes de crear un perfil.');
        }

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id, // UID Supabase v2
            wallet_address: address,
            username: `User_${address.slice(0, 6)}`,
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw new Error('Error al crear el perfil de usuario');
        }
        profileId = user.id;
      }

      setWalletAddress(address);
      setUserId(profileId);
      localStorage.setItem('wallet_address', address);
      localStorage.setItem('user_id', profileId);
      setError(null);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);

      let errorMessage = 'Error desconocido al conectar wallet';

      if (error.code === 4001) {
        errorMessage = 'Conexión rechazada por el usuario';
      } else if (error.code === -32002) {
        errorMessage = 'Ya hay una solicitud de conexión pendiente. Revisa tu wallet.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setUserId(null);
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('user_id');
  };

  return (
    <AuthContext.Provider value={{ walletAddress, userId, isConnecting, showWalletModal, setShowWalletModal, connectWallet, disconnectWallet, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

