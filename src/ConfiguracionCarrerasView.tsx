import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, BookOpen, Edit2, Upload, Loader2 } from 'lucide-react';
import { Career, DEFAULT_CAREERS } from './data/defaultCareers';

export const ConfiguracionCarrerasView = ({ onBack, onUpdate }: { onBack: () => void, onUpdate: () => void }) => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch('/api/carreras-detalladas')
      .then(res => res.json())
      .then(data => {
        const formattedCareers: Career[] = data.map((c: any) => ({
          id: c.carrera_id.toString(),
          name: c.nombre,
          shortDesc: c.descripcion_corta,
          fullDesc: c.descripcion_completa,
          profile: c.perfil_egresado,
          field: c.campo_laboral,
          imageUrl: c.imagen_url
        }));
        setCareers(formattedCareers);
        setSelectedId(formattedCareers[0]?.id);
        setLoading(false);
      });
  }, []);

  const selectedCareer = careers.find(c => c.id === selectedId) || careers[0];

  const handleChange = (field: keyof Career, value: string) => {
    setCareers(prev => prev.map(c => c.id === selectedId ? { ...c, [field]: value } : c));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        handleChange('imageUrl', data.url);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCareer) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/carreras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrera_id: selectedCareer.id,
          nombre: selectedCareer.name,
          descripcion_corta: selectedCareer.shortDesc,
          descripcion_completa: selectedCareer.fullDesc,
          perfil_egresado: selectedCareer.profile,
          campo_laboral: selectedCareer.field,
          imagen_url: selectedCareer.imageUrl
        })
      });
      if (response.ok) {
        onUpdate();
        onBack();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex items-center gap-5 mb-10">
          <div className="w-14 h-14 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl flex items-center justify-center shadow-inner">
            <BookOpen size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-stone-800 tracking-tight">Configuración de Carreras</h2>
            <p className="text-stone-500 font-medium">Modifica la información y fotos de las carreras profesionales.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <div className="w-full lg:w-1/3 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1 mb-2">Seleccionar Carrera</p>
            {careers.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center justify-between group ${selectedId === c.id ? 'bg-uniq-cyan text-white shadow-lg shadow-uniq-cyan/20 ring-4 ring-uniq-cyan/10' : 'bg-stone-50 text-stone-600 hover:bg-white hover:shadow-md border border-transparent hover:border-stone-200'}`}
              >
                <span className="truncate">{c.name}</span>
                <Edit2 size={16} className={`shrink-0 transition-all ${selectedId === c.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}`} />
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="w-full lg:w-2/3 space-y-8 bg-stone-50/50 p-8 rounded-[2rem] border border-stone-100">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Nombre de la Carrera</label>
              <input 
                type="text" 
                value={selectedCareer.name} 
                onChange={e => handleChange('name', e.target.value)} 
                className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan focus:ring-4 focus:ring-uniq-cyan/10 transition-all font-bold text-stone-800 shadow-sm" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Descripción Corta (Inicio)</label>
              <textarea 
                value={selectedCareer.shortDesc} 
                onChange={e => handleChange('shortDesc', e.target.value)} 
                rows={2} 
                className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan focus:ring-4 focus:ring-uniq-cyan/10 transition-all font-medium text-stone-700 shadow-sm" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Descripción Completa</label>
              <textarea 
                value={selectedCareer.fullDesc} 
                onChange={e => handleChange('fullDesc', e.target.value)} 
                rows={4} 
                className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan focus:ring-4 focus:ring-uniq-cyan/10 transition-all font-medium text-stone-700 shadow-sm" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Perfil del Egresado</label>
                <textarea 
                  value={selectedCareer.profile} 
                  onChange={e => handleChange('profile', e.target.value)} 
                  rows={3} 
                  className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan focus:ring-4 focus:ring-uniq-cyan/10 transition-all font-medium text-stone-700 shadow-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Campo Laboral</label>
                <textarea 
                  value={selectedCareer.field} 
                  onChange={e => handleChange('field', e.target.value)} 
                  rows={3} 
                  className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan focus:ring-4 focus:ring-uniq-cyan/10 transition-all font-medium text-stone-700 shadow-sm" 
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Imagen de la Carrera</label>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  value={selectedCareer.imageUrl} 
                  onChange={e => handleChange('imageUrl', e.target.value)} 
                  placeholder="URL de la imagen o sube una..."
                  className="flex-1 px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan focus:ring-4 focus:ring-uniq-cyan/10 transition-all font-medium text-stone-700 shadow-sm" 
                />
                <label className="cursor-pointer flex items-center justify-center gap-3 px-8 py-4 bg-stone-200 text-stone-700 font-bold rounded-2xl hover:bg-stone-300 transition-all active:scale-95 shadow-sm">
                  <Upload size={20} />
                  {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>
              {selectedCareer.imageUrl && (
                <div className="mt-4 aspect-video w-full max-w-md rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                  <img src={selectedCareer.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <button onClick={onBack} className="flex items-center gap-2 px-8 py-4 text-stone-500 font-bold hover:text-stone-800 hover:bg-stone-50 rounded-2xl transition-all">
            <ChevronLeft size={20} /> Volver al Panel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="w-full md:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-uniq-cyan text-white font-bold rounded-2xl hover:bg-uniq-cyan/90 transition-all shadow-xl shadow-uniq-cyan/20 disabled:opacity-50 active:scale-95"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
