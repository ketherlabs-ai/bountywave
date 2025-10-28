import { Search, Filter, Clock, Trophy } from 'lucide-react';
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
  category_name: string;
  category_icon: string;
  is_featured: boolean;
  submission_count: number;
}

export function Explorer({ onNavigate }: ExplorerProps) {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadBounties();
  }, [selectedCategory, searchTerm]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (data) {
      setCategories(data);
    }
  };

  const loadBounties = async () => {
    setLoading(true);

    let query = supabase
      .from('bounties')
      .select(`
        id,
        title,
        description,
        reward_amount,
        reward_token,
        deadline,
        is_featured,
        categories (name, icon)
      `)
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    if (searchTerm) {
      query = query.ilike('title', `%${searchTerm}%`);
    }

    const { data } = await query;

    if (data) {
      const bountiesWithCounts = await Promise.all(
        data.map(async (bounty: any) => {
          const { count } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('bounty_id', bounty.id);

          return {
            id: bounty.id,
            title: bounty.title,
            description: bounty.description,
            reward_amount: bounty.reward_amount,
            reward_token: bounty.reward_token,
            deadline: bounty.deadline,
            category_name: bounty.categories?.name || 'General',
            category_icon: bounty.categories?.icon || 'Briefcase',
            is_featured: bounty.is_featured,
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

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f6fa] to-[#e5e7eb] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explorar Retos</h1>
          <p className="text-gray-600">Descubre oportunidades para poner a prueba tu talento</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar retos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-64 pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bounties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No se encontraron retos</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bounties.map((bounty) => (
              <div
                key={bounty.id}
                onClick={() => onNavigate('bounty', { bountyId: bounty.id })}
                className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer border-2 ${
                  bounty.is_featured ? 'border-[#00FFB2]' : 'border-transparent'
                }`}
              >
                {bounty.is_featured && (
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-[#00FFB2] to-[#00FFC6] text-[#232946] text-xs font-bold rounded-full mb-3">
                    DESTACADO
                  </div>
                )}

                <div className="text-sm text-[#2563eb] font-semibold mb-2">{bounty.category_name}</div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{bounty.title}</h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{bounty.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock size={16} />
                    <span>{getTimeRemaining(bounty.deadline)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {bounty.submission_count} {bounty.submission_count === 1 ? 'propuesta' : 'propuestas'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500">Recompensa</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-[#2563eb] to-[#00FFB2] bg-clip-text text-transparent flex items-center gap-1">
                      <Trophy size={20} className="text-[#00FFB2]" />
                      {bounty.reward_amount} {bounty.reward_token}
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
