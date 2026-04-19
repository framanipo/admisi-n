import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export const ColegioManagementView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [regiones, setRegiones] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [distritos, setDistritos] = useState<any[]>([]);
  const [colegios, setColegios] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [selectedProvincia, setSelectedProvincia] = useState<any>(null);
  const [selectedDistrito, setSelectedDistrito] = useState<any>(null);

  const fetchRegiones = async () => {
    const res = await fetch('/api/regiones');
    const data = await res.json();
    setRegiones(data);
  };

  const fetchProvincias = async (regionId: number) => {
    const res = await fetch(`/api/provincias?region_id=${regionId}`);
    const data = await res.json();
    setProvincias(data);
  };

  const fetchDistritos = async (provinciaId: number) => {
    const res = await fetch(`/api/distritos?provincia_id=${provinciaId}`);
    const data = await res.json();
    setDistritos(data);
  };

  const fetchColegios = async (distritoId: number) => {
    const res = await fetch(`/api/colegios?distrito_id=${distritoId}`);
    const data = await res.json();
    setColegios(data);
  };

  useEffect(() => {
    fetchRegiones();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
        fetchProvincias(selectedRegion.id);
        setSelectedProvincia(null);
        setSelectedDistrito(null);
        setColegios([]);
    } else {
        setProvincias([]);
        setDistritos([]);
        setColegios([]);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedProvincia) {
        fetchDistritos(selectedProvincia.id);
        setSelectedDistrito(null);
        setColegios([]);
    } else {
        setDistritos([]);
        setColegios([]);
    }
  }, [selectedProvincia]);

  useEffect(() => {
    if (selectedDistrito) fetchColegios(selectedDistrito.id);
    else setColegios([]);
  }, [selectedDistrito]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ codigo: string; nombre: string; direccion: string; nivel: string; gestion: string }>({ codigo: '', nombre: '', direccion: '', nivel: '', gestion: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState<{ codigo: string; nombre: string; direccion: string; nivel: string; gestion: string }>({ codigo: '', nombre: '', direccion: '', nivel: '', gestion: '' });

  const handleCreate = async () => {
    const res = await fetch('/api/colegios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newData, distrito_id: selectedDistrito.id })
    });
    
    if (res.ok) {
      fetchColegios(selectedDistrito.id);
      setIsAdding(false);
      setNewData({ codigo: '', nombre: '', direccion: '', nivel: '', gestion: '' });
    }
  };

  const handleEdit = async (id: number, data: any) => {
    const res = await fetch(`/api/colegios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      fetchColegios(selectedDistrito.id);
      setEditingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este colegio?")) return;
    const res = await fetch(`/api/colegios/${id}`, { method: 'DELETE' });
    
    if (res.ok) {
      fetchColegios(selectedDistrito.id);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-stone-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-900">Gestión de Colegios</h2>
            <p className="text-stone-500 mt-1">Administra los colegios por ubicación.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onBack} className="px-6 py-3 bg-stone-100 text-stone-700 rounded-2xl font-bold text-sm hover:bg-stone-200 transition-all">Volver al Panel</button>
            <button onClick={() => setIsAdding(true)} className="px-6 py-3 bg-uniq-cyan text-white rounded-2xl font-bold text-sm hover:bg-uniq-cyan/90 transition-all" disabled={!selectedDistrito}>+ Agregar Colegio</button>
          </div>
        </div>

        {isAdding && (
          <div className="p-6 rounded-2xl shadow-sm border border-stone-100 bg-stone-50 mb-8">
            <h3 className="font-bold text-stone-800 mb-4">Nuevo Colegio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="w-full p-2 border rounded" value={newData.codigo} onChange={e => setNewData({...newData, codigo: e.target.value})} placeholder="Código del colegio" />
                <input className="w-full p-2 border rounded" value={newData.nombre} onChange={e => setNewData({...newData, nombre: e.target.value})} placeholder="Nombre del colegio" />
                <input className="w-full p-2 border rounded" value={newData.direccion} onChange={e => setNewData({...newData, direccion: e.target.value})} placeholder="Dirección" />
                <input className="w-full p-2 border rounded" value={newData.nivel} onChange={e => setNewData({...newData, nivel: e.target.value})} placeholder="Nivel (ej. Primaria, Secundaria)" />
                <input className="w-full p-2 border rounded" value={newData.gestion} onChange={e => setNewData({...newData, gestion: e.target.value})} placeholder="Gestión (ej. Público, Privado)" />
            </div>
            <div className="flex gap-2 mt-4">
                <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleCreate}>Guardar</button>
                <button className="bg-stone-300 text-white px-4 py-2 rounded" onClick={() => setIsAdding(false)}>Cancelar</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <select className="p-3 border rounded-xl" onChange={e => setSelectedRegion(regiones.find(r => r.id === parseInt(e.target.value)))} value={selectedRegion?.id || ''}>
                <option value="">Seleccione Región</option>
                {regiones.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            <select className="p-3 border rounded-xl" onChange={e => setSelectedProvincia(provincias.find(p => p.id === parseInt(e.target.value)))} value={selectedProvincia?.id || ''} disabled={!selectedRegion}>
                <option value="">Seleccione Provincia</option>
                {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <select className="p-3 border rounded-xl" onChange={e => setSelectedDistrito(distritos.find(d => d.id === parseInt(e.target.value)))} value={selectedDistrito?.id || ''} disabled={!selectedProvincia}>
                <option value="">Seleccione Distrito</option>
                {distritos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
        </div>

        <div className="space-y-4">
            {colegios.map(c => (
                <div key={c.id} className="p-4 rounded-xl shadow-sm border border-stone-100 bg-white">
                    {editingId === c.id ? (
                        <div className="space-y-2">
                            <input className="w-full p-2 border rounded" value={editData.codigo || ''} onChange={e => setEditData({...editData, codigo: e.target.value})} placeholder="Código" />
                            <input className="w-full p-2 border rounded" value={editData.nombre || ''} onChange={e => setEditData({...editData, nombre: e.target.value})} placeholder="Nombre" />
                            <input className="w-full p-2 border rounded" value={editData.direccion || ''} onChange={e => setEditData({...editData, direccion: e.target.value})} placeholder="Dirección" />
                            <input className="w-full p-2 border rounded" value={editData.nivel || ''} onChange={e => setEditData({...editData, nivel: e.target.value})} placeholder="Nivel" />
                            <input className="w-full p-2 border rounded" value={editData.gestion || ''} onChange={e => setEditData({...editData, gestion: e.target.value})} placeholder="Gestión" />
                            <div className="flex gap-2">
                                <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => handleEdit(c.id, editData)}>Guardar</button>
                                <button className="bg-stone-300 text-white px-3 py-1 rounded" onClick={() => setEditingId(null)}>Cancelar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-bold text-stone-800">{c.nombre}</div>
                                <div className="text-sm text-stone-500">{c.direccion} - {c.nivel} - {c.gestion}</div>
                            </div>
                            <div className="flex gap-2">
                                <button className="text-blue-600 text-xs font-semibold" onClick={() => { setEditingId(c.id); setEditData({ codigo: c.codigo, nombre: c.nombre, direccion: c.direccion, nivel: c.nivel, gestion: c.gestion }); }}>Editar</button>
                                <button className="text-red-600 text-xs font-semibold" onClick={() => handleDelete(c.id)}>Eliminar</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};
