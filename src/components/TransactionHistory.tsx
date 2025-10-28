import { useState, useEffect } from 'react';
import { ExternalLink, ArrowUpRight, ArrowDownLeft, RefreshCw, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  token: string;
  tx_hash: string;
  status: string;
  scrollscan_url: string;
  created_at: string;
  bounty_id?: string;
}

export function TransactionHistory() {
  const { userId } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadTransactions();
  }, [userId, filter]);

  const loadTransactions = async () => {
    if (!userId) return;

    let query = supabase
      .from('transactions')
      .select('*')
      .or(`from_profile_id.eq.${userId},to_profile_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    if (data) setTransactions(data);
    setLoading(false);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'reward':
        return <ArrowDownLeft className="text-green-400" size={20} />;
      case 'deposit':
        return <ArrowDownLeft className="text-blue-400" size={20} />;
      case 'withdrawal':
        return <ArrowUpRight className="text-orange-400" size={20} />;
      case 'refund':
        return <RefreshCw className="text-yellow-400" size={20} />;
      default:
        return <DollarSign className="text-neutral-400" size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: <CheckCircle size={16} />,
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          text: 'Confirmado'
        };
      case 'pending':
        return {
          icon: <Clock size={16} />,
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          text: 'Pendiente'
        };
      case 'failed':
        return {
          icon: <XCircle size={16} />,
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          text: 'Fallido'
        };
      default:
        return {
          icon: <Clock size={16} />,
          color: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
          text: status
        };
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      reward: 'Recompensa',
      deposit: 'Depósito',
      withdrawal: 'Retiro',
      refund: 'Reembolso',
      fee: 'Comisión'
    };
    return labels[type] || type;
  };

  const buildScrollscanUrl = (txHash: string) => {
    return `https://scrollscan.com/tx/${txHash}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/20 rounded-full" />
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Historial de Transacciones</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filter === 'confirmed'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            Confirmadas
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            Pendientes
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <DollarSign className="text-neutral-600 mx-auto mb-4" size={48} />
          <p className="text-neutral-500">No hay transacciones aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const statusBadge = getStatusBadge(tx.status);
            return (
              <div
                key={tx.id}
                className="group bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                      {getTransactionIcon(tx.transaction_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {getTransactionTypeLabel(tx.transaction_type)}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 ${statusBadge.color}`}>
                          {statusBadge.icon}
                          {statusBadge.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(tx.created_at).toLocaleString()}
                        </span>
                        {tx.tx_hash && (
                          <a
                            href={buildScrollscanUrl(tx.tx_hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors"
                          >
                            Ver en Scrollscan
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      {tx.tx_hash && (
                        <div className="text-xs text-neutral-600 font-mono mt-1">
                          {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-8)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {tx.transaction_type === 'withdrawal' ? '-' : '+'}
                      {tx.amount.toFixed(4)}
                    </div>
                    <div className="text-sm text-neutral-500 font-semibold">
                      {tx.token}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
