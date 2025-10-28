🌊 BountyWave

Plataforma Web3 descentralizada donde organizaciones lanzan retos con recompensas en crypto y solucionadores globales ganan bounties de forma transparente y automática.

https://bountywave-web3-chal-0wp9.bolt.host
Contract
0x444988008B5245B55E96fe27154Be9514d226479


🎯 ¿Qué es BountyWave?
BountyWave es una plataforma que conecta organizaciones que necesitan soluciones con talento global dispuesto a resolver retos por recompensas en crypto. Todo funciona de manera transparente, descentralizada y con pagos automáticos vía smart contracts.
✨ Características Principales

🎁 Retos con Recompensas: Crea bounties con premios en ETH/tokens
⚡ Pagos Automáticos: Los ganadores reciben su recompensa instantáneamente
🏆 Sistema de Reputación: Construye tu perfil on-chain con cada participación
🔒 Transparencia Total: Todos los retos y pagos son verificables on-chain
🌐 Global y Abierto: Participa desde cualquier lugar del mundo
🎨 UI Moderna Web3: Diseño estilo glassmorphism con colores neón


🚀 Demo Rápido
bash# Clonar el repositorio
git clone https://github.com/tu-usuario/bountywave.git
cd bountywave

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar aplicación
npm run dev

📋 Tabla de Contenidos

Arquitectura
Tecnologías
Instalación
Smart Contract
Uso
Flujos de Usuario
Roadmap
Contribuir
Licencia


🏗️ Arquitectura
bountywave/
├── contracts/              # Smart contracts Solidity
│   ├── BountyWave.sol     # Contrato principal
│   └── test/              # Tests de contratos
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── hooks/         # Custom hooks Web3
│   │   ├── utils/         # Utilidades
│   │   └── styles/        # Estilos TailwindCSS
│   └── public/
├── scripts/               # Scripts de deployment
├── docs/                  # Documentación adicional
└── README.md

🛠️ Tecnologías
Smart Contracts

Solidity ^0.8.20: Lenguaje del smart contract
Hardhat: Framework de desarrollo
OpenZeppelin: Librerías de seguridad
Scroll Network: Blockchain L2

Frontend

React 18: Framework UI
TailwindCSS: Estilos y diseño
ethers.js / wagmi: Interacción Web3
WalletConnect: Conexión de wallets
lucide-react: Iconos modernos
react-hook-form: Manejo de formularios

Infraestructura

IPFS: Almacenamiento descentralizado
Supabase/Firebase: Base de datos auxiliar
EPNS: Notificaciones Web3
SendGrid: Emails (opcional)


📦 Instalación
Prerrequisitos

Node.js >= 18.x
npm o yarn
MetaMask u otra wallet Web3
Fondos en Scroll testnet/mainnet

Paso 1: Clonar y Configurar
bash# Clonar repositorio
git clone https://github.com/tu-usuario/bountywave.git
cd bountywave

# Instalar dependencias del proyecto completo
npm install

# Instalar dependencias de contratos
cd contracts
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
Paso 2: Variables de Entorno
Crear archivo .env en la raíz del proyecto:
env# Blockchain
SCROLL_RPC_URL=https://rpc.scroll.io
PRIVATE_KEY=tu_private_key_aqui
SCROLLSCAN_API_KEY=tu_api_key_aqui

# Frontend
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=534352
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/

# Opcional
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_key_aqui
Paso 3: Compilar Contratos
bashcd contracts
npx hardhat compile
Paso 4: Deploy en Scroll
bash# Testnet
npx hardhat run scripts/deploy.js --network scrollSepolia

# Mainnet
npx hardhat run scripts/deploy.js --network scroll
Paso 5: Iniciar Frontend
bashcd frontend
npm run dev
Abre http://localhost:5173 en tu navegador.

📜 Smart Contract
Contrato Principal: BountyWave.sol
El contrato implementa todas las funcionalidades core de la plataforma.
Funciones Principales
Para Sponsors:
solidity// Crear un reto con recompensa
function createChallenge(
    string memory _title,
    string memory _description,
    uint256 _deadline,
    uint256 _maxWinners
) external payable

// Seleccionar ganadores (pago automático)
function selectWinners(
    uint256 _challengeId,
    address[] memory _winners
) external

// Cancelar reto sin participantes
function cancelChallenge(uint256 _challengeId) external
Para Solvers:
solidity// Enviar propuesta a un reto
function submitProposal(
    uint256 _challengeId,
    string memory _submissionURI
) external
Funciones de Consulta:
solidity// Obtener detalles del reto
function getChallenge(uint256 _challengeId) external view

// Ver participantes
function getChallengeParticipants(uint256 _challengeId) external view

// Ver ganadores
function getChallengeWinners(uint256 _challengeId) external view

// Perfil de usuario
function getUserProfile(address _user) external view

