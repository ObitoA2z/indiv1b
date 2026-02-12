import { useRef, useState } from 'react';
import { X, Upload, Camera, ScrollText, Sparkles } from 'lucide-react';
import { categories } from '../data/mockData';
import { uploadImage } from '../api/client';

interface AddProductModalProps {
  onClose: () => void;
  onSubmit: (productData: ProductFormData) => void;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  shipping: number;
  category: string;
  images: string[];
}

export function AddProductModal({ onClose, onSubmit }: AddProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    shipping: 0,
    category: '',
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Le titre est obligatoire';
    if (!formData.description.trim()) newErrors.description = 'La description est obligatoire';
    else if (formData.description.length < 50) newErrors.description = 'Minimum 50 caracteres';
    if (formData.price <= 0) newErrors.price = 'Le prix doit etre superieur a 0';
    if (formData.shipping < 0) newErrors.shipping = 'Les frais de port ne peuvent pas etre negatifs';
    if (!formData.category) newErrors.category = 'Veuillez selectionner une categorie';
    if (formData.images.length === 0) newErrors.images = 'Au moins une photo est obligatoire';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        uploadedUrls.push(url);
      }
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      if (errors.images) setErrors((prev) => ({ ...prev, images: '' }));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'upload des images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#020409]/85 p-3 backdrop-blur-sm sm:p-6">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-cyan-300/30 bg-[#040815]/95 shadow-[0_0_90px_rgba(45,212,191,0.2)]">
        <header className="flex items-start justify-between gap-4 border-b border-cyan-300/20 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Publication</p>
            <h2 className="text-xl text-[#effbff]">Ajouter un produit epouvante</h2>
            <p className="text-sm text-cyan-100/70">Une fiche claire augmente la validation moderation.</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-cyan-300/35 bg-cyan-300/10 p-1.5 text-cyan-100 hover:bg-cyan-300/20">
            <X className="h-6 w-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[1.35fr_0.85fr] lg:p-7">
          <section className="space-y-4">
            <div className="rounded-2xl border border-cyan-300/20 bg-[#081128] p-4">
              <label className="mb-2 block text-sm text-cyan-50">Titre *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full rounded-xl border bg-[#040917] px-4 py-2 text-sm text-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 ${
                  errors.title ? 'border-red-400' : 'border-cyan-300/25'
                }`}
                placeholder="Ex: Masque de plague doctor artisanal"
                maxLength={100}
              />
              {errors.title && <p className="mt-1 text-xs text-red-300">{errors.title}</p>}
            </div>

            <div className="rounded-2xl border border-cyan-300/20 bg-[#081128] p-4">
              <label className="mb-2 block text-sm text-cyan-50">Description detaillee *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={8}
                className={`w-full rounded-xl border bg-[#040917] px-4 py-2 text-sm text-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 ${
                  errors.description ? 'border-red-400' : 'border-cyan-300/25'
                }`}
                placeholder="Origine, etat, details, dimensions, histoire..."
                maxLength={1000}
              />
              {errors.description && <p className="mt-1 text-xs text-red-300">{errors.description}</p>}
              <p className="mt-1 text-xs text-cyan-100/55">{formData.description.length}/1000 caracteres</p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-cyan-300/20 bg-[#081128] p-4">
                <label className="mb-2 block text-sm text-cyan-50">Categorie *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full rounded-xl border bg-[#040917] px-3 py-2 text-sm text-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 ${
                    errors.category ? 'border-red-400' : 'border-cyan-300/25'
                  }`}
                >
                  <option className="bg-[#040917]" value="">Choisir</option>
                  {categories.map((cat) => (
                    <option className="bg-[#040917]" key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-300">{errors.category}</p>}
              </div>

              <div className="rounded-2xl border border-cyan-300/20 bg-[#081128] p-4">
                <label className="mb-2 block text-sm text-cyan-50">Prix *</label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className={`w-full rounded-xl border bg-[#040917] px-3 py-2 text-sm text-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 ${
                    errors.price ? 'border-red-400' : 'border-cyan-300/25'
                  }`}
                  min="0"
                  step="0.01"
                />
                {errors.price && <p className="mt-1 text-xs text-red-300">{errors.price}</p>}
              </div>

              <div className="rounded-2xl border border-cyan-300/20 bg-[#081128] p-4">
                <label className="mb-2 block text-sm text-cyan-50">Port</label>
                <input
                  type="number"
                  value={formData.shipping || ''}
                  onChange={(e) => handleInputChange('shipping', parseFloat(e.target.value) || 0)}
                  className={`w-full rounded-xl border bg-[#040917] px-3 py-2 text-sm text-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 ${
                    errors.shipping ? 'border-red-400' : 'border-cyan-300/25'
                  }`}
                  min="0"
                  step="0.01"
                />
                {errors.shipping && <p className="mt-1 text-xs text-red-300">{errors.shipping}</p>}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-cyan-300/20 bg-[#081128] p-4">
              <div className="mb-2 flex items-center gap-2 text-cyan-50">
                <Camera className="h-4 w-4 text-cyan-300" /> Photos ({formData.images.length}/8)
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />

              <div className="mb-2 grid grid-cols-3 gap-2">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt={`Product ${index + 1}`} className="h-20 w-full rounded-lg border border-cyan-300/20 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {formData.images.length < 8 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="grid h-20 place-items-center rounded-lg border-2 border-dashed border-cyan-300/35 text-cyan-100/70 hover:text-cyan-100"
                    disabled={uploading}
                  >
                    <Upload className="h-5 w-5" />
                  </button>
                )}
              </div>

              {errors.images && <p className="text-xs text-red-300">{errors.images}</p>}
              <p className="text-xs text-cyan-100/60">{uploading ? 'Upload en cours...' : 'Ajoute des photos nettes et bien eclairees.'}</p>
            </div>

            <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm text-emerald-100">
              <p className="mb-2 inline-flex items-center gap-2">
                <ScrollText className="h-4 w-4" /> Regles de publication
              </p>
              <ul className="space-y-1 text-xs">
                <li>- Description fidele et complete</li>
                <li>- Aucun contact externe</li>
                <li>- Moderation 24h a 48h</li>
                <li>- Commission maison 5%</li>
              </ul>
            </div>

            {formData.price > 0 && (
              <div className="rounded-2xl border border-cyan-300/20 bg-[#081128] p-4 text-sm">
                <p className="mb-2 inline-flex items-center gap-2 text-cyan-50"><Sparkles className="h-4 w-4 text-cyan-300" /> Recapitulatif</p>
                <div className="space-y-1 text-xs text-cyan-100/70">
                  <div className="flex justify-between"><span>Prix</span><span>{formData.price.toFixed(2)} EUR</span></div>
                  <div className="flex justify-between"><span>Commission</span><span>- {(formData.price * 0.05).toFixed(2)} EUR</span></div>
                  <div className="flex justify-between border-t border-cyan-300/20 pt-1 text-cyan-50"><span>Net vendeur</span><span>{(formData.price * 0.95).toFixed(2)} EUR</span></div>
                </div>
              </div>
            )}
          </aside>

          <div className="flex gap-3 lg:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-cyan-300/30 bg-cyan-300/10 py-2.5 text-sm text-cyan-100 hover:bg-cyan-300/20"
            >
              Annuler
            </button>
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-2.5 text-sm font-semibold text-white">
              Publier le produit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
