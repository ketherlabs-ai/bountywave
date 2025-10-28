# 🚀 BOUNTYWAVE - Guía de Deploy en Scroll

Guía completa para desplegar los smart contracts de BOUNTYWAVE en Scroll Testnet y Mainnet.

---

## 📋 Prerequisitos

### 1. Instalar Dependencias

```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers @nomiclabs/hardhat-etherscan ethers dotenv
npm install @openzeppelin/contracts
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Private key de la wallet que hará el deploy (SIN el prefijo 0x)
PRIVATE_KEY=tu_private_key_aqui

# Dirección que recibirá las fees de la plataforma (opcional, por defecto usa el deployer)
FEE_COLLECTOR_ADDRESS=0x...

# API Key de Scrollscan para verificación automática (opcional pero recomendado)
# Obtener en: https://scrollscan.com/myapikey
SCROLLSCAN_API_KEY=tu_api_key_aqui

# RPCs personalizados (opcional, usa defaults si no se especifican)
SCROLL_SEPOLIA_RPC=https://sepolia-rpc.scroll.io
SCROLL_MAINNET_RPC=https://rpc.scroll.io
```

**⚠️ IMPORTANTE:** Nunca compartas ni commitees tu `.env`. Ya está en `.gitignore`.

### 3. Obtener Fondos

#### Testnet (Scroll Sepolia):
```bash
# Faucet oficial de Scroll
https://scroll.io/portal

# Bridges desde Sepolia Ethereum
https://sepolia.scroll.io/bridge
```

#### Mainnet:
```bash
# Bridge oficial de Scroll
https://scroll.io/bridge

# Bridges alternativos
- Orbiter Finance
- Stargate
```

---

## 🎯 Deploy en Testnet (Scroll Sepolia)

### Paso 1: Compilar Contratos

```bash
npx hardhat compile
```

Deberías ver:
```
Compiled 5 Solidity files successfully
```

### Paso 2: Deploy

```bash
npx hardhat run scripts/deploy.js --network scrollSepolia
```

**Output esperado:**
```
🚀 ===== BOUNTYWAVE DEPLOYMENT =====

📍 Network: scrollSepolia
👤 Deployer: 0x...
💰 Balance: 0.5 ETH

💵 Fee Collector: 0x...

📝 Deploying BountyWaveFactory...

⏳ Waiting for deployment transaction...

✅ ===== DEPLOYMENT SUCCESSFUL =====

📋 Contract Addresses:
   Factory: 0xAbC123...
   Fee Collector: 0x...

🔗 Transaction Hash: 0x...

🔍 View on Explorer:
   Contract: https://sepolia.scrollscan.com/address/0xAbC123...
   Transaction: https://sepolia.scrollscan.com/tx/0x...

💰 Platform Fee: 250 basis points (2.5%)

💾 Deployment info saved to: deployments/scrollSepolia.json

📝 Add this to your .env file:
VITE_FACTORY_CONTRACT_ADDRESS=0xAbC123...
VITE_SCROLL_CHAIN_ID=534351
VITE_SCROLL_RPC_URL=https://sepolia-rpc.scroll.io
VITE_SCROLL_EXPLORER_URL=https://sepolia.scrollscan.com

⏳ Waiting 30 seconds before verification...

🔍 Verifying contract on Scrollscan...

✅ Contract verified successfully!
   View verified code: https://sepolia.scrollscan.com/address/0xAbC123...#code

✨ ===== DEPLOYMENT COMPLETE =====
```

### Paso 3: Actualizar .env del Frontend

Copia las variables que te dio el script:

```env
VITE_FACTORY_CONTRACT_ADDRESS=0xAbC123...
VITE_SCROLL_CHAIN_ID=534351
VITE_SCROLL_RPC_URL=https://sepolia-rpc.scroll.io
VITE_SCROLL_EXPLORER_URL=https://sepolia.scrollscan.com
```

### Paso 4: Verificar el Deploy

1. **En Scrollscan:**
   - Ir a https://sepolia.scrollscan.com/address/TU_CONTRACT_ADDRESS
   - Deberías ver:
     - ✅ Contract verified (check verde)
     - Source code visible
     - ABI disponible
     - Transacciones

2. **Localmente:**
   ```bash
   # Ver info del deployment
   cat deployments/scrollSepolia.json
   ```

3. **Probar desde consola:**
   ```bash
   npx hardhat console --network scrollSepolia
   ```
   ```javascript
   const Factory = await ethers.getContractFactory("BountyWaveFactory");
   const factory = await Factory.attach("TU_CONTRACT_ADDRESS");
   const fee = await factory.platformFee();
   console.log("Platform fee:", fee.toString());
   ```

---

## 🌐 Deploy en Mainnet (Scroll)

### ⚠️ Checklist Pre-Mainnet

Antes de deployar en mainnet, asegúrate de:

- [ ] Tests completos pasando
- [ ] Auditoría de seguridad (recomendado)
- [ ] Testnet testeado exhaustivamente
- [ ] Private key segura (usar hardware wallet si es posible)
- [ ] Suficiente ETH para gas (estimar ~0.05 ETH)
- [ ] Fee collector address correcta
- [ ] Backup de todos los archivos importantes

### Deploy

```bash
npx hardhat run scripts/deploy.js --network scrollMainnet
```

**IMPORTANTE:**
- Este deploy cuesta ETH real
- Revisa dos veces todas las configuraciones
- El contrato será inmutable una vez deployado

### Post-Deploy Mainnet

