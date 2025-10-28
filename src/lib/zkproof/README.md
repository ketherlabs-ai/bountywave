# 🔐 Zero-Knowledge Proof System - BOUNTYWAVE

Sistema de privacidad con zero-knowledge proofs para votaciones anónimas y verificación de reputación.

## 🎯 Implementación Actual

### Fase 1: Cryptographic Primitives (✅ IMPLEMENTADO)

La implementación actual usa primitivas criptográficas estándar:

- **Hashing**: SHA-256 para commitments y nullifiers
- **Commitments**: Sistema de commit-reveal para votaciones
- **Nullifiers**: Prevención de doble votación
- **Encryption**: AES-GCM para datos sensibles
- **Timestamps**: Expiración de proofs

**Características activas:**
- ✅ Votación con commitments
- ✅ Verificación de reputación sin revelar valor exacto
- ✅ Sistema de nullifiers para prevenir doble voto
- ✅ Hashed user IDs para privacidad
- ✅ Proofs con expiración

## 🚀 Fase 2: zk-SNARKs con Circom (Para Producción)

Para privacidad completa, se recomienda implementar zk-SNARKs:

### Instalación de Dependencias

```bash
npm install snarkjs circomlib
npm install --save-dev circom
```

### 1. Circuit para Votación Anónima

Crear `circuits/anonymousVote.circom`:

```circom
pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template AnonymousVote() {
    // Private inputs
    signal input voterId;
    signal input submissionId;
    signal input voteValue;
    signal input salt;

    // Public inputs
    signal input commitment;
    signal input nullifier;

    // Outputs
    signal output validVote;

    // Component declarations
    component commitmentHasher = Poseidon(3);
    component nullifierHasher = Poseidon(2);
    component voteValidator = LessThan(8);

    // Generate commitment: hash(voterId, submissionId, salt)
    commitmentHasher.inputs[0] <== voterId;
    commitmentHasher.inputs[1] <== submissionId;
    commitmentHasher.inputs[2] <== salt;

    // Verify commitment matches
    commitment === commitmentHasher.out;

    // Generate nullifier: hash(voterId, submissionId)
    nullifierHasher.inputs[0] <== voterId;
    nullifierHasher.inputs[1] <== submissionId;

    // Verify nullifier matches
    nullifier === nullifierHasher.out;

    // Validate vote value (0 or 1)
    voteValidator.in[0] <== voteValue;
    voteValidator.in[1] <== 2;

    validVote <== voteValidator.out;
}

component main = AnonymousVote();
```

### 2. Circuit para Verificación de Reputación

Crear `circuits/reputationProof.circom`:

```circom
pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/poseidon.circom";

template ReputationProof() {
    // Private inputs
    signal input userId;
    signal input actualReputation;

    // Public inputs
    signal input minReputation;
    signal input hashedUserId;

    // Output
    signal output meetsRequirement;

    // Component declarations
    component hasher = Poseidon(1);
    component comparator = GreaterEqThan(32);

    // Verify hashed user ID
    hasher.inputs[0] <== userId;
    hashedUserId === hasher.out;

    // Check reputation >= minReputation
    comparator.in[0] <== actualReputation;
    comparator.in[1] <== minReputation;

    meetsRequirement <== comparator.out;
}

component main = ReputationProof();
```

### 3. Compilar Circuits

```bash
# Compilar circuit de votación
circom circuits/anonymousVote.circom --r1cs --wasm --sym -o build/

# Compilar circuit de reputación
circom circuits/reputationProof.circom --r1cs --wasm --sym -o build/

# Generar trusted setup (para testnet, usar Phase 2 Ceremony para mainnet)
snarkjs powersoftau new bn128 12 build/pot12_0000.ptau -v
snarkjs powersoftau contribute build/pot12_0000.ptau build/pot12_0001.ptau --name="First contribution" -v

# Preparar fase 2
snarkjs powersoftau prepare phase2 build/pot12_0001.ptau build/pot12_final.ptau -v

# Generar zkey para votación
snarkjs groth16 setup build/anonymousVote.r1cs build/pot12_final.ptau build/anonymousVote_0000.zkey
snarkjs zkey contribute build/anonymousVote_0000.zkey build/anonymousVote_final.zkey --name="Vote contribution" -v
snarkjs zkey export verificationkey build/anonymousVote_final.zkey build/anonymousVote_vkey.json

# Generar zkey para reputación
snarkjs groth16 setup build/reputationProof.r1cs build/pot12_final.ptau build/reputationProof_0000.zkey
snarkjs zkey contribute build/reputationProof_0000.zkey build/reputationProof_final.zkey --name="Rep contribution" -v
snarkjs zkey export verificationkey build/reputationProof_final.zkey build/reputationProof_vkey.json
```

