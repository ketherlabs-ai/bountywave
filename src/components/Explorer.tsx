import { Search, Filter, Clock, Trophy, Star, Users, TrendingUp, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ExplorerProps {
  onNavigate: (view: string, data?: any) => void;
}

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  reward_token: string;
  deadline: string;
  status: string;
  category_name: string;
  difficulty_level: string;
  is_featured: boolean;
  is_collaborative: boolean;
  is_sponsored: boolean;
  sponsor_name: string | null;
  submission_count: number;
}

export function Explorer({ onNavigate }: ExplorerProps) {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
    loadBounties();
  }, [selectedCategory, selectedDifficulty, searchTerm]);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const loadBounties = async () => {
    setLoading(true);

    let query = supabase
      .from('bounties')
      .select(`
        id, title, description, reward_amount, reward_token, deadline, status,
        difficulty_level, is_featured, is_collaborative, is_sponsored, sponsor_name,
        categories (name)
      `)
      .eq('status', 'active')
      .order('is_sponsored', { ascending: false })
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (selectedCategory !== 'all') query = query.eq('category_id', selectedCategory);
    if (selectedDifficulty !== 'all') query = query.eq('difficulty_level', selectedDifficulty);
    if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);

    const { data } = await query;

    if (data) {
      const bountiesWithCounts = await Promise.all(
        data.map(async (bounty: any) => {
          const { count } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('bounty_id', bounty.id);

          return {
            ...bounty,
            category_name: bounty.categories?.name || 'General',
            submission_count: count || 0,
          };
        })
      );

      setBounties(bountiesWithCounts);
    }

    setLoading(false);
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Finalizado';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 7) return `${days} días`;
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'advanced': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'expert': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      case 'expert': return 'Experto';
      default: return level;
    }
  };

  const featuredBounties = bounties.filter(b => b.is_featured || b.is_sponsored);
  const regularBounties = bounties.filter(b => !b.is_featured && !b.is_sponsored);

  return (
    <div className="min-h-screen bg-neutral-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary-400 to-accent-400 rounded-full" />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
              Explorar Retos
            </h1>
          </div>
          <p className="text-lg text-neutral-400 ml-7">
            Descubre oportunidades, demuestra tus habilidades y gana recompensas
          </p>
        </div>

        <div className="mb-10 space-y-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary-400 transition-colors" size={22} />
            <input
              type="text"
              placeholder="Buscar retos increíbles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-2xl text-white text-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 focus:bg-white/10 transition-all backdrop-blur-xl"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-neutral-400">
              Categorías
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`group relative overflow-hidden px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25 scale-105'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white hover:scale-105 border border-white/10'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Sparkles size={16} className={selectedCategory === 'all' ? 'animate-pulse' : ''} />
                Todos
              </div>
              {selectedCategory === 'all' && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 blur-xl" />
              )}
            </button>

            {categories.map((cat, index) => {
              const icons = ['💻', '🎨', '🔧', '📱', '🚀', '⚡', '🎯', '🔒'];
              const gradients = [
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500',
                'from-orange-500 to-red-500',
                'from-green-500 to-emerald-500',
                'from-yellow-500 to-orange-500',
                'from-indigo-500 to-purple-500',
              ];

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group relative overflow-hidden px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${gradients[index % gradients.length]} text-white shadow-lg scale-105`
                      : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white hover:scale-105 border border-white/10'
                  }`}
                >
                  <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                    <span className="text-xl">{icons[index % icons.length]}</span>
                    <span className="text-xs">{cat.name}</span>
                  </div>
                  {selectedCategory === cat.id && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${gradients[index % gradients.length]} opacity-20 blur-xl`} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                showFilters
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
              }`}
            >
              <Filter size={18} />
              Filtros Avanzados
              {showFilters ? '▲' : '▼'}
            </button>

            {selectedDifficulty !== 'all' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm">
                <span className="text-neutral-400">Dificultad:</span>
                <span className="text-white font-semibold">{selectedDifficulty}</span>
                <button
                  onClick={() => setSelectedDifficulty('all')}
                  className="ml-2 text-neutral-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {showFilters && (
            <div className="p-6 bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-2xl animate-fade-in backdrop-blur-xl">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setSelectedDifficulty('beginner')}
                  className={`p-4 rounded-xl transition-all ${
                    selectedDifficulty === 'beginner'
                      ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                      : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-2xl mb-2">🌱</div>
                  <div className="font-bold text-sm">Principiante</div>
                </button>
                <button
                  onClick={() => setSelectedDifficulty('intermediate')}
                  className={`p-4 rounded-xl transition-all ${
                    selectedDifficulty === 'intermediate'
                      ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400'
                      : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-bold text-sm">Intermedio</div>
                </button>
                <button
                  onClick={() => setSelectedDifficulty('advanced')}
                  className={`p-4 rounded-xl transition-all ${
                    selectedDifficulty === 'advanced'
                      ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-400'
                      : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="font-bold text-sm">Avanzado</div>
                </button>
                <button
                  onClick={() => setSelectedDifficulty('expert')}
                  className={`p-4 rounded-xl transition-all ${
                    selectedDifficulty === 'expert'
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                      : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-2xl mb-2">💀</div>
                  <div className="font-bold text-sm">Experto</div>
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedDifficulty('all');
                  setShowFilters(false);
                }}
                className="mt-4 w-full py-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary-500/20 rounded-full" />
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0" />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {featuredBounties.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-accent-400" size={20} />
                  <h2 className="text-xl font-bold text-white">Destacados</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredBounties.map((bounty) => (
                    <div
                      key={bounty.id}
                      onClick={() => onNavigate('bounty', { bountyId: bounty.id })}
                      className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:border-primary-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-xs font-semibold rounded-lg">
                              {bounty.category_name}
                            </span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${getDifficultyColor(bounty.difficulty_level)}`}>
                              {getDifficultyLabel(bounty.difficulty_level)}
                            </span>
                            {bounty.is_sponsored && bounty.sponsor_name && (
                              <span className="px-3 py-1 bg-gradient-to-r from-accent-500 to-accent-600 text-neutral-950 text-xs font-bold rounded-lg flex items-center gap-1.5">
                                <Star size={12} className="fill-current" />
                                {bounty.sponsor_name}
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors leading-tight">
                            {bounty.title}
                          </h3>
                          <p className="text-neutral-400 line-clamp-2 text-sm leading-relaxed">
                            {bounty.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-neutral-400">
                            <Clock size={16} />
                            <span className="text-sm font-medium">{getTimeRemaining(bounty.deadline)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-400">
                            <Users size={16} />
                            <span className="text-sm font-medium">{bounty.submission_count}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-accent-400">
                              {bounty.reward_amount}
                            </div>
                            <div className="text-xs text-neutral-500 font-medium">
                              {bounty.reward_token}
                            </div>
                          </div>
                          <Trophy className="text-accent-400" size={24} />
                        </div>
                      </div>

                      {bounty.is_sponsored && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/10 rounded-bl-full blur-2xl pointer-events-none" />
                      )}
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-500/5 rounded-tl-full blur-2xl group-hover:bg-primary-500/10 transition-all pointer-events-none" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {regularBounties.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-primary-400" size={20} />
                  <h2 className="text-xl font-bold text-white">Todos los Retos</h2>
                  <span className="px-2 py-1 bg-white/5 text-neutral-400 text-sm font-semibold rounded-lg">
                    {regularBounties.length}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularBounties.map((bounty) => (
                    <div
                      key={bounty.id}
                      onClick={() => onNavigate('bounty', { bountyId: bounty.id })}
                      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 hover:bg-white/10 hover:border-primary-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-2.5 py-1 bg-primary-500/10 text-primary-400 text-xs font-semibold rounded-lg">
                          {bounty.category_name}
                        </span>
                        {bounty.is_collaborative && (
                          <Users size={14} className="text-accent-400" />
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors leading-snug">
                        {bounty.title}
                      </h3>

                      <p className="text-sm text-neutral-500 line-clamp-2 mb-4 leading-relaxed">
                        {bounty.description}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex flex-col">
                          <div className="text-lg font-bold text-accent-400">
                            {bounty.reward_amount} {bounty.reward_token}
                          </div>
                          <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                            <Clock size={12} />
                            {getTimeRemaining(bounty.deadline)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <Users size={14} />
                          <span className="text-sm font-medium">{bounty.submission_count}</span>
                        </div>
                      </div>

                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={18} className="text-primary-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bounties.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="text-neutral-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No se encontraron retos
                </h3>
                <p className="text-neutral-500">
                  Intenta ajustar los filtros o la búsqueda
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
