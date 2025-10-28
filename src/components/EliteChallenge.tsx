import { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Coins, Clock, Cpu, Users, Layers, Server, Terminal, Lock, Code, Rocket, CheckCircle, AlertTriangle, ExternalLink, Upload, FileText, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EliteChallengeProps {
  onNavigate: (view: string) => void;
  challengeId?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  difficulty: string;
  status: string;
  deadline: string;
  max_participants: number;
  current_participants: number;
  total_submissions: number;
  timelock_hours: number;
  requires_audit: boolean;
  stack_required: string[];
  skills_required: string[];
}

interface TechDetails {
  requirements: string;
  deliverables: string[];
  evaluation_criteria: string[];
  resources: Array<{ title: string; url: string }>;
}

interface Participation {
  status: string;
  submission_url?: string;
  submission_description?: string;
}

export function EliteChallenge({ onNavigate, challengeId }: EliteChallengeProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [techDetails, setTechDetails] = useState<TechDetails | null>(null);
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'submission'>('overview');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    loadChallenge();
    loadTechDetails();
    checkParticipation();
  }, [challengeId]);

  useEffect(() => {
    if (challenge?.deadline) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const deadline = new Date(challenge.deadline).getTime();
        const distance = deadline - now;

        if (distance < 0) {
          setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
          clearInterval(interval);
          return;
        }

        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeRemaining({ hours, minutes, seconds });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [challenge]);

  const loadChallenge = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('elite_challenges')
      .select('*')
      .eq('status', 'active')
      .single();

    if (data) {
      setChallenge(data);
    }
    setLoading(false);
  };

  const loadTechDetails = async () => {
    const { data } = await supabase
      .from('elite_challenge_tech_details')
      .select('*')
      .limit(1)
      .single();

    if (data) {
      setTechDetails(data);
    }
  };

  const checkParticipation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('elite_challenge_participants')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setParticipation(data);
      setIsRegistered(true);
      setSubmissionUrl(data.submission_url || '');
      setSubmissionDescription(data.submission_description || '');
    }
  };

  const handleRegister = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !challenge) {
      alert('Debes iniciar sesión para participar');
      return;
    }

    const { error } = await supabase
      .from('elite_challenge_participants')
      .insert({
        challenge_id: challenge.id,
        user_id: user.id,
        status: 'registered'
      });

    if (error) {
      console.error('Error registering:', error);
      alert('Error al registrarse. Es posible que ya estés registrado.');
    } else {
      setIsRegistered(true);
      alert('¡Te has registrado exitosamente!');
      loadChallenge();
    }
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !challenge) return;

    if (!submissionUrl || !submissionDescription) {
      alert('Por favor completa todos los campos');
      return;
    }

    const { error } = await supabase
      .from('elite_challenge_participants')
      .update({
        status: 'submitted',
        submission_url: submissionUrl,
        submission_description: submissionDescription,
        submission_date: new Date().toISOString()
      })
      .eq('challenge_id', challenge.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error submitting:', error);
      alert('Error al enviar la solución');
    } else {
      alert('¡Solución enviada exitosamente!');
      checkParticipation();
      loadChallenge();
    }
  };

  if (loading || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">Cargando Elite Challenge...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-emerald-500/10 blur-3xl"></div>

          <div className="relative bg-gradient-to-br from-neutral-900/95 via-neutral-950/95 to-black/95 rounded-3xl p-8 md:p-12 border border-primary-500/20 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-500/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent-500/20 to-transparent rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur-lg animate-pulse"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Brain className="w-9 h-9 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="text-red-400 text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Elite Challenge
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold">{challenge.title}</h1>
                    </div>
                  </div>
                  <p className="text-neutral-400 text-lg max-w-3xl">
                    {challenge.description}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-500/40">
                    <Coins className="w-7 h-7 text-emerald-400" />
                    <div>
                      <div className="text-emerald-400 text-3xl font-black">${challenge.reward_amount.toLocaleString()}</div>
                      <div className="text-emerald-400/70 text-xs font-semibold">USDC Reward</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 rounded-lg border border-red-500/30">
                    <Clock className="w-5 h-5 text-red-400" />
                    <div className="text-white font-mono font-bold">
                      {String(timeRemaining.hours).padStart(2, '0')}:{String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-primary-950/50 to-primary-900/30 p-4 rounded-xl border border-primary-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-5 h-5 text-primary-400" />
                    <span className="text-primary-300 text-xs font-bold uppercase">Complejidad</span>
                  </div>
                  <div className="text-white text-xl font-bold mb-2">{challenge.difficulty}</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex-1 h-1.5 bg-primary-500 rounded-full"></div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-accent-950/50 to-accent-900/30 p-4 rounded-xl border border-accent-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-accent-400" />
                    <span className="text-accent-300 text-xs font-bold uppercase">Competidores</span>
                  </div>
                  <div className="text-white text-xl font-bold mb-2">{challenge.current_participants}/{challenge.max_participants}</div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-500 to-accent-400"
                      style={{ width: `${(challenge.current_participants / challenge.max_participants) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 p-4 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 text-xs font-bold uppercase">Submissions</span>
                  </div>
                  <div className="text-white text-xl font-bold mb-2">{challenge.total_submissions} Live</div>
                  <div className="text-emerald-400 text-xs font-semibold">En revisión</div>
                </div>

                <div className="bg-gradient-to-br from-orange-950/50 to-orange-900/30 p-4 rounded-xl border border-orange-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-300 text-xs font-bold uppercase">Timelock</span>
                  </div>
                  <div className="text-white text-xl font-bold mb-2">{challenge.timelock_hours}h</div>
                  <div className="text-orange-400 text-xs font-semibold">Duración mínima</div>
                </div>
              </div>

              <div className="flex gap-2 mb-8 border-b border-neutral-800">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 font-bold transition-colors relative ${
                    activeTab === 'overview'
                      ? 'text-primary-400'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Overview
                  {activeTab === 'overview' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('technical')}
                  className={`px-6 py-3 font-bold transition-colors relative ${
                    activeTab === 'technical'
                      ? 'text-primary-400'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Detalles Técnicos
                  {activeTab === 'technical' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"></div>
                  )}
                </button>
                {isRegistered && (
                  <button
                    onClick={() => setActiveTab('submission')}
                    className={`px-6 py-3 font-bold transition-colors relative ${
                      activeTab === 'submission'
                        ? 'text-primary-400'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    Mi Participación
                    {activeTab === 'submission' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"></div>
                    )}
                  </button>
                )}
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-neutral-950/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800">
                    <div className="text-neutral-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      Stack Tecnológico Requerido
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {challenge.stack_required.map((tech, i) => (
                        <span key={i} className="px-4 py-2 bg-primary-500/10 text-primary-300 text-sm font-bold rounded-lg border border-primary-500/30">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-neutral-950/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800">
                    <div className="text-neutral-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Skills Necesarias
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {challenge.skills_required.map((skill, i) => (
                        <span key={i} className="px-4 py-2 bg-accent-500/10 text-accent-300 text-sm font-bold rounded-lg border border-accent-500/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {challenge.requires_audit && (
                    <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
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
                  )}

                  {!isRegistered && (
                    <button
                      onClick={handleRegister}
                      className="w-full px-8 py-5 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white rounded-xl font-black text-lg hover:from-primary-500 hover:via-primary-400 hover:to-accent-400 transition-all hover:scale-105 shadow-lg shadow-primary-500/50 flex items-center justify-center gap-3 group"
                    >
                      <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      Registrarme en este Challenge
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'technical' && techDetails && (
                <div className="space-y-6">
                  <div className="bg-neutral-950/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-400" />
                      Requisitos Detallados
                    </h3>
                    <p className="text-neutral-300 leading-relaxed">{techDetails.requirements}</p>
                  </div>

                  <div className="bg-neutral-950/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      Entregables
                    </h3>
                    <ul className="space-y-3">
                      {techDetails.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          </div>
                          <span className="text-neutral-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-neutral-950/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent-400" />
                      Criterios de Evaluación
                    </h3>
                    <ul className="space-y-3">
                      {techDetails.evaluation_criteria.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-accent-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-accent-400 font-bold text-xs">{i + 1}</span>
                          </div>
                          <span className="text-neutral-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-neutral-950/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-primary-400" />
                      Recursos Útiles
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {techDetails.resources.map((resource, i) => (
                        <a
                          key={i}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-primary-500/10 hover:bg-primary-500/20 rounded-xl border border-primary-500/30 hover:border-primary-500/50 transition-all group"
                        >
                          <span className="text-primary-300 font-semibold">{resource.title}</span>
                          <ExternalLink className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'submission' && isRegistered && (
                <div className="space-y-6">
                  <div className="bg-neutral-950/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-primary-400" />
                      Enviar Solución
                    </h3>

                    {participation?.status === 'submitted' ? (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Solución Enviada</span>
                        </div>
                        <p className="text-neutral-300 text-sm mb-3">{participation.submission_description}</p>
                        <a
                          href={participation.submission_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
                        >
                          Ver en GitHub
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="block text-sm font-semibold text-neutral-300 mb-2">
                              URL del Repositorio (GitHub, GitLab, etc.)
                            </label>
                            <input
                              type="url"
                              value={submissionUrl}
                              onChange={(e) => setSubmissionUrl(e.target.value)}
                              placeholder="https://github.com/usuario/proyecto"
                              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:border-primary-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-neutral-300 mb-2">
                              Descripción de la Solución
                            </label>
                            <textarea
                              value={submissionDescription}
                              onChange={(e) => setSubmissionDescription(e.target.value)}
                              placeholder="Describe tu implementación, decisiones técnicas, y cómo cumple con los requisitos..."
                              rows={6}
                              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:border-primary-500 focus:outline-none resize-none"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl mb-6">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div className="text-neutral-400 text-sm">
                              <p className="font-bold text-yellow-500 mb-1">Antes de enviar:</p>
                              <ul className="list-disc list-inside space-y-1">
                                <li>Asegúrate de que todos los entregables estén incluidos</li>
                                <li>El código debe estar bien documentado</li>
                                <li>Incluye instrucciones de instalación y uso</li>
                                <li>Los tests deben pasar exitosamente</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleSubmit}
                          className="w-full px-8 py-5 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white rounded-xl font-black text-lg hover:from-primary-500 hover:via-primary-400 hover:to-accent-400 transition-all hover:scale-105 shadow-lg shadow-primary-500/50 flex items-center justify-center gap-3 group"
                        >
                          <Upload className="w-6 h-6 group-hover:translate-y-[-2px] transition-transform" />
                          Enviar Solución
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
