import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Trophy, TrendingUp, Award, History } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WalletProps {
  onNavigate: (view: string) => void;
}

interface ProfileData {
  reputation_score: number;
  total_earned: number;
}

interface Achievement {
  id: string;
  type: string;
  created_at: string;
  bounty_title: string;
}

interface Transaction {
  id: string;
  amount: number;
  token: string;
  status: string;
  created_at: string;
  bounty_title: string;
}

export function Wallet({ onNavigate }: WalletProps) {
  const { userId, walletAddress, connectWallet } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadWalletData();
    }
  }, [userId]);

  const loadWalletData = async () => {
    setLoading(true);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('reputation_score, total_earned')
      .eq('id', userId)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
    }

    const { data: achievementsData } = await supabase
      .from('achievements')
      .select(`
        id,
        type,
        created_at,
        bounties (title)
      `)
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (achievementsData) {
      setAchievements(
        achievementsData.map((a: any) => ({
          id: a.id,
          type: a.type,
          created_at: a.created_at,
          bounty_title: a.bounties?.title || 'Reto',
        }))
      );
    }

    const { data: transactionsData } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        token,
        status,
        created_at,
        bounties (title)
      `)
      .or(`from_profile_id.eq.${userId},to_profile_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsData) {
      setTransactions(
        transactionsData.map((t: any) => ({
          id: t.id,
          amount: t.amount,
          token: t.token,
          status: t.status,
          created_at: t.created_at,
          bounty_title: t.bounties?.title || 'Transacción',
        }))
      );
    }

    setLoading(false);
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-glow p-12 text-center">
            <WalletIcon className="mx-auto mb-6 text-primary-400" size={64} />
            <h2 className="text-4xl font-display font-bold text-white mb-4">Wallet no conectada</h2>
            <p className="text-neutral-400 mb-8 text-lg">
              Conecta tu wallet para ver tu balance, logros y historial de recompensas
            </p>
            <button
              onClick={connectWallet}
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-bold text-lg hover:shadow-glow transition-all"
            >
              Conectar Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-28 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const achievementIcons: Record<string, string> = {
    winner: '🏆',
    contributor: '💡',
    voter: '🗳️',
    sponsor: '💎',
  };

  const achievementLabels: Record<string, string> = {
    winner: 'Ganador',
    contributor: 'Contribuidor',
    voter: 'Votante',
    sponsor: 'Patrocinador',
  };

  return (
    <div className="min-h-screen bg-neutral-950 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-5xl font-display font-bold text-white mb-3">Mi Wallet</h1>
          <p className="text-xl text-neutral-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-accent-400 animate-pulse"></span>
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl p-6 text-white shadow-glow border border-primary-400/20">
            <div className="flex items-center gap-3 mb-4">
              <WalletIcon size={28} />
              <span className="text-lg font-semibold">Balance Total</span>
            </div>
            <div className="text-4xl font-bold mb-1">{profile?.total_earned || 0}</div>
            <div className="text-sm opacity-90">USDC ganados</div>
          </div>

          <div className="bg-gradient-to-br from-accent-500 to-accent-400 rounded-2xl p-6 text-neutral-950 shadow-glow-accent border border-accent-300/20">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={28} />
              <span className="text-lg font-semibold">Reputación</span>
            </div>
            <div className="text-4xl font-bold mb-1">{profile?.reputation_score || 0}</div>
            <div className="text-sm opacity-75">Puntos acumulados</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-glow border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Award size={28} className="text-primary-400" />
              <span className="text-lg font-semibold text-gray-900">Logros</span>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{achievements.length}</div>
            <div className="text-sm text-neutral-400">Insignias obtenidas</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-glow p-6">
            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="text-accent-400" size={28} />
              Mis Logros
            </h2>

            {achievements.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                <Award className="mx-auto mb-4 text-neutral-600" size={48} />
                <p>Aún no tienes logros</p>
                <p className="text-sm mt-2">Participa en retos para ganar insignias</p>
              </div>
            ) : (
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl border border-white/10"
                  >
                    <div className="text-4xl">{achievementIcons[achievement.type]}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {achievementLabels[achievement.type]}
                      </div>
                      <div className="text-sm text-neutral-400">{achievement.bounty_title}</div>
                    </div>
                    <div className="text-xs text-neutral-500">
                      {new Date(achievement.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-glow p-6">
            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
              <History className="text-primary-400" size={28} />
              Historial de Transacciones
            </h2>

            {transactions.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                <History className="mx-auto mb-4 text-neutral-600" size={48} />
                <p>No hay transacciones aún</p>
                <p className="text-sm mt-2">Gana retos para recibir recompensas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-white/10 rounded-xl hover:border-primary-500 hover:bg-white/5 transition-all"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-white">{transaction.bounty_title}</div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-accent-400">
                        +{transaction.amount} {transaction.token}
                      </div>
                      <div
                        className={`text-xs ${
                          transaction.status === 'completed'
                            ? 'text-green-600'
                            : transaction.status === 'pending'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.status === 'completed'
                          ? 'Completado'
                          : transaction.status === 'pending'
                          ? 'Pendiente'
                          : 'Fallido'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-br from-primary-900 to-primary-950 border border-primary-500/20 rounded-2xl p-8 text-white shadow-glow">
          <h3 className="text-2xl font-display font-bold mb-4">Cómo ganar más recompensas</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold mb-2">Participa en retos</h4>
              <p className="text-sm text-neutral-300">
                Envía soluciones innovadoras y gana recompensas en cripto
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🗳️</div>
              <h4 className="font-semibold mb-2">Vota propuestas</h4>
              <p className="text-sm text-neutral-300">
                Ayuda a seleccionar las mejores soluciones y gana reputación
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🚀</div>
              <h4 className="font-semibold mb-2">Crea retos</h4>
              <p className="text-sm text-neutral-300">
                Publica desafíos y conecta con talento global
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
