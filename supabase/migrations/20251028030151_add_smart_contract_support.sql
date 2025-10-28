/*
  # Add Smart Contract Support

  1. Changes
    - Add `contract_address` column to bounties table
    - Add `contract_deployed` boolean flag
    - Add `blockchain_network` column (scroll, ethereum, etc)
    - Add `transaction_hash` for contract deployment
    - Add indexes for efficient contract queries
  
  2. Purpose
    - Store smart contract addresses for each bounty
    - Track deployment status
    - Enable on-chain verification
    - Link bounties with blockchain
*/

-- Add contract-related columns to bounties table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bounties' AND column_name = 'contract_address'
  ) THEN
    ALTER TABLE bounties ADD COLUMN contract_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bounties' AND column_name = 'contract_deployed'
  ) THEN
    ALTER TABLE bounties ADD COLUMN contract_deployed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bounties' AND column_name = 'blockchain_network'
  ) THEN
    ALTER TABLE bounties ADD COLUMN blockchain_network text DEFAULT 'scroll';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bounties' AND column_name = 'deployment_tx_hash'
  ) THEN
    ALTER TABLE bounties ADD COLUMN deployment_tx_hash text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bounties' AND column_name = 'contract_version'
  ) THEN
    ALTER TABLE bounties ADD COLUMN contract_version text DEFAULT 'v1.0';
  END IF;
END $$;

-- Create index for contract address lookups
CREATE INDEX IF NOT EXISTS idx_bounties_contract_address 
ON bounties(contract_address) WHERE contract_address IS NOT NULL;

-- Create index for deployed contracts
CREATE INDEX IF NOT EXISTS idx_bounties_contract_deployed 
ON bounties(contract_deployed) WHERE contract_deployed = true;

-- Add comment to document the columns
COMMENT ON COLUMN bounties.contract_address IS 'Ethereum address of the deployed bounty smart contract';
COMMENT ON COLUMN bounties.contract_deployed IS 'Flag indicating if smart contract has been deployed';
COMMENT ON COLUMN bounties.blockchain_network IS 'Network where contract is deployed (scroll, ethereum, polygon, etc)';
COMMENT ON COLUMN bounties.deployment_tx_hash IS 'Transaction hash of the contract deployment';
COMMENT ON COLUMN bounties.contract_version IS 'Version of the smart contract template used';
