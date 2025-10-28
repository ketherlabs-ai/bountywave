import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Unlock, Trophy, Compass } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GeolocatedBountyMapProps {
  bountyId?: string;
  showNearby?: boolean;
}

export default function GeolocatedBountyMap({ bountyId, showNearby = false }: GeolocatedBountyMapProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [geoBounties, setGeoBounties] = useState<any[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<any>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    getUserLocation();
    if (showNearby) {
      loadNearbyBounties();
    } else if (bountyId) {
      loadBountyLocation();
    }
  }, [bountyId, showNearby]);

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const loadBountyLocation = async () => {
    if (!bountyId) return;

    const { data } = await supabase
      .from('geolocated_bounties')
      .select('*, bounties(*)')
      .eq('bounty_id', bountyId)
      .single();

    if (data) {
      setSelectedBounty(data);
    }
  };

  const loadNearbyBounties = async () => {
    const { data } = await supabase
      .from('geolocated_bounties')
      .select('*, bounties(*)');

    if (data) {
      setGeoBounties(data);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const unlockBounty = async (geoBounty: any) => {
    if (!userLocation) {
      alert('Se necesita tu ubicación para desbloquear este bounty');
      return;
    }

    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lon,
      parseFloat(geoBounty.latitude),
      parseFloat(geoBounty.longitude)
    );

    if (distance > geoBounty.radius_meters) {
      alert(`Debes estar dentro de ${geoBounty.radius_meters}m del bounty. Estás a ${Math.round(distance)}m`);
      return;
    }

    setUnlocking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from('bounty_unlocks')
        .insert({
          bounty_id: geoBounty.bounty_id,
          user_id: user?.id,
          unlock_latitude: userLocation.lat,
          unlock_longitude: userLocation.lon
        });

      alert('¡Bounty desbloqueado! Ahora puedes participar.');
    } catch (err) {
      console.error('Error unlocking bounty:', err);
      alert('Error al desbloquear el bounty');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-blue-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Bounty Geolocalizados</h3>
          <p className="text-gray-400 text-sm">Búsqueda del tesoro en tu ciudad</p>
        </div>
      </div>

      {!userLocation ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Navigation className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Obteniendo tu ubicación...</p>
          <button
            onClick={getUserLocation}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Activar Ubicación
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
            <Compass className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-white font-medium">Ubicación Detectada</div>
              <div className="text-gray-400 text-sm">
                Lat: {userLocation.lat.toFixed(6)}, Lon: {userLocation.lon.toFixed(6)}
              </div>
            </div>
          </div>

          {showNearby && (
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Bounties Cercanos</h4>
              {geoBounties.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                  No hay bounties geolocalizados cerca de ti
                </div>
              ) : (
                geoBounties.map((geoBounty) => {
                  const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lon,
                    parseFloat(geoBounty.latitude),
                    parseFloat(geoBounty.longitude)
                  );

                  const isInRange = distance <= geoBounty.radius_meters;

                  return (
                    <div
                      key={geoBounty.id}
                      className={`bg-gray-800 rounded-lg p-4 border-2 transition-all ${
                        isInRange
                          ? 'border-green-500'
                          : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="text-white font-semibold mb-1">
                            {geoBounty.bounties?.title || 'Bounty'}
                          </h5>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MapPin className="w-4 h-4" />
                            {geoBounty.city}, {geoBounty.country}
                          </div>
                        </div>
                        {geoBounty.is_treasure_hunt && (
                          <Trophy className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-400 text-xs">Distancia</div>
                          <div className={`font-bold ${
                            isInRange ? 'text-green-400' : 'text-gray-300'
                          }`}>
                            {Math.round(distance)}m
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-400 text-xs">Radio</div>
                          <div className="text-white font-bold">
                            {geoBounty.radius_meters}m
                          </div>
                        </div>

                        <button
                          onClick={() => unlockBounty(geoBounty)}
                          disabled={!isInRange || unlocking}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                            isInRange
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Unlock className="w-4 h-4" />
                          {isInRange ? 'Desbloquear' : 'Fuera de rango'}
                        </button>
                      </div>

                      {geoBounty.clue_text && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="text-gray-400 text-xs mb-1">Pista</div>
                          <div className="text-gray-300 text-sm italic">
                            "{geoBounty.clue_text}"
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {selectedBounty && !showNearby && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-white font-semibold mb-4">Ubicación del Bounty</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-400 text-sm">Ciudad</div>
                  <div className="text-white font-medium">
                    {selectedBounty.city}, {selectedBounty.country}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Radio de activación</div>
                  <div className="text-white font-medium">{selectedBounty.radius_meters} metros</div>
                </div>
                {selectedBounty.clue_text && (
                  <div>
                    <div className="text-gray-400 text-sm">Pista</div>
                    <div className="text-gray-300 italic">"{selectedBounty.clue_text}"</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
