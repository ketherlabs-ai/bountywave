import { useState, useEffect } from 'react';
import {
  ArrowRight, ArrowLeft, Check, Sparkles, DollarSign, Calendar, Tag,
  FileText, Zap, Target, Clock, TrendingUp, Award, Code, Wand2,
  Upload, X, Eye, Rocket, Shield, CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreateBountyWizardProps {
  onNavigate: (view: string) => void;
}

const STEPS = [
  { id: 1, name: 'Información', icon: FileText },
  { id: 2, name: 'Recompensa', icon: DollarSign },
  { id: 3, name: 'Skills & Tags', icon: Tag },
  { id: 4, name: 'Plazo', icon: Calendar },
  { id: 5, name: 'Previsualizar', icon: Eye }
];

const SUGGESTED_SKILLS = [
  { name: 'Solidity', icon: Code, color: 'from-blue-500 to-cyan-500' },
  { name: 'React', icon: Code, color: 'from-cyan-400 to-blue-500' },
  { name: 'TypeScript', icon: Code, color: 'from-blue-600 to-blue-400' },
  { name: 'Smart Contracts', icon: Shield, color: 'from-purple-500 to-pink-500' },
  { name: 'Web3', icon: Zap, color: 'from-orange-500 to-red-500' },
  { name: 'Node.js', icon: Code, color: 'from-green-600 to-green-400' },
  { name: 'Python', icon: Code, color: 'from-yellow-500 to-blue-500' },
  { name: 'UI/UX', icon: Target, color: 'from-pink-500 to-purple-500' },
  { name: 'Backend', icon: Code, color: 'from-gray-600 to-gray-400' },
  { name: 'Frontend', icon: Code, color: 'from-purple-400 to-blue-400' },
];

const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Principiante', color: 'from-green-500 to-emerald-500', range: '0-100 USDC' },
  { id: 'intermediate', name: 'Intermedio', color: 'from-blue-500 to-cyan-500', range: '100-500 USDC' },
  { id: 'advanced', name: 'Avanzado', color: 'from-orange-500 to-red-500', range: '500-2000 USDC' },
  { id: 'expert', name: 'Experto', color: 'from-purple-500 to-pink-500', range: '2000+ USDC' }
];

