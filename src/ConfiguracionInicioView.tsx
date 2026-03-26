import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, ChevronLeft, Loader2, Layout, Image as ImageIcon, Globe, Eye, Calendar, Clock, Sliders, GraduationCap } from 'lucide-react';

export const ConfiguracionInicioView = ({ onBack, onUpdate }: { onBack: () => void, onUpdate: () => void }) => {
  const [config, setConfig] = useState({ 
    titulo: '', 
    subtitulo: '', 
    imagen_url: '', 
    overlay_opacity: 0.5,
    overlay_color: '#000000',
    excelencia_titulo: '',
    excelencia_subtitulo: '',
    excelencia_descripcion: '',
    excelencia_etiqueta: '',
    excelencia_icono: 'GraduationCap',
    excelencia_etiqueta_icono: 'ShieldCheck',
    texto_logo: '', 
    imagen_portal_url: '',
    contador_visitas: 0,
    fecha_modificacion: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/configuracion-inicio')
      .then(res => res.json())
      .then(data => {
        // Ensure no null values for controlled inputs
        const sanitizedData = { ...data };
        Object.keys(config).forEach(key => {
          if (sanitizedData[key] === null || sanitizedData[key] === undefined) {
            if (typeof config[key as keyof typeof config] === 'string') sanitizedData[key] = '';
            if (typeof config[key as keyof typeof config] === 'number') sanitizedData[key] = 0;
          }
        });
        setConfig(prev => ({ ...prev, ...sanitizedData }));
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/configuracion-inicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      onUpdate();
      onBack();
    } catch (error) {
      console.error("Error saving config:", error);
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
        {/* Configuración General */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-uniq-cyan/10 flex items-center justify-center text-uniq-cyan">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">Identidad del Portal</h2>
              <p className="text-sm text-stone-500">Configura los elementos visuales básicos de la plataforma.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                Texto junto al Logo
              </label>
              <input 
                value={config.texto_logo} 
                onChange={e => setConfig({...config, texto_logo: e.target.value})}
                className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium"
                placeholder={`Admisión ${new Date().getFullYear()}`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">URL de Imagen del Portal (Logo/Icono)</label>
              <div className="flex gap-4">
                <input 
                  value={config.imagen_portal_url} 
                  onChange={e => setConfig({...config, imagen_portal_url: e.target.value})}
                  className="flex-1 p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium"
                  placeholder="https://ejemplo.com/logo.png"
                />
                {config.imagen_portal_url && (
                  <div className="w-14 h-14 rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 flex items-center justify-center">
                    <img src={config.imagen_portal_url} alt="Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Bienvenida */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Layout size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">Sección de Bienvenida</h2>
              <p className="text-sm text-stone-500">Personaliza el mensaje principal que ven los postulantes.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Título Principal</label>
              <input 
                value={config.titulo} 
                onChange={e => setConfig({...config, titulo: e.target.value})}
                className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Subtítulo / Descripción</label>
              <textarea 
                value={config.subtitulo} 
                onChange={e => setConfig({...config, subtitulo: e.target.value})}
                className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium min-h-[120px]"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700">URL de Imagen de Fondo</label>
                  <input 
                    value={config.imagen_url} 
                    onChange={e => setConfig({...config, imagen_url: e.target.value})}
                    className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium"
                    placeholder="https://ejemplo.com/hero.jpg"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                    <Sliders size={16} />
                    Opacidad del Overlay
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={config.overlay_opacity}
                      onChange={e => setConfig({...config, overlay_opacity: parseFloat(e.target.value)})}
                      className="flex-1 h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-uniq-cyan"
                    />
                    <span className="text-sm font-bold text-stone-600 w-12 text-right">
                      {Math.round(config.overlay_opacity * 100)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                    Color del Overlay
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color"
                      value={config.overlay_color}
                      onChange={e => setConfig({...config, overlay_color: e.target.value})}
                      className="w-12 h-12 rounded-xl border-none cursor-pointer overflow-hidden p-0"
                    />
                    <input 
                      type="text"
                      value={config.overlay_color}
                      onChange={e => setConfig({...config, overlay_color: e.target.value})}
                      className="flex-1 p-3 rounded-xl border border-stone-200 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Vista Previa</label>
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-stone-100 border border-stone-200">
                  {config.imagen_url ? (
                    <>
                      <img 
                        src={config.imagen_url} 
                        alt="Hero Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div 
                        className="absolute inset-0" 
                        style={{ backgroundColor: config.overlay_color, opacity: config.overlay_opacity }}
                      />
                      <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
                        <h4 className="text-lg font-bold leading-tight line-clamp-1">{config.titulo || 'Título'}</h4>
                        <p className="text-[10px] opacity-80 line-clamp-2 mt-1">{config.subtitulo || 'Descripción'}</p>
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
          </div>
        </section>

        {/* Cuadro de Excelencia */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
              <GraduationCap size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">Cuadro de Excelencia</h2>
              <p className="text-sm text-stone-500">Configura la información del cuadro flotante en la sección de inicio.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Título del Cuadro</label>
              <input 
                value={config.excelencia_titulo} 
                onChange={e => setConfig({...config, excelencia_titulo: e.target.value})}
                className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium"
                placeholder="Excelencia UNIQ"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Subtítulo del Cuadro</label>
              <input 
                value={config.excelencia_subtitulo} 
                onChange={e => setConfig({...config, excelencia_subtitulo: e.target.value})}
                className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium"
                placeholder="Formación Intercultural"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-stone-700">Descripción / Detalle</label>
              <textarea 
                value={config.excelencia_descripcion} 
                onChange={e => setConfig({...config, excelencia_descripcion: e.target.value})}
                className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium min-h-[100px]"
                rows={3}
                placeholder="Programas acreditados y docentes de primer nivel para tu formación profesional."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-stone-700">Etiqueta de Certificación</label>
              <input 
                value={config.excelencia_etiqueta} 
                onChange={e => setConfig({...config, excelencia_etiqueta: e.target.value})}
                className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium"
                placeholder="Título a nombre de la Nación"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Icono Principal (Lucide)</label>
              <input 
                value={config.excelencia_icono} 
                onChange={e => setConfig({...config, excelencia_icono: e.target.value})}
                className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium"
                placeholder="GraduationCap"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Icono Etiqueta (Lucide)</label>
              <input 
                value={config.excelencia_etiqueta_icono} 
                onChange={e => setConfig({...config, excelencia_etiqueta_icono: e.target.value})}
                className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-uniq-cyan/10 focus:border-uniq-cyan outline-none transition-all font-medium"
                placeholder="ShieldCheck"
              />
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
