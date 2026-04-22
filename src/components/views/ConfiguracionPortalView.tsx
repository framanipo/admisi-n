import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, ChevronLeft, Loader2, Calendar, Eye } from 'lucide-react';

export const ConfiguracionAdmisionView = ({ onBack, onUpdate }: { onBack: () => void, onUpdate: () => void }) => {
  const [config, setConfig] = useState({ 
    descripcion_admision: '', 
    contador_visitas: 0,
    fecha_modificacion: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/configuracion-admision')
      .then(res => res.json())
      .then(data => {
        setConfig({
          descripcion_admision: data.descripcion_admision || '',
          contador_visitas: data.contador_visitas || 0,
          fecha_modificacion: data.fecha_modificacion || null
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching admission config:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/configuracion-admision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion_admision: config.descripcion_admision
        })
      });
      
      onUpdate();
      onBack();
    } catch (error) {
      console.error("Error saving admission config:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <Loader2 className="animate-spin text-uniq-cyan" size={40} />
      <p className="text-stone-400 font-bold animate-pulse">Cargando configuración...</p>
    </div>
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors font-bold group">
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
            <ChevronLeft size={20} />
          </div>
          Volver al panel
        </button>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Última modificación</p>
            <p className="text-sm font-bold text-stone-600">{formatDate(config.fecha_modificacion)}</p>
          </div>
          <div className="h-10 w-px bg-stone-200" />
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Visitas totales</p>
            <div className="flex items-center gap-2 justify-end">
              <Eye size={14} className="text-uniq-cyan" />
              <p className="text-sm font-bold text-stone-600">{config.contador_visitas.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-uniq-cyan/10 flex items-center justify-center text-uniq-cyan">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">Configuración de Admisión</h2>
              <p className="text-sm text-stone-500">Configura la etiqueta principal del proceso de admisión actual.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                Descripción de Admisión o Año (Ej: Admisión 2026)
              </label>
              <input 
                value={config.descripcion_admision || ''} 
                onChange={e => setConfig({...config, descripcion_admision: e.target.value})}
                className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium"
                placeholder={`Admisión ${new Date().getFullYear()}`}
              />
              <p className="text-xs text-stone-400 italic">Este texto se muestra junto al logo en la cabecera y en los documentos generados.</p>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-12 bg-uniq-cyan text-white font-bold py-4 rounded-2xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 shadow-lg shadow-uniq-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