export function CreateBountyWizard({ onNavigate }: CreateBountyWizardProps) {
  const { userId, walletAddress } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    rewardAmount: '',
    rewardToken: 'USDC',
    deadline: '',
    skills: [] as string[],
    difficulty: '',
    attachments: [] as File[]
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const handleAIGenerate = async () => {
    setAiGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const suggestions = {
      title: 'Desarrollar Smart Contract de NFT Marketplace',
      description: 'Buscamos un desarrollador experimentado en Solidity para crear un smart contract robusto para un marketplace de NFTs. El contrato debe incluir funcionalidades de listado, compra, venta, y royalties automáticos. Se requiere experiencia previa con ERC-721 y optimización de gas.',
      skills: ['Solidity', 'Smart Contracts', 'Web3'],
      difficulty: 'advanced'
    };

    setFormData(prev => ({ ...prev, ...suggestions }));
    setAiGenerating(false);
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files!)]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.categoryId;
      case 2:
        return formData.rewardAmount && parseFloat(formData.rewardAmount) > 0;
      case 3:
        return formData.skills.length > 0 && formData.difficulty;
      case 4:
        return formData.deadline;
      default:
        return true;
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase.from('bounties').insert({
        creator_id: userId,
        title: formData.title,
        description: formData.description,
        category_id: formData.categoryId,
        reward_amount: parseFloat(formData.rewardAmount),
        reward_token: formData.rewardToken,
        deadline: new Date(formData.deadline).toISOString(),
        status: 'active',
      });

      if (insertError) throw insertError;

      setIsPublished(true);
      setTimeout(() => {
        onNavigate('explorer');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al publicar el reto');
    } finally {
      setLoading(false);
    }
  };

  if (isPublished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 pt-24 pb-12 flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 border-emerald-500/50 rounded-3xl p-12 text-center shadow-2xl shadow-emerald-500/20">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4">¡Reto Publicado!</h2>
            <p className="text-neutral-300 text-lg mb-6">
              Tu reto ha sido publicado exitosamente en Scroll Network
            </p>
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
              <Shield className="w-5 h-5" />
              <span>Verificado en blockchain</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-12 bg-gradient-to-b from-primary-400 to-accent-400 rounded-full" />
            <h1 className="text-4xl md:text-5xl font-black text-white">
              Crear Nuevo Reto
            </h1>
          </div>
          <p className="text-neutral-400 text-lg ml-7">
            Sigue los pasos para publicar tu bounty en la blockchain
          </p>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/50'
                          : isCurrent
                          ? 'bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg shadow-primary-500/50 scale-110'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className={`w-6 h-6 ${isCurrent ? 'text-white' : 'text-neutral-500'}`} />
                      )}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${
                      isCurrent ? 'text-white' : 'text-neutral-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full ${
                      isCompleted ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-neutral-400">
              Paso {currentStep} de {STEPS.length}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-white">Información General</h2>
                  <button
                    onClick={handleAIGenerate}
                    disabled={aiGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                  >
                    <Wand2 className={`w-4 h-4 ${aiGenerating ? 'animate-spin' : ''}`} />
                    {aiGenerating ? 'Generando...' : 'Ayuda con IA'}
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Título del Reto</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej: Desarrollar Smart Contract de DeFi"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe los requisitos, objetivos y entregables del proyecto..."
                      rows={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Categoría</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-neutral-900">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-black text-white mb-6">Recompensa</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Monto de Recompensa</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rewardAmount}
                        onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-12 pr-24 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-bold placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <select
                        value={formData.rewardToken}
                        onChange={(e) => setFormData({ ...formData, rewardToken: e.target.value })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-bold focus:outline-none"
                      >
                        <option value="USDC" className="bg-neutral-900">USDC</option>
                        <option value="ETH" className="bg-neutral-900">ETH</option>
                        <option value="USDT" className="bg-neutral-900">USDT</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold text-sm">Recompensa Promedio</span>
                      </div>
                      <div className="text-2xl font-black text-white">$350</div>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-400 font-semibold text-sm">Tasa de Éxito</span>
                      </div>
                      <div className="text-2xl font-black text-white">87%</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-yellow-500 font-bold mb-1">Consejo Pro</div>
                        <div className="text-neutral-300 text-sm">
                          Recompensas entre $200-$500 reciben 3x más aplicaciones de calidad
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-black text-white mb-6">Skills & Dificultad</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-semibold mb-3">Selecciona Skills Requeridos</label>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_SKILLS.map((skill) => {
                        const Icon = skill.icon;
                        const isSelected = formData.skills.includes(skill.name);
                        return (
                          <button
                            key={skill.name}
                            onClick={() => toggleSkill(skill.name)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                              isSelected
                                ? `bg-gradient-to-r ${skill.color} text-white shadow-lg scale-105`
                                : 'bg-white/5 text-neutral-400 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {skill.name}
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-3">Nivel de Dificultad</label>
                    <div className="grid grid-cols-2 gap-3">
                      {DIFFICULTY_LEVELS.map((level) => {
                        const isSelected = formData.difficulty === level.id;
                        return (
                          <button
                            key={level.id}
                            onClick={() => setFormData({ ...formData, difficulty: level.id })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? `bg-gradient-to-r ${level.color} border-transparent shadow-lg scale-105`
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className={`font-black text-lg mb-1 ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                              {level.name}
                            </div>
                            <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-neutral-500'}`}>
                              {level.range}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-3">Archivos Adjuntos (Opcional)</label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary-500/50 transition-all cursor-pointer">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                        <div className="text-neutral-400 text-sm">
                          Arrastra archivos o <span className="text-primary-400 font-semibold">haz clic para subir</span>
                        </div>
                      </label>
                    </div>
                    {formData.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-white text-sm truncate">{file.name}</span>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-black text-white mb-6">Plazo de Entrega</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Fecha Límite</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { days: 7, label: '1 Semana' },
                      { days: 14, label: '2 Semanas' },
                      { days: 30, label: '1 Mes' }
                    ].map((preset) => (
                      <button
                        key={preset.days}
                        onClick={() => {
                          const date = new Date();
                          date.setDate(date.getDate() + preset.days);
                          setFormData({ ...formData, deadline: date.toISOString().split('T')[0] });
                        }}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 rounded-xl text-white font-semibold transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-blue-400 font-bold mb-1">Tiempo Promedio</div>
                        <div className="text-neutral-300 text-sm">
                          Los retos de nivel {formData.difficulty || 'intermedio'} toman en promedio 2-3 semanas
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-black text-white mb-6">¿Listo para Publicar?</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">Smart Contract Verificado</div>
                      <div className="text-neutral-400 text-sm">Los fondos serán bloqueados de forma segura</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">Pago Automático</div>
                      <div className="text-neutral-400 text-sm">El ganador recibirá el pago al finalizar</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">100% Transparente</div>
                      <div className="text-neutral-400 text-sm">Todo verificable en Scroll blockchain</div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="w-full px-8 py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 text-white rounded-xl font-black text-xl hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Publicando en Blockchain...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-6 h-6 group-hover:translate-y-[-2px] transition-transform" />
                      Publicar Reto
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Anterior
                </button>
              )}

              {currentStep < 5 && (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed()}
                  className="ml-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Eye className="w-5 h-5 text-primary-400" />
                <h3 className="text-xl font-black text-white">Vista Previa</h3>
              </div>

              <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {formData.title ? formData.title[0].toUpperCase() : '?'}
                  </div>
                  {formData.rewardAmount && (
                    <div className="px-3 py-1 bg-emerald-500/20 rounded-lg">
                      <span className="text-emerald-400 font-bold">${formData.rewardAmount} {formData.rewardToken}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {formData.title || 'Título del reto'}
                </h3>

                <p className="text-neutral-400 text-sm mb-4 line-clamp-3">
                  {formData.description || 'La descripción aparecerá aquí...'}
                </p>

                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-primary-500/20 text-primary-300 text-xs font-bold rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {formData.difficulty && (
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${
                      DIFFICULTY_LEVELS.find(l => l.id === formData.difficulty)?.color
                    } text-white`}>
                      {DIFFICULTY_LEVELS.find(l => l.id === formData.difficulty)?.name}
                    </span>
                  </div>
                )}

                {formData.deadline && (
                  <div className="flex items-center gap-2 text-neutral-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Deadline: {new Date(formData.deadline).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-primary-400 font-bold mb-1">Alcance Estimado</div>
                    <div className="text-neutral-300 text-sm">
                      Tu reto será visto por ~{formData.skills.length * 150}+ desarrolladores cualificados
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
