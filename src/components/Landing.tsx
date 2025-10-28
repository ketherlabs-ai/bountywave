import { ArrowRight, Trophy, Users, Zap, Check, Globe, Sparkles, Code, Wallet, Shield, TrendingUp, Star, DollarSign, MapPin, CheckCircle, Play, ExternalLink, Clock, Flame, Award, Target, Cpu, Layers, Lock, Server, Terminal, Rocket, Brain, Coins } from 'lucide-react';
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

          <div className="relative max-w-7xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-emerald-500/10 blur-3xl"></div>

            <div className="relative bg-gradient-to-br from-neutral-900/95 via-neutral-950/95 to-black/95 rounded-3xl p-8 md:p-12 border border-primary-500/20 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-500/20 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent-500/20 to-transparent rounded-full blur-3xl"></div>

              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `repeating-linear-gradient(0deg, rgba(99, 102, 241, 0.1) 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0px, transparent 1px, transparent 40px)`
                }}></div>
              </div>

              <div className="relative">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur-lg animate-pulse"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="text-red-400 text-sm font-black uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          Elite Challenge
                        </div>
                        <div className="text-white text-2xl md:text-3xl font-bold">Zero-Knowledge Proof System</div>
                      </div>
                    </div>
                    <p className="text-neutral-400 text-sm md:text-base max-w-2xl">
                      Implementar un sistema completo de pruebas de conocimiento cero con verificación on-chain, compatible con ZK-SNARKs y optimizado para gas efficiency.
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-500/40 backdrop-blur-sm">
                      <Coins className="w-6 h-6 text-emerald-400" />
                      <div>
                        <div className="text-emerald-400 text-2xl md:text-3xl font-black">$5,000</div>
                        <div className="text-emerald-400/70 text-xs font-semibold">USDC Reward</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/30">
                      <Clock className="w-4 h-4 text-red-400" />
                      <div className="text-white font-mono font-bold text-sm">
                        {String(timeRemaining.hours).padStart(2, '0')}:{String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-primary-950/50 to-primary-900/30 p-4 rounded-xl border border-primary-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-5 h-5 text-primary-400" />
                      <span className="text-primary-300 text-xs font-bold uppercase tracking-wider">Complejidad</span>
                    </div>
                    <div className="text-white text-xl font-bold mb-1">Expert</div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex-1 h-1.5 bg-primary-500 rounded-full"></div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-accent-950/50 to-accent-900/30 p-4 rounded-xl border border-accent-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-accent-400" />
                      <span className="text-accent-300 text-xs font-bold uppercase tracking-wider">Competidores</span>
                    </div>
                    <div className="text-white text-xl font-bold mb-1">12/15</div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-gradient-to-r from-accent-500 to-accent-400"></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 p-4 rounded-xl border border-emerald-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Submissions</span>
                    </div>
                    <div className="text-white text-xl font-bold mb-1">8 Live</div>
                    <div className="text-emerald-400 text-xs font-semibold">En revisión</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-950/50 to-orange-900/30 p-4 rounded-xl border border-orange-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-5 h-5 text-orange-400" />
                      <span className="text-orange-300 text-xs font-bold uppercase tracking-wider">Timelock</span>
                    </div>
                    <div className="text-white text-xl font-bold mb-1">48h</div>
                    <div className="text-orange-400 text-xs font-semibold">Duración mínima</div>
                  </div>
                </div>

                <div className="bg-neutral-950/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800 mb-8">
                  <div className="text-neutral-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Requisitos Técnicos
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-neutral-400 text-xs font-semibold mb-3">Stack Principal</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-primary-500/10 text-primary-300 text-xs font-bold rounded-lg border border-primary-500/30">
                          Circom 2.x
                        </span>
                        <span className="px-3 py-1.5 bg-primary-500/10 text-primary-300 text-xs font-bold rounded-lg border border-primary-500/30">
                          SnarkJS
                        </span>
                        <span className="px-3 py-1.5 bg-primary-500/10 text-primary-300 text-xs font-bold rounded-lg border border-primary-500/30">
                          Solidity 0.8+
                        </span>
                        <span className="px-3 py-1.5 bg-primary-500/10 text-primary-300 text-xs font-bold rounded-lg border border-primary-500/30">
                          Hardhat
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-400 text-xs font-semibold mb-3">Skills Requeridas</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-accent-500/10 text-accent-300 text-xs font-bold rounded-lg border border-accent-500/30">
                          Cryptography
                        </span>
                        <span className="px-3 py-1.5 bg-accent-500/10 text-accent-300 text-xs font-bold rounded-lg border border-accent-500/30">
                          ZK-SNARKs
                        </span>
                        <span className="px-3 py-1.5 bg-accent-500/10 text-accent-300 text-xs font-bold rounded-lg border border-accent-500/30">
                          Gas Optimization
                        </span>
                        <span className="px-3 py-1.5 bg-accent-500/10 text-accent-300 text-xs font-bold rounded-lg border border-accent-500/30">
                          Circuit Design
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-yellow-500 text-sm font-bold mb-1">Auditoría Obligatoria</div>
                        <div className="text-neutral-400 text-xs">
                          El código debe pasar auditoría de seguridad automatizada y revisión por pares antes de ser elegible para el premio.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={() => onNavigate('elite-challenge')}
                    className="flex-1 px-8 py-5 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white rounded-xl font-black text-lg hover:from-primary-500 hover:via-primary-400 hover:to-accent-400 transition-all hover:scale-105 shadow-lg shadow-primary-500/50 flex items-center justify-center gap-3 group"
                  >
                    <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    Aceptar Challenge
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => onNavigate('elite-challenge')}
                    className="px-8 py-5 bg-neutral-900/50 text-white rounded-xl font-bold text-lg hover:bg-neutral-900/80 transition-all border border-neutral-700 hover:border-neutral-600 flex items-center justify-center gap-2"
                  >
                    <Code className="w-5 h-5" />
                    Ver Detalles Técnicos
                  </button>
                </div>
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
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-emerald-500/20 blur-3xl"></div>

          <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-950 to-black rounded-3xl p-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-accent-500 to-emerald-500 opacity-50 blur-xl"></div>

            <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-950 to-black rounded-3xl p-12 md:p-16">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(99, 102, 241, 0.1) 2px, rgba(99, 102, 241, 0.1) 4px),
                    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(16, 185, 129, 0.1) 2px, rgba(16, 185, 129, 0.1) 4px)
                  `,
                  backgroundSize: '80px 80px'
                }}></div>
              </div>

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-gradient-to-b from-primary-500/30 to-transparent blur-3xl rounded-full"></div>

              <div className="relative text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500/20 to-accent-500/20 backdrop-blur-sm border border-primary-500/30 rounded-full mb-8">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest bg-gradient-to-r from-primary-400 via-accent-400 to-emerald-400 bg-clip-text text-transparent">
                    Sistema Activo
                  </span>
                </div>

                <h2 className="text-4xl md:text-6xl font-black mb-6">
                  <span className="bg-gradient-to-r from-white via-primary-100 to-white bg-clip-text text-transparent">
                    Construye el Futuro.
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-emerald-400 bg-clip-text text-transparent">
                    Gana en Crypto.
                  </span>
                </h2>

                <p className="text-xl text-neutral-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Únete a la red global de <span className="text-accent-400 font-bold">desarrolladores elite</span> que están revolucionando la Web3, resolviendo desafíos técnicos complejos y ganando recompensas en <span className="text-emerald-400 font-bold">USDC</span>.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-primary-950/50 to-primary-900/30 p-6 rounded-2xl border border-primary-500/30 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-primary-400 text-3xl font-black mb-2">Instant</div>
                    <div className="text-neutral-400 text-sm">
                      Pagos automáticos on-chain al resolver el reto
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-accent-950/50 to-accent-900/30 p-6 rounded-2xl border border-accent-500/30 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-accent-400 text-3xl font-black mb-2">Seguro</div>
                    <div className="text-neutral-400 text-sm">
                      Smart contracts auditados protegen tus fondos
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 p-6 rounded-2xl border border-emerald-500/30 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-emerald-400 text-3xl font-black mb-2">Global</div>
                    <div className="text-neutral-400 text-sm">
                      Compite con los mejores de 47+ países
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => onNavigate('explorer')}
                    className="group px-10 py-5 bg-gradient-to-r from-primary-600 via-accent-500 to-emerald-500 text-white rounded-xl font-black text-xl hover:from-primary-500 hover:via-accent-400 hover:to-emerald-400 transition-all hover:scale-105 shadow-2xl shadow-primary-500/50 inline-flex items-center gap-3"
                  >
                    <Rocket className="w-6 h-6 group-hover:translate-y-[-2px] transition-transform" />
                    Explorar Challenges
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => onNavigate('create')}
                    className="group px-10 py-5 bg-neutral-900 text-white rounded-xl font-bold text-xl hover:bg-neutral-800 transition-all border-2 border-neutral-700 hover:border-neutral-600 inline-flex items-center gap-3"
                  >
                    <Code className="w-6 h-6" />
                    Crear Bounty
                  </button>
                </div>

                <div className="mt-12 flex items-center justify-center gap-8 text-neutral-500 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span>Sin comisiones ocultas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span>100% transparente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span>Open source</span>
                  </div>
                </div>
              </div>
            </div>
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
