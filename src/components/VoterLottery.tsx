import React, { useState, useEffect } from 'react';
import { Gift, Ticket, Trophy, Users, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function VoterLottery() {
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [myEntries, setMyEntries] = useState<any>(null);
  const [recentWinners, setRecentWinners] = useState<any[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    loadLotteryData();
  }, []);

  const loadLotteryData = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: round } = await supabase
      .from('lottery_rounds')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (round) {
      setCurrentRound(round);

      if (user) {
        const { data: entries } = await supabase
          .from('lottery_entries')
          .select('*')
          .eq('round_id', round.id)
          .eq('user_id', user.id)
          .maybeSingle();

        setMyEntries(entries);
      }

      const { count } = await supabase
        .from('lottery_entries')
        .select('*', { count: 'exact', head: true })
        .eq('round_id', round.id);

      setTotalParticipants(count || 0);
    }

    const { data: winners } = await supabase
      .from('lottery_winners')
      .select('*, lottery_rounds(*), profiles(*)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (winners) {
      setRecentWinners(winners);
    }
  };

  const getTimeRemaining = () => {
    if (!currentRound) return '';

    const end = new Date(currentRound.end_date);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Finalizó';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h`;
  };

  if (!currentRound) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No hay sorteo activo en este momento</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Lotería de Votantes</h3>
          <p className="text-gray-400 text-sm">Vota y gana premios semanales</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg p-6 mb-6 border border-yellow-500/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-gray-300 text-sm mb-1">Ronda #{currentRound.round_number}</div>
            <div className="flex items-baseline gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span className="text-3xl font-bold text-white">
                ${parseFloat(currentRound.prize_pool).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-300 text-sm mb-1">Termina en</div>
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-xl">
              <Calendar className="w-5 h-5" />
              {getTimeRemaining()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">Ganadores</div>
            <div className="text-white font-bold">{currentRound.winner_count}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">Participantes</div>
            <div className="text-white font-bold flex items-center gap-1">
              <Users className="w-4 h-4" />
              {totalParticipants}
            </div>
          </div>
        </div>
      </div>

      {myEntries ? (
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Ticket className="w-6 h-6 text-green-400" />
              <div>
                <div className="text-white font-bold">¡Estás Participando!</div>
                <div className="text-gray-400 text-sm">Tus votos cuentan como entradas</div>
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Tus entradas</div>
              <div className="text-white font-bold text-2xl">{myEntries.entry_count}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Votos realizados</div>
              <div className="text-green-400 font-bold text-2xl">{myEntries.votes_cast}</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Probabilidad de ganar</span>
              <span className="text-yellow-400 font-bold">
                {((myEntries.entry_count / Math.max(totalParticipants, 1)) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 mb-6 text-center">
          <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-white font-semibold mb-2">¡Empieza a Votar!</h4>
          <p className="text-gray-400 text-sm mb-4">
            Cada voto que hagas te da una entrada al sorteo
          </p>
          <div className="inline-flex items-center gap-2 text-yellow-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Más votos = Más oportunidades de ganar</span>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Ganadores Recientes
        </h4>

        {recentWinners.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            Aún no hay ganadores
          </div>
        ) : (
          <div className="space-y-3">
            {recentWinners.map((winner, idx) => (
              <div key={winner.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-yellow-500 text-black' :
                    idx === 1 ? 'bg-gray-400 text-black' :
                    idx === 2 ? 'bg-orange-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {winner.profiles?.username || 'Anónimo'}
                    </div>
                    <div className="text-gray-400 text-xs">
                      Ronda #{winner.lottery_rounds?.round_number}
                    </div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">
                  ${parseFloat(winner.prize_amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30">
        <h4 className="text-white font-semibold mb-2 text-sm">Cómo Funciona</h4>
        <ul className="space-y-2 text-xs text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>Vota en propuestas y submissions para ganar entradas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>Cada voto = 1 entrada al sorteo semanal</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>Los ganadores se seleccionan aleatoriamente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>El premio se reparte entre los ganadores</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
