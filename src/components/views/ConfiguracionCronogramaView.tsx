import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, ChevronLeft, Loader2, Image as ImageIcon, Calendar, Sliders, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export const ConfiguracionCronogramaView = ({ onBack, onUpdate }: { onBack: () => void, onUpdate: () => void }) => {
  const [config, setConfig] = useState({ 
    fondo_url: '', 
    overlay_opacity: 0.8,
    overlay_color: '#081c22', // Darker institutional cyan for better contrast
    fecha_modificacion: null
  });

  const PRESET_COLORS = [
    { name: 'Cian UNIQ (Logo)', value: '#0891b2' },
    { name: 'Azul Institucional', value: '#1e3a8a' },
    { name: 'Verde UNIQ', value: '#65a30d' },
    { name: 'Ambar UNIQ', value: '#eab308' },
    { name: 'Oscuro Profundo', value: '#0c0a09' },
    { name: 'Pizarra Intensa', value: '#0f172a' },
  ];
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, eventsRes] = await Promise.all([
          fetch('/api/configuracion-cronograma'),
          fetch('/api/cronograma')
        ]);
        const configData = await configRes.json();
        const eventsData = await eventsRes.json();
        
        setConfig(configData);
        // Keep all events for reordering
        setEvents(eventsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cronograma data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save background config
      await fetch('/api/configuracion-cronograma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      // Save manual events
      await fetch('/api/cronograma/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: events })
      });

      onUpdate();
      onBack();
    } catch (error) {
      console.error("Error saving cronograma config:", error);
    } finally {
      setSaving(false);
    }
  };

  const addEvent = () => {
    const newEvent = {
      event: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: new Date().toISOString().split('T')[0],
      usar_rango: true,
      status: 'pendiente',
      habilitado: true,
      isAutomatic: false
    };
    setEvents([...events, newEvent]);
    setEditingEvent(events.length);
    setIsAdding(true);
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
    if (editingEvent === index) setEditingEvent(null);
  };

  const updateEvent = (index: number, field: string, value: any) => {
    const newEvents = [...events];
    if (field === 'usar_rango' && value === false) {
      newEvents[index] = { ...newEvents[index], [field]: value, fecha_fin: '' };
    } else {
      newEvents[index] = { ...newEvents[index], [field]: value };
    }
    setEvents(newEvents);
  };

  const moveEvent = (index: number, direction: 'up' | 'down') => {
    const newEvents = [...events];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newEvents.length) return;
    
    [newEvents[index], newEvents[targetIndex]] = [newEvents[targetIndex], newEvents[index]];
    setEvents(newEvents);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <Loader2 className="animate-spin text-uniq-cyan" size={40} />
      <p className="text-stone-400 font-bold animate-pulse">Cargando configuración...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors font-bold group">
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
            <ChevronLeft size={20} />
          </div>
          Volver al panel
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-uniq-cyan/10 flex items-center justify-center text-uniq-cyan">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">Eventos del Cronograma</h2>
              <p className="text-sm text-stone-500">Gestiona los hitos y fechas importantes del proceso de admisión.</p>
            </div>
          </div>
          <button 
            onClick={addEvent}
            className="flex items-center gap-2 px-6 py-3 bg-uniq-cyan/10 text-uniq-cyan font-bold rounded-xl hover:bg-uniq-cyan/20 transition-all active:scale-95"
          >
            <Plus size={18} /> Agregar Evento
          </button>
        </div>

        <div className="space-y-4">
          {events.map((ev, idx) => (
            <div key={ev.id || idx} className={`p-6 rounded-3xl border transition-all bg-stone-50 border-stone-100 space-y-6`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Nombre del Evento</label>
                      <input 
                        value={ev.event || ''}
                        onChange={e => updateEvent(idx, 'event', e.target.value)}
                        className={`w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-bold text-stone-800`}
                        placeholder="Ej: Examen de Admisión"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className={`flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl select-none w-full cursor-pointer`}>
                        <input 
                          type="checkbox" 
                          checked={ev.usar_rango !== false} 
                          onChange={e => updateEvent(idx, 'usar_rango', e.target.checked)}
                          className="w-5 h-5 accent-uniq-cyan rounded"
                        />
                        <span className="text-sm font-bold text-stone-700">Utilizar rango de fechas</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Fecha Inicio</label>
                      <input 
                        type="date"
                        value={ev.fecha_inicio?.split('T')[0] || ''}
                        onChange={e => updateEvent(idx, 'fecha_inicio', e.target.value)}
                        className={`w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-bold text-stone-800`}
                      />
                    </div>
                    <div className={`space-y-2 transition-opacity ${ev.usar_rango === false ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Fecha Fin</label>
                      <input 
                        type="date"
                        value={ev.fecha_fin?.split('T')[0] || ''}
                        onChange={e => updateEvent(idx, 'fecha_fin', e.target.value)}
                        className={`w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-bold text-stone-800`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => moveEvent(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 text-stone-400 hover:text-uniq-cyan hover:bg-uniq-cyan/5 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Subir"
                  >
                    <ChevronLeft size={20} className="rotate-90" />
                  </button>
                  <button 
                    onClick={() => moveEvent(idx, 'down')}
                    disabled={idx === events.length - 1}
                    className="p-2 text-stone-400 hover:text-uniq-cyan hover:bg-uniq-cyan/5 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Bajar"
                  >
                    <ChevronLeft size={20} className="-rotate-90" />
                  </button>
                </div>
                <button 
                  onClick={() => removeEvent(idx)}
                  className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Eliminar evento"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          
          {events.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-stone-100 rounded-[2.5rem]">
              <p className="text-stone-400 font-medium">No hay eventos manuales configurados.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-uniq-cyan/10 flex items-center justify-center text-uniq-cyan">
            <Sliders size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-800">Estética del Cronograma</h2>
            <p className="text-sm text-stone-500">Personaliza la tonalidad, color y fondo visual para alinearlo con la identidad de la UNIQ.</p>
          </div>
        </div>

        <div className="space-y-8 bg-stone-50/50 p-6 rounded-3xl border border-stone-100">
          <div className="space-y-4">
            <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
              <ImageIcon size={16} className="text-uniq-cyan" />
              Imagen de Fondo (URL)
            </label>
            <input 
              value={config.fondo_url || ''} 
              onChange={e => setConfig({...config, fondo_url: e.target.value})}
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium bg-white shadow-sm"
              placeholder="https://ejemplo.com/fondo-institucional.jpg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-uniq-cyan" />
                  Color del Logo / Institucional
                </label>
                <span className="text-[10px] font-bold text-uniq-cyan bg-uniq-cyan/10 px-2 py-0.5 rounded-md uppercase tracking-widest">Recomendado</span>
              </div>
              <div className="grid grid-cols-6 gap-3">
                {PRESET_COLORS.map((color) => (
                  <motion.button
                    key={color.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConfig({ ...config, overlay_color: color.value })}
                    className={`w-full aspect-square rounded-xl border-2 transition-all relative group ${
                      config.overlay_color === color.value ? 'border-uniq-cyan shadow-lg' : 'border-white hover:border-uniq-cyan/30'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {config.overlay_color === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-stone-800 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {color.name}
                    </div>
                  </motion.button>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-6 p-3 bg-white rounded-2xl border border-stone-200 shadow-sm">
                <input 
                  type="color"
                  value={config.overlay_color || '#000000'}
                  onChange={e => setConfig({...config, overlay_color: e.target.value})}
                  className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                />
                <input 
                  type="text"
                  value={config.overlay_color || '#000000'}
                  onChange={e => setConfig({...config, overlay_color: e.target.value})}
                  className="flex-1 bg-transparent border-none outline-none font-mono text-sm uppercase font-bold text-stone-600"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                <Sliders size={16} className="text-uniq-cyan" />
                Opacidad de Tonalidad ({Math.round(config.overlay_opacity * 100)}%)
              </label>
              <div className="flex flex-col gap-6 pt-2">
                <div className="relative h-2 w-full bg-stone-200 rounded-full">
                  <div 
                    className="absolute h-full rounded-full bg-gradient-to-r from-uniq-cyan to-uniq-lime" 
                    style={{ width: `${config.overlay_opacity * 100}%` }}
                  />
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={config.overlay_opacity ?? 0}
                    onChange={e => setConfig({...config, overlay_opacity: parseFloat(e.target.value)})}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
                  />
                  <motion.div 
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-uniq-cyan rounded-full shadow-lg pointer-events-none z-20"
                    style={{ left: `calc(${config.overlay_opacity * 100}% - 12px)` }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">
                  <span>Claro / Visible</span>
                  <span>Oscuro / Tonalidad</span>
                </div>
              </div>
              <div className="p-4 bg-uniq-cyan/5 rounded-2xl border border-uniq-cyan/10">
                <p className="text-xs text-stone-500 leading-relaxed">
                  Tip: Usa una opacidad entre <span className="font-bold text-uniq-cyan">70% y 90%</span> para asegurar que el texto blanco del cronograma sea legible sobre fondos coloridos.
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700">Vista Previa</label>
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-stone-100 border border-stone-200">
              {config.fondo_url ? (
                <>
                  <img 
                    src={config.fondo_url} 
                    alt="Cronograma Background Preview" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div 
                    className="absolute inset-0" 
                    style={{ backgroundColor: config.overlay_color, opacity: config.overlay_opacity }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <h3 className="text-white text-2xl font-bold">Cronograma de Admisión</h3>
                      <p className="text-stone-300 text-sm">Ejemplo de texto sobre el fondo</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                  <ImageIcon size={48} />
                  <p className="text-sm font-medium">Ingresa una URL para ver la previsualización</p>
                </div>
              )}
            </div>
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
