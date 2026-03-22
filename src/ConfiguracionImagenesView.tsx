import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, Image as ImageIcon } from 'lucide-react';

export const ConfiguracionImagenesView = ({ appSettings, onSave, onBack }: { appSettings: any, onSave: (settings: any) => void, onBack: () => void }) => {
  const [heroImage, setHeroImage] = useState(appSettings?.heroImage || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const newSettings = {
      ...appSettings,
      heroImage
    };
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (response.ok) {
        onSave(newSettings);
        onBack();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
            <ImageIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Configuración de Inicio</h2>
            <p className="text-stone-500">Actualiza la imagen principal de la página de inicio.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-stone-800 mb-4">Imagen Principal (Hero)</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">URL de la imagen</label>
              <input 
                type="text" 
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              {heroImage && (
                <div className="mt-4 aspect-video max-w-md rounded-xl overflow-hidden border border-stone-200">
                  <img src={heroImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-100 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
          >
            <ChevronLeft size={18} />
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