### 4. Integración en Frontend

Crear `src/lib/zkproof/snark.ts`:

```typescript
import { groth16 } from 'snarkjs';

export async function generateVoteProof(
  voterId: string,
  submissionId: string,
  voteValue: number,
  salt: string
) {
  const input = {
    voterId: BigInt(voterId),
    submissionId: BigInt(submissionId),
    voteValue: BigInt(voteValue),
    salt: BigInt(salt)
  };

  const { proof, publicSignals } = await groth16.fullProve(
    input,
    '/build/anonymousVote.wasm',
    '/build/anonymousVote_final.zkey'
  );

  return { proof, publicSignals };
}

export async function verifyVoteProof(proof: any, publicSignals: any) {
  const vkey = await fetch('/build/anonymousVote_vkey.json').then(r => r.json());
  return await groth16.verify(vkey, publicSignals, proof);
}
```

### 5. Smart Contract Verificador

Crear `contracts/VoteVerifier.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VoteVerifier {
    mapping(bytes32 => bool) public usedNullifiers;

    event VoteVerified(bytes32 indexed nullifier, uint256 submissionId);

    function verifyAndVote(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory input
    ) public returns (bool) {
        bytes32 nullifier = bytes32(input[0]);

        require(!usedNullifiers[nullifier], "Vote already cast");

        // Aquí se verificaría el proof con el verificador generado
        // require(verifyProof(a, b, c, input), "Invalid proof");

        usedNullifiers[nullifier] = true;
        emit VoteVerified(nullifier, input[1]);

        return true;
    }
}
```

## 📊 Comparación de Implementaciones

| Característica | Fase 1 (Actual) | Fase 2 (zk-SNARKs) |
|---------------|-----------------|-------------------|
| **Privacidad** | Básica (hashing) | Completa (ZK) |
| **Performance** | Rápido | Más lento |
| **Setup** | Simple | Requiere trusted setup |
| **Verificación on-chain** | ❌ | ✅ |
| **Costo gas** | Bajo | Medio-Alto |
| **Complejidad** | Baja | Alta |
| **Producción ready** | ✅ | Requiere auditoría |

## 🔧 Uso Actual

### Votación Anónima

```typescript
import { generateAnonymousVoteProof, verifyAnonymousVoteProof } from '@/lib/zkproof/utils';

// Generar proof
const voteProof = await generateAnonymousVoteProof(
  userId,
  submissionId,
  1 // voteValue
);

// Verificar proof
const result = await verifyAnonymousVoteProof(voteProof);
if (result.valid) {
  // Procesar voto
}
```

### Verificación de Reputación

```typescript
import { generateReputationProof, verifyReputationProof } from '@/lib/zkproof/utils';

// Probar reputación >= 100 sin revelar el valor exacto
const repProof = await generateReputationProof(
  userId,
  150, // actual reputation
  100  // minimum required
);

// Verificar proof
const result = await verifyReputationProof(repProof, 100);
if (result.valid) {
  // Usuario tiene reputación suficiente
}
```

## 🛡️ Seguridad

### Implementación Actual
- ✅ Commitments criptográficos
- ✅ Nullifiers para prevenir doble voto
- ✅ Hashing de identidades
- ✅ Expiración de proofs
- ⚠️ No verificable on-chain

### Con zk-SNARKs
- ✅ Todo lo anterior +
- ✅ Verificación on-chain
- ✅ Zero-knowledge real
- ✅ Resistente a ataques
- ✅ Auditable matemáticamente

## 📝 Roadmap

### ✅ Fase 1: Primitivas Criptográficas (Completado)
- Hashing y commitments
- Nullifiers
- Reputación privada
- Sistema de votación básico

### 🔄 Fase 2: zk-SNARKs (En progreso)
- Setup de Circom
- Circuits para votación
- Circuits para reputación
- Integración con snarkjs
- Tests extensivos

### 📅 Fase 3: Producción (Futuro)
- Trusted setup ceremony
- Auditoría de circuits
- Deploy de verificadores
- Optimización de gas
- Documentación completa

## 🌐 Recursos

- [SnarkJS Documentation](https://github.com/iden3/snarkjs)
- [Circom Language](https://docs.circom.io/)
- [Scroll ZK Documentation](https://scroll.io/docs)
- [ZK Patterns](https://zkpatterns.com/)

## 💡 Notas de Implementación

1. **Testnet**: La implementación actual es perfecta para testnet y pruebas
2. **Mainnet**: Para mainnet con alto volumen, implementar zk-SNARKs
3. **Híbrido**: Se puede usar ambos sistemas en paralelo
4. **Migration**: Fácil migración de Fase 1 a Fase 2

---

**Implementado por BOUNTYWAVE - Zero-Knowledge Privacy System**
