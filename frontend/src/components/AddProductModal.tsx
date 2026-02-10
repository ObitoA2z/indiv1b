import { useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
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
    images: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    } else if (formData.description.length < 50) {
      newErrors.description = 'La description doit contenir au moins 50 caracteres';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Le prix doit etre superieur a 0';
    }

    if (formData.shipping < 0) {
      newErrors.shipping = 'Les frais de port ne peuvent pas etre negatifs';
    }

    if (!formData.category) {
      newErrors.category = 'Veuillez selectionner une categorie';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'Au moins une photo est obligatoire';
    }

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

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
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
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: '' }));
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'upload des images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full my-8 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div>
            <h2 className="text-slate-100">Publier un objet d'epouvante</h2>
            <p className="text-slate-400 text-sm">Chaque objet passe par un rituel de verification</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-slate-200 mb-2">Photos de l'objet *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
            <div className="grid grid-cols-4 gap-4 mb-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative">
                  <img src={img} alt={`Product ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-slate-800" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 hover:bg-rose-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.images.length < 8 && (
                <button
                  type="button"
                  onClick={handleFileInputClick}
                  className="h-24 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center hover:border-rose-500 hover:bg-rose-500/10 transition-colors"
                  disabled={uploading}
                >
                  <Upload className="h-6 w-6 text-slate-400 mb-1" />
                  <span className="text-slate-400">
                    {uploading ? 'Upload en cours...' : 'Ajouter'}
                  </span>
                </button>
              )}
            </div>
            {errors.images && <p className="text-rose-300">{errors.images}</p>}
            <p className="text-slate-500">Ajoutez jusqu'a 8 photos de qualite de votre objet</p>
          </div>

          <div>
            <label className="block text-slate-200 mb-2">Titre de l'objet *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg bg-slate-900 text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.title ? 'border-rose-500' : 'border-slate-700'}`}
              placeholder="Ex: Grimoire d'initiation - Edition 1897"
              maxLength={100}
            />
            {errors.title && <p className="text-rose-300 mt-1">{errors.title}</p>}
            <p className="text-slate-500 mt-1">{formData.title.length}/100 caracteres</p>
          </div>

          <div>
            <label className="block text-slate-200 mb-2">Description detaillee *</label>
            <textarea
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg bg-slate-900 text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.description ? 'border-rose-500' : 'border-slate-700'}`}
              placeholder="Decrivez votre objet d'epouvante : etat, origine, histoire, rituels associes..."
              maxLength={1000}
            />
            {errors.description && <p className="text-rose-300 mt-1">{errors.description}</p>}
            <p className="text-slate-500 mt-1">
              {formData.description.length}/1000 caracteres (minimum 50)
            </p>
          </div>

          <div>
            <label className="block text-slate-200 mb-2">Categorie *</label>
            <select
              value={formData.category}
              onChange={e => handleInputChange('category', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg bg-slate-900 text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.category ? 'border-rose-500' : 'border-slate-700'}`}
            >
              <option value="">Selectionnez une categorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-rose-300 mt-1">{errors.category}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-200 mb-2">Prix de vente *</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={e => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2 border rounded-lg bg-slate-900 text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.price ? 'border-rose-500' : 'border-slate-700'}`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500">€</span>
              </div>
              {errors.price && <p className="text-rose-300 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-slate-200 mb-2">Frais de port</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.shipping || ''}
                  onChange={e => handleInputChange('shipping', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2 border rounded-lg bg-slate-900 text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.shipping ? 'border-rose-500' : 'border-slate-700'}`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500">€</span>
              </div>
              {errors.shipping && <p className="text-rose-300 mt-1">{errors.shipping}</p>}
            </div>
          </div>

          {formData.price > 0 && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
              <h4 className="text-rose-200 mb-2">Recapitulatif</h4>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Prix de vente</span>
                  <span>{formData.price.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Commission Maison de l'Epouvante (5%)</span>
                  <span>- {(formData.price * 0.05).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-1 mt-1">
                  <span>Vous recevrez</span>
                  <span>{(formData.price * 0.95).toFixed(2)} €</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <h4 className="text-amber-200 mb-2">Informations importantes</h4>
            <ul className="text-amber-200/80 space-y-1">
              <li>• Votre objet sera verifie avant publication (24-48h)</li>
              <li>• Les paiements se font uniquement via la plateforme</li>
              <li>• Ne communiquez jamais vos coordonnees personnelles</li>
              <li>• Assurez-vous que votre objet est authentique</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-900 text-slate-200 border border-slate-700 py-3 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-500 transition-colors"
            >
              Publier l'objet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
