import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Download, Check } from 'lucide-react';
import { UniqLogo } from '../UniqLogo';
import { renderTitle } from '../lib/utils';
import { DynamicIcon } from './ui/FormComponents';
import { Career } from '../data/defaultCareers';

export const LandingPage = ({ onPreRegister, onLogin, onViewCareer, appSettings, cronograma, carrerasDetalladas }: { onPreRegister: () => void, onLogin: () => void, onViewCareer: (career: Career) => void, appSettings: any, cronograma: any[], carrerasDetalladas: any[] }) => {
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
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{appSettings?.textoLogo || "Admisión 2026"}</p>
            </div>
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
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image and Overlay */}
        <div className="absolute inset-0 z-0">
          {appSettings?.configuracionInicio?.imagen_url && (
            <img 
              src={appSettings.configuracionInicio.imagen_url} 
              alt="Fondo Principal" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <div 
            className="absolute inset-0" 
            style={{ 
              backgroundColor: appSettings?.configuracionInicio?.overlay_color || '#000000', 
              opacity: appSettings?.configuracionInicio?.overlay_opacity ?? 0.5 
            }} 
          />
          {/* Gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md text-white rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-uniq-cyan/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-uniq-cyan"></span>
              </span>
              {currentStatus}
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              {renderTitle(appSettings?.configuracionInicio?.titulo || "Tu futuro comienza aquí.")}
            </h2>
            <p className="text-lg text-white/80 leading-relaxed max-w-lg">
              {appSettings?.configuracionInicio?.subtitulo || "Únete a la Universidad Nacional Intercultural de Quillabamba y sé parte de una comunidad académica que valora la excelencia y la diversidad cultural."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onPreRegister}
                className="px-10 py-4 bg-uniq-cyan text-white font-bold rounded-2xl hover:bg-cyan-700 transition-all shadow-2xl shadow-uniq-cyan/30 flex items-center justify-center gap-2 group"
              >
                Iniciar Inscripción
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2 group">
                Descargar Guía
                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:flex justify-end"
          >
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-2xl max-w-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-uniq-yellow/20 text-uniq-yellow rounded-2xl flex items-center justify-center">
                  <DynamicIcon name={appSettings?.configuracionInicio?.excelencia_icono || "GraduationCap"} size={24} />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{appSettings?.configuracionInicio?.excelencia_titulo || "Excelencia UNIQ"}</p>
                  <p className="text-xs text-white/60">{appSettings?.configuracionInicio?.excelencia_subtitulo || "Formación Intercultural"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/80 leading-relaxed">
                    {appSettings?.configuracionInicio?.excelencia_descripcion || "Programas acreditados y docentes de primer nivel para tu formación profesional."}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-uniq-cyan text-xs font-bold">
                  <DynamicIcon name={appSettings?.configuracionInicio?.excelencia_etiqueta_icono || "ShieldCheck"} size={14} />
                  {appSettings?.configuracionInicio?.excelencia_etiqueta || "Título a nombre de la Nación"}
                </div>
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
            {carrerasDetalladas.map((carrera: any) => (
              <div key={carrera.carrera_id || carrera.id} className="bg-stone-50 p-8 rounded-3xl border border-stone-100 space-y-4 group cursor-pointer" onClick={() => onViewCareer(carrera)}>
                <div className="rounded-2xl overflow-hidden">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Carreras", value: "06" },
              { label: "Estudiantes", value: "1.2k+" },
              { label: "Docentes", value: "80+" },
              { label: "Años", value: "05+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <p className="text-4xl md:text-5xl font-bold text-uniq-cyan">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cronograma Preview */}
      <section className="py-24 px-6 bg-stone-950 text-white overflow-hidden relative">
        {/* Intercultural Background Elements */}
        <div className="absolute inset-0 z-0">
          <img 
            src={appSettings?.cronogramaFondoUrl || "https://picsum.photos/seed/quillabamba-landscape-intercultural/1920/1080"} 
            alt="Fondo Intercultural UNIQ" 
            className="w-full h-full object-cover opacity-10 grayscale hover:grayscale-0 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-950" style={{ opacity: appSettings?.cronogramaOverlayOpacity ?? 0.8 }} />
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-uniq-cyan/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-uniq-lime/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">Cronograma de <br />{appSettings?.textoLogo || "Admisión 2026"}</h2>
              <p className="text-stone-400 text-lg">
                No pierdas la oportunidad de postular. Revisa las fechas clave del proceso actual.
              </p>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                {cronograma.filter((item: any) => item.habilitado !== false).map((item: any) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="text-uniq-cyan font-mono font-bold text-sm whitespace-nowrap">{item.date}</div>
                      <div className="font-bold text-stone-100 group-hover:text-white transition-colors">{item.event}</div>
                    </div>
                    <div className={`
                      px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                      ${item.status === 'completado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        item.status === 'activo' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse' : 
                        'bg-stone-500/10 text-stone-400 border-stone-500/20'}
                    `}>
                      {item.status === 'completado' ? 'Finalizado' : 
                       item.status === 'activo' ? 'En Curso' : 'Pendiente'}
                    </div>
                  </div>
                ))}
                {cronograma.length === 0 && (
                  <p className="text-stone-500 italic text-center py-10">Cargando cronograma oficial...</p>
                )}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
              {/* Intercultural Accent Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-uniq-cyan via-uniq-yellow to-uniq-lime opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <h3 className="text-xl font-bold mb-6">Requisitos de Inscripción</h3>
              <ul className="space-y-4">
                {[
                  "Certificado de estudios secundarios (original).",
                  "Copia de DNI vigente.",
                  "Comprobante de pago por derecho de examen.",
                  "Fotografía tamaño carnet a color.",
                  "Ficha de preinscripción debidamente llenada."
                ].map((req) => (
                  <li key={req} className="flex items-start gap-3 text-stone-400 text-sm">
                    <div className="w-5 h-5 rounded-full bg-uniq-cyan/20 flex items-center justify-center text-uniq-cyan shrink-0 mt-0.5">
                      <Check size={12} />
                    </div>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
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
              <li className="hover:text-uniq-cyan cursor-pointer transition-colors">Cronograma</li>
              <li className="hover:text-uniq-cyan cursor-pointer transition-colors">Reglamento</li>
              <li className="hover:text-uniq-cyan cursor-pointer transition-colors">Resultados</li>
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
