import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, ChevronLeft, Loader2 } from 'lucide-react';

export const ConfiguracionInicioView = ({ onBack, onUpdate }: { onBack: () => void, onUpdate: () => void }) => {
  const [config, setConfig] = useState({ titulo: '', subtitulo: '', imagen_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/configuracion-inicio')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/configuracion-inicio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    setSaving(false);
    onUpdate();
    onBack();
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors font-bold">
        <ChevronLeft size={20} /> Volver al panel
      </button>

      <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100 space-y-6">
        <h2 className="text-2xl font-bold text-stone-800">Configurar Bienvenida</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Título</label>
            <input 
              value={config.titulo} 
              onChange={e => setConfig({...config, titulo: e.target.value})}
              className="w-full p-3 rounded-xl border border-stone-200"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Subtítulo</label>
            <textarea 
              value={config.subtitulo} 
              onChange={e => setConfig({...config, subtitulo: e.target.value})}
              className="w-full p-3 rounded-xl border border-stone-200"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">URL de Imagen</label>
            <input 
              value={config.imagen_url} 
              onChange={e => setConfig({...config, imagen_url: e.target.value})}
              className="w-full p-3 rounded-xl border border-stone-200"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-cyan-600 text-white font-bold py-3 rounded-xl hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Guardar Cambios
        </button>
      </div>
    </motion.div>
  );
};
