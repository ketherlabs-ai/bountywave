import { ArrowRight, Trophy, Users, Zap, Check, Globe, Sparkles, Code, Wallet, Shield, TrendingUp, Star, DollarSign, MapPin, CheckCircle, Play, ExternalLink, Clock, Flame, Award, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface LandingProps {
  onNavigate: (view: string) => void;
}

interface Stats {
  activeBounties: number;
  totalRewards: number;
  totalSubmissions: number;
}

interface LiveActivity {
  id: string;
  type: 'bounty_solved' | 'new_bounty' | 'user_joined';
  user: string;
  amount?: number;
  title?: string;
  country?: string;
}

export function Landing({ onNavigate }: LandingProps) {
  const [stats, setStats] = useState<Stats>({ activeBounties: 0, totalRewards: 0, totalSubmissions: 0 });
  const [animatedStats, setAnimatedStats] = useState({ rewards: 0, bounties: 0, countries: 0 });
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [userLevel, setUserLevel] = useState({ level: 5, xp: 2450, nextLevelXp: 3000, streak: 7 });

  useEffect(() => {
    loadStats();
    generateLiveActivities();

    const activityInterval = setInterval(() => {
      setCurrentActivityIndex(prev => (prev + 1) % 5);
    }, 4000);

    const countdownInterval = setInterval(() => {
      setTimeRemaining(prev => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => {
      clearInterval(activityInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        rewards: Math.floor(234000 * progress),
        bounties: Math.floor(280 * progress),
        countries: Math.floor(47 * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const loadStats = async () => {
    const { data: bounties } = await supabase.from('bounties').select('reward_amount, status').eq('status', 'active');
    const { count: submissions } = await supabase.from('submissions').select('*', { count: 'exact', head: true });

    const totalRewards = bounties?.reduce((sum, b) => sum + parseFloat(b.reward_amount || '0'), 0) || 0;

    setStats({
      activeBounties: bounties?.length || 7,
      totalRewards: Math.round(totalRewards),
      totalSubmissions: submissions || 150,
    });
  };

  const generateLiveActivities = () => {
    const activities: LiveActivity[] = [
      { id: '1', type: 'bounty_solved', user: 'Juan Pérez', amount: 150, country: 'México' },
      { id: '2', type: 'new_bounty', user: 'OpenAI', title: 'Desarrollar plugin ChatGPT', amount: 500 },
      { id: '3', type: 'bounty_solved', user: 'Maria Silva', amount: 220, country: 'Brasil' },
      { id: '4', type: 'user_joined', user: 'Alex Chen', country: 'Singapur' },
      { id: '5', type: 'new_bounty', user: 'Uniswap', title: 'Auditoría Smart Contract', amount: 800 }
    ];
    setLiveActivities(activities);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bounty_solved': return '🎯';
      case 'new_bounty': return '🔥';
      case 'user_joined': return '👋';
      default: return '⚡';
    }
  };

  const getActivityText = (activity: LiveActivity) => {
    switch (activity.type) {
      case 'bounty_solved':
        return `${activity.user} resolvió un bounty y ganó $${activity.amount} USDC`;
      case 'new_bounty':
        return `Nuevo reto publicado por ${activity.user}: "${activity.title}"`;
      case 'user_joined':
        return `${activity.user} se unió desde ${activity.country}`;
      default:
        return '';
    }
  };

  const featuredBounties = [
    {
      title: 'Desarrollar dashboard analytics',
      company: 'TechCorp',
      reward: 450,
      skills: ['React', 'TypeScript', 'D3.js'],
      applicants: 12,
      country: '🇺🇸'
    },
    {
      title: 'Smart Contract audit',
      company: 'DeFi Labs',
      reward: 800,
      skills: ['Solidity', 'Security'],
      applicants: 8,
      country: '🇬🇧'
    },
    {
      title: 'Diseño UI/UX para app móvil',
      company: 'StartupX',
      reward: 320,
      skills: ['Figma', 'UI Design'],
      applicants: 15,
      country: '🇩🇪'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 overflow-hidden">
      <div className="fixed top-24 right-4 z-40 space-y-3 max-w-sm">
        {liveActivities.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-900/90 to-green-900/90 backdrop-blur-xl rounded-xl p-4 border border-emerald-500/30 shadow-2xl animate-slide-in-right">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getActivityIcon(liveActivities[currentActivityIndex].type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium leading-relaxed">
                  {getActivityText(liveActivities[currentActivityIndex])}
                </p>
                <p className="text-xs text-emerald-300 mt-1">Hace 2 minutos</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-500/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 relative">
          <div className="text-center mb-16 animate-blur-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/20 backdrop-blur-sm border border-accent-500/30 rounded-full mb-8">
              <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></div>
              <span className="text-sm font-bold bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">Powered by Scroll L2</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight tracking-tight">
              Resuelve Retos Globales.
              <br />
              <span className="bg-gradient-to-r from-accent-400 via-primary-400 to-emerald-400 bg-clip-text text-transparent">
                Gana Cripto.
              </span>
              <br />
              <span className="text-5xl md:text-6xl lg:text-7xl">Cambia el juego.</span>
            </h1>

            <p className="text-xl md:text-2xl text-neutral-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              La plataforma descentralizada donde el talento global se encuentra con oportunidades reales.
              <span className="text-accent-400"> Pagos instantáneos. Votación transparente.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => onNavigate('explorer')}
                className="group px-10 py-5 bg-gradient-to-r from-accent-500 to-emerald-500 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-accent-500/50 transition-all hover:scale-105 hover:from-accent-400 hover:to-emerald-400"
              >
                Empieza ya - Gana tu primer bounty
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('features')}
              className="group px-6 py-3 bg-white/5 backdrop-blur-sm text-white rounded-full font-semibold text-base flex items-center justify-center gap-2 mx-auto border border-white/10 hover:bg-white/10 hover:border-accent-500/50 transition-all"
            >
              <Play size={18} />
              Prueba cómo funciona en 30 segundos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-20">
            <div className="text-center p-8 bg-gradient-to-br from-accent-500/10 to-emerald-500/10 rounded-2xl border border-accent-500/20 backdrop-blur-sm">
              <div className="min-h-[80px] flex items-center justify-center mb-3">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent-400 to-emerald-400 bg-clip-text text-transparent whitespace-nowrap overflow-visible">
                  ${animatedStats.rewards.toLocaleString()}
                </div>
              </div>
              <div className="text-sm text-neutral-400 font-medium">Pagados en Recompensas</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-2xl border border-primary-500/20 backdrop-blur-sm">
              <div className="min-h-[80px] flex items-center justify-center mb-3">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap overflow-visible">
                  {animatedStats.bounties}+
                </div>
              </div>
              <div className="text-sm text-neutral-400 font-medium">Retos Resueltos</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
              <div className="min-h-[80px] flex items-center justify-center mb-3">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap overflow-visible">
                  {animatedStats.countries}
                </div>
              </div>
              <div className="text-sm text-neutral-400 font-medium">Países Activos</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-3xl p-8 border-2 border-orange-500/50 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center animate-pulse">
                    <Flame className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-orange-300 text-sm font-bold uppercase tracking-wider">Reto del Día</div>
                    <div className="text-white text-xs">Termina en:</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-neutral-950/50 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
                    <div className="text-4xl font-bold text-white text-center mb-1">
                      {String(timeRemaining.hours).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-orange-300 text-center font-semibold">HORAS</div>
                  </div>
                  <div className="bg-neutral-950/50 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
                    <div className="text-4xl font-bold text-white text-center mb-1">
                      {String(timeRemaining.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-orange-300 text-center font-semibold">MINUTOS</div>
                  </div>
                  <div className="bg-neutral-950/50 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
                    <div className="text-4xl font-bold text-white text-center mb-1">
                      {String(timeRemaining.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-orange-300 text-center font-semibold">SEGUNDOS</div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  Crear sistema de votación descentralizado
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-lg border border-orange-500/40 font-semibold">
                    React
                  </span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-lg border border-orange-500/40 font-semibold">
                    Solidity
                  </span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-lg border border-orange-500/40 font-semibold">
                    Web3
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <div className="text-2xl font-bold text-emerald-400">$850</div>
                    </div>
                    <div className="text-xs text-gray-400">Premio</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="w-4 h-4 text-yellow-400" />
                      <div className="text-2xl font-bold text-yellow-400">Hard</div>
                    </div>
                    <div className="text-xs text-gray-400">Dificultad</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-primary-400" />
                      <div className="text-2xl font-bold text-primary-400">28</div>
                    </div>
                    <div className="text-xs text-gray-400">Compitiendo</div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('explorer')}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:from-orange-400 hover:to-red-400 transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  Participar Ahora
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-3xl p-8 border-2 border-purple-500/50 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                      <Trophy className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-purple-300 text-sm font-bold uppercase tracking-wider">Tu Nivel</div>
                      <div className="text-white text-2xl font-bold">Nivel {userLevel.level}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-xl border border-orange-500/40">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <div className="text-white font-bold">{userLevel.streak} días</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-300 font-semibold">Progreso al Nivel {userLevel.level + 1}</span>
                    <span className="text-sm text-white font-bold">{userLevel.xp} / {userLevel.nextLevelXp} XP</span>
                  </div>
                  <div className="h-4 bg-neutral-950/50 rounded-full overflow-hidden border border-purple-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 relative overflow-hidden"
                      style={{ width: `${(userLevel.xp / userLevel.nextLevelXp) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-neutral-950/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="text-xs text-purple-300 font-semibold">BADGES</span>
                    </div>
                    <div className="text-2xl font-bold text-white">12</div>
                  </div>
                  <div className="bg-neutral-950/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs text-purple-300 font-semibold">RETOS</span>
                    </div>
                    <div className="text-2xl font-bold text-white">38</div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-neutral-950/50 backdrop-blur-sm rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-sm text-white">Resolver bounty</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">+50 XP</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-950/50 backdrop-blur-sm rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-400" />
                      </div>
                      <span className="text-sm text-white">Votar en comunidad</span>
                    </div>
                    <span className="text-primary-400 font-bold text-sm">+10 XP</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-950/50 backdrop-blur-sm rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent-500/20 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-accent-400" />
                      </div>
                      <span className="text-sm text-white">Crear nuevo reto</span>
                    </div>
                    <span className="text-accent-400 font-bold text-sm">+25 XP</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('profile')}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-400 hover:to-pink-400 transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  Ver Mi Perfil
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 backdrop-blur-sm border border-primary-500/30 rounded-full mb-6">
            <Trophy className="w-5 h-5 text-primary-400" />
            <span className="text-sm font-bold text-primary-400">Retos Destacados</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Empieza a ganar hoy
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {featuredBounties.map((bounty, index) => (
            <div key={index} className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-accent-500/50 transition-all hover:scale-105 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{bounty.country}</div>
                <div className="px-3 py-1 bg-accent-500/20 rounded-full">
                  <span className="text-accent-400 font-bold text-sm">{bounty.applicants} aplicantes</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-400 transition-colors">
                {bounty.title}
              </h3>

              <p className="text-gray-400 text-sm mb-4">Por {bounty.company}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {bounty.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-lg border border-primary-500/30">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span className="text-2xl font-bold text-white">${bounty.reward}</span>
                  <span className="text-gray-400 text-sm">USDC</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-accent-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => onNavigate('explorer')}
            className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white rounded-xl font-bold text-lg border border-white/10 hover:bg-white/10 hover:border-accent-500/50 transition-all inline-flex items-center gap-2"
          >
            Ver todos los retos
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full mb-6">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">Seguridad y Transparencia</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pagos garantizados por Smart Contracts
          </h2>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 border border-gray-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-500/5 to-emerald-500/5"></div>

          <div className="relative grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sube tu solución</h3>
              <p className="text-gray-400 text-sm">Envía tu trabajo de forma segura</p>
            </div>

            <div className="text-center relative">
              <div className="hidden md:block absolute top-8 -left-12 w-24 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Votación comunitaria</h3>
              <p className="text-gray-400 text-sm">La comunidad decide el ganador</p>
            </div>

            <div className="text-center relative">
              <div className="hidden md:block absolute top-8 -left-12 w-24 h-0.5 bg-gradient-to-r from-accent-500 to-emerald-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Pago automático</h3>
              <p className="text-gray-400 text-sm">El smart contract libera fondos</p>
            </div>

            <div className="text-center relative">
              <div className="hidden md:block absolute top-8 -left-12 w-24 h-0.5 bg-gradient-to-r from-emerald-500 to-purple-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Historial público</h3>
              <p className="text-gray-400 text-sm">Todo verificable en blockchain</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://scrollscan.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all"
            >
              <Shield className="w-5 h-5 text-emerald-400" />
              Ver contratos auditados en Scrollscan
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-accent-500 to-emerald-500 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Listo para empezar a ganar?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Únete a miles de creadores que ya están ganando cripto resolviendo retos globales
            </p>
            <button
              onClick={() => onNavigate('explorer')}
              className="group px-12 py-5 bg-white text-accent-600 rounded-xl font-bold text-xl hover:bg-neutral-50 transition-all hover:scale-105 shadow-2xl inline-flex items-center gap-3"
            >
              Explorar retos ahora
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="sticky bottom-6 left-0 right-0 z-40 px-6 md:hidden">
        <button
          onClick={() => onNavigate('explorer')}
          className="w-full px-8 py-4 bg-gradient-to-r from-accent-500 to-emerald-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-2xl"
        >
          Empieza ya
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
