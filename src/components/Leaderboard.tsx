import { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Award, Star, Flame, Zap, Target, DollarSign, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  id: string;
  username: string;
  wallet_address: string;
  avatar_url?: string;
  total_bounties_won: number;
  total_bounties_participated: number;
  total_rewards_earned: number;
  ranking_score: number;
  endorsements_count: number;
  achievements_count: number;
  level: number;
  reputation_score: number;
  badges: string[];
  position_change?: number;
  recent_wins?: number;
}

interface LeaderboardProps {
  onNavigate: (view: string, data?: any) => void;
}

export function Leaderboard({ onNavigate }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'global' | 'month' | 'week'>('global');
  const [sortBy, setSortBy] = useState<'rewards' | 'wins' | 'reputation'>('rewards');

  useEffect(() => {
    loadLeaderboard();
  }, [period, sortBy]);

  const loadLeaderboard = async () => {
    setLoading(true);

    const mockData: LeaderboardEntry[] = [
      {
        id: '1', username: 'CryptoMaster', wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        total_bounties_won: 87, total_bounties_participated: 120, total_rewards_earned: 45.5,
        ranking_score: 2850, endorsements_count: 42, achievements_count: 15, level: 15,
        reputation_score: 98, badges: ['Top Solver', 'Diamond', 'DAO Member'], position_change: 2, recent_wins: 3
      },
      {
        id: '2', username: 'Web3Wizard', wallet_address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
        total_bounties_won: 72, total_bounties_participated: 95, total_rewards_earned: 38.2,
        ranking_score: 2420, endorsements_count: 38, achievements_count: 12, level: 12,
        reputation_score: 95, badges: ['Top Solver', 'Diamond', 'Speedster'], position_change: 0, recent_wins: 2
      },
      {
        id: '3', username: 'SolverPro', wallet_address: '0x1234567890123456789012345678901234567890',
        total_bounties_won: 58, total_bounties_participated: 78, total_rewards_earned: 28.7,
        ranking_score: 1980, endorsements_count: 31, achievements_count: 10, level: 10,
        reputation_score: 92, badges: ['Diamond', 'Comunidad MVP'], position_change: -1, recent_wins: 1
      },
      {
        id: '4', username: 'BlockchainDev', wallet_address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
        total_bounties_won: 45, total_bounties_participated: 63, total_rewards_earned: 22.3,
        ranking_score: 1650, endorsements_count: 28, achievements_count: 8, level: 9,
        reputation_score: 89, badges: ['Speedster', 'DAO Member'], position_change: 1, recent_wins: 2
      },
      {
        id: '5', username: 'CodeNinja', wallet_address: '0x9876543210987654321098765432109876543210',
        total_bounties_won: 39, total_bounties_participated: 55, total_rewards_earned: 18.9,
        ranking_score: 1420, endorsements_count: 26, achievements_count: 7, level: 8,
        reputation_score: 85, badges: ['Comunidad MVP', 'DAO Member'], position_change: 3, recent_wins: 2
      },
      {
        id: '6', username: 'DeFiBuilder', wallet_address: '0x1111111111111111111111111111111111111111',
        total_bounties_won: 32, total_bounties_participated: 48, total_rewards_earned: 15.4,
        ranking_score: 1180, endorsements_count: 22, achievements_count: 6, level: 7,
        reputation_score: 78, badges: ['Speedster'], position_change: -2, recent_wins: 1
      },
      {
        id: '7', username: 'SmartContract', wallet_address: '0x2222222222222222222222222222222222222222',
        total_bounties_won: 28, total_bounties_participated: 42, total_rewards_earned: 13.8,
        ranking_score: 1050, endorsements_count: 19, achievements_count: 5, level: 7,
        reputation_score: 76, badges: ['DAO Member'], position_change: 0, recent_wins: 0
      },
      {
        id: '8', username: 'Web3Designer', wallet_address: '0x3333333333333333333333333333333333333333',
        total_bounties_won: 24, total_bounties_participated: 38, total_rewards_earned: 11.2,
        ranking_score: 920, endorsements_count: 17, achievements_count: 4, level: 6,
        reputation_score: 72, badges: [], position_change: 1, recent_wins: 1
      },
      {
        id: '9', username: 'DAOMember', wallet_address: '0x4444444444444444444444444444444444444444',
        total_bounties_won: 21, total_bounties_participated: 35, total_rewards_earned: 9.8,
        ranking_score: 810, endorsements_count: 15, achievements_count: 5, level: 6,
        reputation_score: 70, badges: ['DAO Member'], position_change: -1, recent_wins: 0
      },
      {
        id: '10', username: 'QuickSolver', wallet_address: '0x5555555555555555555555555555555555555555',
        total_bounties_won: 18, total_bounties_participated: 29, total_rewards_earned: 8.3,
        ranking_score: 720, endorsements_count: 13, achievements_count: 3, level: 5,
        reputation_score: 65, badges: ['Speedster'], position_change: 2, recent_wins: 3
      },
      {
        id: '11', username: 'ScrollExpert', wallet_address: '0x6666666666666666666666666666666666666666',
        total_bounties_won: 16, total_bounties_participated: 26, total_rewards_earned: 7.5,
        ranking_score: 650, endorsements_count: 12, achievements_count: 3, level: 5,
        reputation_score: 63, badges: [], position_change: 0, recent_wins: 1
      },
      {
        id: '12', username: 'FrontendWizard', wallet_address: '0x7777777777777777777777777777777777777777',
        total_bounties_won: 14, total_bounties_participated: 23, total_rewards_earned: 6.2,
        ranking_score: 580, endorsements_count: 10, achievements_count: 2, level: 4,
        reputation_score: 58, badges: [], position_change: 1, recent_wins: 1
      },
      {
        id: '13', username: 'BackendPro', wallet_address: '0x8888888888888888888888888888888888888888',
        total_bounties_won: 12, total_bounties_participated: 20, total_rewards_earned: 5.7,
        ranking_score: 520, endorsements_count: 9, achievements_count: 2, level: 4,
        reputation_score: 55, badges: [], position_change: -1, recent_wins: 0
      },
      {
        id: '14', username: 'FullStackDev', wallet_address: '0x9999999999999999999999999999999999999999',
        total_bounties_won: 10, total_bounties_participated: 18, total_rewards_earned: 4.9,
        ranking_score: 460, endorsements_count: 8, achievements_count: 2, level: 3,
        reputation_score: 52, badges: [], position_change: 0, recent_wins: 1
      },
      {
        id: '15', username: 'NFTCreator', wallet_address: '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        total_bounties_won: 9, total_bounties_participated: 16, total_rewards_earned: 4.1,
        ranking_score: 410, endorsements_count: 7, achievements_count: 1, level: 3,
        reputation_score: 48, badges: [], position_change: 1, recent_wins: 2
      }
    ];

    let filteredData = [...mockData];

    if (period === 'month') {
      filteredData = mockData.map(e => ({ ...e, total_rewards_earned: e.total_rewards_earned * 0.4 }));
    } else if (period === 'week') {
      filteredData = mockData.map(e => ({ ...e, total_rewards_earned: e.total_rewards_earned * 0.15 }));
    }

    if (sortBy === 'wins') {
      filteredData.sort((a, b) => b.total_bounties_won - a.total_bounties_won);
    } else if (sortBy === 'reputation') {
      filteredData.sort((a, b) => b.ranking_score - a.ranking_score);
    }

    setLeaderboard(filteredData);
    setLoading(false);
  };

  const getBadges = (entry: any) => {
    const badges = [];
    if (entry.total_bounties_won >= 50) badges.push('Top Solver');
    if (entry.total_rewards_earned >= 10) badges.push('Diamond');
    if (entry.endorsements_count >= 25) badges.push('Comunidad MVP');
    if (entry.total_bounties_won >= 10 && entry.total_bounties_participated > 0) {
      const winRate = (entry.total_bounties_won / entry.total_bounties_participated) * 100;
      if (winRate >= 70) badges.push('Speedster');
    }
    if (entry.achievements_count >= 5) badges.push('DAO Member');
    return badges;
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          icon: <Crown size={32} />,
          gradient: 'from-yellow-400 via-yellow-500 to-orange-500',
          glow: 'shadow-yellow-500/50',
          border: 'border-yellow-500/50',
          label: '1º'
        };
      case 1:
        return {
          icon: <Medal size={28} />,
          gradient: 'from-gray-300 via-gray-400 to-gray-500',
          glow: 'shadow-gray-400/50',
          border: 'border-gray-400/50',
          label: '2º'
        };
      case 2:
        return {
          icon: <Award size={28} />,
          gradient: 'from-orange-500 via-orange-600 to-orange-700',
          glow: 'shadow-orange-500/50',
          border: 'border-orange-500/50',
          label: '3º'
        };
      default:
        return {
          icon: <Star size={20} />,
          gradient: 'from-neutral-700 to-neutral-800',
          glow: '',
          border: 'border-white/10',
          label: `${index + 1}º`
        };
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Top Solver': return 'from-purple-500 to-pink-500';
      case 'Diamond': return 'from-cyan-400 to-blue-500';
      case 'Comunidad MVP': return 'from-green-400 to-emerald-500';
      case 'Speedster': return 'from-orange-400 to-red-500';
      case 'DAO Member': return 'from-blue-500 to-purple-600';
      default: return 'from-neutral-600 to-neutral-700';
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Top Solver': return '🏆';
      case 'Diamond': return '💎';
      case 'Comunidad MVP': return '⭐';
      case 'Speedster': return '⚡';
      case 'DAO Member': return '🎯';
      default: return '🏅';
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
            <div className="w-1 h-12 bg-gradient-to-b from-accent-400 to-primary-400 rounded-full" />
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight">
              Ranking Global
            </h1>
          </div>
          <p className="text-xl text-neutral-400 ml-7">
            Los mejores solucionadores y creadores de la plataforma
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-accent-500/20 to-accent-600/20 backdrop-blur-xl border border-accent-500/30 rounded-3xl p-8 text-center">
            <Trophy className="text-accent-400 mx-auto mb-3" size={48} />
            <div className="text-sm text-neutral-300 mb-2">Total Ganadores</div>
            <div className="text-4xl font-bold text-white">{leaderboard.length}</div>
          </div>

          <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 backdrop-blur-xl border border-primary-500/30 rounded-3xl p-8 text-center">
            <DollarSign className="text-primary-400 mx-auto mb-3" size={48} />
            <div className="text-sm text-neutral-300 mb-2">Premios Totales</div>
            <div className="text-4xl font-bold text-white">
              {leaderboard.reduce((sum, e) => sum + e.total_rewards_earned, 0).toFixed(1)}
            </div>
            <div className="text-xs text-neutral-500 font-semibold">ETH</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 text-center">
            <Target className="text-purple-400 mx-auto mb-3" size={48} />
            <div className="text-sm text-neutral-300 mb-2">Retos Resueltos</div>
            <div className="text-4xl font-bold text-white">
              {leaderboard.reduce((sum, e) => sum + e.total_bounties_won, 0)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl border border-orange-500/30 rounded-3xl p-8 text-center">
            <Flame className="text-orange-400 mx-auto mb-3" size={48} />
            <div className="text-sm text-neutral-300 mb-2">Más Activo</div>
            <div className="text-2xl font-bold text-white truncate">
              {leaderboard[0]?.username || 'N/A'}
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setPeriod('global')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  period === 'global'
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Global
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  period === 'month'
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Este Mes
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  period === 'week'
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Esta Semana
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-neutral-500" size={18} />
              <button
                onClick={() => setSortBy('rewards')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  sortBy === 'rewards'
                    ? 'bg-accent-500 text-neutral-950'
                    : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                💰 Premios
              </button>
              <button
                onClick={() => setSortBy('wins')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  sortBy === 'wins'
                    ? 'bg-accent-500 text-neutral-950'
                    : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                🏆 Victorias
              </button>
              <button
                onClick={() => setSortBy('reputation')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  sortBy === 'reputation'
                    ? 'bg-accent-500 text-neutral-950'
                    : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                ⭐ Reputación
              </button>
            </div>
          </div>
        </div>

        {leaderboard.slice(0, 3).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Crown className="text-yellow-400" size={28} />
              Hall of Fame
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {leaderboard.slice(0, 3).map((entry, index) => {
                const badge = getRankBadge(index);
                return (
                  <div
                    key={entry.id}
                    onClick={() => onNavigate('profile', { profileId: entry.id })}
                    className={`group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 ${badge.border} rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:scale-105 ${badge.glow} hover:shadow-2xl overflow-hidden`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />

                    <div className="relative z-10">
                      <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${badge.gradient} rounded-2xl flex items-center justify-center text-white transform group-hover:scale-110 transition-transform`}>
                        {badge.icon}
                      </div>

                      <div className="text-center mb-4">
                        <div className={`inline-block px-3 py-1 bg-gradient-to-r ${badge.gradient} rounded-lg text-white font-bold text-sm mb-2`}>
                          {badge.label} Lugar
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{entry.username}</h3>
                        <p className="text-xs text-neutral-500 font-mono">
                          {entry.wallet_address.slice(0, 6)}...{entry.wallet_address.slice(-4)}
                        </p>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-400">Premios</span>
                          <span className="text-accent-400 font-bold">{entry.total_rewards_earned.toFixed(2)} ETH</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-400">Victorias</span>
                          <span className="text-white font-bold">{entry.total_bounties_won}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-400">Nivel</span>
                          <span className="text-primary-400 font-bold">{entry.level}</span>
                        </div>
                      </div>

                      {entry.badges.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {entry.badges.slice(0, 2).map((badgeName, i) => (
                            <span
                              key={i}
                              className={`px-2 py-1 bg-gradient-to-r ${getBadgeColor(badgeName)} rounded-lg text-white text-xs font-bold flex items-center gap-1`}
                            >
                              {getBadgeIcon(badgeName)}
                              {badgeName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {leaderboard.slice(3).map((entry, index) => {
            const actualIndex = index + 3;
            const badge = getRankBadge(actualIndex);
            return (
              <div
                key={entry.id}
                onClick={() => onNavigate('profile', { profileId: entry.id })}
                className="group bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-primary-500/50 rounded-2xl p-5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${badge.gradient} rounded-xl flex items-center justify-center text-white font-bold shrink-0`}>
                    {actualIndex < 10 ? badge.icon : actualIndex + 1}
                  </div>

                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {entry.username[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-white truncate">{entry.username}</h3>
                      <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs font-bold rounded-lg">
                        Nivel {entry.level}
                      </span>
                      {entry.position_change !== undefined && entry.position_change !== 0 && (
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                          entry.position_change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {entry.position_change > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          {Math.abs(entry.position_change)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-400 mb-2">
                      <span className="font-mono">
                        {entry.wallet_address.slice(0, 8)}...{entry.wallet_address.slice(-6)}
                      </span>
                      {entry.recent_wins! > 0 && (
                        <span className="flex items-center gap-1 text-accent-400">
                          <Zap size={14} />
                          {entry.recent_wins} victorias recientes
                        </span>
                      )}
                    </div>
                    {entry.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {entry.badges.map((badgeName, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 bg-gradient-to-r ${getBadgeColor(badgeName)} rounded text-white text-xs font-semibold flex items-center gap-1`}
                          >
                            <span>{getBadgeIcon(badgeName)}</span>
                            {badgeName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-center shrink-0">
                    <div>
                      <div className="text-2xl font-bold text-accent-400">{entry.total_rewards_earned.toFixed(2)}</div>
                      <div className="text-xs text-neutral-500">ETH</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{entry.total_bounties_won}</div>
                      <div className="text-xs text-neutral-500">Victorias</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-400">{entry.ranking_score}</div>
                      <div className="text-xs text-neutral-500">Puntos</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
