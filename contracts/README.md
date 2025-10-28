# 🎯 BOUNTYWAVE Smart Contracts

Contratos inteligentes para gestionar retos con recompensas en la red Scroll (compatible con cualquier EVM).

## 📋 Contratos

### 1. BountyWaveChallenge.sol
Contrato principal que gestiona un reto individual:
- ✅ Custodia de recompensas (ETH o ERC20)
- ✅ Registro de submissions/soluciones
- ✅ Selección de ganador y pago automático
- ✅ Sistema de deadlines
- ✅ Cancelación y reembolsos
- ✅ Eventos completos para tracking

### 2. BountyWaveFactory.sol
Factory para crear y gestionar múltiples retos:
- ✅ Deploy automatizado de retos
- ✅ Fee de plataforma (2.5% configurable)
- ✅ Registro de todos los retos
- ✅ Búsqueda por creador
- ✅ Soporte ETH y tokens ERC20

## 🚀 Deployment

### Requisitos previos
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
npm install @openzeppelin/contracts
```

### Configuración Hardhat

Crea `hardhat.config.js`:
```javascript
require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io",
      chainId: 534351,
      accounts: [process.env.PRIVATE_KEY]
    },
    scrollMainnet: {
      url: "https://rpc.scroll.io",
      chainId: 534352,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### Script de Deploy

Crea `scripts/deploy.js`:
```javascript
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BOUNTYWAVE Contracts...");

  // Deploy Factory
  const feeCollector = "TU_ADDRESS_AQUI"; // Dirección que recibe fees

  const Factory = await hre.ethers.getContractFactory("BountyWaveFactory");
  const factory = await Factory.deploy(feeCollector);
  await factory.deployed();

  console.log("✅ BountyWaveFactory deployed to:", factory.address);
  console.log("📝 Fee Collector:", feeCollector);
  console.log("💰 Platform Fee:", (await factory.platformFee()).toString(), "basis points");

  // Guardar dirección
  console.log("\n📋 Add this to your .env:");
  console.log(`VITE_FACTORY_CONTRACT_ADDRESS=${factory.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Comandos de Deploy

**Testnet (Scroll Sepolia):**
```bash
npx hardhat run scripts/deploy.js --network scrollSepolia
```

**Mainnet (Scroll):**
```bash
npx hardhat run scripts/deploy.js --network scrollMainnet
```

## 💻 Uso desde Frontend

### Instalación
```bash
npm install ethers
```

### Configuración

Añade a tu `.env`:
```env
VITE_FACTORY_CONTRACT_ADDRESS=0x...
VITE_SCROLL_RPC_URL=https://rpc.scroll.io
VITE_SCROLL_CHAIN_ID=534352
```

### ABIs

Crea `src/lib/contracts/abis.ts`:
```typescript
export const FACTORY_ABI = [
  "function createBountyWithETH(uint256 _deadline, string memory _title, string memory _description, string memory _metadataURI) external payable returns (address)",
  "function getTotalBounties() external view returns (uint256)",
  "function getBounties(uint256 _start, uint256 _count) external view returns (address[])",
  "function getBountyInfo(address _bountyAddress) external view returns (address, address, uint256, address, bool, uint256, uint256, uint256, string, string)",
  "event BountyCreated(address indexed creator, address indexed bountyAddress, address rewardToken, uint256 rewardAmount, uint256 deadline, string title)"
];

export const BOUNTY_ABI = [
  "function submitSolution(string memory _solutionURI) external",
  "function selectWinner(address _winner) external",
  "function cancelBounty() external",
  "function getBountyInfo() external view returns (address, address, uint256, address, bool, uint256, uint256, uint256, string, string)",
  "function getSubmission(address _participant) external view returns (string, uint256, bool)",
  "function getParticipantCount() external view returns (uint256)",
  "function hasEnded() external view returns (bool)",
  "function timeRemaining() external view returns (uint256)",
  "event SubmissionReceived(address indexed participant, string solutionURI, uint256 timestamp)",
  "event WinnerSelected(address indexed winner, uint256 rewardAmount, uint256 timestamp)"
];
```

### Ejemplo de Integración

```typescript
import { ethers } from 'ethers';
import { FACTORY_ABI, BOUNTY_ABI } from './abis';

// Conectar a Scroll
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const factoryAddress = import.meta.env.VITE_FACTORY_CONTRACT_ADDRESS;
const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer);

// CREAR UN RETO CON ETH
async function createBounty(title: string, description: string, deadline: number, rewardInETH: string) {
  const metadataURI = "ipfs://..."; // Tu metadata en IPFS

  const tx = await factory.createBountyWithETH(
    deadline,
    title,
    description,
    metadataURI,
    { value: ethers.utils.parseEther(rewardInETH) }
  );

  const receipt = await tx.wait();

  // Obtener dirección del contrato creado desde el evento
  const event = receipt.events?.find(e => e.event === 'BountyCreated');
  const bountyAddress = event?.args?.bountyAddress;

  console.log("✅ Bounty creado en:", bountyAddress);
  return bountyAddress;
}

// ENVIAR SOLUCIÓN
async function submitSolution(bountyAddress: string, solutionURI: string) {
  const bounty = new ethers.Contract(bountyAddress, BOUNTY_ABI, signer);

  const tx = await bounty.submitSolution(solutionURI);
  await tx.wait();

  console.log("✅ Solución enviada");
}

// SELECCIONAR GANADOR
async function selectWinner(bountyAddress: string, winnerAddress: string) {
  const bounty = new ethers.Contract(bountyAddress, BOUNTY_ABI, signer);

  const tx = await bounty.selectWinner(winnerAddress);
  await tx.wait();

  console.log("✅ Ganador seleccionado y recompensa transferida");
}

// OBTENER INFO DEL RETO
async function getBountyInfo(bountyAddress: string) {
  const bounty = new ethers.Contract(bountyAddress, BOUNTY_ABI, provider);

  const [
    owner,
    rewardToken,
    rewardAmount,
    winner,
    isActive,
    createdAt,
    deadline,
    submissionCount,
    title,
    description
  ] = await bounty.getBountyInfo();

  return {
    owner,
    rewardToken,
    rewardAmount: ethers.utils.formatEther(rewardAmount),
    winner,
    isActive,
    createdAt: new Date(createdAt.toNumber() * 1000),
    deadline: new Date(deadline.toNumber() * 1000),
    submissionCount: submissionCount.toNumber(),
    title,
    description
  };
}
```

## 🔒 Seguridad

### Características de Seguridad
- ✅ **ReentrancyGuard**: Protección contra ataques de reentrancy
- ✅ **Access Control**: Solo el owner puede seleccionar ganador
- ✅ **Validaciones**: Checks en todas las funciones críticas
- ✅ **Events**: Tracking completo de todas las acciones
- ✅ **SafeTransfer**: Uso de calls seguros para transferencias

### Auditoría
⚠️ **IMPORTANTE**: Estos contratos son de ejemplo educativo. Para producción:
1. Realizar auditoría profesional
2. Testear exhaustivamente en testnet
3. Considerar seguros (ej: Nexus Mutual)
4. Implementar timelock para cambios críticos

## 📊 Gas Estimates

Operación | Gas Estimado
----------|-------------
Deploy Factory | ~2,500,000
Create Bounty (ETH) | ~1,200,000
Submit Solution | ~80,000
Select Winner | ~120,000
Cancel Bounty | ~100,000

## 🌐 Scroll Network Info

### Testnet (Sepolia)
- **Chain ID**: 534351
- **RPC**: https://sepolia-rpc.scroll.io
- **Explorer**: https://sepolia.scrollscan.com
- **Faucet**: https://scroll.io/portal

### Mainnet
- **Chain ID**: 534352
- **RPC**: https://rpc.scroll.io
- **Explorer**: https://scrollscan.com

## 📝 Flujo Completo

```
1. CREADOR
   ├─ Deploy bounty vía Factory
   ├─ Deposita recompensa (ETH/USDC)
   └─ Espera submissions

2. PARTICIPANTES
   ├─ Ven el reto en la plataforma
   ├─ Desarrollan solución
   └─ Llaman submitSolution(URI)

3. DEADLINE
   └─ Tiempo límite alcanzado

4. SELECCIÓN
   ├─ Creador revisa submissions
   ├─ Llama selectWinner(address)
   └─ Contrato transfiere recompensa automáticamente

5. GANADOR
   └─ Recibe fondos directo a su wallet
```

## 🛠️ Testing

```bash
# Compilar contratos
npx hardhat compile

# Correr tests
npx hardhat test

# Verificar en Scrollscan
npx hardhat verify --network scrollMainnet DEPLOYED_CONTRACT_ADDRESS "CONSTRUCTOR_ARGS"
```

## 🤝 Soporte

Para reportar issues o contribuir:
- GitHub: [tu-repo]
- Discord: [tu-servidor]
- Docs: [tu-documentacion]

## 📜 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

**⚡ Construido con Solidity 0.8.20 + OpenZeppelin + Scroll**
