import React, { useState } from 'react';
import {
  Sparkles, Camera, Trophy, Video, MapPin, Zap, Gift, BarChart3,
  ChevronRight, X
} from 'lucide-react';
import ARVRBounty from './ARVRBounty';
import DynamicNFTCard from './DynamicNFTCard';
import LiveStreamBounty from './LiveStreamBounty';
import AIBountyGenerator from './AIBountyGenerator';
import GeolocatedBountyMap from './GeolocatedBountyMap';
import InstantPayoutPanel from './InstantPayoutPanel';
import VoterLottery from './VoterLottery';
import GamifiedDashboard from './GamifiedDashboard';

const features = [
  {
    id: 'ar-vr',
    icon: Camera,
    title: 'Retos AR/VR',
    description: 'Escanea códigos QR y participa en experiencias de realidad aumentada',
    color: 'from-purple-600 to-pink-600',
    component: ARVRBounty,
    mockData: {
      bountyId: 'demo-ar-vr',
      bountyData: {
        ar_vr_type: 'ar',
        qr_code_data: 'DEMO_QR_CODE',
        model_3d_url: 'https://example.com/model.glb',
        ar_instructions: {
          description: 'Escanea el código QR con tu cámara para desbloquear el reto en realidad aumentada'
        }
      }
    }
  },
  {
    id: 'nft',
    icon: Trophy,
    title: 'NFT Dinámico',
    description: 'Tu reputación evoluciona visualmente como un NFT único',
    color: 'from-yellow-600 to-orange-600',
    component: DynamicNFTCard,
    mockData: {
      profileId: 'demo-profile'
    }
  },
  {
    id: 'stream',
    icon: Video,
    title: 'Streaming en Vivo',
    description: 'Colabora en tiempo real con video, audio y chat integrado',
    color: 'from-red-600 to-pink-600',
    component: LiveStreamBounty,
    mockData: {
      bountyId: 'demo-stream',
      isHost: false
    }
  },
  {
    id: 'ai',
    icon: Sparkles,
    title: 'Generador IA',
    description: 'Crea retos, imágenes y contenido con inteligencia artificial',
    color: 'from-purple-600 to-indigo-600',
    component: AIBountyGenerator,
    mockData: {}
  },
  {
    id: 'geo',
    icon: MapPin,
    title: 'Bounty Hunt',
    description: 'Búsqueda del tesoro geolocalizada en tu ciudad',
    color: 'from-blue-600 to-cyan-600',
    component: GeolocatedBountyMap,
    mockData: {
      showNearby: true
    }
  },
  {
    id: 'payout',
    icon: Zap,
    title: 'Pago Instantáneo',
    description: 'Recibe fondos en streaming por segundo mientras trabajas',
    color: 'from-green-600 to-emerald-600',
    component: InstantPayoutPanel,
    mockData: {
      bountyId: 'demo-payout',
      recipientId: 'demo-recipient'
    }
  },
  {
    id: 'lottery',
    icon: Gift,
    title: 'Lotería de Votantes',
    description: 'Gana premios semanales solo por participar votando',
    color: 'from-yellow-600 to-orange-600',
    component: VoterLottery,
    mockData: {}
  },
  {
    id: 'dashboard',
    icon: BarChart3,
    title: 'Dashboard Gamificado',
    description: 'Estadísticas avanzadas, heatmaps y predicciones con IA',
    color: 'from-indigo-600 to-purple-600',
    component: GamifiedDashboard,
    mockData: {
      userId: 'demo-user'
    }
  }
];

export default function FeaturesShowcase() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const getFeatureById = (id: string) => features.find(f => f.id === id);
  const selectedFeatureData = selectedFeature ? getFeatureById(selectedFeature) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 mb-6">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">Funcionalidades Avanzadas</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            8 Funcionalidades Disruptivas
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explora todas las características innovadoras implementadas en BountyWave MVP
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => setSelectedFeature(feature.id)}
                className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:scale-105 text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`}></div>

                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{feature.description}</p>

                <div className="flex items-center text-purple-400 text-sm font-medium">
                  <span>Ver Demo</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>

                {selectedFeature === feature.id && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>

        {selectedFeatureData && (
          <div className="bg-gray-900 rounded-2xl border-2 border-purple-500/30 overflow-hidden">
            <div className={`bg-gradient-to-r ${selectedFeatureData.color} px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <selectedFeatureData.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedFeatureData.title}</h2>
                  <p className="text-white/80 text-sm">{selectedFeatureData.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6">
              <selectedFeatureData.component {...selectedFeatureData.mockData} />
            </div>
          </div>
        )}

        {!selectedFeature && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Selecciona una funcionalidad para ver su demo
              </h3>
              <p className="text-gray-400">
                Haz clic en cualquier tarjeta de arriba para explorar las características
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
