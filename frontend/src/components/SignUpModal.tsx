import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

interface SignUpModalProps {
  onClose: () => void;
  onRegister: (
    name: string,
    email: string,
    password: string,
    role: 'BUYER' | 'SELLER',
    address?: string,
    phone?: string,
    gender?: string,
  ) => Promise<void> | void;
}

export function SignUpModal({ onClose, onRegister }: SignUpModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onRegister(name, email, password, role, address, phone, gender);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
      <div className="pm-panel pm-edge w-full max-w-3xl rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#4f3426] px-5 py-4">
          <div>
            <h2 className="text-[#f7f0e8] text-xl">Creer un compte</h2>
            <p className="text-[#d7c8b8] text-xs">Inscription immediate et acces a ton espace</p>
          </div>
          <button onClick={onClose} className="text-[#d7c8b8] hover:text-[#f28d49]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#f7f0e8] mb-1 text-sm">Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#4f3426] bg-[#1a1310]/90 px-3 py-2 text-sm text-[#f7f0e8] focus:outline-none focus:ring-2 focus:ring-[#d95f18]/40"
              />
            </div>

            <div>
              <label className="block text-[#f7f0e8] mb-1 text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#4f3426] bg-[#1a1310]/90 px-3 py-2 text-sm text-[#f7f0e8] focus:outline-none focus:ring-2 focus:ring-[#d95f18]/40"
                required
              />
            </div>

            <div>
              <label className="block text-[#f7f0e8] mb-1 text-sm">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#4f3426] bg-[#1a1310]/90 px-3 py-2 text-sm text-[#f7f0e8] focus:outline-none focus:ring-2 focus:ring-[#d95f18]/40"
                required
              />
              <p className="text-[#d7c8b8] text-xs mt-1">Minimum 6 caracteres</p>
            </div>

            <div>
              <label className="block text-[#f7f0e8] mb-1 text-sm">Telephone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-[#4f3426] bg-[#1a1310]/90 px-3 py-2 text-sm text-[#f7f0e8] focus:outline-none focus:ring-2 focus:ring-[#d95f18]/40"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[#f7f0e8] mb-1 text-sm">Adresse</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-[#4f3426] bg-[#1a1310]/90 px-3 py-2 text-sm text-[#f7f0e8] focus:outline-none focus:ring-2 focus:ring-[#d95f18]/40"
                placeholder="12 rue des ombres, Lyon"
              />
            </div>

            <div>
              <label className="block text-[#f7f0e8] mb-1 text-sm">Sexe</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other' | '')}
                className="w-full rounded-lg border border-[#4f3426] bg-[#1a1310]/90 px-3 py-2 text-sm text-[#f7f0e8] focus:outline-none focus:ring-2 focus:ring-[#d95f18]/40"
              >
                <option className="bg-[#1a1310]" value="">Selectionner...</option>
                <option className="bg-[#1a1310]" value="male">Homme</option>
                <option className="bg-[#1a1310]" value="female">Femme</option>
                <option className="bg-[#1a1310]" value="other">Autre</option>
              </select>
            </div>

            <div>
              <span className="block text-[#f7f0e8] mb-1 text-sm">Type de compte</span>
              <div className="flex items-center gap-4 text-sm text-[#f7f0e8] rounded-lg border border-[#4f3426] bg-[#1a1310]/90 px-3 py-2.5">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value="BUYER" checked={role === 'BUYER'} onChange={() => setRole('BUYER')} />
                  Acheteur
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value="SELLER" checked={role === 'SELLER'} onChange={() => setRole('SELLER')} />
                  Vendeur
                </label>
              </div>
            </div>
          </div>

          {error && <p className="text-[#ffc59f] text-xs mt-3">{error}</p>}

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-[#d7c8b8] text-xs">
              Le compte est actif immediatement. Les vendeurs publient apres approbation.
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d95f18] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-50"
              disabled={loading}
            >
              <UserPlus className="h-4 w-4" />
              {loading ? 'Creation...' : 'Creer le compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
