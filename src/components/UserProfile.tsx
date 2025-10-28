import { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp, Target, ExternalLink, Github, Globe, Twitter, Edit2, Star, Medal, Crown, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  profileId?: string;
  onNavigate: (view: string) => void;
}

interface ProfileData {
  id: string;
  username: string;
  wallet_address: string;
  avatar_url?: string;
  reputation_score: number;
  total_earned: number;
  level: number;
}

interface Stats {
  total_bounties_created: number;
  total_bounties_participated: number;
  total_bounties_won: number;
  total_rewards_earned: number;
  ranking_score: number;
  achievements_count: number;
  endorsements_count: number;
}

interface Portfolio {
  bio?: string;
  skills: string[];
  expertise_level: string;
  hourly_rate?: number;
  availability: string;
  portfolio_url?: string;
  github_url?: string;
  twitter_url?: string;
  website_url?: string;
  success_rate: number;
}

interface Achievement {
  id: string;
  type: string;
  earned_at: string;
  nft_token_id?: string;
  nft_minted: boolean;
}

export function UserProfile({ profileId, onNavigate }: UserProfileProps) {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const targetId = profileId || userId;
  const isOwnProfile = targetId === userId;

  useEffect(() => {
    loadProfileData();
  }, [targetId]);

  const loadProfileData = async () => {
    if (!targetId) return;

    const [profileRes, statsRes, portfolioRes, achievementsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', targetId).single(),
      supabase.from('user_stats').select('*').eq('profile_id', targetId).single(),
      supabase.from('user_portfolios').select('*').eq('profile_id', targetId).single(),
      supabase.from('achievements').select('*').eq('profile_id', targetId).order('created_at', { ascending: false })
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (statsRes.data) setStats(statsRes.data);
    if (portfolioRes.data) setPortfolio(portfolioRes.data);
    if (achievementsRes.data) setAchievements(achievementsRes.data);

    setLoading(false);
  };

  const getExpertiseColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-blue-400';
      case 'advanced': return 'text-orange-400';
      case 'expert': return 'text-purple-400';
      default: return 'text-neutral-400';
    }
  };

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case 'available': return { color: 'bg-green-500', text: 'Disponible' };
      case 'busy': return { color: 'bg-yellow-500', text: 'Ocupado' };
      case 'unavailable': return { color: 'bg-red-500', text: 'No disponible' };
      default: return { color: 'bg-neutral-500', text: 'Desconocido' };
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'first_bounty': return { icon: '🎯', rarity: 'common' };
      case 'early_adopter': return { icon: '🚀', rarity: 'rare' };
      case 'team_player': return { icon: '🤝', rarity: 'common' };
      case 'big_winner': return { icon: '💎', rarity: 'epic' };
      case 'consistent': return { icon: '⭐', rarity: 'rare' };
      case 'legendary': return { icon: '👑', rarity: 'legendary' };
      case 'community_leader': return { icon: '🌟', rarity: 'epic' };
      case 'sponsor': return { icon: '💰', rarity: 'common' };
      default: return { icon: '🏆', rarity: 'common' };
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'rare': return 'from-blue-500 to-cyan-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'legendary': return 'from-yellow-500 to-orange-500';
      default: return 'from-neutral-500 to-neutral-600';
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-20">
        <div className="max-w-4xl mx-auto px-4 text-center py-20">
          <p className="text-neutral-400">Perfil no encontrado</p>
        </div>
      </div>
    );
  }

  const availabilityBadge = getAvailabilityBadge(portfolio?.availability || 'unavailable');

  return (
    <div className="min-h-screen bg-neutral-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                      {profile.username[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center text-neutral-950 font-bold text-sm">
                      {profile.level}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
                    <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
                      <span className="font-mono">{profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}</span>
                    </div>
                    {portfolio && (
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${availabilityBadge.color} animate-pulse`} />
                        <span className="text-sm text-neutral-300">{availabilityBadge.text}</span>
                        {portfolio.expertise_level && (
                          <>
                            <span className="text-neutral-600">•</span>
                            <span className={`text-sm font-semibold ${getExpertiseColor(portfolio.expertise_level)}`}>
                              {portfolio.expertise_level}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white flex items-center gap-2 transition-all"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                )}
              </div>

              {portfolio?.bio && (
                <p className="text-neutral-300 leading-relaxed mb-6">{portfolio.bio}</p>
              )}

              {portfolio?.skills && portfolio.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {portfolio.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-primary-500/10 text-primary-400 text-sm font-semibold rounded-lg border border-primary-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {portfolio?.github_url && (
                  <a
                    href={portfolio.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-300 hover:text-white transition-all"
                  >
                    <Github size={18} />
                    GitHub
                  </a>
                )}
                {portfolio?.twitter_url && (
                  <a
                    href={portfolio.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-300 hover:text-white transition-all"
                  >
                    <Twitter size={18} />
                    Twitter
                  </a>
                )}
                {portfolio?.website_url && (
                  <a
                    href={portfolio.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-300 hover:text-white transition-all"
                  >
                    <Globe size={18} />
                    Website
                  </a>
                )}
                {portfolio?.portfolio_url && (
                  <a
                    href={portfolio.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-300 hover:text-white transition-all"
                  >
                    <ExternalLink size={18} />
                    Portfolio
                  </a>
                )}
              </div>

              <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary-500/5 rounded-tl-full blur-3xl" />
            </div>

            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                      <Target className="text-primary-400" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.total_bounties_won}</div>
                      <div className="text-xs text-neutral-500">Retos Ganados</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
                      <Trophy className="text-accent-400" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.total_rewards_earned.toFixed(2)}</div>
                      <div className="text-xs text-neutral-500">ETH Ganados</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="text-purple-400" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.ranking_score}</div>
                      <div className="text-xs text-neutral-500">Puntos</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <Star className="text-orange-400" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.endorsements_count}</div>
                      <div className="text-xs text-neutral-500">Endorsements</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {achievements.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Award className="text-accent-400" size={28} />
                  Logros Desbloqueados
                  <span className="px-2 py-1 bg-white/5 text-neutral-400 text-sm font-semibold rounded-lg">
                    {achievements.length}
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {achievements.map((achievement) => {
                    const { icon, rarity } = getAchievementIcon(achievement.type);
                    return (
                      <div
                        key={achievement.id}
                        className="relative group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 text-center transition-all cursor-pointer"
                      >
                        <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${getRarityColor(rarity)} rounded-xl flex items-center justify-center text-3xl transform group-hover:scale-110 transition-transform`}>
                          {icon}
                        </div>
                        <div className="text-sm font-semibold text-white capitalize mb-1">
                          {achievement.type.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </div>
                        {achievement.nft_minted && (
                          <div className="absolute top-2 right-2">
                            <Medal size={16} className="text-accent-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              {portfolio && portfolio.hourly_rate && (
                <div className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
                  <Zap className="text-accent-400 mx-auto mb-2" size={32} />
                  <div className="text-sm text-neutral-400 mb-1">Tarifa por Hora</div>
                  <div className="text-3xl font-bold text-white">${portfolio.hourly_rate}</div>
                </div>
              )}

              {stats && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy size={18} className="text-primary-400" />
                    Estadísticas
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-neutral-400">Retos Creados</span>
                      <span className="text-white font-semibold">{stats.total_bounties_created}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-neutral-400">Participaciones</span>
                      <span className="text-white font-semibold">{stats.total_bounties_participated}</span>
                    </div>
                    {portfolio && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-neutral-400">Tasa de Éxito</span>
                        <span className="text-accent-400 font-semibold">{portfolio.success_rate}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {profile.reputation_score > 0 && (
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
                  <Crown className="text-purple-400 mx-auto mb-2" size={32} />
                  <div className="text-sm text-neutral-400 mb-1">Reputación</div>
                  <div className="text-3xl font-bold text-white">{profile.reputation_score}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
