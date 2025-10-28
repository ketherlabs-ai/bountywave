import { useState, useEffect } from 'react';
import { Clock, DollarSign, FileText, Tag, AlertCircle, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SmartContractBadge } from './SmartContractBadge';

interface CreateBountyProps {
  onNavigate: (view: string) => void;
}

export function CreateBounty({ onNavigate }: CreateBountyProps) {
  const { userId, walletAddress, connectWallet } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    rewardAmount: '',
    rewardToken: 'ETH',
    deadline: '',
    isFeatured: false,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId || !walletAddress) {
      setError('Por favor conecta tu wallet para publicar un reto');
      return;
    }

    if (!formData.title || !formData.description || !formData.categoryId || !formData.rewardAmount || !formData.deadline) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase.from('bounties').insert({
        creator_id: userId,
        title: formData.title,
        description: formData.description,
        category_id: formData.categoryId,
        reward_amount: parseFloat(formData.rewardAmount),
        reward_token: formData.rewardToken,
        deadline: new Date(formData.deadline).toISOString(),
        is_featured: formData.isFeatured,
        status: 'active',
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        onNavigate('explorer');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al crear el reto');
    } finally {
      setLoading(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-primary-400" size={48} />
            <h2 className="text-2xl font-bold text-white mb-4">Wallet no conectada</h2>
            <p className="text-neutral-400 mb-6">
              Necesitas conectar tu wallet para publicar un reto
            </p>
            <button
              onClick={connectWallet}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
            >
              Conectar Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-12 bg-gradient-to-b from-accent-400 to-primary-400 rounded-full" />
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight">
              Publicar Nuevo Reto
            </h1>
          </div>
          <p className="text-xl text-neutral-400 ml-7">Crea un desafío y encuentra las mejores soluciones</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Título del Reto
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Desarrollar una app móvil para..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Descripción Completa
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el reto, requisitos, criterios de evaluación..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Tag size={16} />
                  Categoría
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                >
                  <option value="" className="bg-neutral-900">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-neutral-900">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <DollarSign size={16} />
                    Recompensa
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rewardAmount}
                    onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                    placeholder="0.5"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Token</label>
                  <select
                    value={formData.rewardToken}
                    onChange={(e) => setFormData({ ...formData, rewardToken: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  >
                    <option value="ETH" className="bg-neutral-900">ETH</option>
                    <option value="USDC" className="bg-neutral-900">USDC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Fecha Límite
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-5 h-5 text-primary-500 border-white/10 rounded focus:ring-primary-500"
                />
                <label htmlFor="featured" className="text-sm text-neutral-300">
                  Destacar este reto (mayor visibilidad)
                </label>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                  Reto creado exitosamente! Redirigiendo...
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-primary-500/50 transition-all disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Publicar Reto'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Vista Previa</h3>

              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-6">
                <div className="text-sm text-accent-400 font-semibold mb-2">
                  {formData.categoryId
                    ? categories.find((c) => c.id === formData.categoryId)?.name
                    : 'Categoría'}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{formData.title || 'Título del reto'}</h4>
                <p className="text-neutral-400 text-sm mb-4">{formData.description || 'Descripción del reto...'}</p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-neutral-500">Recompensa</div>
                    <div className="text-2xl font-bold text-accent-400">
                      {formData.rewardAmount || '0'} {formData.rewardToken}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-neutral-500">Plazo</div>
                    <div className="text-sm text-white">
                      {formData.deadline
                        ? new Date(formData.deadline).toLocaleDateString()
                        : 'Sin definir'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-neutral-400">
              <p>• Tu reto será visible para miles de solucionadores globales</p>
              <p>• Recibirás propuestas de talento verificado en la plataforma</p>
              <p>• El pago se ejecuta automáticamente al seleccionar un ganador</p>
              <p>• Una comisión del 5% se aplica sobre la recompensa</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-accent-400" size={24} />
                <h4 className="text-lg font-bold text-white">Smart Contract</h4>
              </div>
              <SmartContractBadge compact={false} status="pending" />
              <div className="mt-4 text-sm text-neutral-400 space-y-2">
                <p className="font-semibold text-white">Al publicar, el smart contract:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Bloqueará la recompensa en custodia segura</li>
                  <li>Registrará el reto en Scroll blockchain</li>
                  <li>Permitirá votación transparente y verificable</li>
                  <li>Ejecutará el pago automático al ganador</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
