export interface ZKProof {
  proof: string;
  publicSignals: string[];
  timestamp: number;
}

export interface VoteProof extends ZKProof {
  submissionId: string;
  hashedVoterId: string;
}

export interface ReputationProof extends ZKProof {
  minReputation: number;
  hashedUserId: string;
}

export interface ProofGenerationInput {
  privateInputs: Record<string, any>;
  publicInputs: Record<string, any>;
}

export interface ProofVerificationResult {
  valid: boolean;
  message?: string;
  data?: any;
}
