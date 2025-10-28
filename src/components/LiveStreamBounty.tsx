import React, { useState, useEffect, useRef } from 'react';
import { Video, Users, Send, Mic, MicOff, VideoOff, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LiveStreamBountyProps {
  bountyId: string;
  isHost?: boolean;
}

export default function LiveStreamBounty({ bountyId, isHost = false }: LiveStreamBountyProps) {
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStreamSession();
    subscribeToChat();

    return () => {
      supabase.channel('stream_chat').unsubscribe();
    };
  }, [bountyId]);

  const loadStreamSession = async () => {
    const { data } = await supabase
      .from('stream_sessions')
      .select('*')
      .eq('bounty_id', bountyId)
      .eq('status', 'live')
      .maybeSingle();

    if (data) {
      setSession(data);
      setViewerCount(data.viewer_count);
      if (data.playback_url && videoRef.current) {
        videoRef.current.src = data.playback_url;
      }
    }
  };

  const subscribeToChat = () => {
    const channel = supabase
      .channel('stream_chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'stream_chat',
        filter: `session_id=eq.${session?.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();
  };

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !session) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('stream_chat')
      .insert({
        session_id: session.id,
        user_id: user.id,
        message: newMessage
      });

    setNewMessage('');
  };

  const startStream = async () => {
    if (!isHost) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { data: newSession } = await supabase
        .from('stream_sessions')
        .insert({
          bounty_id: bountyId,
          host_id: user?.id,
          status: 'live',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      setSession(newSession);
    } catch (err) {
      console.error('Error starting stream:', err);
      alert('No se pudo acceder a la cámara y micrófono');
    }
  };

  const endStream = async () => {
    if (!session || !isHost) return;

    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }

    await supabase
      .from('stream_sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .eq('id', session.id);

    setSession(null);
  };

  if (!session && !isHost) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No hay transmisión en vivo en este momento</p>
      </div>
    );
  }

  if (isHost && !session) {
    return (
      <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-xl p-8 text-center border border-red-500/30">
        <Video className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Iniciar Transmisión en Vivo</h3>
        <p className="text-gray-400 mb-6">Colabora con la comunidad en tiempo real</p>
        <button
          onClick={startStream}
          className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all"
        >
          Comenzar Stream
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-4 left-4 flex items-center gap-3">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            EN VIVO
          </div>
          <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            {viewerCount} espectadores
          </div>
        </div>

        {isHost && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-white/20'} backdrop-blur-md text-white hover:bg-white/30 transition-all`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-white/20'} backdrop-blur-md text-white hover:bg-white/30 transition-all`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
            <button
              onClick={endStream}
              className="px-6 py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
            >
              Finalizar Stream
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 p-6">
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold text-white mb-4">Información del Stream</h3>
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div>
              <div className="text-gray-400 text-sm">Estado</div>
              <div className="text-white font-semibold">Transmitiendo en vivo</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Espectadores</div>
              <div className="text-white font-semibold">{viewerCount} conectados</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Duración</div>
              <div className="text-white font-semibold">
                {session?.started_at ? new Date(session.started_at).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Chat en Vivo</h3>
          </div>

          <div
            ref={chatRef}
            className="bg-gray-800 rounded-lg p-4 h-64 overflow-y-auto mb-3 space-y-2"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className="bg-gray-700 rounded-lg p-2">
                <div className="text-blue-400 text-sm font-semibold">{msg.user_id.slice(0, 8)}</div>
                <div className="text-white text-sm">{msg.message}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
