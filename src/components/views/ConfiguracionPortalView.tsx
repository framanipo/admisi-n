import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, ChevronLeft, Loader2, Calendar, FileText, PlusCircle } from 'lucide-react';

export const ConfiguracionAdmisionView = ({ onBack, onUpdate }: { onBack: () => void, onUpdate: () => void }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [newDescripcion, setNewDescripcion] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/configuracion-admision')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
          // Set input to the active one by default
          const active = data.find(d => d.es_actual);
          if (active) setNewDescripcion(active.descripcion_admision);
        }
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
      const user = JSON.parse(localStorage.getItem('userLog') || '{}');
      await fetch('/api/configuracion-admision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion_admision: newDescripcion,
          user_name: user?.nombre_completo || 'Admin'
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
      </div>

      <div className="space-y-8">
        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-uniq-cyan/10 flex items-center justify-center text-uniq-cyan">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">Nueva Configuración de Admisión</h2>
              <p className="text-sm text-stone-500">Abre un nuevo proceso de admisión actual.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                Descripción de Admisión o Año (Ej: Admisión 2026)
              </label>
              <input 
                value={newDescripcion} 
                onChange={e => setNewDescripcion(e.target.value)}
                className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium"
                placeholder={`Admisión ${new Date().getFullYear()}`}
              />
              <p className="text-xs text-stone-400 italic">Al guardar se registrará un nuevo historial y dejará los anteriores inactivos.</p>
            </div>
          </div>

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
                  <PlusCircle size={20} />
                  Crear Nueva Admisión
                </>
              )}
            </button>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 space-y-6">
          <div className="flex items-center gap-4 border-b border-stone-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">Historial de Admisiones</h2>
              <p className="text-sm text-stone-500">Registro de todos los procesos configurados.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl rounded-bl-xl">ID</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Creado Por</th>
                  <th className="px-6 py-4">Fecha Modificación</th>
                  <th className="px-6 py-4 rounded-tr-xl rounded-br-xl">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {history.map((item, idx) => (
                  <tr key={idx} className={`${item.es_actual ? 'bg-green-50/30' : 'hover:bg-stone-50'} transition-colors`}>
                    <td className="px-6 py-4 font-mono font-bold text-stone-900">#{item.id}</td>
                    <td className="px-6 py-4 font-bold">{item.descripcion_admision}</td>
                    <td className="px-6 py-4">{item.creado_por || 'Sistema'}</td>
                    <td className="px-6 py-4">{formatDate(item.fecha_modificacion)}</td>
                    <td className="px-6 py-4">
                      {item.es_actual ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-xs">ACTUAL</span>
                      ) : (
                        <span className="px-3 py-1 bg-stone-200 text-stone-600 font-bold rounded-full text-xs">INACTIVO</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 && (
              <div className="text-center py-10 text-stone-400">
                No hay historiales registrados.
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
};