// Listar retos activos
function getActiveChallenges() external view
Eventos Importantes
solidityevent ChallengeCreated(uint256 indexed challengeId, address indexed sponsor, string title, uint256 rewardAmount, uint256 deadline)
event ProposalSubmitted(uint256 indexed challengeId, address indexed solver, string submissionURI, uint256 timestamp)
event WinnerSelected(uint256 indexed challengeId, address indexed winner, uint256 rewardAmount)
event RewardClaimed(uint256 indexed challengeId, address indexed winner, uint256 amount)
Seguridad

✅ ReentrancyGuard: Protección contra ataques de reentrada
✅ Access Control: Solo sponsors verificados pueden crear retos
✅ Validaciones: Múltiples checks en cada función
✅ OpenZeppelin: Librerías auditadas

Gas Optimization

Uso eficiente de storage
Batch operations donde es posible
Eventos para indexación off-chain


💡 Uso
Como Sponsor (Crear Retos)

Conecta tu Wallet con MetaMask/WalletConnect
Verifica tu Cuenta como sponsor (contacta al admin)
Crea un Reto:

Define título y descripción
Establece recompensa en ETH
Configura deadline y número de ganadores


Revisa Propuestas de los participantes
Selecciona Ganadores → Pagos automáticos ⚡

Como Solver (Ganar Bounties)

Conecta tu Wallet
Explora Retos Activos en el feed principal
Selecciona un Reto que te interese
Envía tu Propuesta:

Sube tu solución a IPFS
Envía el enlace con descripción


Espera Resultados en tu dashboard
Recibe tu Recompensa automáticamente si ganas 🎉


🔄 Flujos de Usuario
Flujo 1: Participar y Ganar
mermaidgraph LR
    A[Conectar Wallet] --> B[Explorar Retos]
    B --> C[Seleccionar Reto]
    C --> D[Enviar Propuesta]
    D --> E[Esperar Resultados]
    E --> F{¿Ganaste?}
    F -->|Sí| G[Recibir Pago Automático]
    F -->|No| H[+10 Reputación]
    G --> I[+100 Reputación + Badge]
Flujo 2: Crear Reto
mermaidgraph LR
    A[Sponsor Verificado] --> B[Crear Reto]
    B --> C[Fondos Bloqueados]
    C --> D[Recibir Propuestas]
    D --> E[Seleccionar Ganadores]
    E --> F[Pagos Automáticos]
    F --> G[Reto Completado]

🎨 Diseño y UX
Paleta de Colores
css/* Colores principales */
--primary-blue: #00ffab;      /* Verde neón */
--secondary-purple: #7a7efc;  /* Lila */
--accent-pink: #bf61ff;       /* Rosa neón */
--dark-bg: #191d2b;           /* Fondo oscuro */
Tipografía

Headings: Space Grotesk
Body: Manrope
Code: JetBrains Mono

Componentes Clave

🎴 Cards con glassmorphism
⚡ Animaciones fluidas
📱 Totalmente responsive
🎯 Micro-interacciones


🗺️ Roadmap
✅ Fase 1: MVP (Completado)

 Smart contract core
 Conexión wallet
 Crear y participar en retos
 Pagos automáticos
 Sistema de reputación básico

🚧 Fase 2: Funcionalidades Avanzadas (En Desarrollo)

 Sistema de votación descentralizada con zk-proofs
 Badges NFT para ganadores
 Ranking global dinámico
 Feed social "Lo que dice la comunidad"
 Dashboard avanzado con estadísticas

🔮 Fase 3: Escalabilidad

 Soporte multi-token (USDC, DAI)
 Integración con Scrollscan completa
 Notificaciones push EPNS
 API pública para integraciones
 Mobile app (React Native)


🧪 Testing
bash# Ejecutar tests de contratos
cd contracts
npx hardhat test

# Coverage
npx hardhat coverage

# Tests del frontend
cd frontend
npm run test

🤝 Contribuir
¡Contribuciones son bienvenidas! Por favor:

Fork el proyecto
Crea tu feature branch (git checkout -b feature/AmazingFeature)
Commit tus cambios (git commit -m 'Add some AmazingFeature')
Push al branch (git push origin feature/AmazingFeature)
Abre un Pull Request

Guía de Contribución

Sigue el estilo de código existente
Añade tests para nuevas funcionalidades
Actualiza la documentación
Escribe commits descriptivos


📚 Recursos Adicionales

Documentación Técnica Completa
Guía de Integración API
Scroll Network Docs
Ejemplos de Uso


🛡️ Seguridad
Si encuentras una vulnerabilidad de seguridad, por favor NO abras un issue público. Contáctanos directamente:

Email: security@bountywave.io
Discord: BountyWave Server


📄 Licencia
Este proyecto está bajo la licencia MIT. Ver archivo LICENSE para más detalles.

👥 Equipo
Desarrollado con ❤️ por el equipo BountyWave



🙏 Agradecimientos

Scroll Network - L2 Infrastructure
Comunidad Web3 - Feedback y soporte


<div align="center">
¿Te gusta BountyWave? Dale una ⭐ al repo!
Website • Docs • Discord • Twitter
</div>
