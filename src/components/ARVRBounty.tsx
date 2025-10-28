import React, { useState, useRef, useEffect } from 'react';
import { Camera, QrCode, Box, Play, CheckCircle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ARVRBountyProps {
  bountyId: string;
  bountyData: any;
  onInteraction?: () => void;
}

export default function ARVRBounty({ bountyId, bountyData, onInteraction }: ARVRBountyProps) {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [arMode, setArMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setScanning(true);
    } catch (err) {
      console.error('Camera permission denied:', err);
      alert('Se necesita permiso de cámara para escanear códigos QR');
    }
  };

  const handleScan = async () => {
    if (!scannedData) return;

    try {
      await supabase
        .from('ar_interactions')
        .insert({
          bounty_id: bountyId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          interaction_type: 'qr_scan',
          scan_data: { qr_code: scannedData }
        });

      onInteraction?.();
    } catch (err) {
      console.error('Error recording AR interaction:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setScanning(false);
    setHasPermission(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-lg">
          <Box className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            {bountyData.ar_vr_type === 'ar' ? 'Reto de Realidad Aumentada' :
             bountyData.ar_vr_type === 'vr' ? 'Reto de Realidad Virtual' :
             'Reto de Realidad Mixta'}
          </h3>
          <p className="text-gray-400 text-sm">Experiencia inmersiva interactiva</p>
        </div>
      </div>

      {bountyData.ar_instructions && (
        <div className="mb-6 p-4 bg-black/30 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Instrucciones:</h4>
          <p className="text-gray-300 text-sm">{bountyData.ar_instructions.description}</p>
        </div>
      )}

      {bountyData.qr_code_data && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Escanea el código QR para participar</span>
          </div>

          {!scanning ? (
            <button
              onClick={requestCameraPermission}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Activar Escáner QR
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-4 border-purple-500/50 rounded-lg">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-purple-500">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500"></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={stopCamera}
                  className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleScan}
                  disabled={!scannedData}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirmar Escaneo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {bountyData.model_3d_url && (
        <div className="mb-6">
          <button
            onClick={() => setArMode(!arMode)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            {arMode ? 'Cerrar Vista AR' : 'Ver en Realidad Aumentada'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-black/30 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Tipo</div>
          <div className="text-white font-semibold uppercase">{bountyData.ar_vr_type}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Estado</div>
          <div className="text-green-400 font-semibold">Activo</div>
        </div>
      </div>
    </div>
  );
}
