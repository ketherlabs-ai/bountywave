import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Flame, Target, Award, BarChart3, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GamifiedDashboardProps {
  userId: string;
}

export default function GamifiedDashboard({ userId }: GamifiedDashboardProps) {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBounties: 0,
    totalSubmissions: 0,
    totalVotes: 0,
    activityScore: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: heatmap } = await supabase
      .from('user_activity_heatmap')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('activity_date', { ascending: true });

    if (heatmap) {
      setHeatmapData(heatmap);

      const totals = heatmap.reduce((acc, day) => ({
        totalBounties: acc.totalBounties + day.bounties_created,
        totalSubmissions: acc.totalSubmissions + day.submissions_made,
        totalVotes: acc.totalVotes + day.votes_cast,
        activityScore: acc.activityScore + day.activity_score
      }), { totalBounties: 0, totalSubmissions: 0, totalVotes: 0, activityScore: 0 });

      setStats(totals);
    }

    const { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (streak) {
      setStreakData(streak);
    }

    const { data: userPredictions } = await supabase
      .from('success_predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (userPredictions) {
      setPredictions(userPredictions);
    }
  };

  const getActivityColor = (score: number) => {
    if (score === 0) return 'bg-gray-800';
    if (score < 5) return 'bg-green-900/30';
    if (score < 10) return 'bg-green-700/50';
    if (score < 20) return 'bg-green-500/70';
    return 'bg-green-400';
  };

  const generateCalendarGrid = () => {
    const grid = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = heatmapData.find(d => d.activity_date === dateStr);
      const score = dayData?.activity_score || 0;

      grid.push({
        date: dateStr,
        score,
        day: date.getDate()
      });
    }

    return grid;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-500/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Dashboard Gamificado</h3>
            <p className="text-gray-400 text-sm">Estadísticas y progreso en tiempo real</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg p-4 border border-blue-500/30">
            <Activity className="w-8 h-8 text-blue-400 mb-2" />
            <div className="text-3xl font-bold text-white">{stats.totalBounties}</div>
            <div className="text-gray-400 text-sm">Retos Creados</div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg p-4 border border-green-500/30">
            <Target className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-3xl font-bold text-white">{stats.totalSubmissions}</div>
            <div className="text-gray-400 text-sm">Submissions</div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/30">
            <Award className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-3xl font-bold text-white">{stats.totalVotes}</div>
            <div className="text-gray-400 text-sm">Votos</div>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-lg p-4 border border-orange-500/30">
            <TrendingUp className="w-8 h-8 text-orange-400 mb-2" />
            <div className="text-3xl font-bold text-white">{Math.round(stats.activityScore)}</div>
            <div className="text-gray-400 text-sm">Score Total</div>
          </div>
        </div>

        {streakData && (
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg p-6 mb-6 border border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-400" />
                <div>
                  <h4 className="text-xl font-bold text-white">Racha Activa</h4>
                  <p className="text-gray-400 text-sm">¡Mantén tu momentum!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-orange-400">{streakData.current_streak}</div>
                <div className="text-gray-400 text-sm">días consecutivos</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
              <div>
                <div className="text-gray-400 text-sm">Racha más larga</div>
                <div className="text-white font-bold text-2xl">{streakData.longest_streak} días</div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-sm">Última actividad</div>
                <div className="text-white font-medium">
                  {streakData.last_activity_date ? new Date(streakData.last_activity_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h4 className="text-lg font-bold text-white">Heatmap de Actividad (últimos 30 días)</h4>
          </div>

          <div className="grid grid-cols-10 gap-2">
            {generateCalendarGrid().map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded ${getActivityColor(day.score)} relative group cursor-pointer transition-all hover:scale-110`}
                title={`${day.date}: ${day.score} puntos`}
              >
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white opacity-0 group-hover:opacity-100">
                  {day.score}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
            <span>Menos activo</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-800 rounded"></div>
              <div className="w-3 h-3 bg-green-900/30 rounded"></div>
              <div className="w-3 h-3 bg-green-700/50 rounded"></div>
              <div className="w-3 h-3 bg-green-500/70 rounded"></div>
              <div className="w-3 h-3 bg-green-400 rounded"></div>
            </div>
            <span>Más activo</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h4 className="text-lg font-bold text-white">Predicciones de Éxito (IA)</h4>
        </div>

        {predictions.length === 0 ? (
          <div className="text-center text-gray-400 py-6">
            No hay predicciones disponibles todavía
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.map((pred) => (
              <div key={pred.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium">Bounty #{pred.bounty_id.slice(0, 8)}</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    pred.prediction_score > 0.7 ? 'bg-green-500/20 text-green-400' :
                    pred.prediction_score > 0.4 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {Math.round(pred.prediction_score * 100)}% éxito
                  </div>
                </div>

                {pred.prediction_factors && (
                  <div className="text-xs text-gray-400">
                    Factores: {Object.keys(pred.prediction_factors).join(', ')}
                  </div>
                )}

                {pred.actual_outcome && pred.accuracy_score && (
                  <div className="mt-2 pt-2 border-t border-gray-600 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Resultado: {pred.actual_outcome}</span>
                    <span className="text-green-400">Precisión: {Math.round(pred.accuracy_score * 100)}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
