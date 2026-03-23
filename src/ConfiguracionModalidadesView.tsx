import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export const ConfiguracionModalidadesView = ({ onBack }: { onBack: () => void }) => {
  const [modalidades, setModalidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    fetchModalidades();
  }, []);

  const fetchModalidades = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/modalidades');
      if (response.ok) {
        const data = await response.json();
        setModalidades(data);
      }
    } catch (error) {
      console.error('Error fetching modalidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: number | null) => {
    setIsSaving(true);
    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/modalidades/${id}` : '/api/modalidades';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        fetchModalidades();
        setEditingId(null);
        setEditForm({});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta modalidad?')) return;
    try {
      await fetch(`/api/modalidades/${id}`, { method: 'DELETE' });
      fetchModalidades();
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (m: any) => {
    setEditingId(m.id || -1);
    setEditForm(m);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Edit2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Configuración de Modalidades</h2>
              <p className="text-stone-500">Gestiona las modalidades de examen y sus precios.</p>
            </div>
          </div>
          <button onClick={() => startEdit({ nombre: '', precio_nacional: 0, precio_privado: 0, precio_amazonico: 0, deshabilitado: false, es_descentralizado: false })} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">
            <Plus size={18} /> Nueva Modalidad
          </button>
        </div>

        {loading ? (
          <p className="text-center py-10">Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="p-4 text-xs font-bold uppercase text-stone-500">Nombre</th>
                  <th className="p-4 text-xs font-bold uppercase text-stone-500">Fechas</th>
                  <th className="p-4 text-xs font-bold uppercase text-stone-500">Precios (Nac/Priv/Ama)</th>
                  <th className="p-4 text-xs font-bold uppercase text-stone-500">Descentralizado</th>
                  <th className="p-4 text-xs font-bold uppercase text-stone-500">Estado</th>
                  <th className="p-4 text-xs font-bold uppercase text-stone-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {modalidades.map(m => (
                  <tr key={m.id} className="border-b border-stone-100">
                    {editingId === m.id ? (
                      <>
                        <td className="p-4"><input type="text" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} className="w-full p-2 border rounded" /></td>
                        <td className="p-4">
                          <input type="date" value={editForm.fecha_inicio?.split('T')[0]} onChange={e => setEditForm({...editForm, fecha_inicio: e.target.value})} className="w-full p-1 border rounded text-xs" />
                          <input type="date" value={editForm.fecha_fin?.split('T')[0]} onChange={e => setEditForm({...editForm, fecha_fin: e.target.value})} className="w-full p-1 border rounded text-xs mt-1" />
                        </td>
                        <td className="p-4 flex gap-1">
                          <input type="number" value={editForm.precio_nacional} onChange={e => setEditForm({...editForm, precio_nacional: e.target.value})} className="w-16 p-2 border rounded" />
                          <input type="number" value={editForm.precio_privado} onChange={e => setEditForm({...editForm, precio_privado: e.target.value})} className="w-16 p-2 border rounded" />
                          <input type="number" value={editForm.precio_amazonico} onChange={e => setEditForm({...editForm, precio_amazonico: e.target.value})} className="w-16 p-2 border rounded" />
                        </td>
                        <td className="p-4"><input type="checkbox" checked={editForm.es_descentralizado} onChange={e => setEditForm({...editForm, es_descentralizado: e.target.checked})} /></td>
                        <td className="p-4"><input type="checkbox" checked={editForm.deshabilitado} onChange={e => setEditForm({...editForm, deshabilitado: e.target.checked})} /></td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => handleSave(m.id)} className="p-2 text-emerald-600"><Check size={18} /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-red-600"><X size={18} /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 font-bold text-stone-800">{m.nombre}</td>
                        <td className="p-4 text-xs text-stone-500">{m.fecha_inicio?.split('T')[0]} - {m.fecha_fin?.split('T')[0]}</td>
                        <td className="p-4 text-xs text-stone-600">S/ {m.precio_nacional} / S/ {m.precio_privado} / S/ {m.precio_amazonico}</td>
                        <td className="p-4">{m.es_descentralizado ? 'Sí' : 'No'}</td>
                        <td className="p-4">{m.deshabilitado ? <span className="text-red-500 font-bold text-xs">Deshabilitado</span> : <span className="text-emerald-500 font-bold text-xs">Activo</span>}</td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => startEdit(m)} className="p-2 text-stone-500 hover:text-stone-800"><Edit2 size={18} /></button>
                          <button onClick={() => handleDelete(m.id)} className="p-2 text-red-500 hover:text-red-800"><Trash2 size={18} /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {editingId === -1 && (
                  <tr className="border-b border-stone-100 bg-emerald-50">
                    <td className="p-4"><input type="text" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} className="w-full p-2 border rounded" /></td>
                    <td className="p-4">
                      <input type="date" value={editForm.fecha_inicio} onChange={e => setEditForm({...editForm, fecha_inicio: e.target.value})} className="w-full p-1 border rounded text-xs" />
                      <input type="date" value={editForm.fecha_fin} onChange={e => setEditForm({...editForm, fecha_fin: e.target.value})} className="w-full p-1 border rounded text-xs mt-1" />
                    </td>
                    <td className="p-4 flex gap-1">
                      <input type="number" value={editForm.precio_nacional} onChange={e => setEditForm({...editForm, precio_nacional: e.target.value})} className="w-16 p-2 border rounded" />
                      <input type="number" value={editForm.precio_privado} onChange={e => setEditForm({...editForm, precio_privado: e.target.value})} className="w-16 p-2 border rounded" />
                      <input type="number" value={editForm.precio_amazonico} onChange={e => setEditForm({...editForm, precio_amazonico: e.target.value})} className="w-16 p-2 border rounded" />
                    </td>
                    <td className="p-4"><input type="checkbox" checked={editForm.es_descentralizado} onChange={e => setEditForm({...editForm, es_descentralizado: e.target.checked})} /></td>
                    <td className="p-4"><input type="checkbox" checked={editForm.deshabilitado} onChange={e => setEditForm({...editForm, deshabilitado: e.target.checked})} /></td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleSave(null)} className="p-2 text-emerald-600"><Check size={18} /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-red-600"><X size={18} /></button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-stone-100 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all">
            <ChevronLeft size={18} /> Volver
          </button>
        </div>
      </div>
    </motion.div>
  );
};
