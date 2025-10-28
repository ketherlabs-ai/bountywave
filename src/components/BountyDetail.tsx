import { useState, useEffect } from 'react';
import { Clock, User, FileText, Send, Trophy, ArrowLeft, Shield, Calendar, Target, CheckCircle, Award, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SmartContractBadge } from './SmartContractBadge';
import { generateAnonymousVoteProof, verifyAnonymousVoteProof, generateNullifier, checkNullifier, markNullifierUsed, serializeProof } from '../lib/zkproof/utils';

interface BountyDetailProps {
  bountyId: string;
  onNavigate: (view: string) => void;
}

interface BountyData {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  reward_token: string;
  deadline: string;
  status: string;
  category_name: string;
  creator_username: string;
  difficulty_level: string;
  contract_address?: string;
}

interface Submission {
  id: string;
  content: string;
  created_at: string;
  submitter_username: string;
  vote_count: number;
  status: string;
}

export function BountyDetail({ bountyId, onNavigate }: BountyDetailProps) {
  const { userId, walletAddress } = useAuth();
  const [bounty, setBounty] = useState<BountyData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadBountyData();
    loadSubmissions();
  }, [bountyId]);

  const loadBountyData = async () => {
    const { data } = await supabase
      .from('bounties')
      .select(`
        id, title, description, reward_amount, reward_token, deadline, status,
        difficulty_level, contract_address,
        categories (name),
        profiles!bounties_creator_id_fkey (username)
      `)
      .eq('id', bountyId)
      .single();

    if (data) {
      setBounty({
        ...data,
        category_name: data.categories?.name || 'General',
        creator_username: data.profiles?.username || 'Unknown',
      });
    }
    setLoading(false);
  };

  const loadSubmissions = async () => {
    const { data } = await supabase
      .from('submissions')
      .select(`
        id, content, created_at, vote_count, status,
        profiles!submissions_submitter_id_fkey (username)
      `)
      .eq('bounty_id', bountyId)
      .order('vote_count', { ascending: false });

    if (data) {
      setSubmissions(
        data.map((s: any) => ({
          ...s,
          submitter_username: s.profiles?.username || 'Unknown',
        }))
      );
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      setError('Por favor conecta tu wallet para participar');
      return;
    }

    if (!submissionContent.trim()) {
      setError('Por favor escribe tu solución');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: submitError } = await supabase.from('submissions').insert({
        bounty_id: bountyId,
        submitter_id: userId,
        content: submissionContent,
      });

      if (submitError) throw submitError;

      setSuccess('Solución enviada exitosamente');
      setSubmissionContent('');
      setShowSubmitForm(false);
      loadSubmissions();
    } catch (err: any) {
      setError(err.message || 'Error al enviar solución');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (submissionId: string) => {
    if (!userId) {
      setError('Por favor conecta tu wallet para votar');
      return;
    }

    try {
      const nullifier = await generateNullifier(userId, submissionId);

      if (!checkNullifier(nullifier)) {
        setError('Ya has votado por esta propuesta');
        return;
      }

      const zkProof = await generateAnonymousVoteProof(userId, submissionId, 1);
      const verificationResult = await verifyAnonymousVoteProof(zkProof);

      if (!verificationResult.valid) {
        setError('Proof de votación inválido');
        return;
      }

      const serializedProof = serializeProof(zkProof);

      const { error: voteError } = await supabase.from('votes').insert({
        submission_id: submissionId,
        voter_id: userId,
        vote_proof: serializedProof,
      });

      if (voteError) throw voteError;

      markNullifierUsed(nullifier);

      await supabase
        .from('submissions')
        .update({ vote_count: supabase.raw('vote_count + 1') })
        .eq('id', submissionId);

      setSuccess('Voto registrado exitosamente');
      loadSubmissions();
    } catch (err: any) {
      if (err.code === '23505') {
        setError('Ya has votado por esta propuesta');
      } else {
        setError('Error al votar');
      }
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return { text: 'Finalizado', expired: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 7) return { text: `${days} días restantes`, expired: false };
    if (days > 0) return { text: `${days}d ${hours}h restantes`, expired: false };
    return { text: `${hours}h restantes`, expired: false };
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'from-green-500 to-emerald-500';
      case 'intermediate': return 'from-yellow-500 to-orange-500';
      case 'advanced': return 'from-orange-500 to-red-500';
      case 'expert': return 'from-red-500 to-pink-500';
      default: return 'from-neutral-500 to-neutral-600';
    }
  };

  const getDifficultyLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
      expert: 'Experto',
    };
    return labels[level] || level;
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

  if (!bounty) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-20">
        <div className="max-w-4xl mx-auto px-4 text-center py-20">
          <p className="text-neutral-400">Reto no encontrado</p>
        </div>
      </div>
    );
  }

  const timeInfo = getTimeRemaining(bounty.deadline);

  return (
    <div className="min-h-screen bg-neutral-950 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('explorer')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 font-medium transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Volver al explorador
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-fade-in">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 animate-fade-in">
            <CheckCircle size={18} className="text-green-400" />
            <span className="text-green-400 text-sm">{success}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1.5 bg-primary-500/20 text-primary-400 text-sm font-semibold rounded-lg">
                  {bounty.category_name}
                </span>
                <span className={`px-3 py-1.5 bg-gradient-to-r ${getDifficultyColor(bounty.difficulty_level)} text-white text-sm font-semibold rounded-lg`}>
                  {getDifficultyLabel(bounty.difficulty_level)}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
                {bounty.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400 mb-6">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>Por {bounty.creator_username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span className={timeInfo.expired ? 'text-red-400' : ''}>
                    {timeInfo.text}
                  </span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {bounty.description}
                </p>
              </div>
            </div>

            {bounty.contract_address && (
              <SmartContractBadge
                contractAddress={bounty.contract_address}
                status="confirmed"
                network="scroll"
                showDetails={true}
              />
            )}

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText size={24} className="text-primary-400" />
                  Soluciones Propuestas
                  <span className="px-2 py-1 bg-white/5 text-neutral-400 text-sm font-semibold rounded-lg">
                    {submissions.length}
                  </span>
                </h2>
                {walletAddress && (
                  <button
                    onClick={() => setShowSubmitForm(!showSubmitForm)}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
                  >
                    Participar
                  </button>
                )}
              </div>

              {showSubmitForm && (
                <div className="mb-6 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 animate-fade-in">
                  <textarea
                    placeholder="Describe tu solución al reto..."
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                    >
                      <Send size={18} />
                      {submitting ? 'Enviando...' : 'Enviar Solución'}
                    </button>
                    <button
                      onClick={() => setShowSubmitForm(false)}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="text-neutral-600" size={32} />
                    </div>
                    <p className="text-neutral-500">
                      Aún no hay soluciones propuestas
                    </p>
                    <p className="text-neutral-600 text-sm mt-1">
                      Sé el primero en participar
                    </p>
                  </div>
                ) : (
                  submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="group p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                            {submission.submitter_username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {submission.submitter_username}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {new Date(submission.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleVote(submission.id)}
                          disabled={!walletAddress}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-primary-500/20 border border-white/10 hover:border-primary-500/50 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 group"
                        >
                          <Trophy size={16} className="text-accent-400 group-hover:scale-110 transition-transform" />
                          <span className="text-white">{submission.vote_count}</span>
                        </button>
                      </div>
                      <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                        {submission.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
              <div className="bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
                <div className="mb-4">
                  <Trophy size={48} className="text-accent-400 mx-auto mb-2" />
                  <div className="text-sm text-neutral-400 mb-1">Recompensa Total</div>
                </div>
                <div className="text-5xl font-bold text-white mb-2">
                  {bounty.reward_amount}
                </div>
                <div className="text-lg font-semibold text-accent-400">
                  {bounty.reward_token}
                </div>
              </div>

              <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Target size={18} className="text-primary-400" />
                  Detalles del Reto
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-neutral-400">Estado</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 font-semibold rounded-lg text-xs">
                      {bounty.status === 'active' ? 'Activo' : bounty.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-neutral-400">Propuestas</span>
                    <span className="text-white font-semibold">{submissions.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-neutral-400">Deadline</span>
                    <span className={`text-white font-semibold ${timeInfo.expired ? 'text-red-400' : ''}`}>
                      {new Date(bounty.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {!walletAddress && (
                <div className="mt-6 p-6 bg-primary-500/10 border border-primary-500/20 rounded-2xl text-center">
                  <Shield size={32} className="text-primary-400 mx-auto mb-3" />
                  <p className="text-sm text-neutral-300 mb-3">
                    Conecta tu wallet para participar en este reto
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
