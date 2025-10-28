export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          wallet_address: string | null
          username: string | null
          avatar_url: string | null
          reputation_score: number
          total_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          wallet_address?: string | null
          username?: string | null
          avatar_url?: string | null
          reputation_score?: number
          total_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string | null
          username?: string | null
          avatar_url?: string | null
          reputation_score?: number
          total_earned?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          created_at?: string
        }
      }
      bounties: {
        Row: {
          id: string
          creator_id: string | null
          title: string
          description: string
          category_id: string | null
          reward_amount: number
          reward_token: string
          status: string
          is_featured: boolean
          deadline: string
          contract_address: string | null
          contract_deployed: boolean
          blockchain_network: string
          deployment_tx_hash: string | null
          contract_version: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id?: string | null
          title: string
          description: string
          category_id?: string | null
          reward_amount: number
          reward_token?: string
          status?: string
          is_featured?: boolean
          deadline: string
          contract_address?: string | null
          contract_deployed?: boolean
          blockchain_network?: string
          deployment_tx_hash?: string | null
          contract_version?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string | null
          title?: string
          description?: string
          category_id?: string | null
          reward_amount?: number
          reward_token?: string
          status?: string
          is_featured?: boolean
          deadline?: string
          contract_address?: string | null
          contract_deployed?: boolean
          blockchain_network?: string
          deployment_tx_hash?: string | null
          contract_version?: string
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          bounty_id: string | null
          submitter_id: string | null
          content: string
          attachments: Json
          status: string
          vote_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bounty_id?: string | null
          submitter_id?: string | null
          content: string
          attachments?: Json
          status?: string
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bounty_id?: string | null
          submitter_id?: string | null
          content?: string
          attachments?: Json
          status?: string
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          submission_id: string | null
          voter_id: string | null
          vote_proof: string | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id?: string | null
          voter_id?: string | null
          vote_proof?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string | null
          voter_id?: string | null
          vote_proof?: string | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          profile_id: string | null
          type: string
          bounty_id: string | null
          metadata: Json
          nft_token_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          type: string
          bounty_id?: string | null
          metadata?: Json
          nft_token_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          type?: string
          bounty_id?: string | null
          metadata?: Json
          nft_token_id?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          from_profile_id: string | null
          to_profile_id: string | null
          bounty_id: string | null
          amount: number
          token: string
          tx_hash: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          from_profile_id?: string | null
          to_profile_id?: string | null
          bounty_id?: string | null
          amount: number
          token?: string
          tx_hash?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          from_profile_id?: string | null
          to_profile_id?: string | null
          bounty_id?: string | null
          amount?: number
          token?: string
          tx_hash?: string | null
          status?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json
          read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
      }
    }
  }
}
