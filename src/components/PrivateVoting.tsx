import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Lock, Users, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  generateAnonymousVoteProof,
  verifyAnonymousVoteProof,
  hasUserVoted,
  generateNullifier,
  checkNullifier,
  markNullifierUsed,
  generateReputationProof,
  verifyReputationProof
} from '../lib/zkproof/utils';

interface Submission {
  id: string;
  title: string;
  submitter_id: string;
  submitter: {
    username: string;
    wallet_address: string;
  };
  votes_count: number;
  average_score: number;
}

interface PrivateVotingProps {
  bountyId: string;
}

export function PrivateVoting({ bountyId }: PrivateVotingProps) {
  const { userId, walletAddress } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingFor, setVotingFor] = useState<string | null>(null);
  const [voteScore, setVoteScore] = useState(5);
  const [showProof, setShowProof] = useState(false);
  const [proofDetails, setProofDetails] = useState<any>(null);
  const [userReputation, setUserReputation] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSubmissions();
    loadUserReputation();
  }, [bountyId]);

  const loadUserReputation = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('profiles')
      .select('reputation_score')
      .eq('id', userId)
      .single();

    if (data) setUserReputation(data.reputation_score || 0);
  };

  const loadSubmissions = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('submissions')
      .select(`
        id,
        title,
        submitter_id,
        profiles:submitter_id (
          username,
          wallet_address
        )
      `)
      .eq('bounty_id', bountyId)
      .eq('status', 'pending');

    if (data) {
      const enriched = await Promise.all(
        data.map(async (sub: any) => {
          const { data: votes } = await supabase
            .from('votes')
            .select('score')
            .eq('submission_id', sub.id);

          const votesCount = votes?.length || 0;
          const avgScore = votes && votes.length > 0
            ? votes.reduce((sum, v) => sum + v.score, 0) / votes.length
            : 0;

          return {
            id: sub.id,
            title: sub.title,
            submitter_id: sub.submitter_id,
            submitter: {
              username: sub.profiles?.username || 'Unknown',
              wallet_address: sub.profiles?.wallet_address || ''
            },
            votes_count: votesCount,
            average_score: avgScore
          };
        })
      );

      setSubmissions(enriched);
    }

    setLoading(false);
  };

  const handleVote = async (submissionId: string) => {
    if (!userId || !walletAddress) {
      setMessage({ type: 'error', text: 'Conecta tu wallet para votar' });
      return;
    }

    setVotingFor(submissionId);

    try {
      const alreadyVoted = await hasUserVoted(userId, submissionId);
      if (alreadyVoted) {
        setMessage({ type: 'error', text: 'Ya has votado en esta propuesta' });
        setVotingFor(null);
        return;
      }

      const minReputation = 10;
      if (userReputation < minReputation) {
        setMessage({
          type: 'error',
          text: `Necesitas al menos ${minReputation} puntos de reputación para votar`
        });
        setVotingFor(null);
        return;
      }

      const reputationProof = await generateReputationProof(
        userId,
        userReputation,
        minReputation
      );

      const reputationVerification = await verifyReputationProof(reputationProof, minReputation);
      if (!reputationVerification.valid) {
        setMessage({ type: 'error', text: 'Proof de reputación inválido' });
        setVotingFor(null);
        return;
      }

      const nullifier = await generateNullifier(userId, submissionId);
      if (!checkNullifier(nullifier)) {
        setMessage({ type: 'error', text: 'Nullifier ya usado - doble votación detectada' });
        setVotingFor(null);
        return;
      }

      const voteProof = await generateAnonymousVoteProof(userId, submissionId, voteScore);

      const proofVerification = await verifyAnonymousVoteProof(voteProof);
      if (!proofVerification.valid) {
        setMessage({ type: 'error', text: 'Proof de votación inválido' });
        setVotingFor(null);
        return;
      }

      markNullifierUsed(nullifier);

      const { error } = await supabase.from('votes').insert({
        submission_id: submissionId,
        voter_id: userId,
        score: voteScore,
        vote_proof: voteProof.proof,
        nullifier: nullifier
      });

      if (error) throw error;

      setProofDetails({
        voteProof,
        reputationProof,
        nullifier,
        submissionId
      });
      setShowProof(true);
      setMessage({ type: 'success', text: '¡Voto registrado con privacidad total!' });
      loadSubmissions();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al registrar voto' });
    } finally {
      setVotingFor(null);
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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-purple-400" size={32} />
          <div>
            <h2 className="text-3xl font-bold text-white">Votación Privada con zk-SNARK</h2>
            <p className="text-neutral-400">Tu voto es anónimo y verificable on-chain</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
            <Lock className="text-purple-400 mb-2" size={24} />
            <div className="text-sm text-neutral-400 mb-1">Privacidad Total</div>
            <div className="text-lg font-bold text-white">Zero-Knowledge Proof</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
            <Users className="text-blue-400 mb-2" size={24} />
            <div className="text-sm text-neutral-400 mb-1">Tu Reputación</div>
            <div className="text-lg font-bold text-accent-400">{userReputation} puntos</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
            <TrendingUp className="text-green-400 mb-2" size={24} />
            <div className="text-sm text-neutral-400 mb-1">Propuestas</div>
            <div className="text-lg font-bold text-white">{submissions.length}</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <h4 className="text-sm font-bold text-purple-300 mb-2">🔐 Cómo Funciona</h4>
          <ul className="text-xs text-neutral-300 space-y-1">
            <li>• Tu identidad se oculta con zero-knowledge proofs</li>
            <li>• Se verifica tu reputación sin revelarla</li>
            <li>• Nullifiers previenen doble votación</li>
            <li>• Todo verificable on-chain pero anónimo</li>
          </ul>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span className="font-semibold">{message.text}</span>
          </div>
        </div>
      )}

      {showProof && proofDetails && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="text-purple-400" />
              Proof Generado
            </h3>
            <button
              onClick={() => setShowProof(false)}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-neutral-400 mb-1">Vote Proof (hash)</div>
              <div className="text-white font-mono text-xs break-all">
                {proofDetails.voteProof.proof}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-neutral-400 mb-1">Reputation Proof</div>
              <div className="text-white font-mono text-xs break-all">
                {proofDetails.reputationProof.proof}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-neutral-400 mb-1">Nullifier (anti double-vote)</div>
              <div className="text-white font-mono text-xs break-all">
                {proofDetails.nullifier}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-neutral-400 mb-1">Hashed Voter ID</div>
              <div className="text-white font-mono text-xs break-all">
                {proofDetails.voteProof.hashedVoterId}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <p className="text-sm text-green-400">
              ✅ Tu voto fue registrado de forma anónima. Nadie puede saber quién votaste, pero todos pueden verificar que tu voto es válido.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{submission.title}</h3>
                <p className="text-sm text-neutral-400 mb-1">
                  Por: {submission.submitter.username}
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  {submission.submitter.wallet_address.slice(0, 10)}...
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent-400">{submission.average_score.toFixed(1)}</div>
                <div className="text-xs text-neutral-500">{submission.votes_count} votos</div>
              </div>
            </div>

            {userId !== submission.submitter_id && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">
                    Tu puntuación: {voteScore}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={voteScore}
                    onChange={(e) => setVoteScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <button
                  onClick={() => handleVote(submission.id)}
                  disabled={votingFor === submission.id}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                >
                  <Shield size={18} />
                  {votingFor === submission.id ? 'Generando Proof...' : 'Votar con Privacidad'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
          <Shield className="text-neutral-600 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">Sin Propuestas para Votar</h3>
          <p className="text-neutral-400">
            No hay envíos disponibles para votación en este momento
          </p>
        </div>
      )}
    </div>
  );
}
