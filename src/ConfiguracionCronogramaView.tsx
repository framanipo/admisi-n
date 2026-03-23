import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, Clock, Plus, Trash2, Info } from 'lucide-react';

export interface CronogramaItem {
  id: string;
  event: string;
  date: string;
  status: 'completado' | 'activo' | 'pendiente';
  isAutomatic?: boolean;
}

export const DEFAULT_CRONOGRAMA: CronogramaItem[] = [
  { id: '1', event: "Lanzamiento de Convocatoria", date: "15 de Enero", status: "completado" },
  { id: '2', event: "Inscripciones Ordinario y Extraordinario", date: "01 Feb - 15 Mar", status: "activo" },
  { id: '3', event: "Cierre de Inscripciones", date: "15 de Marzo", status: "pendiente" },
  { id: '4', event: "Examen de Admisión Ordinario", date: "22 de Marzo", status: "pendiente" },
  { id: '5', event: "Publicación de Resultados", date: "23 de Marzo", status: "pendiente" },
  { id: '6', event: "Entrega de Constancias", date: "25 - 27 de Marzo", status: "pendiente" },
];

export const ConfiguracionCronogramaView = ({ onBack }: { onBack: () => void }) => {
  const [items, setItems] = useState<CronogramaItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cronograma')
      .then(res => res.json())
      .then(data => {
        setItems(data.length > 0 ? data : DEFAULT_CRONOGRAMA);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleItemChange = (id: string, field: keyof CronogramaItem, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'date') {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(value)) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const eventDate = new Date(value + 'T00:00:00');
            eventDate.setHours(0, 0, 0, 0);

            if (today > eventDate) updated.status = 'completado';
            else if (today.getTime() === eventDate.getTime()) updated.status = 'activo';
            else updated.status = 'pendiente';
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleAddItem = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newItem: CronogramaItem = {
      id: Date.now().toString(),
      event: 'Nuevo Evento',
      date: todayStr,
      status: 'activo'
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/cronograma/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: items })
      });
      if (response.ok) {
        onBack();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Cargando cronograma...</div>;
  }

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
            <div key={item.id} className={`flex flex-col md:flex-row gap-4 p-6 rounded-2xl border items-start md:items-center ${item.isAutomatic ? 'bg-blue-50/50 border-blue-100' : 'bg-stone-50 border-stone-200'}`}>
              <div className="flex-grow space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Evento</label>
                    <input 
                      type="text" 
                      list={`eventos-predefinidos-${item.id}`}
                      value={item.event}
                      onChange={(e) => handleItemChange(item.id, 'event', e.target.value)}
                      disabled={item.isAutomatic}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:bg-stone-100 disabled:text-stone-500"
                      placeholder="Selecciona o escribe un evento"
                    />
                    <datalist id={`eventos-predefinidos-${item.id}`}>
                      <option value="Lanzamiento de Convocatoria" />
                      <option value="Cierre de Inscripciones" />
                      <option value="Examen de Admisión Extraordinario" />
                      <option value="Examen de Admisión Ordinario" />
                      <option value="Publicación de Resultados" />
                      <option value="Entrega de Constancias de Ingreso" />
                      <option value="Inicio de Clases" />
                    </datalist>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Fecha</label>
                    <input 
                      type={item.isAutomatic ? "text" : "date"} 
                      value={item.date}
                      onChange={(e) => handleItemChange(item.id, 'date', e.target.value)}
                      disabled={item.isAutomatic}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:bg-stone-100 disabled:text-stone-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Estado</label>
                    {item.isAutomatic ? (
                      <span className="text-[10px] font-bold uppercase text-blue-500 flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded-full">
                        <Info size={10} />
                        Automático (Modalidad)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Info size={10} />
                        Auto-calculado
                      </span>
                    )}
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) => handleItemChange(item.id, 'status', e.target.value as any)}
                    disabled={true}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:bg-stone-100 disabled:text-stone-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="activo">Activo</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
              </div>
              {!item.isAutomatic && (
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all self-end md:self-center mt-4 md:mt-0"
                  title="Eliminar evento"
                >
                  <Trash2 size={20} />
                </button>
              )}
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
