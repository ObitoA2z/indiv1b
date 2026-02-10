import { useState } from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full shadow-[0_0_30px_rgba(0,0,0,0.6)]">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <div>
            <h2 className="text-slate-100">Creer un compte</h2>
            <p className="text-slate-500 text-xs">Votre demande passera par la maison</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-slate-300 mb-1 text-sm">Nom</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-900 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

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

          <div>
            <label className="block text-slate-300 mb-1 text-sm">Adresse</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-900 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="123 Rue de la Paix, Paris"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 text-sm">Numero de telephone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-900 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 text-sm">Sexe</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value as 'male' | 'female' | 'other' | '')}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-900 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">Selectionner...</option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <span className="block text-slate-300 mb-1 text-sm">Type de compte</span>
            <div className="flex items-center gap-4 text-sm text-slate-200">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="role" value="BUYER" checked={role==='BUYER'} onChange={() => setRole('BUYER')} />
                Acheteur
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="role" value="SELLER" checked={role==='SELLER'} onChange={() => setRole('SELLER')} />
                Vendeur
              </label>
            </div>
          </div>

          {error && (
            <p className="text-rose-300 text-xs mb-1">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-rose-600 text-white py-2 rounded-lg text-sm hover:bg-rose-500 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creation...' : 'Creer le compte'}
          </button>

          <p className="text-slate-500 text-xs mt-2">
            Votre compte sera soumis a validation par un administrateur avant d'etre active.
            Les vendeurs peuvent publier des objets apres approbation.
          </p>
        </form>
      </div>
    </div>
  );
}
