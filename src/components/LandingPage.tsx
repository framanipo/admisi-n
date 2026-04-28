import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Download, Check, FileText, Clock, ChevronLeft, Layout, GraduationCap, Calendar, Gavel, Trophy, BookOpen } from 'lucide-react';
import { UniqLogo } from '../UniqLogo';
import { renderTitle } from '../lib/utils';
import { DynamicIcon } from './ui/FormComponents';
import { Career } from '../data/defaultCareers';

export const LandingPage = ({ onPreRegister, onLogin, onNavigate, onViewCareer, appSettings, cronograma, carrerasDetalladas, visitorCount }: { onPreRegister: () => void, onLogin: () => void, onNavigate: (view: any) => void, onViewCareer: (career: Career) => void, appSettings: any, cronograma: any[], carrerasDetalladas: any[], visitorCount?: number | null }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const QUICK_LINKS = [
    { label: 'Guía del Postulante', icon: <BookOpen size={18} />, action: () => { window.scrollTo(0, 0); onNavigate('guia'); } },
    { label: 'Cronograma', icon: <Calendar size={18} />, action: () => scrollToId('cronograma-section') },
    { label: 'Reglamento', icon: <Gavel size={18} />, action: () => onNavigate('reglamento') },
    { label: 'Resultados', icon: <Trophy size={18} />, action: () => { window.scrollTo(0, 0); onNavigate('resultados'); } },
  ];
  
  const heroImages = useMemo(() => {
    const images = appSettings?.configuracionInicio?.hero_images;
    const imagesArray = Array.isArray(images) ? images : [];
    
    if (imagesArray.length === 0 && appSettings?.configuracionInicio?.imagen_url) {
      return [appSettings.configuracionInicio.imagen_url];
    }
    return imagesArray.filter((img: string) => img && typeof img === 'string' && img.trim() !== '');
  }, [appSettings?.configuracionInicio?.hero_images, appSettings?.configuracionInicio?.imagen_url]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const currentStatus = useMemo(() => {
    const items = cronograma;
    const activeItem = items.find(item => item.status === 'activo' && item.habilitado !== false);
    if (activeItem) {
      return activeItem.event;
    }
    const hasPending = items.some(item => item.status === 'pendiente' && item.habilitado !== false);
    if (hasPending) {
      return "Próximo Proceso de Admisión";
    }
    return "Proceso de Admisión Finalizado";
  }, [cronograma]);

  return (
    <div className="min-h-screen bg-[#f8f7f4] selection:bg-uniq-cyan/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl z-50 border-b border-stone-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {appSettings?.imagenPortalUrl ? (
              <img src={appSettings.imagenPortalUrl} alt="Logo" className="h-12 w-12 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <UniqLogo className="h-12 w-12" />
            )}
            <div className="hidden sm:block">
              <h1 className="font-bold text-stone-800 leading-tight text-sm max-w-[250px]">Universidad Nacional Intercultural de Quillabamba</h1>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{appSettings?.descripcionAdmision || "Admisión 2026"}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Quick Access Menu moved to Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="flex items-center gap-2 px-3 py-2 text-stone-600 hover:text-uniq-cyan hover:bg-uniq-cyan/5 rounded-xl transition-all font-bold text-xs"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={onLogin}
                className="px-6 py-2.5 text-stone-600 font-bold text-sm hover:text-stone-900 transition-colors"
            >
              Ingresar
            </button>
            <button 
              onClick={onPreRegister}
              className="px-6 py-2.5 bg-uniq-cyan text-white font-bold text-sm rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-uniq-cyan/20"
            >
              Preinscripción
            </button>
          </div>
        </div>
      </div>
    </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Overlay Color (stays constant) */}
        <div 
          className="absolute inset-0 z-[2]" 
          style={{ 
            backgroundColor: appSettings?.configuracionInicio?.overlay_color || '#000000', 
            opacity: appSettings?.configuracionInicio?.overlay_opacity ?? 0.5 
          }} 
        />
        
        {/* Background Image Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="popLayout">
            {heroImages.length > 0 && heroImages[currentSlide] ? (
              <motion.img 
                key={currentSlide}
                src={heroImages[currentSlide]} 
                alt="Fondo Principal" 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 bg-stone-900" />
            )}
          </AnimatePresence>

          {/* Gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-[3]" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md text-white rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 shadow-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-uniq-cyan/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-uniq-cyan"></span>
              </span>
              {currentStatus}
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter drop-shadow-2xl">
              {renderTitle(appSettings?.configuracionInicio?.titulo || "Tu futuro comienza aquí.")}
            </h2>
            <p className="text-xl text-white/90 leading-relaxed max-w-xl font-medium drop-shadow-md">
              {appSettings?.configuracionInicio?.subtitulo || "Únete a la Universidad Nacional Intercultural de Quillabamba y sé parte de una comunidad académica que valora la excelencia y la diversidad cultural."}
            </p>
            <div className="flex flex-col gap-6 pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={onPreRegister}
                  className="px-12 py-5 bg-uniq-cyan text-white font-bold rounded-2xl hover:bg-cyan-500 transition-all shadow-2xl shadow-uniq-cyan/40 flex items-center justify-center gap-3 group text-lg"
                >
                  Iniciar Inscripción
                  <ChevronRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
                <button className="px-10 py-5 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-3 group">
                  Descargar Guía
                  <Download size={22} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Slider Dots */}
            {heroImages.length > 1 && (
              <div className="flex gap-2 pt-8">
                {heroImages.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-12 bg-uniq-cyan' : 'w-4 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="hidden lg:flex justify-end"
          >
            <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-uniq-cyan/20 blur-[60px] rounded-full -translate-y-10 translate-x-10 group-hover:bg-uniq-cyan/30 transition-colors" />
              
              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="w-16 h-16 bg-uniq-yellow/20 text-uniq-yellow rounded-[1.5rem] flex items-center justify-center shadow-inner">
                  <DynamicIcon name={appSettings?.configuracionInicio?.excelencia_icono || "GraduationCap"} size={32} />
                </div>
                <div>
                  <p className="font-black text-white text-2xl tracking-tight leading-none mb-1">{appSettings?.configuracionInicio?.excelencia_titulo || "Excelencia UNIQ"}</p>
                  <p className="text-xs text-white/50 font-bold uppercase tracking-widest">{appSettings?.configuracionInicio?.excelencia_subtitulo || "Formación Intercultural"}</p>
                </div>
              </div>
              <div className="space-y-6 relative z-10">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <p className="text-sm text-white/80 leading-relaxed font-medium">
                    {appSettings?.configuracionInicio?.excelencia_descripcion || "Programas acreditados y docentes de primer nivel para tu formación profesional."}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-uniq-cyan font-black text-sm p-4 bg-uniq-cyan/10 rounded-2xl border border-uniq-cyan/20">
                  <DynamicIcon name={appSettings?.configuracionInicio?.excelencia_etiqueta_icono || "ShieldCheck"} size={20} />
                  {appSettings?.configuracionInicio?.excelencia_etiqueta || "Título a nombre de la Nación"}
                </div>
                {visitorCount && visitorCount > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 1 }}
                    className="flex flex-col gap-1 p-5 bg-gradient-to-r from-uniq-cyan/10 to-uniq-cyan/5 rounded-2xl border border-uniq-cyan/20 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2">
                       <DynamicIcon name="PartyPopper" size={18} className="text-uniq-yellow animate-bounce" />
                       <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Estadísticas del mes</span>
                    </div>
                    <p className="text-white font-medium text-sm">
                      ¡Qué alegría! Eres el visitante número <span className="text-uniq-yellow text-lg font-black">{visitorCount.toLocaleString()}</span> en explorar nuestra excelencia este mes.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Carreras Detalladas Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-extrabold text-uniq-cyan mb-4 tracking-tight">Nuestras Carreras</h3>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Descubre los programas académicos diseñados para formar líderes y profesionales de excelencia, comprometidos con el desarrollo de la región y el país.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {carrerasDetalladas.map((carrera: any, i: number) => (
              <div 
                key={carrera.carrera_id || carrera.id} 
                className="bg-white p-8 rounded-3xl border border-stone-100 space-y-4 group cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-float-slow" 
                style={{ animationDelay: `${i * 0.5}s` }}
                onClick={() => onViewCareer(carrera)}
              >
                <div className="rounded-2xl overflow-hidden bg-stone-100">
                  {carrera.imagen_url ? (
                    <img 
                      src={carrera.imagen_url} 
                      alt={carrera.nombre} 
                      className="w-full h-48 object-cover transition-transform duration-500 hover-zoom-image" 
                      style={{
                        objectPosition: `${carrera.imagen_offset_x ?? 50}% ${carrera.imagen_offset_y ?? 50}%`,
                        '--base-scale': (carrera.imagen_zoom ?? 100) / 100,
                        transform: 'scale(var(--base-scale))'
                      } as React.CSSProperties}
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-stone-300">
                      <Layout size={40} />
                    </div>
                  )}
                </div>
                <h4 className="text-xl font-bold text-stone-800 group-hover:text-uniq-cyan transition-colors">{carrera.nombre}</h4>
                <p className="text-sm text-stone-600">{carrera.descripcion_corta}</p>
                <button 
                  className="text-uniq-cyan font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  Ver más <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden bg-stone-50">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-uniq-cyan/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-uniq-lime/5 blur-[100px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Carreras", value: "06", icon: <Layout className="text-uniq-cyan" size={20} /> },
              { label: "Estudiantes", value: "1.2k+", icon: <GraduationCap className="text-uniq-yellow" size={20} /> },
              { label: "Docentes", value: "80+", icon: <FileText className="text-uniq-lime" size={20} /> },
              { label: "Años UNIQ", value: "05+", icon: <Clock className="text-stone-400" size={20} /> },
            ].map((stat) => (
              <motion.div 
                key={stat.label}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[2rem] border border-stone-200/60 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="space-y-1">
                  <p className="text-4xl md:text-5xl font-black text-stone-900 tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cronograma Preview */}
      <section id="cronograma-section" className="py-24 px-6 bg-stone-950 text-white overflow-hidden relative">
        {/* Intercultural Background Elements */}
        <div className="absolute inset-0 z-0">
          <img 
            src={appSettings?.cronogramaConfig?.fondo_url || "https://picsum.photos/seed/quillabamba-landscape-intercultural/1920/1080"} 
            alt="Fondo Intercultural UNIQ" 
            className="w-full h-full object-cover opacity-10 grayscale group-hover:grayscale-0 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0" style={{ backgroundColor: appSettings?.cronogramaConfig?.overlay_color || '#0c0a09', opacity: appSettings?.cronogramaConfig?.overlay_opacity ?? 0.8 }} />
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-uniq-cyan/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-uniq-lime/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">Cronograma de <br /><span className="text-uniq-cyan">{appSettings?.descripcionAdmision || "Admisión 2026"}</span></h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-uniq-cyan to-uniq-lime rounded-full" />
                <p className="text-stone-400 text-lg max-w-md">
                  Asegura tu ingreso conociendo las fechas clave. El camino hacia tu formación profesional comienza aquí.
                </p>
              </motion.div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
                {cronograma.filter((item: any) => item.habilitado !== false).map((item: any, idx: number) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group cursor-default"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-2 h-2 rounded-full bg-uniq-cyan group-hover:shadow-[0_0_12px_rgba(8,145,178,0.8)] transition-all" />
                      <div className="space-y-1">
                        <div className="text-uniq-cyan font-mono font-bold text-xs tracking-widest uppercase">{item.date}</div>
                        <div className="font-bold text-stone-100 group-hover:text-white text-lg transition-colors">{item.event}</div>
                      </div>
                    </div>
                    <div className={`
                      px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border
                      ${item.status === 'completado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        item.status === 'activo' ? 'bg-uniq-cyan/20 text-uniq-cyan border-uniq-cyan/30 shadow-[0_0_15px_rgba(8,145,178,0.2)]' : 
                        'bg-stone-500/10 text-stone-400 border-stone-500/20'}
                    `}>
                      {item.status === 'completado' ? 'Finalizado' : 
                       item.status === 'activo' ? '• Proceso Actual' : 'Próximamente'}
                    </div>
                  </motion.div>
                ))}
                {cronograma.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-stone-500 gap-4">
                    <Clock className="animate-spin text-uniq-cyan/50" />
                    <p className="italic">Cargando cronograma oficial...</p>
                  </div>
                )}
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/10 relative overflow-hidden group shadow-2xl"
            >
              {/* Intercultural Accent Bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-uniq-cyan via-uniq-yellow to-uniq-lime opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-uniq-cyan/20 flex items-center justify-center text-uniq-cyan">
                  <FileText size={24} />
                </div>
                <h3 className="text-2xl font-bold">Requisitos de Inscripción</h3>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Certificado de estudios", desc: "Original de estudios secundarios completos." },
                  { title: "Identidad", desc: "Copia de DNI o documento de identidad vigente." },
                  { title: "Derecho de Examen", desc: "Voucher de pago original por derecho de admisión." },
                  { title: "Fotografía", desc: "Tamaño carnet a color con fondo blanco." },
                  { title: "Ficha UNIQ", desc: "Ficha de preinscripción generada en este portal." }
                ].map((req, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-uniq-cyan/20 flex items-center justify-center text-uniq-cyan shrink-0 mt-0.5">
                      <Check size={14} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-stone-100 text-sm">{req.title}</p>
                      <p className="text-stone-400 text-xs leading-relaxed">{req.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 p-6 bg-uniq-cyan/5 rounded-3xl border border-uniq-cyan/10">
                <p className="text-xs text-stone-400 leading-relaxed italic">
                  * Los requisitos pueden variar según la modalidad de ingreso seleccionada. Ver reglamento completo para más detalles.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-stone-50 border-t border-stone-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <UniqLogo className="h-10 w-10" />
              <h1 className="font-bold text-stone-900 text-lg max-w-[250px] leading-tight">Universidad Nacional Intercultural de Quillabamba</h1>
            </div>
            <p className="text-stone-600 max-w-sm leading-relaxed text-sm">
              Universidad Nacional Intercultural de Quillabamba. Formando profesionales para el mundo desde el corazón de la Amazonía cusqueña.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-stone-900 mb-6 uppercase text-xs tracking-widest">Proceso</h4>
            <ul className="space-y-4 text-sm text-stone-600">
              <li className="hover:text-uniq-cyan cursor-pointer transition-colors">Guía del Postulante</li>
              <li className="hover:text-uniq-cyan cursor-pointer transition-colors" onClick={() => scrollToId('cronograma-section')}>Cronograma</li>
              <li className="hover:text-uniq-cyan cursor-pointer transition-colors" onClick={() => { window.scrollTo(0, 0); onNavigate('reglamento'); }}>Reglamento</li>
              <li className="hover:text-uniq-cyan cursor-pointer transition-colors" onClick={() => { window.scrollTo(0, 0); onNavigate('resultados'); }}>Resultados</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-stone-900 mb-6 uppercase text-xs tracking-widest">Contacto</h4>
            <ul className="space-y-4 text-sm text-stone-600">
              <li className="flex items-center gap-3">
                admision@uniq.edu.pe
              </li>
              <li className="flex items-center gap-3">
                (084) 282728
              </li>
              <li className="flex items-center gap-3">
                Quillabamba, Cusco
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-stone-200 text-center text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Universidad Nacional Intercultural de Quillabamba. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
