import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, DollarSign, ExternalLink, Award, Star, Crown, Medal } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url?: string;
  total_rewards_earned: number;
  total_bounties_won: number;
  ranking_score: number;
  level: number;
}

interface TransparencyLog {
  id: string;
  action: string;
  amount: number;
  token: string;
  tx_hash: string;
  scrollscan_url: string;
  created_at: string;
  from_username?: string;
  to_username?: string;
  bounty_title?: string;
}

interface HallOfFameProps {
  onNavigate: (view: string) => void;
}

export function HallOfFame({ onNavigate }: HallOfFameProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [transparencyLogs, setTransparencyLogs] = useState<TransparencyLog[]>([]);
  const [totalPaidOut, setTotalPaidOut] = useState(0);
  const [totalBounties, setTotalBounties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'top' | 'recent'>('top');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [leaderboardRes, logsRes, statsRes] = await Promise.all([
      supabase
        .from('user_stats')
        .select(`
          profile_id,
          total_rewards_earned,
          total_bounties_won,
          ranking_score,
          profiles!user_stats_profile_id_fkey (
            id,
            username,
            avatar_url,
            level
          )
        `)
        .gt('total_bounties_won', 0)
        .order('total_rewards_earned', { ascending: false })
        .limit(20),

      supabase
        .from('transparency_logs')
        .select(`
          *,
          bounties (title)
        `)
        .eq('action', 'reward_paid')
        .order('created_at', { ascending: false })
        .limit(50),

      supabase
        .from('bounties')
        .select('id, reward_amount', { count: 'exact' })
        .eq('status', 'completed')
    ]);

    if (leaderboardRes.data) {
      const formattedLeaderboard = leaderboardRes.data.map((entry: any) => ({
        id: entry.profiles.id,
        username: entry.profiles.username,
        avatar_url: entry.profiles.avatar_url,
        total_rewards_earned: entry.total_rewards_earned,
        total_bounties_won: entry.total_bounties_won,
        ranking_score: entry.ranking_score,
        level: entry.profiles.level
      }));
      setLeaderboard(formattedLeaderboard);
    }

    if (logsRes.data) {
      setTransparencyLogs(logsRes.data);
    }

    if (statsRes.data) {
      const total = statsRes.data.reduce((sum, b: any) => sum + parseFloat(b.reward_amount), 0);
      setTotalPaidOut(total);
      setTotalBounties(statsRes.count || 0);
    }

    setLoading(false);
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          icon: <Crown size={24} />,
          color: 'from-yellow-500 to-orange-500',
          text: '1º'
        };
      case 1:
        return {
          icon: <Medal size={24} />,
          color: 'from-gray-400 to-gray-500',
          text: '2º'
        };
      case 2:
        return {
          icon: <Award size={24} />,
          color: 'from-orange-600 to-orange-700',
          text: '3º'
        };
      default:
        return {
          icon: <Star size={20} />,
          color: 'from-neutral-600 to-neutral-700',
          text: `${index + 1}º`
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-20 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/20 rounded-full" />
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-8 bg-gradient-to-b from-accent-400 to-primary-400 rounded-full" />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
              Salón de la Fama
            </h1>
          </div>
          <p className="text-lg text-neutral-400 ml-7">
            Transparencia total: Todos los premios y pagos realizados en la plataforma
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-accent-500/20 to-accent-600/20 backdrop-blur-xl border border-accent-500/30 rounded-3xl p-8 text-center">
            <DollarSign className="text-accent-400 mx-auto mb-3" size={48} />
            <div className="text-sm text-neutral-300 mb-2">Total Pagado</div>
            <div className="text-4xl font-bold text-white">{totalPaidOut.toFixed(2)} ETH</div>
          </div>

          <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 backdrop-blur-xl border border-primary-500/30 rounded-3xl p-8 text-center">
            <Trophy className="text-primary-400 mx-auto mb-3" size={48} />
            <div className="text-sm text-neutral-300 mb-2">Retos Completados</div>
            <div className="text-4xl font-bold text-white">{totalBounties}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 text-center">
            <Users className="text-purple-400 mx-auto mb-3" size={48} />
            <div className="text-sm text-neutral-300 mb-2">Top Ganadores</div>
            <div className="text-4xl font-bold text-white">{leaderboard.length}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setActiveTab('top')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'top'
                ? 'bg-primary-500 text-white'
                : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            Top 20 Ganadores
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'recent'
                ? 'bg-primary-500 text-white'
                : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            Pagos Recientes
          </button>
        </div>

        {activeTab === 'top' && (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => {
              const badge = getRankBadge(index);
              return (
                <div
                  key={entry.id}
                  className={`group relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all cursor-pointer overflow-hidden ${
                    index < 3 ? 'border-2' : ''
                  }`}
                  style={index < 3 ? {
                    borderImage: `linear-gradient(135deg, ${index === 0 ? '#f59e0b, #ea580c' : index === 1 ? '#9ca3af, #6b7280' : '#f97316, #ea580c'}) 1`
                  } : {}}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${badge.color} rounded-2xl flex items-center justify-center text-white font-bold transform group-hover:scale-110 transition-transform`}>
                      {index < 3 ? badge.icon : badge.text}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">{entry.username}</h3>
                        <div className="px-3 py-1 bg-accent-500/20 text-accent-400 text-sm font-bold rounded-lg">
                          Nivel {entry.level}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-neutral-400">
                        <span className="flex items-center gap-2">
                          <Trophy size={16} className="text-accent-400" />
                          {entry.total_bounties_won} retos ganados
                        </span>
                        <span className="flex items-center gap-2">
                          <TrendingUp size={16} className="text-primary-400" />
                          {entry.ranking_score} puntos
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-accent-400">
                        {entry.total_rewards_earned.toFixed(4)}
                      </div>
                      <div className="text-sm text-neutral-500 font-semibold">ETH</div>
                    </div>
                  </div>

                  {index < 3 && (
                    <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${badge.color} opacity-10 rounded-tl-full blur-3xl`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="space-y-3">
            {transparencyLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <DollarSign className="text-green-400" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Pago de Recompensa
                        </h3>
                        <p className="text-sm text-neutral-400">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {log.tx_hash && (
                      <div className="ml-13 flex items-center gap-2">
                        <a
                          href={`https://scrollscan.com/tx/${log.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          Ver en Scrollscan
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      +{log.amount.toFixed(4)}
                    </div>
                    <div className="text-sm text-neutral-500 font-semibold">
                      {log.token}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
