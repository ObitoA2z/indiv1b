import { useState } from 'react';
import { X } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void> | void;
}

export function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('buyer@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full shadow-[0_0_30px_rgba(0,0,0,0.6)]">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <div>
            <h2 className="text-slate-100">Se connecter</h2>
            <p className="text-slate-500 text-xs">Acces reserve aux visiteurs autorises</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-slate-300 mb-1 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-900 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 text-sm">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-900 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <p className="text-rose-300 text-xs mb-1">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-rose-600 text-white py-2 rounded-lg text-sm hover:bg-rose-500 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p className="text-slate-500 text-xs mt-2">
            Comptes de demo :
            <br />- buyer@example.com / password123 (acheteur)
            <br />- seller@example.com / password123 (vendeur)
            <br />- admin@example.com / password123 (admin)
          </p>
        </form>
      </div>
    </div>
  );
}
