import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Plus, Edit, Trash2, Save, X, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';

export const IdiomaManagementView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ idioma: '', pueblo_indigena: '', tipo_comunidad: '' });
  const [isReordering, setIsReordering] = useState(false);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mapeo-idiomas');
      const data = await res.json();
      setMappings(data);
    } catch (e) {
      console.error("Error fetching mappings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  const handleSave = async () => {
    if (!formData.idioma) return;
    
    try {
      const url = editingId ? `/api/mapeo-idiomas/${editingId}` : '/api/mapeo-idiomas';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        fetchMappings();
        setIsAdding(false);
        setEditingId(null);
        setFormData({ idioma: '', pueblo_indigena: '', tipo_comunidad: '' });
      }
    } catch (e) {
      console.error("Error saving mapping:", e);
    }
  };

  const handleEdit = (mapping: any) => {
    setEditingId(mapping.id);
    setFormData({ 
      idioma: mapping.idioma, 
      pueblo_indigena: mapping.pueblo_indigena || '', 
      tipo_comunidad: mapping.tipo_comunidad || '' 
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este mapeo?")) return;
    try {
      const res = await fetch(`/api/mapeo-idiomas/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMappings();
    } catch (e) {
      console.error("Error deleting mapping:", e);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (isReordering) return;
    const newMappings = [...mappings];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newMappings.length) return;
    
    // Swap items
    [newMappings[index], newMappings[targetIndex]] = [newMappings[targetIndex], newMappings[index]];
    
    // Update local state for immediate feedback
    setMappings(newMappings);
    
    // Prepare items for backend update
    const itemsToUpdate = newMappings.map((m, i) => ({ id: m.id, orden: i + 1 }));
    
    setIsReordering(true);
    try {
      const res = await fetch('/api/mapeo-idiomas/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToUpdate })
      });
      if (!res.ok) {
        // If failed, revert or re-fetch
        fetchMappings();
      }
    } catch (e) {
      console.error("Error reordering:", e);
      fetchMappings();
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-stone-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-900">Gestión de Idiomas</h2>
            <p className="text-stone-500 mt-1">Configura el mapeo automático de Idioma, Pueblo Indígena y Tipo de Comunidad.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onBack} className="px-6 py-3 bg-stone-100 text-stone-700 rounded-2xl font-bold text-sm hover:bg-stone-200 transition-all">Volver al Panel</button>
            <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ idioma: '', pueblo_indigena: '', tipo_comunidad: '' }); }} className="px-6 py-3 bg-uniq-cyan text-white rounded-2xl font-bold text-sm hover:bg-uniq-cyan/90 transition-all">+ Agregar Mapeo</button>
          </div>
        </div>

        {isAdding && (
          <div className="p-6 rounded-2xl shadow-sm border border-stone-100 bg-stone-50 mb-8">
            <h3 className="font-bold text-stone-800 mb-4">{editingId ? 'Editar Mapeo' : 'Nuevo Mapeo'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase">Idioma</label>
                <input className="w-full p-2 border rounded-xl" value={formData.idioma} onChange={e => setFormData({...formData, idioma: e.target.value.toUpperCase()})} placeholder="EJ. QUECHUA" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase">Tipo de Comunidad</label>
                <input className="w-full p-2 border rounded-xl" value={formData.tipo_comunidad} onChange={e => setFormData({...formData, tipo_comunidad: e.target.value.toUpperCase()})} placeholder="EJ. AMAZÓNICO" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase">Pueblo Indígena</label>
                <input className="w-full p-2 border rounded-xl" value={formData.pueblo_indigena} onChange={e => setFormData({...formData, pueblo_indigena: e.target.value.toUpperCase()})} placeholder="EJ. ANDINO" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2" onClick={handleSave}>
                <Save size={16} /> Guardar
              </button>
              <button className="bg-stone-300 text-stone-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2" onClick={() => setIsAdding(false)}>
                <X size={16} /> Cancelar
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="animate-spin text-uniq-cyan" size={32} />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-100">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-bold w-16">Orden</th>
                  <th className="px-6 py-4 font-bold">Idioma</th>
                  <th className="px-6 py-4 font-bold">Tipo de Comunidad</th>
                  <th className="px-6 py-4 font-bold">Pueblo Indígena</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {mappings.map((m, index) => (
                  <tr key={m.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <button 
                          disabled={index === 0 || isReordering}
                          onClick={() => handleMove(index, 'up')}
                          className={`p-1 rounded hover:bg-stone-200 transition-colors ${index === 0 ? 'opacity-20 cursor-not-allowed' : 'text-stone-600'}`}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button 
                          disabled={index === mappings.length - 1 || isReordering}
                          onClick={() => handleMove(index, 'down')}
                          className={`p-1 rounded hover:bg-stone-200 transition-colors ${index === mappings.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-stone-600'}`}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-stone-800">{m.idioma}</td>
                    <td className="px-6 py-4 text-stone-600">{m.tipo_comunidad || '-'}</td>
                    <td className="px-6 py-4 text-stone-600">{m.pueblo_indigena || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {mappings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-stone-400">No hay mapeos configurados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};
