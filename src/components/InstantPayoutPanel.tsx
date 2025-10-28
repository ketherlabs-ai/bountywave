import React, { useState, useEffect } from 'react';
import { Zap, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface InstantPayoutPanelProps {
  bountyId: string;
  recipientId: string;
}

export default function InstantPayoutPanel({ bountyId, recipientId }: InstantPayoutPanelProps) {
  const [streams, setStreams] = useState<any[]>([]);
  const [totalStreamed, setTotalStreamed] = useState(0);

  useEffect(() => {
    loadPaymentStreams();
    const interval = setInterval(updateStreamAmounts, 1000);
    return () => clearInterval(interval);
  }, [bountyId, recipientId]);

  const loadPaymentStreams = async () => {
    const { data } = await supabase
      .from('payment_streams')
      .select('*')
      .eq('bounty_id', bountyId)
      .eq('recipient_id', recipientId)
      .eq('status', 'active');

    if (data) {
      setStreams(data);
    }
  };

  const updateStreamAmounts = () => {
    setStreams(prev => prev.map(stream => {
      const elapsed = (Date.now() - new Date(stream.started_at).getTime()) / 1000;
      const currentAmount = parseFloat(stream.flow_rate) * elapsed;
      return { ...stream, current_streamed: currentAmount };
    }));

    const total = streams.reduce((sum, s) => sum + (s.current_streamed || 0), 0);
    setTotalStreamed(total);
  };

  const claimPayment = async (streamId: string) => {
    try {
      await supabase
        .from('payment_streams')
        .update({ status: 'completed', ended_at: new Date().toISOString() })
        .eq('id', streamId);

      alert('¡Pago reclamado exitosamente!');
      loadPaymentStreams();
    } catch (err) {
      console.error('Error claiming payment:', err);
      alert('Error al reclamar el pago');
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Pago Instantáneo</h3>
          <p className="text-gray-400 text-sm">Streaming de fondos en tiempo real</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-6 mb-6 border border-green-500/30">
        <div className="text-gray-300 text-sm mb-2">Total Acumulado</div>
        <div className="flex items-baseline gap-2">
          <DollarSign className="w-6 h-6 text-green-400" />
          <span className="text-4xl font-bold text-white">
            {totalStreamed.toFixed(6)}
          </span>
          <span className="text-gray-400 text-lg">USDC</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span>Streaming activo en tiempo real</span>
        </div>
      </div>

      <div className="space-y-4">
        {streams.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
            No hay streams de pago activos
          </div>
        ) : (
          streams.map((stream) => (
            <div key={stream.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">Stream Activo</span>
                </div>
                <div className="text-green-400 font-bold">
                  {(stream.current_streamed || 0).toFixed(6)} USDC
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-gray-400 text-xs mb-1">Tasa de flujo</div>
                  <div className="text-white font-semibold text-sm">
                    {parseFloat(stream.flow_rate).toFixed(6)}/seg
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Iniciado</div>
                  <div className="text-white font-semibold text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(stream.started_at).toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Token</div>
                  <div className="text-white font-semibold text-sm">USDC</div>
                </div>
              </div>

              <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                  style={{
                    width: `${Math.min(((stream.current_streamed || 0) / stream.total_streamed) * 100, 100)}%`
                  }}
                ></div>
              </div>

              <button
                onClick={() => claimPayment(stream.id)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Reclamar Pago
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Ventajas del Pago Instantáneo</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            Recibe fondos en tiempo real mientras trabajas
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            Sin esperas ni períodos de retención
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            Transparencia total del flujo de fondos
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            Tecnología Superfluid integrada
          </li>
        </ul>
      </div>
    </div>
  );
}
