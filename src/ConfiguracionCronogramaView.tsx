import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, Clock, Plus, Trash2 } from 'lucide-react';

export interface CronogramaItem {
  id: string;
  event: string;
  date: string;
  status: 'completado' | 'activo' | 'pendiente';
}

export const DEFAULT_CRONOGRAMA: CronogramaItem[] = [
  { id: '1', event: "Lanzamiento de Convocatoria", date: "15 de Enero", status: "completado" },
  { id: '2', event: "Inscripciones Ordinario y Extraordinario", date: "01 Feb - 15 Mar", status: "activo" },
  { id: '3', event: "Cierre de Inscripciones", date: "15 de Marzo", status: "pendiente" },
  { id: '4', event: "Examen de Admisión Ordinario", date: "22 de Marzo", status: "pendiente" },
  { id: '5', event: "Publicación de Resultados", date: "23 de Marzo", status: "pendiente" },
  { id: '6', event: "Entrega de Constancias", date: "25 - 27 de Marzo", status: "pendiente" },
];

export const ConfiguracionCronogramaView = ({ appSettings, onSave, onBack }: { appSettings: any, onSave: (settings: any) => void, onBack: () => void }) => {
  const [items, setItems] = useState<CronogramaItem[]>(appSettings?.cronograma || DEFAULT_CRONOGRAMA);
  const [isSaving, setIsSaving] = useState(false);

  const handleItemChange = (id: string, field: keyof CronogramaItem, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddItem = () => {
    const newItem: CronogramaItem = {
      id: Date.now().toString(),
      event: 'Nuevo Evento',
      date: 'Fecha',
      status: 'pendiente'
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const newSettings = {
      ...appSettings,
      cronograma: items
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Configuración del Cronograma</h2>
              <p className="text-stone-500">Administra las fechas y eventos del proceso de admisión.</p>
            </div>
          </div>
          <button 
            onClick={handleAddItem}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-all"
          >
            <Plus size={18} />
            Añadir Evento
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex flex-col md:flex-row gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200 items-start md:items-center">
              <div className="flex-grow space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Evento</label>
                    <input 
                      type="text" 
                      value={item.event}
                      onChange={(e) => handleItemChange(item.id, 'event', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Fecha</label>
                    <input 
                      type="text" 
                      value={item.date}
                      onChange={(e) => handleItemChange(item.id, 'date', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Estado</label>
                  <select
                    value={item.status}
                    onChange={(e) => handleItemChange(item.id, 'status', e.target.value as any)}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="activo">Activo</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => handleRemoveItem(item.id)}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all self-end md:self-center mt-4 md:mt-0"
                title="Eliminar evento"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-stone-500 py-8">No hay eventos en el cronograma.</p>
          )}
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
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