1. **Verificar contrato:**
   ```bash
   npx hardhat run scripts/verify.js --network scrollMainnet
   ```

2. **Transferir ownership si es necesario:**
   ```bash
   npx hardhat console --network scrollMainnet
   ```
   ```javascript
   const factory = await ethers.getContractAt("BountyWaveFactory", "CONTRACT_ADDRESS");
   await factory.transferFactoryOwnership("NEW_OWNER_ADDRESS");
   ```

3. **Configurar multisig (RECOMENDADO):**
   - Usar Gnosis Safe en Scroll
   - Transferir ownership del factory al multisig
   - Requiere múltiples firmas para cambios

4. **Monitoreo:**
   - Configurar alertas en Scrollscan
   - Monitorear eventos del contrato
   - Tracking de fees acumuladas

---

## 🔍 Verificación Manual

Si la verificación automática falla:

### Opción 1: Script de Verificación

```bash
npx hardhat run scripts/verify.js --network scrollSepolia
```

### Opción 2: Comando Directo

```bash
npx hardhat verify --network scrollSepolia CONTRACT_ADDRESS "FEE_COLLECTOR_ADDRESS"
```

### Opción 3: Web UI de Scrollscan

1. Ir a https://sepolia.scrollscan.com/verifyContract
2. Seleccionar "Contract Address"
3. Pegar dirección del contrato
4. Seleccionar compiler: `v0.8.20+commit.a1b79de6`
5. Optimization: `Yes` con `200` runs
6. Pegar código fuente del contrato
7. Constructor arguments (ABI-encoded):
   ```
   # Para obtener los constructor args:
   node
   const ethers = require('ethers');
   const encoded = ethers.utils.defaultAbiCoder.encode(
     ['address'],
     ['FEE_COLLECTOR_ADDRESS']
   );
   console.log(encoded.slice(2)); // Sin el 0x
   ```
8. Submit

---

## 📊 Costos Estimados

### Testnet (Scroll Sepolia)
- **Deploy**: ~$0 (ETH de testnet gratis)
- **Verificación**: Gratis

### Mainnet (Scroll)
- **Deploy Factory**: ~0.003-0.005 ETH (~$5-10 USD)
- **Deploy Bounty** (por usuario): ~0.001-0.002 ETH (~$2-5 USD)
- **Verificación**: Gratis

*Precios aproximados, varían según congestión de la red*

---

## 🛠️ Troubleshooting

### Error: "insufficient funds"
```bash
# Verificar balance
npx hardhat console --network scrollSepolia
const [deployer] = await ethers.getSigners();
const balance = await deployer.getBalance();
console.log(ethers.utils.formatEther(balance));
```

### Error: "nonce too high"
```bash
# Reset nonce
# En MetaMask: Settings > Advanced > Reset Account
```

### Error: "verification failed"
```bash
# Esperar 1-2 minutos después del deploy
# Verificar que SCROLLSCAN_API_KEY sea correcta
# Usar verificación manual como backup
```

### Error: "contract already deployed"
```bash
# Cambiar deployer address o
# Usar diferentes constructor arguments
```

---

## 📝 Comandos Útiles

```bash
# Compilar
npx hardhat compile

# Deploy testnet
npx hardhat run scripts/deploy.js --network scrollSepolia

# Deploy mainnet
npx hardhat run scripts/deploy.js --network scrollMainnet

# Verificar
npx hardhat run scripts/verify.js --network scrollSepolia

# Console
npx hardhat console --network scrollSepolia

# Verificación manual
npx hardhat verify --network scrollSepolia CONTRACT_ADDRESS ARGS

# Clean build
npx hardhat clean

# Run tests (cuando los tengas)
npx hardhat test
```

---

## 🔐 Seguridad

### Best Practices:

1. **Private Keys:**
   - Nunca commitear `.env`
   - Usar hardware wallet para mainnet
   - Considerar usar Gnosis Safe

2. **Verificación:**
   - Siempre verificar contratos
   - Permite auditoría pública
   - Genera confianza en usuarios

3. **Ownership:**
   - Transferir a multisig para mainnet
   - No usar EOA personal como owner

4. **Monitoreo:**
   - Configurar alertas
   - Revisar transacciones regularmente
   - Monitorear eventos

---

## 📚 Recursos

- **Scroll Docs**: https://scroll.io/docs
- **Hardhat Docs**: https://hardhat.org/docs
- **Scrollscan**: https://scrollscan.com
- **Scroll Bridge**: https://scroll.io/bridge
- **Scroll Faucet**: https://scroll.io/portal

---

## ✅ Checklist de Deploy

### Pre-Deploy:
- [ ] Contratos compilados sin errores
- [ ] `.env` configurado correctamente
- [ ] Private key tiene fondos
- [ ] Fee collector address verificada
- [ ] Tests pasando (si los tienes)

### Deploy:
- [ ] Deploy ejecutado exitosamente
- [ ] Transaction hash guardado
- [ ] Contract address anotada
- [ ] `deployments/` folder actualizado

### Post-Deploy:
- [ ] Contrato verificado en Scrollscan
- [ ] Frontend `.env` actualizado
- [ ] Testear creación de bounty
- [ ] Testear submission
- [ ] Testear votación
- [ ] Testear pago de winner

### Mainnet Extra:
- [ ] Auditoría completada
- [ ] Ownership transferida a multisig
- [ ] Monitoreo configurado
- [ ] Documentación pública lista

---

**🎉 Felicidades! Tu plataforma BOUNTYWAVE está lista para cambiar el mundo Web3 de los bounties.**
