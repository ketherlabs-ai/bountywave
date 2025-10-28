import { Shield, ExternalLink, FileCode, AlertCircle } from 'lucide-react';
import { getExplorerUrl, shortenAddress } from '../lib/contracts/utils';

interface SmartContractBadgeProps {
  contractAddress?: string;
  transactionHash?: string;
  status?: 'pending' | 'confirmed' | 'executed' | 'none';
  network?: string;
  compact?: boolean;
  showDetails?: boolean;
}

export function SmartContractBadge({
  contractAddress,
  transactionHash,
  status = 'none',
  network = 'scroll',
  compact = false,
  showDetails = true
}: SmartContractBadgeProps) {

  const statusConfig = {
    none: { label: 'Sin Smart Contract', color: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30', icon: AlertCircle },
    pending: { label: 'Desplegando...', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Shield },
    confirmed: { label: 'Verified on Scroll', color: 'bg-accent-500/20 text-accent-300 border-accent-500/30', icon: Shield },
    executed: { label: 'Ejecutado', color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: Shield },
  };

  const currentStatus = statusConfig[status];

  const StatusIcon = currentStatus.icon;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm ${currentStatus.color}`}>
        <StatusIcon size={14} />
        <span className="text-xs font-semibold">{status === 'none' ? 'No Blockchain' : 'Smart Contract'}</span>
      </div>
    );
  }

  if (status === 'none' || !contractAddress) {
    return (
      <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-neutral-700/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-neutral-400" size={20} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-neutral-300 mb-1">Sin Smart Contract</div>
            <div className="text-xs text-neutral-500">
              Este reto aún no tiene un smart contract desplegado en blockchain. Las recompensas se gestionarán manualmente.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-accent-500/10 to-primary-500/10 backdrop-blur-sm rounded-xl p-4 border border-accent-500/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield className="text-white" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full mb-2 text-xs font-bold uppercase tracking-wider border ${currentStatus.color}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
            {currentStatus.label}
          </div>
          {showDetails && (
            <>
              <div className="text-sm text-neutral-400 mb-2">
                Transacciones protegidas por smart contract en Scroll L2
              </div>
              <div className="flex items-center gap-2 mb-3 font-mono text-xs">
                <span className="text-neutral-500">Contrato:</span>
                <span className="text-accent-400 font-semibold">{shortenAddress(contractAddress, 6)}</span>
              </div>
            </>
          )}
          <div className="flex flex-wrap gap-2">
            <a
              href={getExplorerUrl(network, contractAddress, 'address')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-neutral-300 hover:text-white rounded-lg text-xs font-medium border border-white/10 hover:border-accent-500/50 transition-all"
            >
              <FileCode size={12} />
              Ver Contrato
              <ExternalLink size={10} />
            </a>
            {transactionHash && (
              <a
                href={getExplorerUrl(network, transactionHash, 'tx')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-neutral-300 hover:text-white rounded-lg text-xs font-medium border border-white/10 hover:border-accent-500/50 transition-all"
              >
                Ver TX Hash
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
