import { ArrowRight, Trophy, Users, Zap, Check, Globe, Sparkles, Code, Wallet, Shield, TrendingUp, Star, Lock, ExternalLink, FileCode } from 'lucide-react';
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

export function Landing({ onNavigate }: LandingProps) {
  const [stats, setStats] = useState<Stats>({ activeBounties: 0, totalRewards: 0, totalSubmissions: 0 });

  useEffect(() => {
    loadStats();
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

  const features = [
    {
      icon: Zap,
      title: 'Recompensas Instantáneas',
      description: 'Pagos automáticos en USDC/ETH sobre Scroll L2. Sin intermediarios, 100% transparente y seguro.',
      gradient: 'from-accent-500 to-accent-600',
    },
    {
      icon: Shield,
      title: 'Votación Privada zk-Proof',
      description: 'Sistema de votación anónimo con tecnología zero-knowledge. Tu identidad siempre protegida.',
      gradient: 'from-primary-500 to-primary-600',
    },
    {
      icon: Globe,
      title: 'Talento Global Sin Fronteras',
      description: 'Conecta con solucionadores de todo el mundo. Diversidad, innovación y colaboración garantizadas.',
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Conecta tu Wallet',
      description: 'Usa MetaMask o cualquier wallet compatible con Scroll L2.',
      icon: Wallet,
    },
    {
      number: '02',
      title: 'Explora y Resuelve',
      description: 'Encuentra retos que se alineen con tus habilidades y envía tu solución.',
      icon: Code,
    },
    {
      number: '03',
      title: 'Gana y Crece',
      description: 'La comunidad vota, tú ganas recompensas y subes en el ranking global.',
      icon: TrendingUp,
    },
  ];

  const testimonials = [
    {
      name: 'Ana Martínez',
      role: 'Frontend Developer',
      avatar: '0x4a5b...c3d2',
      text: 'Gané mi primer bounty en 48 horas. La plataforma es increíblemente intuitiva y los pagos son instantáneos.',
      rating: 5,
    },
    {
      name: 'Carlos Rivera',
      role: 'Smart Contract Developer',
      avatar: '0x8f3a...b1e4',
      text: 'Excelente para encontrar proyectos desafiantes. La votación zk-proof es innovadora y justa.',
      rating: 5,
    },
    {
      name: 'Sofia Chen',
      role: 'UI/UX Designer',
      avatar: '0x2c7d...f5a6',
      text: 'Como creadora, BOUNTYWAVE me ayudó a encontrar talento de clase mundial para mi proyecto DAO.',
      rating: 5,
    },
  ];


  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 relative">
          <div className="text-center mb-24 animate-blur-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8 hover:border-accent-500/50 transition-all">
              <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
              <span className="text-sm font-medium text-neutral-300">Powered by</span>
              <span className="text-sm font-bold bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">Scroll L2</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight tracking-tight">
              Resuelve retos globales.
              <br />
              <span className="bg-gradient-to-r from-accent-400 via-primary-400 to-purple-400 bg-clip-text text-transparent animate-fade-in">
                Gana, conecta y aprende
              </span>
              <br />
              <span className="text-5xl md:text-6xl lg:text-7xl">en Web3</span>
            </h1>

            <p className="text-xl md:text-2xl text-neutral-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              BOUNTYWAVE conecta talento global con desafíos reales. Recompensas instantáneas, votación privada y comunidad descentralizada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => onNavigate('explorer')}
                className="group px-8 py-4 bg-gradient-to-r from-accent-500 to-primary-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-accent-500/50 transition-all hover:scale-105"
              >
                Explorar Retos
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('create')}
                className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white rounded-xl font-bold text-lg border border-white/10 hover:bg-white/10 hover:border-accent-500/50 transition-all"
              >
                Publicar Reto
              </button>
            </div>

            <div className="mb-16">
              <button
                onClick={() => onNavigate('features')}
                className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-base flex items-center justify-center gap-2 mx-auto hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 animate-bounce-slow"
              >
                <Sparkles size={18} className="animate-pulse" />
                Ver 8 Funcionalidades Avanzadas
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center animate-slide-up">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent mb-2">
                  {stats.activeBounties}+
                </div>
                <div className="text-sm text-neutral-500">Retos Activos</div>
              </div>
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-2">
                  ${stats.totalRewards}k+
                </div>
                <div className="text-sm text-neutral-500">En Premios</div>
              </div>
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stats.totalSubmissions}+
                </div>
                <div className="text-sm text-neutral-500">Propuestas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-accent-500/50 transition-all hover:shadow-2xl hover:shadow-accent-500/20 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Cómo Funciona</h2>
            <p className="text-xl text-neutral-400">Tres pasos simples para comenzar tu viaje Web3</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 -right-4 w-8 h-0.5 bg-gradient-to-r from-accent-500 to-transparent"></div>
                  )}
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-accent-500/50 transition-all h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-6xl font-bold text-white/10">{step.number}</div>
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-primary-500 rounded-xl flex items-center justify-center">
                        <Icon className="text-white" size={24} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-neutral-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-32">
          <div className="bg-gradient-to-r from-accent-500/10 via-primary-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl border border-accent-500/30 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-accent-500/50">
                  <Lock className="text-white" size={40} />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-500/20 rounded-full mb-4">
                  <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></div>
                  <span className="text-xs font-bold text-accent-300 uppercase tracking-wider">Verified on Scroll</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Pagos y Recompensas 100% Auditados por Smart Contracts
                </h3>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  Todas las transacciones son ejecutadas automáticamente mediante contratos inteligentes en Scroll L2.
                  Sin intermediarios, totalmente transparente y verificable en blockchain.
                </p>
                <a
                  href="https://scrollscan.com/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-sm border border-white/20 hover:border-accent-500/50 transition-all"
                >
                  <FileCode size={16} />
                  Ver Smart Contract en Scrollscan
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Cómo Funcionan los Pagos Web3</h2>
            <p className="text-xl text-neutral-400">Transparencia total, seguridad garantizada</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="relative">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-500/50">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Publicación</h4>
                  <p className="text-sm text-neutral-400">El creador deposita la recompensa en el smart contract</p>
                </div>
                <div className="hidden md:block absolute top-8 -right-3 w-6 h-0.5 bg-gradient-to-r from-accent-500 to-primary-500"></div>
              </div>

              <div className="relative">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/50">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Propuestas</h4>
                  <p className="text-sm text-neutral-400">Los builders envían soluciones y compiten</p>
                </div>
                <div className="hidden md:block absolute top-8 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500"></div>
              </div>

              <div className="relative">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Votación zk-Proof</h4>
                  <p className="text-sm text-neutral-400">La comunidad vota de forma privada y segura</p>
                </div>
                <div className="hidden md:block absolute top-8 -right-3 w-6 h-0.5 bg-gradient-to-r from-purple-500 to-green-500"></div>
              </div>

              <div>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50">
                    <Check className="text-white" size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Pago Automático</h4>
                  <p className="text-sm text-neutral-400">El smart contract envía la recompensa al ganador</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="bg-accent-500/10 rounded-2xl p-6 border border-accent-500/30">
                <div className="flex items-start gap-4">
                  <Shield className="text-accent-400 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h5 className="text-white font-bold mb-2">¿Por qué Smart Contracts?</h5>
                    <p className="text-neutral-300 text-sm leading-relaxed">
                      En BOUNTYWAVE, las recompensas se gestionan sin intermediarios a través de contratos inteligentes en Scroll.
                      El pago ocurre de forma automática, es completamente auditable en blockchain y no hay posibilidad de fraude.
                      Una vez que la votación termina, el contrato ejecuta el pago instantáneamente al ganador.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Lo Que Dice la Comunidad</h2>
            <p className="text-xl text-neutral-400">Historias reales de builders y creadores</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.avatar}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-accent-500/50 transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-accent-400 fill-accent-400" />
                  ))}
                </div>
                <p className="text-neutral-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-neutral-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 via-primary-500/20 to-purple-500/20 backdrop-blur-sm"></div>
          <div className="relative px-8 py-16 md:py-24 text-center">
            <Sparkles className="mx-auto text-accent-400 mb-6" size={48} />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Únete a la Revolución Web3
            </h2>
            <p className="text-xl text-neutral-300 mb-10 max-w-2xl mx-auto">
              Miles de builders ya están resolviendo retos, ganando recompensas y construyendo su reputación onchain.
            </p>
            <button
              onClick={() => onNavigate('explorer')}
              className="group px-8 py-4 bg-white text-neutral-900 rounded-xl font-bold text-lg flex items-center justify-center gap-3 mx-auto hover:shadow-2xl hover:shadow-white/50 transition-all hover:scale-105"
            >
              Comenzar Ahora
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
