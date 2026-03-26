import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Save, Plus, Trash2, Edit2, Check, X, Calendar, Loader2, AlertCircle } from 'lucide-react';

export const ConfiguracionModalidadesView = ({ onBack, onUpdate }: { onBack: () => void, onUpdate?: () => void }) => {
  const [modalidades, setModalidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (editForm.fecha_fin) {
      const today = new Date().toISOString().split('T')[0];
      const isExpired = editForm.fecha_fin < today;
      if (isExpired && !editForm.deshabilitado) {
        setEditForm((prev: any) => ({ ...prev, deshabilitado: true }));
      } else if (!isExpired && editForm.deshabilitado) {
        setEditForm((prev: any) => ({ ...prev, deshabilitado: false }));
      }
    }
  }, [editForm.fecha_fin]);

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
    if (!editForm.nombre) return;
    setIsSaving(true);
    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/modalidades/${id}` : '/api/modalidades';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editForm.nombre,
          fecha_inicio: editForm.fecha_inicio,
          fecha_fin: editForm.fecha_fin,
          usar_rango: editForm.usar_rango !== undefined ? editForm.usar_rango : true,
          precio_nacional: editForm.precio_nacional || 0,
          precio_privado: editForm.precio_privado || 0,
          deshabilitado: editForm.deshabilitado
        })
      });
      if (response.ok) {
        fetchModalidades();
        if (onUpdate) onUpdate();
        setEditingId(null);
        setEditForm({});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    try {
      const response = await fetch(`/api/modalidades/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchModalidades();
        if (onUpdate) onUpdate();
        setDeleteConfirmId(null);
      }
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
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl flex items-center justify-center shadow-inner">
              <Calendar size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-stone-800 tracking-tight">Configuración de Modalidades</h2>
              <p className="text-stone-500 font-medium">Gestiona las modalidades de admisión.</p>
            </div>
          </div>
          <button 
            onClick={() => startEdit({ nombre: '', fecha_inicio: '', fecha_fin: '', usar_rango: true, precio_nacional: 0, precio_privado: 0, deshabilitado: false })} 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-uniq-cyan text-white font-bold rounded-2xl hover:bg-uniq-cyan/90 transition-all shadow-lg shadow-uniq-cyan/20 active:scale-95"
          >
            <Plus size={20} /> Nueva Modalidad
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-uniq-cyan" size={40} />
            <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Cargando modalidades...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {modalidades.map(m => (
                <motion.div 
                  layout
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative overflow-hidden rounded-3xl border transition-all ${editingId === m.id ? 'border-uniq-cyan/20 bg-uniq-cyan/5 ring-4 ring-uniq-cyan/10' : 'border-stone-100 bg-stone-50/50 hover:bg-white hover:shadow-lg hover:border-stone-200'}`}
                >
                  {editingId === m.id ? (
                    <div className="p-8 space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Nombre de la Modalidad</label>
                            <input 
                              type="text" 
                              value={editForm.nombre} 
                              onChange={e => setEditForm({...editForm, nombre: e.target.value})} 
                              className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all font-bold text-stone-800"
                              placeholder="Ej: Ordinario 2026-I"
                            />
                          </div>
                          <div className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl">
                            <input 
                              type="checkbox" 
                              id="usar_rango"
                              checked={editForm.usar_rango !== false} 
                              onChange={e => {
                                const checked = e.target.checked;
                                setEditForm({
                                  ...editForm, 
                                  usar_rango: checked,
                                  fecha_fin: checked ? editForm.fecha_fin : ''
                                });
                              }}
                              className="w-5 h-5 accent-uniq-cyan rounded"
                            />
                            <label htmlFor="usar_rango" className="text-sm font-bold text-stone-700 cursor-pointer select-none">
                              Utilizar rango de fechas (Inicio y Fin)
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Fecha Inicio</label>
                              <input 
                                type="date" 
                                value={editForm.fecha_inicio?.split('T')[0] || ''} 
                                onChange={e => setEditForm({...editForm, fecha_inicio: e.target.value})} 
                                className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-cyan-500 transition-all font-bold text-stone-800"
                              />
                            </div>
                            <div className={`space-y-2 transition-opacity ${editForm.usar_rango === false ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Fecha Fin</label>
                              <input 
                                type="date" 
                                value={editForm.fecha_fin?.split('T')[0] || ''} 
                                onChange={e => setEditForm({...editForm, fecha_fin: e.target.value})} 
                                className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-cyan-500 transition-all font-bold text-stone-800"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Precio Nacional</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">S/</span>
                                <input 
                                  type="number" 
                                  value={editForm.precio_nacional} 
                                  onChange={e => setEditForm({...editForm, precio_nacional: parseFloat(e.target.value)})} 
                                  className="w-full pl-12 pr-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-bold text-stone-800"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Precio Privado</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">S/</span>
                                <input 
                                  type="number" 
                                  value={editForm.precio_privado} 
                                  onChange={e => setEditForm({...editForm, precio_privado: parseFloat(e.target.value)})} 
                                  className="w-full pl-12 pr-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-bold text-stone-800"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${editForm.deshabilitado ? 'bg-red-50 text-red-500' : 'bg-lime-50 text-lime-600'}`}>
                                  {editForm.deshabilitado ? <X size={20} /> : <Check size={20} />}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-stone-800">{editForm.deshabilitado ? 'Deshabilitada' : 'Habilitada'}</p>
                                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Estado de la modalidad</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => setEditForm({...editForm, deshabilitado: !editForm.deshabilitado})}
                                className={`w-12 h-6 rounded-full relative transition-colors ${editForm.deshabilitado ? 'bg-stone-200' : 'bg-lime-500'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editForm.deshabilitado ? 'left-1' : 'left-7'}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-4 pt-4 border-t border-cyan-100">
                        <button 
                          onClick={() => setEditingId(null)} 
                          className="px-8 py-4 text-stone-500 font-bold hover:text-stone-800 transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => handleSave(m.id)} 
                          disabled={isSaving}
                          className="flex items-center gap-2 px-10 py-4 bg-uniq-cyan text-white font-bold rounded-2xl hover:bg-uniq-cyan/90 transition-all shadow-xl shadow-uniq-cyan/20 disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                          Guardar Modalidad
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${m.deshabilitado ? 'bg-stone-100 text-stone-400' : 'bg-uniq-cyan/10 text-uniq-cyan'}`}>
                          <Calendar size={24} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-stone-800">{m.nombre}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-uniq-cyan" />
                              {m.usar_rango ? (
                                <>
                                  {m.fecha_inicio?.split('T')[0]} al {m.fecha_fin?.split('T')[0]}
                                </>
                              ) : (
                                <>
                                  Desde: {m.fecha_inicio?.split('T')[0]}
                                </>
                              )}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="text-amber-500 font-bold">S/</span>
                              {m.precio_nacional} (Nac.) / S/ {m.precio_privado} (Priv.)
                            </span>
                            {m.fecha_creacion && (
                              <span className="flex items-center gap-1.5">
                                <span className="text-stone-400">Creado:</span>
                                {new Date(m.fecha_creacion).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${m.eliminado ? 'bg-stone-100 text-stone-500 border-stone-200' : m.deshabilitado ? 'bg-red-50 text-red-500 border-red-100' : 'bg-lime-50 text-lime-600 border-lime-100'}`}>
                          {m.eliminado ? 'Histórico' : m.deshabilitado ? 'Deshabilitado' : 'Activo'}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => startEdit(m)} 
                            className="w-10 h-10 bg-white text-stone-400 rounded-xl border border-stone-200 flex items-center justify-center hover:text-uniq-cyan hover:border-uniq-cyan/20 hover:bg-uniq-cyan/5 transition-all"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          {!m.eliminado && (
                            <button 
                              onClick={() => setDeleteConfirmId(m.id)} 
                              className="w-10 h-10 bg-white text-stone-400 rounded-xl border border-stone-200 flex items-center justify-center hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                              title="Archivar"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {editingId === -1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-uniq-cyan/5 border-2 border-dashed border-uniq-cyan/20 rounded-[2.5rem] space-y-8"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-uniq-cyan/10 text-uniq-cyan rounded-xl flex items-center justify-center">
                      <Plus size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-stone-800">Nueva Modalidad</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Nombre de la Modalidad</label>
                        <input 
                          type="text" 
                          value={editForm.nombre} 
                          onChange={e => setEditForm({...editForm, nombre: e.target.value})} 
                          className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-bold text-stone-800"
                          placeholder="Ej: Ordinario 2026-I"
                        />
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl">
                        <input 
                          type="checkbox" 
                          id="new_usar_rango"
                          checked={editForm.usar_rango !== false} 
                          onChange={e => {
                            const checked = e.target.checked;
                            setEditForm({
                              ...editForm, 
                              usar_rango: checked,
                              fecha_fin: checked ? editForm.fecha_fin : ''
                            });
                          }}
                          className="w-5 h-5 accent-uniq-cyan rounded"
                        />
                        <label htmlFor="new_usar_rango" className="text-sm font-bold text-stone-700 cursor-pointer select-none">
                          Utilizar rango de fechas (Inicio y Fin)
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Fecha Inicio</label>
                          <input 
                            type="date" 
                            value={editForm.fecha_inicio} 
                            onChange={e => setEditForm({...editForm, fecha_inicio: e.target.value})} 
                            className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-bold text-stone-800"
                          />
                        </div>
                        <div className={`space-y-2 transition-opacity ${editForm.usar_rango === false ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Fecha Fin</label>
                          <input 
                            type="date" 
                            value={editForm.fecha_fin} 
                            onChange={e => setEditForm({...editForm, fecha_fin: e.target.value})} 
                            className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-bold text-stone-800"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Precio Nacional</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">S/</span>
                            <input 
                              type="number" 
                              value={editForm.precio_nacional} 
                              onChange={e => setEditForm({...editForm, precio_nacional: parseFloat(e.target.value)})} 
                              className="w-full pl-12 pr-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-bold text-stone-800"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Precio Privado</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">S/</span>
                            <input 
                              type="number" 
                              value={editForm.precio_privado} 
                              onChange={e => setEditForm({...editForm, precio_privado: parseFloat(e.target.value)})} 
                              className="w-full pl-12 pr-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-bold text-stone-800"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${editForm.deshabilitado ? 'bg-red-50 text-red-500' : 'bg-lime-50 text-lime-600'}`}>
                              {editForm.deshabilitado ? <X size={20} /> : <Check size={20} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-stone-800">{editForm.deshabilitado ? 'Deshabilitada' : 'Habilitada'}</p>
                              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Estado de la modalidad</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setEditForm({...editForm, deshabilitado: !editForm.deshabilitado})}
                            className={`w-12 h-6 rounded-full relative transition-colors ${editForm.deshabilitado ? 'bg-stone-200' : 'bg-lime-500'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editForm.deshabilitado ? 'left-1' : 'left-7'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 pt-4 border-t border-cyan-100">
                    <button 
                      onClick={() => setEditingId(null)} 
                      className="px-8 py-4 text-stone-500 font-bold hover:text-stone-800 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => handleSave(null)} 
                      disabled={isSaving}
                      className="flex items-center gap-2 px-10 py-4 bg-uniq-cyan text-white font-bold rounded-2xl hover:bg-uniq-cyan/90 transition-all shadow-xl shadow-uniq-cyan/20 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                      Crear Modalidad
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {modalidades.length === 0 && !loading && editingId !== -1 && (
              <div className="text-center py-20 bg-stone-50 rounded-[2.5rem] border-2 border-dashed border-stone-200">
                <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-stone-800">No hay modalidades</h3>
                <p className="text-stone-500 mt-2">Comienza creando una nueva modalidad de admisión.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-stone-100 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 px-8 py-4 text-stone-500 font-bold hover:text-stone-800 hover:bg-stone-50 rounded-2xl transition-all">
            <ChevronLeft size={20} /> Volver al Panel
          </button>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-inner">
                  <Trash2 size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-stone-800">¿Eliminar modalidad?</h3>
                  <p className="text-stone-500 font-medium">Esta acción no se puede deshacer. Todos los datos asociados a esta modalidad se perderán permanentemente.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full pt-4">
                  <button 
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-6 py-4 bg-stone-100 text-stone-600 font-bold rounded-2xl hover:bg-stone-200 transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleDelete(deleteConfirmId)}
                    className="px-6 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
