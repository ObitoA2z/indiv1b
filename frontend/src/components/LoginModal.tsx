import { useState } from 'react';
import { X, KeyRound, DoorOpen } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void> | void;
}

export function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
      <div className="pm-panel pm-edge w-full max-w-2xl rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-[0.95fr_1.05fr]">
          <aside className="hidden md:block border-r border-[#4f3426] bg-[#1a1310]/80 p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4f3426] bg-[#261a14] px-3 py-1 text-xs text-[#f7f0e8] mb-4">
              <DoorOpen className="h-3.5 w-3.5 text-[#f28d49]" />
              Acces prive
            </div>
            <h3 className="text-2xl text-[#f7f0e8] mb-3">Connexion au manoir</h3>
            <p className="text-sm text-[#d7c8b8] leading-relaxed">
              Connecte-toi pour acheter, publier et suivre tes contenus epouvante.
            </p>
          </aside>

          <section className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[#f7f0e8] text-xl">Se connecter</h2>
                <p className="text-[#d7c8b8] text-xs">Session securisee</p>
              </div>
              <button onClick={onClose} className="text-[#d7c8b8] hover:text-[#f28d49]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[#f7f0e8] mb-1 text-sm">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#4f3426] bg-[#1a1310]/90 px-3 py-2 text-sm text-[#f7f0e8] placeholder:text-[#bcae9e] focus:outline-none focus:ring-2 focus:ring-[#d95f18]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-[#f7f0e8] mb-1 text-sm">Mot de passe</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bcae9e]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-[#4f3426] bg-[#1a1310]/90 py-2 pl-9 pr-3 text-sm text-[#f7f0e8] placeholder:text-[#bcae9e] focus:outline-none focus:ring-2 focus:ring-[#d95f18]/40"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-[#ffc59f] text-xs">{error}</p>}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#d95f18] py-2.5 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Ouvrir ma session'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
