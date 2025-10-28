import React, { useEffect, useState } from 'react';
import { Trophy, Zap, TrendingUp, Star, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DynamicNFTCardProps {
  profileId: string;
  compact?: boolean;
}

export default function DynamicNFTCard({ profileId, compact = false }: DynamicNFTCardProps) {
  const [nftData, setNftData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTData();
  }, [profileId]);

  const loadNFTData = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_nfts')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (data) {
        setNftData(data);
      } else if (!error) {
        const { data: newNFT } = await supabase
          .from('dynamic_nfts')
          .insert({
            profile_id: profileId,
            current_level: 1,
            total_xp: 0,
            visual_traits: {
              background: 'cosmic',
              frame: 'bronze',
              badge: 'novice'
            }
          })
          .select()
          .single();

        setNftData(newNFT);
      }
    } catch (err) {
      console.error('Error loading NFT data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-800 rounded-xl p-6 h-64">
        <div className="h-full bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  if (!nftData) return null;

  const levelProgress = (nftData.total_xp % 1000) / 1000 * 100;
  const nextLevelXP = (Math.floor(nftData.total_xp / 1000) + 1) * 1000;

  const getFrameColor = (level: number) => {
    if (level >= 50) return 'from-yellow-400 to-orange-500';
    if (level >= 25) return 'from-purple-400 to-pink-500';
    if (level >= 10) return 'from-blue-400 to-cyan-500';
    return 'from-gray-400 to-gray-600';
  };

  const getRankTitle = (level: number) => {
    if (level >= 50) return 'Legendario';
    if (level >= 25) return 'Maestro';
    if (level >= 10) return 'Experto';
    if (level >= 5) return 'Avanzado';
    return 'Novato';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getFrameColor(nftData.current_level)} flex items-center justify-center font-bold text-white text-xl`}>
          {nftData.current_level}
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold">{getRankTitle(nftData.current_level)}</div>
          <div className="text-gray-400 text-sm">{nftData.total_xp.toLocaleString()} XP</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-700">
      <div className={`h-48 bg-gradient-to-br ${getFrameColor(nftData.current_level)} relative`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-bold">Nivel {nftData.current_level}</span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getFrameColor(nftData.current_level)} flex items-center justify-center`}>
              <div className="w-28 h-28 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center">
                <Trophy className="w-16 h-16 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-2">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white">{getRankTitle(nftData.current_level)}</h3>
            <div className="flex items-center gap-1 text-yellow-400">
              <Zap className="w-4 h-4" />
              <span className="font-bold">{nftData.total_xp.toLocaleString()} XP</span>
            </div>
          </div>

          <div className="relative">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getFrameColor(nftData.current_level)} transition-all duration-500`}
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{nftData.total_xp % 1000} XP</span>
              <span>{nextLevelXP} XP</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-white font-bold">{nftData.current_level}</div>
            <div className="text-gray-400 text-xs">Nivel</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-white font-bold">{(nftData.total_xp / 1000).toFixed(1)}k</div>
            <div className="text-gray-400 text-xs">Total XP</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <Star className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-white font-bold">{Object.keys(nftData.visual_traits).length}</div>
            <div className="text-gray-400 text-xs">Rasgos</div>
          </div>
        </div>

        {nftData.contract_address && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-gray-400 text-xs mb-1">NFT Address</div>
            <div className="text-white text-xs font-mono truncate">
              {nftData.contract_address}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
