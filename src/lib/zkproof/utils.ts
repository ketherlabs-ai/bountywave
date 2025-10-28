import { VoteProof, ReputationProof, ProofVerificationResult } from './types';

/**
 * Hash function using Web Crypto API
 * Usada para crear commitments y hashes de identidad
 */
export async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Genera un commitment para votación anónima
 * commitment = hash(voterId + submissionId + salt)
 */
export async function generateVoteCommitment(
  voterId: string,
  submissionId: string,
  salt?: string
): Promise<{ commitment: string; salt: string }> {
  const usedSalt = salt || crypto.randomUUID();
  const preimage = `${voterId}:${submissionId}:${usedSalt}`;
  const commitment = await hashValue(preimage);

  return { commitment, salt: usedSalt };
}

/**
 * Verifica un commitment de votación
 */
export async function verifyVoteCommitment(
  commitment: string,
  voterId: string,
  submissionId: string,
  salt: string
): Promise<boolean> {
  const { commitment: calculatedCommitment } = await generateVoteCommitment(
    voterId,
    submissionId,
    salt
  );

  return commitment === calculatedCommitment;
}

/**
 * Genera un proof de reputación sin revelar la reputación exacta
 * Prueba que reputation >= minReputation sin revelar el valor exacto
 */
export async function generateReputationProof(
  userId: string,
  reputation: number,
  minReputation: number
): Promise<ReputationProof> {
  if (reputation < minReputation) {
    throw new Error('Reputation below minimum threshold');
  }

  const hashedUserId = await hashValue(userId);

  const proofData = {
    minReputation,
    hashedUserId,
    timestamp: Date.now(),
    meetsRequirement: true
  };

  const proof = await hashValue(JSON.stringify(proofData));

  return {
    proof,
    publicSignals: [minReputation.toString(), hashedUserId],
    timestamp: Date.now(),
    minReputation,
    hashedUserId
  };
}

/**
 * Verifica un proof de reputación
 */
export async function verifyReputationProof(
  proof: ReputationProof,
  expectedMinReputation: number
): Promise<ProofVerificationResult> {
  if (proof.minReputation !== expectedMinReputation) {
    return {
      valid: false,
      message: 'Minimum reputation mismatch'
    };
  }

  if (Date.now() - proof.timestamp > 3600000) {
    return {
      valid: false,
      message: 'Proof expired (older than 1 hour)'
    };
  }

  return {
    valid: true,
    message: 'Proof verified successfully',
    data: {
      hashedUserId: proof.hashedUserId,
      minReputation: proof.minReputation
    }
  };
}

/**
 * Genera un proof simple de votación anónima
 * En producción, esto se haría con snarkjs + circom
 */
export async function generateAnonymousVoteProof(
  voterId: string,
  submissionId: string,
  voteValue: number
): Promise<VoteProof> {
  const salt = crypto.randomUUID();
  const { commitment } = await generateVoteCommitment(voterId, submissionId, salt);
  const hashedVoterId = await hashValue(voterId);

  const proofData = {
    commitment,
    hashedVoterId,
    submissionId,
    voteValue,
    salt,
    timestamp: Date.now()
  };

  const proof = await hashValue(JSON.stringify(proofData));

  localStorage.setItem(`vote_proof_${submissionId}_${hashedVoterId}`, JSON.stringify(proofData));

  return {
    proof,
    publicSignals: [commitment, submissionId, voteValue.toString()],
    timestamp: Date.now(),
    submissionId,
    hashedVoterId
  };
}

/**
 * Verifica que un usuario no haya votado antes
 */
export async function hasUserVoted(
  voterId: string,
  submissionId: string
): Promise<boolean> {
  const hashedVoterId = await hashValue(voterId);
  const storedProof = localStorage.getItem(`vote_proof_${submissionId}_${hashedVoterId}`);
  return storedProof !== null;
}

/**
 * Verifica un proof de votación anónima
 */
export async function verifyAnonymousVoteProof(
  voteProof: VoteProof
): Promise<ProofVerificationResult> {
  if (Date.now() - voteProof.timestamp > 86400000) {
    return {
      valid: false,
      message: 'Proof expired (older than 24 hours)'
    };
  }

  if (voteProof.publicSignals.length !== 3) {
    return {
      valid: false,
      message: 'Invalid proof format'
    };
  }

  return {
    valid: true,
    message: 'Anonymous vote verified',
    data: {
      submissionId: voteProof.submissionId,
      hashedVoterId: voteProof.hashedVoterId
    }
  };
}

/**
 * Genera un nullifier único para prevenir doble votación
 * En sistemas zk reales, esto se genera dentro del circuit
 */
export async function generateNullifier(
  voterId: string,
  submissionId: string
): Promise<string> {
  const data = `nullifier:${voterId}:${submissionId}`;
  return await hashValue(data);
}

/**
 * Verifica que un nullifier no haya sido usado
 */
export function checkNullifier(nullifier: string): boolean {
  const used = localStorage.getItem(`nullifier_${nullifier}`);
  return used === null;
}

/**
 * Marca un nullifier como usado
 */
export function markNullifierUsed(nullifier: string): void {
  localStorage.setItem(`nullifier_${nullifier}`, Date.now().toString());
}

/**
 * Encripta datos sensibles para almacenamiento local
 */
export async function encryptSensitiveData(
  data: string,
  userKey: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userKey),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('bountywave-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );

  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedData), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Formatea un proof para almacenamiento/transmisión
 */
export function serializeProof(proof: VoteProof | ReputationProof): string {
  return JSON.stringify({
    proof: proof.proof,
    publicSignals: proof.publicSignals,
    timestamp: proof.timestamp
  });
}

/**
 * Parsea un proof serializado
 */
export function deserializeProof(serialized: string): VoteProof | ReputationProof {
  return JSON.parse(serialized);
}
