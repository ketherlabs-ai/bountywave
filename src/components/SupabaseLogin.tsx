import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SupabaseLogin({ onLogin }: { onLogin?: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Te hemos enviado un email. Verifica el link y después podrás conectar tu wallet.");
      if (onLogin) onLogin();
    }
  };

  return (
    <form onSubmit={handleLogin} className="login-form">
      <h2>Inicia sesión</h2>
      <input
        type="email"
        placeholder="Tu correo"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={loading || !email}>
        {loading ? "Enviando..." : "Iniciar sesión"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
