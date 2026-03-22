import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, BookOpen, Edit2 } from 'lucide-react';
import { Career, DEFAULT_CAREERS } from './data/defaultCareers';

export const ConfiguracionCarrerasView = ({ appSettings, onSave, onBack }: { appSettings: any, onSave: (settings: any) => void, onBack: () => void }) => {
  const [careers, setCareers] = useState<Career[]>(appSettings?.careers || DEFAULT_CAREERS);
  const [selectedId, setSelectedId] = useState<string>(careers[0]?.id);
  const [isSaving, setIsSaving] = useState(false);

  const selectedCareer = careers.find(c => c.id === selectedId) || careers[0];

  const handleChange = (field: keyof Career, value: string) => {
    setCareers(prev => prev.map(c => c.id === selectedId ? { ...c, [field]: value } : c));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const newSettings = { ...appSettings, careers };
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
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Configuración de Carreras</h2>
            <p className="text-stone-500">Modifica la información y fotos de las carreras profesionales.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/3 space-y-2">
            {careers.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-between ${selectedId === c.id ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-transparent'}`}
              >
                {c.name}
                <Edit2 size={16} className={selectedId === c.id ? 'opacity-100' : 'opacity-0'} />
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="w-full lg:w-2/3 space-y-6 bg-stone-50 p-6 rounded-2xl border border-stone-100">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Nombre de la Carrera</label>
              <input type="text" value={selectedCareer.name} onChange={e => handleChange('name', e.target.value)} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Descripción Corta (Inicio)</label>
              <textarea value={selectedCareer.shortDesc} onChange={e => handleChange('shortDesc', e.target.value)} rows={2} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Descripción Completa</label>
              <textarea value={selectedCareer.fullDesc} onChange={e => handleChange('fullDesc', e.target.value)} rows={4} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Perfil del Egresado</label>
                <textarea value={selectedCareer.profile} onChange={e => handleChange('profile', e.target.value)} rows={3} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Campo Laboral</label>
                <textarea value={selectedCareer.field} onChange={e => handleChange('field', e.target.value)} rows={3} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">URL de la Imagen</label>
              <input type="text" value={selectedCareer.imageUrl} onChange={e => handleChange('imageUrl', e.target.value)} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />
              {selectedCareer.imageUrl && (
                <div className="mt-2 aspect-video w-full max-w-sm rounded-xl overflow-hidden border border-stone-200">
                  <img src={selectedCareer.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-100 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all">
            <ChevronLeft size={18} /> Cancelar
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50">
            <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
