import { useState, useEffect } from 'react';
import { Layers, CheckCircle, Clock, Users, DollarSign, ArrowRight, Plus, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Phase {
  id: string;
  phase_number: number;
  title: string;
  description: string;
  reward_amount: number;
  reward_token: string;
  deadline: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  smart_contract_address?: string;
  winner_id?: string;
  submissions_count: number;
}

interface ModularBountyProps {
  bountyId: string;
  onNavigate: (view: string, data?: any) => void;
}

export function ModularBounty({ bountyId, onNavigate }: ModularBountyProps) {
  const { userId } = useAuth();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const [newPhase, setNewPhase] = useState({
    title: '',
    description: '',
    reward_amount: '',
    deadline: '',
  });

  useEffect(() => {
    loadPhases();
    checkIfCreator();
  }, [bountyId]);

  const checkIfCreator = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('bounties')
      .select('creator_id')
      .eq('id', bountyId)
      .single();

    setIsCreator(data?.creator_id === userId);
  };

  const loadPhases = async () => {
    setLoading(true);

    const { data: phasesData } = await supabase
      .from('bounty_phases')
      .select('*')
      .eq('bounty_id', bountyId)
      .order('phase_number');

    if (phasesData) {
      const enrichedPhases = await Promise.all(
        phasesData.map(async (phase) => {
          const { count } = await supabase
            .from('phase_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('phase_id', phase.id);

          return {
            ...phase,
            submissions_count: count || 0,
          };
        })
      );

      setPhases(enrichedPhases as Phase[]);
    }

    setLoading(false);
  };

  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const nextPhaseNumber = phases.length + 1;

    const { error } = await supabase.from('bounty_phases').insert({
      bounty_id: bountyId,
      phase_number: nextPhaseNumber,
      title: newPhase.title,
      description: newPhase.description,
      reward_amount: parseFloat(newPhase.reward_amount),
      reward_token: 'ETH',
      deadline: new Date(newPhase.deadline).toISOString(),
      status: nextPhaseNumber === 1 ? 'active' : 'pending',
    });

    if (!error) {
      setNewPhase({ title: '', description: '', reward_amount: '', deadline: '' });
      setShowAddPhase(false);
      loadPhases();
    }
  };

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'from-green-400 to-emerald-500';
      case 'completed': return 'from-blue-400 to-cyan-500';
      case 'pending': return 'from-yellow-400 to-orange-500';
      case 'cancelled': return 'from-red-400 to-pink-500';
      default: return 'from-neutral-600 to-neutral-700';
    }
  };

  const getPhaseStatusText = (status: string) => {
    switch (status) {
      case 'active': return '🟢 Activa';
      case 'completed': return '✅ Completada';
      case 'pending': return '⏳ Pendiente';
      case 'cancelled': return '❌ Cancelada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary-500/20 rounded-full" />
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0" />
        </div>
      </div>
    );
  }

  const totalReward = phases.reduce((sum, phase) => sum + phase.reward_amount, 0);
  const completedPhases = phases.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 backdrop-blur-xl border border-primary-500/30 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Layers className="text-primary-400" size={32} />
          <div>
            <h2 className="text-3xl font-bold text-white">Reto Modular Multi-Etapa</h2>
            <p className="text-neutral-400">Progresa por fases, gana recompensas parciales</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
            <div className="text-sm text-neutral-400 mb-1">Total Fases</div>
            <div className="text-3xl font-bold text-white">{phases.length}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
            <div className="text-sm text-neutral-400 mb-1">Completadas</div>
            <div className="text-3xl font-bold text-accent-400">{completedPhases}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
            <div className="text-sm text-neutral-400 mb-1">Recompensa Total</div>
            <div className="text-3xl font-bold text-primary-400">{totalReward.toFixed(2)} ETH</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
            <div className="text-sm text-neutral-400 mb-1">Progreso</div>
            <div className="text-3xl font-bold text-white">
              {phases.length > 0 ? Math.round((completedPhases / phases.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {phases.length > 0 && (
          <div className="mt-6">
            <div className="relative">
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                  style={{ width: `${phases.length > 0 ? (completedPhases / phases.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {isCreator && (
        <button
          onClick={() => setShowAddPhase(!showAddPhase)}
          className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary-500/50 transition-all"
        >
          <Plus size={20} />
          Agregar Nueva Fase
        </button>
      )}

      {showAddPhase && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Nueva Fase</h3>
          <form onSubmit={handleAddPhase} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Título de la Fase</label>
              <input
                type="text"
                value={newPhase.title}
                onChange={(e) => setNewPhase({ ...newPhase, title: e.target.value })}
                placeholder="Ej: Fase 1 - Research y Análisis"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Descripción</label>
              <textarea
                value={newPhase.description}
                onChange={(e) => setNewPhase({ ...newPhase, description: e.target.value })}
                placeholder="Describe los requisitos y entregables de esta fase..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Recompensa (ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPhase.reward_amount}
                  onChange={(e) => setNewPhase({ ...newPhase, reward_amount: e.target.value })}
                  placeholder="0.5"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Deadline</label>
                <input
                  type="datetime-local"
                  value={newPhase.deadline}
                  onChange={(e) => setNewPhase({ ...newPhase, deadline: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Crear Fase
              </button>
              <button
                type="button"
                onClick={() => setShowAddPhase(false)}
                className="px-6 py-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className="group bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-primary-500/50 rounded-2xl p-6 transition-all duration-300"
          >
            <div className="flex items-start gap-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${getPhaseStatusColor(phase.status)} rounded-xl flex items-center justify-center text-white text-2xl font-bold shrink-0`}>
                {phase.status === 'completed' ? <CheckCircle size={32} /> : phase.phase_number}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{phase.title}</h3>
                    <p className="text-neutral-400 text-sm">{phase.description}</p>
                  </div>
                  <span className={`px-3 py-1 bg-gradient-to-r ${getPhaseStatusColor(phase.status)} rounded-lg text-white text-sm font-bold whitespace-nowrap`}>
                    {getPhaseStatusText(phase.status)}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={16} className="text-accent-400" />
                    <span className="text-white font-bold">{phase.reward_amount} ETH</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-neutral-400" />
                    <span className="text-neutral-300">
                      {new Date(phase.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-primary-400" />
                    <span className="text-neutral-300">{phase.submissions_count} envíos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target size={16} className="text-accent-400" />
                    <span className="text-neutral-300">Fase {phase.phase_number}</span>
                  </div>
                </div>

                {phase.status === 'active' && (
                  <button
                    onClick={() => onNavigate('phase-submit', { phaseId: phase.id })}
                    className="px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                  >
                    Enviar Solución
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {phases.length === 0 && !showAddPhase && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
          <Layers className="text-neutral-600 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">Sin Fases Aún</h3>
          <p className="text-neutral-400">
            {isCreator
              ? 'Crea la primera fase para comenzar este reto modular'
              : 'Este reto aún no tiene fases disponibles'}
          </p>
        </div>
      )}
    </div>
  );
}
