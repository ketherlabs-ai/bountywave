import { ArrowRight, Trophy, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface LandingProps {
  onNavigate: (view: string) => void;
}

interface FeaturedBounty {
  id: string;
  title: string;
  reward_amount: number;
  reward_token: string;
  category_name: string;
}

export function Landing({ onNavigate }: LandingProps) {
  const [featuredBounties, setFeaturedBounties] = useState<FeaturedBounty[]>([]);

  useEffect(() => {
    loadFeaturedBounties();
  }, []);

  const loadFeaturedBounties = async () => {
    const { data } = await supabase
      .from('bounties')
      .select(`
        id,
        title,
        reward_amount,
        reward_token,
        categories (name)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .limit(3);

    if (data) {
      setFeaturedBounties(
        data.map((b: any) => ({
          id: b.id,
          title: b.title,
          reward_amount: b.reward_amount,
          reward_token: b.reward_token,
          category_name: b.categories?.name || 'General',
        }))
      );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <div className="text-center mb-24 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft mb-8">
            <span className="text-sm font-medium text-neutral-600">Powered by</span>
            <span className="text-sm font-bold text-primary-600">Scroll L2</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-neutral-900 mb-8 leading-tight tracking-tight">
            Resuelve Retos.
            <br />
            <span className="text-primary-600">
              Gana Cripto.
            </span>
          </h1>
          <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            BountyWave conecta talento global con desafíos reales. Publica retos, recibe soluciones innovadoras y recompensa automáticamente en blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('explorer')}
              className="px-8 py-4 bg-neutral-900 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-soft-lg hover:shadow-soft-xl transition-all"
            >
              Explorar Retos
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('create')}
              className="px-8 py-4 bg-white text-neutral-900 rounded-xl font-semibold text-base border border-neutral-200 hover:border-neutral-300 shadow-soft transition-all"
            >
              Publicar Reto
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-white rounded-2xl p-8 border border-neutral-200 hover:border-primary-200 shadow-soft hover:shadow-soft-lg transition-all">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <Trophy className="text-primary-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-3">Recompensas Automáticas</h3>
            <p className="text-neutral-600 leading-relaxed">
              Pagos instantáneos en USDC/ETH sobre Scroll. Sin intermediarios, 100% transparente.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-neutral-200 hover:border-accent-200 shadow-soft hover:shadow-soft-lg transition-all">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mb-6">
              <Zap className="text-accent-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-3">Privacidad zk-Proof</h3>
            <p className="text-neutral-600 leading-relaxed">
              Votaciones anónimas con tecnología zero-knowledge. Tu identidad, protegida.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-neutral-200 hover:border-primary-200 shadow-soft hover:shadow-soft-lg transition-all">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <Users className="text-primary-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-3">Talento Global</h3>
            <p className="text-neutral-600 leading-relaxed">
              Conecta con solucionadores de todo el mundo. Diversidad e innovación garantizadas.
            </p>
          </div>
        </div>

        {featuredBounties.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-10 text-center">Retos Destacados</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredBounties.map((bounty) => (
                <div
                  key={bounty.id}
                  onClick={() => onNavigate('explorer')}
                  className="bg-white rounded-2xl p-6 shadow-soft-md hover:shadow-soft-xl transition-all cursor-pointer border border-neutral-200 hover:border-primary-300"
                >
                  <div className="text-sm text-primary-600 font-semibold mb-3">{bounty.category_name}</div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-6 line-clamp-2">{bounty.title}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Recompensa</div>
                      <div className="text-2xl font-bold text-neutral-900">
                        {bounty.reward_amount} <span className="text-accent-600">{bounty.reward_token}</span>
                      </div>
                    </div>
                    <ArrowRight className="text-neutral-400" size={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
