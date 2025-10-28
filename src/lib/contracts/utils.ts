declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface ContractInfo {
  address: string;
  network: string;
  txHash?: string;
  deployed: boolean;
  explorerUrl: string;
}

export function getExplorerUrl(network: string, address: string, type: 'address' | 'tx' = 'address'): string {
  const explorers: Record<string, string> = {
    scroll: 'https://scrollscan.com',
    'scroll-sepolia': 'https://sepolia.scrollscan.com',
    ethereum: 'https://etherscan.io',
    polygon: 'https://polygonscan.com',
  };

  const baseUrl = explorers[network] || explorers.scroll;
  const path = type === 'tx' ? 'tx' : 'address';
  return `${baseUrl}/${path}/${address}`;
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTokenAmount(amount: string | number, decimals: number = 18): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (value / Math.pow(10, decimals)).toFixed(4);
}

export async function switchToScrollNetwork(): Promise<boolean> {
  if (!window.ethereum) {
    throw new Error('MetaMask no está instalado');
  }

  const scrollChainId = '0x82750'; // 534352 en hex

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: scrollChainId }],
    });
    return true;
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: scrollChainId,
            chainName: 'Scroll',
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://rpc.scroll.io'],
            blockExplorerUrls: ['https://scrollscan.com']
          }],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Scroll network:', addError);
        throw new Error('No se pudo agregar la red Scroll');
      }
    }
    throw new Error('No se pudo cambiar a la red Scroll');
  }
}

export function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: 'Ethereum',
    534352: 'Scroll',
    534351: 'Scroll Sepolia',
    137: 'Polygon',
    80001: 'Mumbai',
  };
  return networks[chainId] || 'Unknown';
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function parseContractError(error: any): string {
  if (error?.reason) {
    return error.reason;
  }
  if (error?.message) {
    if (error.message.includes('user rejected')) {
      return 'Transacción rechazada por el usuario';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Fondos insuficientes para la transacción';
    }
    return error.message;
  }
  return 'Error desconocido en el contrato';
}

export async function waitForTransaction(txHash: string, provider: any): Promise<boolean> {
  try {
    const receipt = await provider.waitForTransaction(txHash);
    return receipt.status === 1;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    return false;
  }
}

export function getContractBadgeColor(deployed: boolean): string {
  return deployed ? 'bg-accent-500' : 'bg-neutral-500';
}

export function getContractBadgeText(deployed: boolean): string {
  return deployed ? 'Smart Contract Activo' : 'Sin Smart Contract';
}

export function getContractStatusIcon(deployed: boolean): string {
  return deployed ? '✓' : '○';
}
