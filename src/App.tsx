/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as LucideIcons from 'lucide-react';
import { 
  User, 
  BookOpen, 
  GraduationCap, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Mail,
  IdCard,
  Calendar,
  School,
  FileText,
  Clock,
  ListChecks,
  Info,
  LogOut,
  Shield,
  ShieldCheck,
  Eye,
  Lock,
  Search,
  UploadCloud,
  FileSearch,
  AlertCircle,
  Download,
  Globe,
  Check,
  Plus,
  Edit,
  Trash2,
  X,
  Database,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';

// --- Types ---

type Step = 'personal' | 'academic' | 'career' | 'success';
type View = 'landing' | 'login' | 'preinscripcion' | 'guia' | 'cronograma' | 'reglamento' | 'temario' | 'resultados' | 'admin-dashboard' | 'control-preinscripcion' | 'config-imagenes' | 'config-cronograma' | 'config-carreras' | 'carrera-detail' | 'inscripcion-form' | 'user-management' | 'registrados-management' | 'config-dni' | 'config-inicio';
type Role = 'admin' | 'registrador' | 'visualizador';

interface UserAuth {
  username: string;
  role: Role;
  full_name?: string;
  email?: string;
  activos?: boolean;
}

interface FormData {
  documentType: 'DNI' | 'Carnet de Extranjería';
  dni: string;
  names: string;
  paternalSurname: string;
  maternalSurname: string;
  birthDate: string;
  gender: string;
  email: string;
  phone: string;
  department: string;
  province: string;
  district: string;
  schoolName: string;
  schoolType: string;
  graduationYear: string;
  career: string;
  modality: string;
  indigenousPeople: string;
  lugarInscripcion: string;
  colegioRegion: string;
  colegioProvincia: string;
  colegioDistrito: string;
  procedenciaRegion: string;
  procedenciaProvincia: string;
  procedenciaDistrito: string;
  procedenciaDireccion: string;
  nacimientoRegion: string;
  nacimientoProvincia: string;
  nacimientoDistrito: string;
  idioma: string;
  idiomaLee: boolean;
  idiomaHabla: boolean;
  idiomaEscribe: boolean;
  tipoComunidad: string;
  nombreApoderado: string;
  celularApoderado: string;
  hasSpecialConditions: boolean;
  discapacidad: boolean;
  conadisNumber: string;
  isDeportista: boolean;
  isVictimaViolencia: boolean;
  isServicioMilitar: boolean;
  isPrimerosPuestos: boolean;
}

import { ConfiguracionInicioView } from './ConfiguracionInicioView';
import { ConfiguracionCronogramaView } from './ConfiguracionCronogramaView';
import { ConfiguracionCarrerasView } from './ConfiguracionCarrerasView';
import { ConfiguracionModalidadesView } from './ConfiguracionModalidadesView';
import { ConfiguracionDatabaseView } from './ConfiguracionDatabaseView';
import { CarreraDetailView } from './CarreraDetailView';
import { Career, DEFAULT_CAREERS } from './data/defaultCareers';

import { UniqLogo } from './UniqLogo';

const CURRENT_YEAR = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 100 }, (_, i) => (CURRENT_YEAR - i).toString());

const INITIAL_DATA: FormData = {
  documentType: 'DNI',
  dni: '',
  names: '',
  paternalSurname: '',
  maternalSurname: '',
  birthDate: '',
  gender: '',
  email: '',
  phone: '',
  department: '',
  province: '',
  district: '',
  schoolName: '',
  schoolType: 'Estatal',
  graduationYear: CURRENT_YEAR.toString(),
  career: '',
  modality: '',
  indigenousPeople: 'AMAZÓNICO',
  lugarInscripcion: '',
  colegioRegion: 'CUSCO',
  colegioProvincia: '',
  colegioDistrito: '',
  procedenciaRegion: 'CUSCO',
  procedenciaProvincia: '',
  procedenciaDistrito: '',
  procedenciaDireccion: '',
  nacimientoRegion: 'CUSCO',
  nacimientoProvincia: '',
  nacimientoDistrito: '',
  idioma: '',
  idiomaLee: false,
  idiomaHabla: false,
  idiomaEscribe: false,
  tipoComunidad: '',
  nombreApoderado: '',
  celularApoderado: '',
  hasSpecialConditions: false,
  discapacidad: false,
  conadisNumber: '',
  isDeportista: false,
  isVictimaViolencia: false,
  isServicioMilitar: false,
  isPrimerosPuestos: false,
};


const MODALITIES = [
  "EXAMEN ORDINARIO",
  "PRIMEROS PUESTOS",
  "GRADUADOS Y TITULADOS",
  "TRASLADO EXTERNO",
  "VÍCTIMAS DEL TERRORISMO",
  "PERSONAS CON DISCAPACIDAD",
  "DEPORTISTAS CALIFICADOS"
];

// --- Components ---

const InputField = ({ label, icon: Icon, error, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
      {Icon && <Icon size={14} />}
      {label}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-2.5 bg-white border ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-stone-200 focus:ring-cyan-500/20 focus:border-cyan-500'} rounded-lg outline-none transition-all text-stone-800 placeholder:text-stone-400`}
    />
    {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{error}</p>}
  </div>
);

const SelectField = ({ label, icon: Icon, options, error, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
      {Icon && <Icon size={14} />}
      {label}
    </label>
    <select
      {...props}
      className={`w-full px-4 py-2.5 bg-white border ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-stone-200 focus:ring-cyan-500/20 focus:border-cyan-500'} rounded-lg outline-none transition-all text-stone-800 appearance-none cursor-pointer`}
    >
      <option value="">Seleccione una opción</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{error}</p>}
  </div>
);

const renderTitle = (title: string) => {
  if (!title.toLowerCase().includes('aquí')) {
    return title;
  }
  const parts = title.split(/(aquí)/gi);
  return parts.map((part, i) => {
    if (part.toLowerCase() === 'aquí') {
      return (
        <motion.span
          key={i}
          className="text-uniq-cyan"
          animate={{ color: ['#0891b2', '#eab308', '#84cc16', '#0891b2'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {part}
        </motion.span>
      );
    }
    return part;
  });
};

const LandingPage = ({ onPreRegister, onLogin, onViewCareer, appSettings, cronograma, carrerasDetalladas }: { onPreRegister: () => void, onLogin: () => void, onViewCareer: (career: Career) => void, appSettings: any, cronograma: any[], carrerasDetalladas: any[] }) => {
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
          <img 
            src={appSettings?.configuracionInicio?.imagen_url || "https://picsum.photos/seed/uniq-hero/1920/1080"} 
            alt="Fondo Principal" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
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
          <h3 className="text-3xl font-bold text-stone-900 mb-12 text-center">Nuestras Carreras</h3>
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
      <footer className="py-20 px-6 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <UniqLogo className="h-10 w-10" />
              <h1 className="font-bold text-stone-800 text-xl max-w-[250px] leading-tight">Universidad Nacional Intercultural de Quillabamba</h1>
            </div>
            <p className="text-stone-500 max-w-sm leading-relaxed">
              Universidad Nacional Intercultural de Quillabamba. Formando profesionales para el mundo desde el corazón de la Amazonía cusqueña.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 hover:bg-uniq-cyan/10 hover:text-uniq-cyan transition-all cursor-pointer">
                <Shield size={20} />
              </div>
              <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 hover:bg-uniq-cyan/10 hover:text-uniq-cyan transition-all cursor-pointer">
                <Info size={20} />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-stone-800 mb-6">Proceso</h4>
            <ul className="space-y-4 text-sm text-stone-500">
              <li className="hover:text-uniq-cyan cursor-pointer">Guía del Postulante</li>
              <li className="hover:text-uniq-cyan cursor-pointer">Cronograma</li>
              <li className="hover:text-uniq-cyan cursor-pointer">Reglamento</li>
              <li className="hover:text-uniq-cyan cursor-pointer">Resultados</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-stone-800 mb-6">Contacto</h4>
            <ul className="space-y-4 text-sm text-stone-500">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-uniq-cyan" />
                admision@uniq.edu.pe
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-uniq-cyan" />
                (084) 282728
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-uniq-cyan" />
                Quillabamba, Cusco
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400">
          <p>© {CURRENT_YEAR} Universidad Nacional Intercultural de Quillabamba. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-stone-600">Privacidad</a>
            <a href="#" className="hover:text-stone-600">Términos</a>
            <a href="#" className="hover:text-stone-600">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper component to render dynamic icons
const DynamicIcon = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
};

export default function App() {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [view, setView] = useState<View>('landing');
  const [step, setStep] = useState<Step>('personal');
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appSettings, setAppSettings] = useState<any>({});
  const [cronograma, setCronograma] = useState<any[]>([]);
  const [reglamento, setReglamento] = useState<any[]>([]);
  const [temario, setTemario] = useState<any[]>([]);
  const [resultados, setResultados] = useState<any[]>([]);
  const [carrerasDetalladas, setCarrerasDetalladas] = useState<any[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [lastRegistrationId, setLastRegistrationId] = useState<number | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [dbCheckResult, setDbCheckResult] = useState<{success: boolean, message: string} | null>(null);

  const checkDbStatus = async () => {
    setIsCheckingDb(true);
    setDbCheckResult(null);
    try {
      const response = await fetch('/api/db-status');
      const data = await response.json();
      if (response.ok && data.status === 'connected') {
        setDbCheckResult({ success: true, message: `Conectado exitosamente a la base de datos` });
        setDbError(null);
        setTimeout(() => setDbCheckResult(null), 3000);
      } else {
        setDbCheckResult({ 
          success: false, 
          message: `${data.code || 'ERROR'}: ${data.details || data.message || 'Error de conexión'}` 
        });
      }
    } catch (error) {
      setDbCheckResult({ success: false, message: 'Error al comunicarse con el servidor de la aplicación.' });
    } finally {
      setIsCheckingDb(false);
    }
  };

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setAppSettings(data);
        }
      }
      
      // Fetch dynamic content from DB
      const endpoints = [
        { url: '/api/cronograma', setter: (data: any) => setCronograma(data.sort((a: any, b: any) => (a.indice_orden || 0) - (b.indice_orden || 0))), name: 'cronograma' },
        { url: '/api/reglamento', setter: setReglamento, name: 'reglamento' },
        { url: '/api/temario', setter: setTemario, name: 'temario' },
        { url: '/api/resultados', setter: setResultados, name: 'resultados' },
        { url: '/api/carreras-detalladas', setter: setCarrerasDetalladas, name: 'carreras-detalladas' },
        { url: '/api/carreras', setter: (data: any) => setAppSettings((prev: any) => ({ ...prev, careers: data })), name: 'carreras' },
        { url: '/api/configuracion-inicio', setter: (data: any) => setAppSettings((prev: any) => ({ ...prev, textoLogo: data.texto_logo, configuracionInicio: data })), name: 'configuracion-inicio' }
      ];

      let hasConnectionError = false;
      let serverIp = "34.34.229.10";

      try {
        const ipRes = await fetch('/api/my-ip');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          serverIp = ipData.ip;
        }
      } catch (e) {
        console.error("Error fetching server IP:", e);
      }

      await Promise.all(endpoints.map(async ({ url, setter, name }) => {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await res.json();
              setter(data);
            } else {
              hasConnectionError = true;
            }
          } else if (res.status === 503 || res.status === 500) {
            hasConnectionError = true;
          }
        } catch (err) {
          console.error(`Error fetching ${name}:`, err);
          hasConnectionError = true;
        }
      }));

      if (hasConnectionError) {
        setDbError(`No se pudo conectar con la base de datos. Asegúrese de autorizar la IP ${serverIp} en cPanel (Remote MySQL).`);
      } else {
        setDbError(null);
      }
      
    } catch (error) {
      console.error('Error fetching settings or dynamic content:', error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    // Increment portal visits
    fetch('/api/portal/increment-visits', { method: 'POST' }).catch(console.error);
  }, [fetchSettings]);

  const fetchRegistrations = useCallback(async () => {
    try {
      const response = await fetch('/api/registrations');
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'visualizador' || user.role === 'registrador')) {
      fetchRegistrations();
    }
  }, [user, fetchRegistrations]);

  const updateRegistrationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/registrations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, changedBy: user?.full_name || user?.username }),
      });
      if (response.ok) {
        setRegistrations(prev => prev.map(reg => reg.id === id ? { ...reg, estado: status, changed_by: user?.full_name || user?.username } : reg));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePreRegister = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, changedBy: user?.full_name || user?.username }),
      });
      
      if (response.ok) {
        const result = await response.json();
        const newRegistration = {
          ...data,
          id: result.id,
          estado: 'Pendiente',
          changed_by: user?.full_name || user?.username,
          created_at: new Date().toISOString()
        };
        
        setRegistrations(prev => [newRegistration, ...prev]);
        return true;
      } else {
        alert('Error al enviar la inscripción.');
        return false;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error de conexión con el servidor.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = (username: string, role: Role, full_name?: string, email?: string) => {
    setUser({ username, role, full_name, email });
    if (role === 'admin' || role === 'visualizador') setView('admin-dashboard');
    else if (role === 'registrador') setView('preinscripcion');
    else setView('guia');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setStep('personal');
    setFormData(INITIAL_DATA);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'documentType') {
      setFormData(prev => ({ ...prev, documentType: value as 'DNI' | 'Carnet de Extranjería', dni: '' }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.dni;
        return newErrors;
      });
      return;
    }

    // Validar DNI o CE
    if (name === 'dni') {
      if (formData.documentType === 'DNI') {
        const onlyNums = value.replace(/[^0-9]/g, '');
        if (onlyNums.length <= 8) {
          setFormData(prev => ({ ...prev, [name]: onlyNums }));
          if (onlyNums.length === 8) {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.dni;
              return newErrors;
            });
          }
        }
      } else {
        // Carnet de Extranjería: 12 caracteres alfanuméricos
        const alphanumeric = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (alphanumeric.length <= 12) {
          setFormData(prev => ({ ...prev, [name]: alphanumeric }));
          if (alphanumeric.length === 12) {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.dni;
              return newErrors;
            });
          }
        }
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    if (step === 'personal') {
      const requiredFields: (keyof FormData)[] = [
        'dni', 'names', 'paternalSurname', 'maternalSurname', 
        'birthDate', 'gender', 'email', 'phone', 'indigenousPeople'
      ];
      
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'Este campo es obligatorio';
        }
      });

      const requiredLength = formData.documentType === 'DNI' ? 8 : 12;
      if (formData.dni && formData.dni.length !== requiredLength) {
        newErrors.dni = `El ${formData.documentType === 'DNI' ? 'DNI' : 'Carnet de Extranjería'} debe tener exactamente ${requiredLength} ${formData.documentType === 'DNI' ? 'dígitos' : 'caracteres'}`;
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});
      setStep('academic');
    }
    else if (step === 'academic') {
      const requiredFields: (keyof FormData)[] = [
        'schoolName', 'schoolType', 'graduationYear', 
        'department', 'province', 'district'
      ];
      
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'Este campo es obligatorio';
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});
      setStep('career');
    }
  };

  const handleBack = () => {
    if (step === 'academic') setStep('personal');
    else if (step === 'career') setStep('academic');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    const requiredFields: (keyof FormData)[] = ['career', 'modality'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'Este campo es obligatorio';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const result = await response.json();
        const newRegistration = {
          ...formData,
          id: result.id,
          estado: 'Pendiente',
          created_at: new Date().toISOString()
        };
        
        setRegistrations(prev => [newRegistration, ...prev]);
        setLastRegistrationId(result.id);
        setStep('success');
      } else {
        alert('Error al enviar la preinscripción. Por favor intente de nuevo.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = {
    personal: 33,
    academic: 66,
    career: 100,
    success: 100
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-stone-900 font-sans selection:bg-uniq-cyan/20 selection:text-uniq-cyan">
      {dbError && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-center sticky top-0 z-[60]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 flex items-center justify-center gap-2">
            <Info size={12} />
            {dbError}
          </p>
        </div>
      )}
      {/* Header */}
      {view !== 'login' && view !== 'landing' && (
        <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView(user?.role === 'admin' ? 'admin-dashboard' : 'guia')}>
              <UniqLogo className="h-10 w-10" />
              <div className="hidden sm:block">
                <h1 className="font-bold text-sm leading-tight tracking-tight text-stone-800 max-w-[250px]">Universidad Nacional Intercultural de Quillabamba</h1>
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-stone-400">{appSettings?.textoLogo || "Admisión 2026"}</p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-6">
              <nav className="flex gap-4 text-xs font-bold uppercase tracking-wider text-stone-500">
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => setView('admin-dashboard')}
                    className={`transition-colors py-2 px-3 rounded-lg ${view === 'admin-dashboard' ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                  >
                    Dashboard
                  </button>
                )}
                {(user?.role === 'admin' || user?.role === 'registrador') && (
                  <button 
                    onClick={() => setView('preinscripcion')}
                    className={`transition-colors py-2 px-3 rounded-lg ${view === 'preinscripcion' ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                  >
                    Inscripción
                  </button>
                )}
                {(user?.role === 'admin' || user?.role === 'registrador' || user?.role === 'visualizador') && (
                  <button 
                    onClick={() => setView('control-preinscripcion')}
                    className={`transition-colors py-2 px-3 rounded-lg ${view === 'control-preinscripcion' ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                  >
                    Control
                  </button>
                )}
                {user?.role === 'visualizador' && (
                  <button 
                    onClick={() => setView('admin-dashboard')}
                    className={`transition-colors py-2 px-3 rounded-lg ${view === 'admin-dashboard' ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                  >
                    Estadísticas
                  </button>
                )}
                <button 
                  onClick={() => setView('cronograma')}
                  className={`transition-colors py-2 px-3 rounded-lg ${view === 'cronograma' ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                >
                  Cronograma
                </button>
                <button 
                  onClick={() => setView('reglamento')}
                  className={`transition-colors py-2 px-3 rounded-lg ${view === 'reglamento' ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                >
                  Reglamento
                </button>
                <button 
                  onClick={() => setView('temario')}
                  className={`transition-colors py-2 px-3 rounded-lg ${view === 'temario' ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                >
                  Temario
                </button>
                <button 
                  onClick={() => setView('resultados')}
                  className={`transition-colors py-2 px-3 rounded-lg ${view === 'resultados' ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                >
                  Resultados
                </button>
              </nav>
              
              <div className="h-8 w-px bg-stone-200 mx-2" />
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-stone-400 uppercase leading-none">{user?.role}</p>
                  <p className="text-xs font-bold text-stone-800">{user?.full_name || user?.username}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  title="Cerrar Sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`${(view === 'login' || view === 'landing') ? '' : 'max-w-5xl mx-auto px-6 py-12'}`}>
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <LandingPage 
              onPreRegister={() => setView('preinscripcion')} 
              onLogin={() => setView('login')} 
              onViewCareer={(career) => {
                setSelectedCareer(career);
                setView('carrera-detail');
              }}
              appSettings={appSettings}
              cronograma={cronograma}
              carrerasDetalladas={carrerasDetalladas}
            />
          ) : view === 'carrera-detail' && selectedCareer ? (
            <CarreraDetailView career={selectedCareer} onBack={() => setView('landing')} />
          ) : view === 'login' ? (
            <LoginView 
              key="login"
              onLogin={handleLogin} 
              onBack={() => setView('landing')} 
              onCheckDb={checkDbStatus}
              isCheckingDb={isCheckingDb}
              dbCheckResult={dbCheckResult}
            />
          ) : view === 'preinscripcion' ? (
            <div className="max-w-6xl mx-auto">
              {user?.role === 'visualizador' ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-xl">
                  <Info className="mx-auto text-amber-500 mb-4" size={48} />
                  <h2 className="text-2xl font-bold text-stone-800">Acceso Restringido</h2>
                  <p className="text-stone-500 mt-2">Su cuenta solo tiene permisos de visualización.</p>
                  <button onClick={() => setView('guia')} className="mt-6 px-6 py-2 bg-stone-900 text-white rounded-full font-bold">Volver a la Guía</button>
                </div>
              ) : (
                <PreinscripcionForm 
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handlePreRegister}
                  onCancel={() => {
                    setView('landing');
                    setFormData(INITIAL_DATA);
                  }}
                  isSubmitting={isSubmitting}
                  careers={appSettings.careers || []}
                  appSettings={appSettings}
                />
              )}
            </div>
          ) : view === 'user-management' ? (
            <UserManagementView onBack={() => setView('admin-dashboard')} />
          ) : view === 'control-preinscripcion' ? (
            <ControlPreinscripcionView 
              registrations={registrations} 
              onUpdateStatus={updateRegistrationStatus}
              userRole={user?.role}
              onBack={() => setView(user?.role === 'admin' ? 'admin-dashboard' : 'guia')}
              onNewInscripcion={() => setView('inscripcion-form')}
              appSettings={appSettings}
            />
          ) : view === 'inscripcion-form' ? (
            <InscripcionAdminFormView 
              onSave={async (data) => {
                await handlePreRegister(data);
                setView('control-preinscripcion');
              }}
              onBack={() => setView('control-preinscripcion')}
              currentUser={user}
              appSettings={appSettings}
            />
          ) : view === 'cronograma' ? (
            <CronogramaView 
              key="cronograma-view" 
              cronograma={cronograma} 
              appSettings={appSettings}
              onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} 
            />
          ) : view === 'reglamento' ? (
            <ReglamentoView reglamento={reglamento} onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'temario' ? (
            <TemarioView key="temario-view" temario={temario} onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'resultados' ? (
            <ResultadosView resultados={resultados} isAdmin={user?.role === 'admin'} appSettings={appSettings} onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'registrados-management' ? (
            <RegistradosManagementView onBack={() => setView('admin-dashboard')} />
          ) : view === 'admin-dashboard' ? (
            <AdminDashboardView 
              registrations={registrations} 
              userRole={user?.role} 
              appSettings={appSettings}
              onBack={() => setView('guia')} 
              onConfigCronograma={() => setView('config-cronograma')} 
              onConfigCarreras={() => setView('config-carreras')} 
              onConfigModalidades={() => setView('config-modalidades')}
              onConfigDatabase={() => setView('config-database')}
              onConfigUsers={() => setView('user-management')}
              onConfigRegistrados={() => setView('registrados-management')}
              onCheckDb={checkDbStatus}
              isCheckingDb={isCheckingDb}
              dbCheckResult={dbCheckResult}
              onConfigDni={() => setView('config-dni')}
              onConfigInicio={() => setView('config-inicio')}
            />
          ) : view === 'config-dni' ? (
            <ConfigDniApiView 
              settings={appSettings}
              onSave={setAppSettings}
              onBack={() => setView('admin-dashboard')}
            />
          ) : view === 'config-inicio' ? (
            <ConfiguracionInicioView 
              onBack={() => setView('admin-dashboard')} 
              onUpdate={fetchSettings}
            />
          ) : view === 'config-cronograma' ? (
            <ConfiguracionCronogramaView 
              onBack={() => setView('admin-dashboard')} 
              onUpdate={fetchSettings}
            />
          ) : view === 'config-carreras' ? (
            <ConfiguracionCarrerasView 
              onBack={() => setView('admin-dashboard')} 
              onUpdate={fetchSettings}
            />
          ) : view === 'config-modalidades' ? (
            <ConfiguracionModalidadesView 
              onBack={() => setView('admin-dashboard')} 
              onUpdate={fetchSettings}
            />
          ) : view === 'config-database' ? (
            <ConfiguracionDatabaseView 
              onBack={() => setView('admin-dashboard')} 
            />
          ) : (
            <motion.div
              key="guia-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              {/* Hero Guía */}
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-stone-800 mb-4">Guía del Postulante {appSettings?.textoLogo?.replace('Admisión ', '') || "2026"}</h2>
                <p className="text-stone-500 max-w-2xl mx-auto">Todo lo que necesitas saber para formar parte de la Universidad Nacional Intercultural de Quillabamba.</p>
              </div>

              {/* Secciones de la Guía */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100">
                  <div className="w-12 h-12 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl flex items-center justify-center mb-6">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4">Requisitos Generales</h3>
                  <ul className="space-y-3 text-stone-600 text-sm">
                    <li className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-uniq-cyan mt-0.5 shrink-0" />
                      Certificado de estudios secundarios (original).
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-uniq-cyan mt-0.5 shrink-0" />
                      Copia del Documento Nacional de Identidad (DNI).
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-uniq-cyan mt-0.5 shrink-0" />
                      Recibo de pago por derecho de examen de admisión.
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-uniq-cyan mt-0.5 shrink-0" />
                      Fotografía tamaño carnet a color con fondo blanco.
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100">
                  <div className="w-12 h-12 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl flex items-center justify-center mb-6">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4">Cronograma de Admisión</h3>
                  <div className="space-y-4">
                    {cronograma.slice(0, 3).map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-stone-400 uppercase">{item.event}</p>
                          <p className="text-sm font-semibold text-stone-700">{item.date}</p>
                        </div>
                        {item.status === 'activo' && (
                          <span className="px-2 py-1 bg-uniq-cyan/10 text-uniq-cyan text-[10px] font-bold rounded">ACTIVO</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pasos */}
              <div className="bg-stone-900 text-white p-10 rounded-[3rem] shadow-2xl">
                <h3 className="text-2xl font-bold mb-10 text-center">Pasos para tu Inscripción</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                    { step: "01", title: "Inscripción", desc: "Completa el formulario web con tus datos." },
                    { step: "02", title: "Pago", desc: "Realiza el pago en el Banco de la Nación." },
                    { step: "03", title: "Validación", desc: "Sube tu voucher y documentos al sistema." },
                    { step: "04", title: "Carnet", desc: "Descarga tu carnet de postulante." }
                  ].map((p, i) => (
                    <div key={i} className="relative">
                      <div className="text-4xl font-black text-white/10 absolute -top-4 -left-2 tracking-tighter">{p.step}</div>
                      <h4 className="font-bold mb-2 relative z-10">{p.title}</h4>
                      <p className="text-xs text-stone-400 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carreras */}
              <div>
                <h3 className="text-2xl font-bold text-stone-800 mb-8 text-center">Nuestras Carreras Profesionales</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(appSettings.careers || []).map((c: any, i: number) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-md border border-stone-100 hover:border-cyan-500 transition-all group cursor-pointer">
                      <div className="w-10 h-10 bg-stone-50 text-stone-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-uniq-cyan/10 group-hover:text-uniq-cyan transition-all">
                        <BookOpen size={20} />
                      </div>
                      <h4 className="font-bold text-sm text-stone-800 leading-tight">{c.codigo} - {c.name}</h4>
                    </div>
                  ))}
                </div>
              </div>

              {/* Temario y Reglamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                    <ListChecks size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4">Temario del Examen</h3>
                  <div className="space-y-4 text-sm text-stone-600">
                    <p>El examen de admisión evalúa las siguientes áreas:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="font-bold text-stone-800">Aptitud Académica</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Razonamiento Verbal</li>
                          <li>Razonamiento Matemático</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="font-bold text-stone-800">Conocimientos</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Matemática</li>
                          <li>Comunicación</li>
                          <li>Ciencia y Tecnología</li>
                          <li>Ciencias Sociales</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <Info size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4">Reglamento de Admisión</h3>
                  <div className="space-y-3 text-sm text-stone-600">
                    <p>Puntos clave del reglamento:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                        <span>La puntualidad es obligatoria el día del examen.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                        <span>Solo se permite el ingreso con DNI y carnet de postulante.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                        <span>Queda prohibido el ingreso de dispositivos electrónicos.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Descargas */}
              <div className="bg-cyan-50 p-8 rounded-3xl border border-cyan-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-uniq-cyan text-white rounded-2xl flex items-center justify-center">
                    <Download size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-cyan-900">Prospecto de Admisión Completo</h4>
                    <p className="text-sm text-cyan-700/70">Descarga el PDF con toda la información detallada.</p>
                  </div>
                </div>
                <button className="px-8 py-3 bg-uniq-cyan text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-uniq-cyan/20">
                  Descargar PDF
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-stone-200 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-bold text-stone-800 mb-4">Universidad Nacional Intercultural de Quillabamba</h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              Universidad Nacional Intercultural de Quillabamba. Comprometidos con la excelencia académica y la interculturalidad.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-stone-800 mb-4">Enlaces Rápidos</h3>
            <ul className="text-sm text-stone-500 space-y-2">
              <li><a href="#" className="hover:text-uniq-cyan">Cronograma de Admisión</a></li>
              <li><a href="#" className="hover:text-uniq-cyan">Reglamento de Admisión</a></li>
              <li><a href="#" className="hover:text-uniq-cyan">Temario del Examen</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-stone-800 mb-4">Soporte</h3>
            <p className="text-sm text-stone-500 mb-2">¿Tienes dudas? Contáctanos:</p>
            <p className="text-sm font-bold text-cyan-700">admision@uniq.edu.pe</p>
            <p className="text-sm text-stone-500">(084) 282728</p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-stone-100 flex flex-col md:row justify-between items-center gap-4">
          <p className="text-xs text-stone-400">© {CURRENT_YEAR} Universidad Nacional Intercultural de Quillabamba. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-xs text-stone-400 font-medium">
            <a href="#" className="hover:text-stone-600">Privacidad</a>
            <a href="#" className="hover:text-stone-600">Términos</a>
            <a href="#" className="hover:text-stone-600">Ayuda</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- New Sub-Views ---

const LoginView: React.FC<{ onLogin: (u: string, r: Role, fn?: string, e?: string) => void, onBack: () => void, onCheckDb: () => void, isCheckingDb: boolean, dbCheckResult: any }> = ({ onLogin, onBack, onCheckDb, isCheckingDb, dbCheckResult }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const user = await response.json();
          onLogin(user.username, user.role, user.full_name, user.email);
        } else {
          setError(`Respuesta inesperada: Status ${response.status}, Content-Type: ${contentType || 'desconocido'}.`);
        }
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setError(data.details || data.error || 'Credenciales incorrectas');
        } else if (response.status === 403) {
          setError('el administrador deshabilito tu usuario comunicate con el.');
        } else {
          setError('Error de conexión con el servidor de base de datos.');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('No se pudo conectar con el servidor. Verifique su conexión a internet o intente más tarde.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-uniq-cyan/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-uniq-lime/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-stone-100 relative z-10"
      >
        <div className="text-center mb-10">
          <UniqLogo className="w-20 h-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-800">Sistema de Admisión</h2>
          <p className="text-stone-400 text-sm mt-1">Universidad Nacional Intercultural de Quillabamba</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest text-center"
            >
              {error}
            </motion.div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Usuario</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-uniq-cyan/20 focus:border-uniq-cyan outline-none transition-all"
                placeholder="Nombre de usuario"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-uniq-cyan/20 focus:border-uniq-cyan outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-4 bg-uniq-cyan text-white font-bold rounded-2xl hover:bg-cyan-700 transition-all shadow-xl shadow-uniq-cyan/20 mt-4 disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Iniciar Sesión
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <button 
            type="button"
            onClick={onBack}
            className="w-full py-3 text-stone-500 font-bold hover:text-stone-800 transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={18} />
            Volver al Inicio
          </button>

          <div className="pt-6 border-t border-stone-100 mt-6">
            <button 
              type="button"
              onClick={onCheckDb}
              disabled={isCheckingDb}
              className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {isCheckingDb ? (
                <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
              {isCheckingDb ? "Verificando..." : "Probar Conexión DB"}
            </button>
            
            {dbCheckResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-2xl border text-[10px] font-bold uppercase tracking-wider ${dbCheckResult.success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}
              >
                <div className="flex items-start gap-2">
                  {dbCheckResult.success ? <CheckCircle size={14} className="shrink-0" /> : <AlertCircle size={14} className="shrink-0" />}
                  <span>{dbCheckResult.message}</span>
                </div>
              </motion.div>
            )}
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-400">¿Problemas para acceder? Contacte a soporte técnico.</p>
        </div>
      </motion.div>
    </div>
  );
};

const PreinscripcionForm: React.FC<{ 
  formData: FormData, 
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  onSubmit: (data: FormData) => Promise<boolean>,
  onCancel: () => void,
  isSubmitting: boolean,
  careers: any[],
  appSettings?: any
}> = ({ formData, setFormData, onSubmit, onCancel, isSubmitting, careers, appSettings }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalidades, setModalidades] = useState<any[]>([]);
  const [isLoadingModalidades, setIsLoadingModalidades] = useState(true);
  const [isSearchingDni, setIsSearchingDni] = useState(false);
  const [lastSearchedDni, setLastSearchedDni] = useState('');
  const [places, setPlaces] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  const handlePlacesSearch = async (input: string) => {
    if (input.length < 3) {
      setPlaces([]);
      return;
    }
    setIsSearchingPlaces(true);
    try {
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}`);
      const data = await response.json();
      if (data.predictions) {
        setPlaces(data.predictions);
      }
    } catch (error) {
      console.error("Error searching places:", error);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  useEffect(() => {
    const lookupDni = async () => {
      // If DNI is cleared or not 8 digits, reset lastSearchedDni and clear personal data
      if (formData.dni.length !== 8) {
        if (lastSearchedDni !== '') {
          setLastSearchedDni('');
          setFormData(prev => ({
            ...prev,
            names: '',
            paternalSurname: '',
            maternalSurname: ''
          }));
        }
        return;
      }

      // Only lookup if DNI is exactly 8 digits and different from last searched
      if (formData.dni.length === 8 && formData.dni !== lastSearchedDni) {
        setIsSearchingDni(true);
        setLastSearchedDni(formData.dni);
        try {
          const response = await fetch(`/api/dni/${formData.dni}`);
          const data = await response.json();
          
          if (response.ok && data && (data.nombres || data.nombre)) {
            const nombres = data.nombres || data.nombre;
            const apPaterno = data.apellidoPaterno || data.paterno || '';
            const apMaterno = data.apellidoMaterno || data.materno || '';
            
            setFormData(prev => ({
              ...prev,
              names: nombres,
              paternalSurname: apPaterno,
              maternalSurname: apMaterno
            }));
            
            // Clear DNI error if any
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.dni;
              return newErrors;
            });
          } else {
            const errorMsg = data.message || data.error || 'DNI no encontrado';
            setErrors(prev => ({ ...prev, dni: errorMsg }));
            // Clear personal data if DNI not found
            setFormData(prev => ({
              ...prev,
              names: '',
              paternalSurname: '',
              maternalSurname: ''
            }));
          }
        } catch (error) {
          console.error("Error looking up DNI:", error);
          setErrors(prev => ({ ...prev, dni: 'Error de conexión' }));
        } finally {
          setIsSearchingDni(false);
        }
      }
    };
    lookupDni();
  }, [formData.dni, setFormData, lastSearchedDni]);

  useEffect(() => {
    setIsLoadingModalidades(true);
    fetch('/api/modalidades')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter out deleted or disabled modalities for the registration form
          setModalidades(data.filter((m: any) => !m.deshabilitado && !m.eliminado));
        } else {
          console.error("Modalidades data is not an array:", data);
          setModalidades([]);
        }
      })
      .catch(err => {
        console.error("Error fetching modalidades:", err);
        setModalidades([]);
      })
      .finally(() => {
        setIsLoadingModalidades(false);
      });
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Step 1 fields (Inscripción)
    if (!formData.modality) newErrors.modality = "Seleccione una modalidad";
    if (!formData.career) newErrors.career = "Seleccione una carrera";
    if (!formData.dni || formData.dni.length !== 8) newErrors.dni = "DNI inválido (8 dígitos)";
    
    // Step 2 fields (Personales)
    if (!formData.names) newErrors.names = "Requerido";
    if (!formData.paternalSurname) newErrors.paternalSurname = "Requerido";
    if (!formData.maternalSurname) newErrors.maternalSurname = "Requerido";
    if (!formData.birthDate) newErrors.birthDate = "Requerido";
    if (!formData.gender) newErrors.gender = "Requerido";
    if (!formData.email) newErrors.email = "Requerido";
    if (!formData.phone) newErrors.phone = "Requerido";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateForm()) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    const success = await onSubmit(formData);
    if (success) setCurrentStep(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'dni') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 8) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: onlyNums,
          // Liberar datos personales si el DNI cambia
          names: '',
          paternalSurname: '',
          maternalSurname: ''
        }));
      }
      return;
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(8, 145, 178); // uniq-cyan
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('UNIVERSIDAD NACIONAL INTERCULTURAL DE QUILLABAMBA', 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`FICHA DE PRE-INSCRIPCIÓN - ${appSettings?.textoLogo?.toUpperCase() || "ADMISIÓN 2026"}`, 105, 25, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    const data = [
      ['DNI', formData.dni],
      ['Nombres', formData.names],
      ['Apellidos', `${formData.paternalSurname} ${formData.maternalSurname}`],
      ['Carrera', formData.career],
      ['Modalidad', formData.modality],
      ['Fecha de Nacimiento', formData.birthDate],
      ['Sexo', formData.gender],
      ['Email', formData.email],
      ['Teléfono', formData.phone],
      ['Colegio', formData.schoolName],
      ['Lugar de Procedencia', `${formData.procedenciaRegion} - ${formData.procedenciaProvincia} - ${formData.procedenciaDistrito}`],
      ['Dirección', formData.procedenciaDireccion],
      ['Apoderado', formData.nombreApoderado],
      ['Celular Apoderado', formData.celularApoderado],
    ];

    if (formData.hasSpecialConditions) {
      const conditions = [];
      if (formData.discapacidad) conditions.push(`Discapacidad (CONADIS: ${formData.conadisNumber || 'N/A'})`);
      if (formData.isDeportista) conditions.push('Deportista Calificado');
      if (formData.isVictimaViolencia) conditions.push('Víctima de Violencia');
      if (formData.isServicioMilitar) conditions.push('Servicio Militar');
      if (formData.isPrimerosPuestos) conditions.push('Primeros Puestos');
      
      data.push(['Condiciones Especiales', conditions.length > 0 ? conditions.join(', ') : 'Sí (Sin especificar)']);
    } else {
      data.push(['Condiciones Especiales', 'Ninguna']);
    }

    autoTable(doc, {
      startY: 50,
      head: [['Campo', 'Información']],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [8, 145, 178] }, // uniq-cyan
    });

    doc.setFontSize(10);
    doc.text('Este documento es una constancia de pre-inscripción. Deberá presentar su voucher de pago para completar el proceso.', 10, doc.internal.pageSize.height - 20);
    doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, 10, doc.internal.pageSize.height - 10);

    doc.save(`Ficha_Preinscripcion_${formData.dni}.pdf`);
  };

  if (isLoadingModalidades) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-32 text-center">
        <div className="w-12 h-12 border-4 border-uniq-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-stone-500 font-medium">Cargando modalidades de examen...</p>
      </div>
    );
  }

  if (modalidades.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-stone-200 p-12 rounded-[2.5rem] shadow-xl max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info size={48} className="text-amber-500" />
          </div>
          <h2 className="text-3xl font-bold text-stone-800 mb-4">Inscripciones Cerradas</h2>
          <p className="text-stone-600 mb-8 text-lg">
            Actualmente no hay ninguna modalidad de examen activa. Por favor, manténgase atento a nuestros canales oficiales para conocer las próximas fechas de inscripción.
          </p>
          <button
            onClick={onCancel}
            className="px-8 py-4 bg-stone-100 text-stone-700 rounded-2xl font-bold hover:bg-stone-200 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Title */}
      <div className="bg-white border border-stone-200 p-4 rounded-xl mb-8 text-center">
        <h2 className="text-2xl font-bold text-uniq-cyan uppercase tracking-wide">Formulario de Pre-Inscripción</h2>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center mb-12 relative max-w-2xl mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-200 -z-10 -translate-y-1/2"></div>
        {[
          { n: 1, label: 'DATOS DEL POSTULANTE' },
          { n: 2, label: 'REPORTE DE FICHA' }
        ].map((s) => (
          <div key={s.n} className="flex items-center gap-3 bg-[#f8f7f4] px-6">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${currentStep >= s.n ? 'bg-uniq-cyan border-uniq-cyan text-white' : 'bg-stone-400 border-stone-400 text-white'}`}>
              {s.n}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStep >= s.n ? 'text-stone-800' : 'text-stone-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-10 rounded-3xl shadow-xl border border-stone-100 space-y-12"
          >
            {/* Section 1: Datos de Inscripción */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-8 h-8 bg-uniq-cyan/10 text-uniq-cyan rounded-lg flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <h3 className="text-lg font-bold text-stone-800">Datos de Inscripción</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SelectField
                  label="Seleccionar Modalidad de Examen"
                  name="modality"
                  value={formData.modality}
                  onChange={handleChange}
                  options={modalidades.map(m => m.nombre)}
                  error={errors.modality}
                />
                <SelectField
                  label="Seleccionar Carrera"
                  name="career"
                  value={formData.career}
                  onChange={handleChange}
                  options={careers.map(c => c.name)}
                  error={errors.career}
                />
                <InputField
                  label="Código de Carrera"
                  name="careerCode"
                  value={careers.find(c => c.name === formData.career)?.codigo || ''}
                  onChange={() => {}}
                  disabled
                />
                <div className="relative">
                  <InputField
                    label="DNI"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    placeholder="12345678"
                    maxLength={8}
                    error={errors.dni}
                  />
                  {isSearchingDni && (
                    <div className="absolute right-3 top-9">
                      <RefreshCw size={16} className="animate-spin text-uniq-cyan" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Datos Personales */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                  <User size={18} />
                </div>
                <h3 className="text-lg font-bold text-stone-800">Datos Personales</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Nombres" name="names" value={formData.names} onChange={handleChange} error={errors.names} />
                <InputField label="Apellido Paterno" name="paternalSurname" value={formData.paternalSurname} onChange={handleChange} error={errors.paternalSurname} />
                <InputField label="Apellido Materno" name="maternalSurname" value={formData.maternalSurname} onChange={handleChange} error={errors.maternalSurname} />
                <InputField label="Fecha de Nacimiento" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} error={errors.birthDate} />
                <SelectField label="Sexo" name="gender" value={formData.gender} onChange={handleChange} options={['MASCULINO', 'FEMENINO']} error={errors.gender} />
                <div className="relative">
                  <InputField
                    label="Lugar de inscripción"
                    name="lugarInscripcion"
                    value={formData.lugarInscripcion}
                    onChange={(e) => {
                      handleChange(e);
                      handlePlacesSearch(e.target.value);
                    }}
                    placeholder="Escriba el lugar..."
                  />
                  {places.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-stone-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                      {places.map((place: any) => (
                        <div
                          key={place.place_id}
                          className="px-4 py-2 hover:bg-uniq-cyan/10 cursor-pointer"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, lugarInscripcion: place.description }));
                            setPlaces([]);
                          }}
                        >
                          {place.description}
                        </div>
                      ))}
                    </div>
                  )}
                  {isSearchingPlaces && (
                    <div className="absolute right-3 top-9">
                      <RefreshCw size={16} className="animate-spin text-uniq-cyan" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Ubicación y Educación */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">Lugar de Procedencia</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField label="Región" name="procedenciaRegion" value={formData.procedenciaRegion} onChange={handleChange} options={['CUSCO', 'LIMA', 'AREQUIPA']} />
                  <InputField label="Provincia" name="procedenciaProvincia" value={formData.procedenciaProvincia} onChange={handleChange} />
                  <InputField label="Distrito" name="procedenciaDistrito" value={formData.procedenciaDistrito} onChange={handleChange} />
                  <InputField label="Dirección" name="procedenciaDireccion" value={formData.procedenciaDireccion} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                  <div className="w-8 h-8 bg-lime-50 text-lime-600 rounded-lg flex items-center justify-center">
                    <School size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">Colegio de Procedencia</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField label="Región" name="colegioRegion" value={formData.colegioRegion} onChange={handleChange} options={['CUSCO', 'LIMA', 'AREQUIPA']} />
                  <InputField label="Provincia" name="colegioProvincia" value={formData.colegioProvincia} onChange={handleChange} />
                  <InputField label="Distrito" name="colegioDistrito" value={formData.colegioDistrito} onChange={handleChange} />
                  <InputField label="Nombre I.E." name="schoolName" value={formData.schoolName} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Section 4: Lugar de Nacimiento */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
                  <Globe size={18} />
                </div>
                <h3 className="text-lg font-bold text-stone-800">Lugar de Nacimiento</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SelectField label="Región" name="nacimientoRegion" value={formData.nacimientoRegion} onChange={handleChange} options={['CUSCO', 'LIMA', 'AREQUIPA']} />
                <InputField label="Provincia" name="nacimientoProvincia" value={formData.nacimientoProvincia} onChange={handleChange} />
                <InputField label="Distrito" name="nacimientoDistrito" value={formData.nacimientoDistrito} onChange={handleChange} />
              </div>
            </div>

            {/* Section 5: Otros Datos */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Info size={18} />
                </div>
                <h3 className="text-lg font-bold text-stone-800">Información Adicional</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Email" name="email" value={formData.email} onChange={handleChange} error={errors.email} />
                <InputField label="Teléfono" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} />
                <SelectField label="Año Egreso" name="graduationYear" value={formData.graduationYear} onChange={handleChange} options={GRADUATION_YEARS} />
                <InputField label="Nombre Apoderado" name="nombreApoderado" value={formData.nombreApoderado} onChange={handleChange} />
                <InputField label="Celular Apoderado" name="celularApoderado" value={formData.celularApoderado} onChange={handleChange} />
                <SelectField label="Idioma" name="idioma" value={formData.idioma} onChange={handleChange} options={['QUECHUA', 'MATSIGUENKA', 'CASTELLANO']} />
                <SelectField label="Pueblo Indígena" name="indigenousPeople" value={formData.indigenousPeople} onChange={handleChange} options={['AMAZÓNICO', 'ANDINO', 'OTROS']} />
                <InputField label="Tipo de Comunidad" name="tipoComunidad" value={formData.tipoComunidad} onChange={handleChange} />
              </div>
              
              <div className="flex flex-wrap gap-8 bg-stone-50 p-6 rounded-2xl border border-stone-100">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Habilidades Idioma</p>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                      <input type="checkbox" name="idiomaLee" checked={formData.idiomaLee} onChange={handleChange} className="w-5 h-5 rounded border-stone-300 text-uniq-cyan focus:ring-uniq-cyan" />
                      Lee
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                      <input type="checkbox" name="idiomaHabla" checked={formData.idiomaHabla} onChange={handleChange} className="w-5 h-5 rounded border-stone-300 text-uniq-cyan focus:ring-uniq-cyan" />
                      Habla
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                      <input type="checkbox" name="idiomaEscribe" checked={formData.idiomaEscribe} onChange={handleChange} className="w-5 h-5 rounded border-stone-300 text-uniq-cyan focus:ring-uniq-cyan" />
                      Escribe
                    </label>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Condiciones Especiales</p>
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="hasSpecialConditions" 
                      checked={formData.hasSpecialConditions} 
                      onChange={handleChange} 
                      className="w-5 h-5 rounded border-stone-300 text-uniq-cyan focus:ring-uniq-cyan" 
                    />
                    Tiene Condiciones Especiales
                  </label>

                  {formData.hasSpecialConditions && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-white rounded-xl border border-stone-100 space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                            <input type="checkbox" name="discapacidad" checked={formData.discapacidad} onChange={handleChange} className="w-4 h-4 rounded border-stone-300 text-uniq-cyan" />
                            Discapacidad Diagnosticada
                          </label>
                          {formData.discapacidad && (
                            <InputField 
                              label="Nro. Carnet CONADIS" 
                              name="conadisNumber" 
                              value={formData.conadisNumber} 
                              onChange={handleChange} 
                              placeholder="Ingrese nro. carnet"
                            />
                          )}
                        </div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                          <input type="checkbox" name="isDeportista" checked={formData.isDeportista} onChange={handleChange} className="w-4 h-4 rounded border-stone-300 text-uniq-cyan" />
                          Deportista Calificado
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                          <input type="checkbox" name="isVictimaViolencia" checked={formData.isVictimaViolencia} onChange={handleChange} className="w-4 h-4 rounded border-stone-300 text-uniq-cyan" />
                          Víctima de Violencia
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                          <input type="checkbox" name="isServicioMilitar" checked={formData.isServicioMilitar} onChange={handleChange} className="w-4 h-4 rounded border-stone-300 text-uniq-cyan" />
                          Servicio Militar
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                          <input type="checkbox" name="isPrimerosPuestos" checked={formData.isPrimerosPuestos} onChange={handleChange} className="w-4 h-4 rounded border-stone-300 text-uniq-cyan" />
                          Primeros Puestos
                        </label>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-8 border-t border-stone-100">
              <button 
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-12 py-4 bg-uniq-cyan text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-uniq-cyan/20 uppercase text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : null}
                {isSubmitting ? 'Guardando...' : 'Finalizar Pre-Inscripción'}
              </button>
              <button 
                onClick={onCancel}
                className="px-12 py-4 bg-white text-stone-600 font-bold rounded-xl border border-stone-200 hover:bg-stone-50 transition-all uppercase text-sm"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[3rem] shadow-2xl border border-stone-100 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-stone-800">¡Pre-Inscripción Exitosa!</h2>
              <p className="text-stone-500 max-w-md mx-auto">Su registro ha sido procesado correctamente. Por favor, descargue su ficha de pre-inscripción.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button 
                onClick={generatePDF}
                className="flex items-center justify-center gap-3 px-10 py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20"
              >
                <Download size={20} />
                Descargar Ficha PDF
              </button>
              <button 
                onClick={onCancel}
                className="flex items-center justify-center gap-3 px-10 py-4 bg-white text-stone-600 font-bold rounded-2xl border border-stone-200 hover:bg-stone-50 transition-all"
              >
                Ir al Inicio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CronogramaView: React.FC<{ onBack: () => void, cronograma: any[], appSettings?: any }> = ({ onBack, cronograma, appSettings }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl flex items-center justify-center">
          <Clock size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Cronograma de {appSettings?.textoLogo || "Admisión 2026"}</h2>
          <p className="text-stone-500">Fechas oficiales del proceso de selección.</p>
        </div>
      </div>

      <div className="space-y-4">
        {cronograma.map((item: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-5 bg-stone-50 rounded-2xl border border-stone-100 hover:border-cyan-200 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${item.status === 'activo' ? 'bg-cyan-500 animate-pulse' : item.status === 'completado' ? 'bg-stone-300' : 'bg-cyan-400'}`} />
              <div>
                <p className="font-bold text-stone-800">{item.event}</p>
                <p className="text-xs text-stone-500">{item.date}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.status === 'activo' ? 'bg-uniq-cyan/10 text-uniq-cyan' : item.status === 'completado' ? 'bg-stone-200 text-stone-500' : 'bg-uniq-cyan/5 text-uniq-cyan'}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-stone-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
        >
          <ChevronLeft size={18} />
          Volver
        </button>
      </div>
    </div>
  </motion.div>
);

const ReglamentoView = ({ onBack, reglamento }: { onBack: () => void, reglamento: any[] }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
          <Info size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Reglamento de Admisión</h2>
          <p className="text-stone-500">Normas y disposiciones legales del proceso.</p>
        </div>
      </div>

      <div className="prose prose-stone max-w-none space-y-6 text-stone-600">
        {reglamento.length > 0 ? (
          reglamento.map((item: any, i: number) => (
            <section key={i} className="space-y-3">
              <h3 className="text-lg font-bold text-stone-800">{item.chapter}: {item.title}</h3>
              <p className="text-sm leading-relaxed">{item.content}</p>
            </section>
          ))
        ) : (
          <>
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-stone-800">Capítulo I: De la Inscripción</h3>
              <p className="text-sm leading-relaxed">Art. 15: El postulante es responsable de la veracidad de los datos consignados en su ficha de preinscripción. Cualquier falsedad detectada anulará automáticamente su participación sin derecho a reclamo.</p>
              <p className="text-sm leading-relaxed">Art. 16: El pago por derecho de examen no es reembolsable ni transferible a otros procesos o personas.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-stone-800">Capítulo II: Del Examen</h3>
              <p className="text-sm leading-relaxed">Art. 22: El ingreso al campus universitario se realizará estrictamente entre las 07:00 y 08:30 horas. No habrá tolerancia bajo ninguna circunstancia.</p>
              <p className="text-sm leading-relaxed">Art. 25: Está prohibido el ingreso con celulares, relojes inteligentes, calculadoras, gorras, aretes o cualquier objeto metálico.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-stone-800">Capítulo III: De la Calificación</h3>
              <p className="text-sm leading-relaxed">Art. 40: El sistema de calificación es por procesamiento óptico. No hay lugar a revisión de tarjetas de respuestas.</p>
            </section>
          </>
        )}
      </div>

      <div className="mt-10 p-6 bg-stone-900 text-white rounded-3xl flex items-center justify-between">
        <div>
          <p className="font-bold">¿Necesitas el documento completo?</p>
          <p className="text-xs text-stone-400">Descarga el PDF oficial con todos los artículos.</p>
        </div>
        <button className="px-6 py-2 bg-uniq-cyan rounded-xl font-bold text-sm hover:opacity-90 transition-all">Descargar PDF</button>
      </div>

      <div className="mt-10 pt-8 border-t border-stone-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
        >
          <ChevronLeft size={18} />
          Volver
        </button>
      </div>
    </div>
  </motion.div>
);

const TemarioView = ({ onBack, temario, key }: { onBack: () => void, temario: any[], key?: string }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
          <ListChecks size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Temario del Examen</h2>
          <p className="text-stone-500">Contenidos temáticos por áreas de conocimiento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {temario.length > 0 ? (
          temario.map((area, i) => (
            <div key={i} className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                {area.area || area.title}
              </h3>
              <ul className="space-y-2">
                {(area.topics || '').split('\n').map((t: string, j: number) => (
                  <li key={j} className="text-sm text-stone-500 flex items-center gap-2">
                    <ChevronRight size={12} className="text-stone-300" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          [
            { title: "Razonamiento Verbal", topics: ["Sinónimos y Antónimos", "Analogías", "Comprensión de Lectura", "Conectores Lógicos"] },
            { title: "Razonamiento Matemático", topics: ["Sucesiones y Series", "Planteo de Ecuaciones", "Áreas y Perímetros", "Probabilidades"] },
            { title: "Matemática", topics: ["Álgebra", "Aritmética", "Geometría", "Trigonometría"] },
            { title: "Comunicación", topics: ["Lenguaje y Literatura", "Ortografía", "Gramática", "Redacción"] },
            { title: "Ciencia y Tecnología", topics: ["Física", "Química", "Biología", "Ecología"] },
            { title: "Ciencias Sociales", topics: ["Historia del Perú", "Geografía", "Economía", "Cívica"] },
          ].map((area, i) => (
            <div key={i} className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                {area.title}
              </h3>
              <ul className="space-y-2">
                {area.topics.map((t, j) => (
                  <li key={j} className="text-sm text-stone-500 flex items-center gap-2">
                    <ChevronRight size={12} className="text-stone-300" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <div className="mt-10 pt-8 border-t border-stone-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
        >
          <ChevronLeft size={18} />
          Volver
        </button>
      </div>
    </div>
  </motion.div>
);

const ResultadosView = ({ isAdmin, resultados, appSettings, onBack }: { isAdmin: boolean, resultados: any[], appSettings?: any, onBack: () => void }) => {
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<string | null>(null);

  const filteredResults = (resultados.length > 0 ? resultados : [
    { pos: 1, name: "GARCIA LOPEZ, MARCO", score: "18.450", status: "Ingresó" },
    { pos: 2, name: "QUISPE MAMANI, ELENA", score: "17.920", status: "Ingresó" },
    { pos: 3, name: "HUAMAN ROJAS, JORGE", score: "17.100", status: "Ingresó" },
    { pos: 4, name: "TORRES VELA, LUCIA", score: "16.850", status: "No Ingresó" },
  ]).filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    (r.dni && r.dni.includes(search))
  );

  const handleUpload = () => {
    setUploading(true);
    // Simulate file selection and upload
    setTimeout(() => {
      setUploading(false);
      setPdfFile(`Resultados_${appSettings?.textoLogo?.replace(' ', '_') || "Admision_2026"}_Final.pdf`);
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl flex items-center justify-center">
              <FileSearch size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Resultados de Admisión</h2>
              <p className="text-stone-500">Consulta de puntajes y vacantes adjudicadas.</p>
            </div>
          </div>

          <div className="flex gap-3">
            {pdfFile && (
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl font-bold text-sm hover:bg-uniq-cyan/20 transition-all"
                onClick={() => window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank')}
              >
                <FileText size={18} />
                Ver PDF Oficial
              </button>
            )}
            {isAdmin && (
              <button 
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-stone-800 transition-all disabled:opacity-50"
              >
                <UploadCloud size={18} />
                {uploading ? 'Subiendo...' : 'Subir PDF de Resultados'}
              </button>
            )}
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por DNI o Apellidos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start gap-4 mb-8">
          <AlertCircle className="text-amber-600 shrink-0" size={24} />
          <div>
            <p className="font-bold text-amber-900">Resultados Preliminares</p>
            <p className="text-sm text-amber-800">Los resultados oficiales finales se publicarán después de la validación de documentos originales.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Puesto</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Postulante</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Puntaje</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Estado</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredResults.map((res, i) => (
                  <tr key={i} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-stone-400">#{res.pos}</td>
                    <td className="p-4 font-bold text-stone-800">{res.name}</td>
                    <td className="p-4 font-mono text-uniq-cyan font-bold">{res.score}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${res.status === 'Ingresó' ? 'bg-uniq-cyan/10 text-uniq-cyan' : 'bg-red-50 text-red-600'}`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-100">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
          >
            <ChevronLeft size={18} />
            Volver
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ControlPreinscripcionView = ({ registrations, onUpdateStatus, userRole, onBack, onNewInscripcion, appSettings }: { registrations: any[], onUpdateStatus: (id: string, status: string) => void, userRole?: string, onBack: () => void, onNewInscripcion: () => void, appSettings?: any }) => {
  const [search, setSearch] = useState('');
  
  const filteredApplicants = registrations.filter(app => {
    const searchLower = search.toLowerCase();
    const fullName = `${app.nombres} ${app.apellido_paterno} ${app.apellido_materno}`.toLowerCase();
    const regCode = `UNIQ-${appSettings?.textoLogo?.replace('Admisión ', '') || "2026"}-${app.id}`.toLowerCase();
    
    return (
      (app.dni && app.dni.includes(search)) || 
      fullName.includes(searchLower) ||
      regCode.includes(searchLower) ||
      (app.id && app.id.toString().includes(search))
    );
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl flex items-center justify-center">
              <ListChecks size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Control de Inscripciones</h2>
              <p className="text-stone-500">Gestión y validación de postulantes inscritos.</p>
            </div>
          </div>
          {userRole !== 'visualizador' && (
            <button 
              onClick={onNewInscripcion}
              className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
            >
              <User size={18} />
              Nueva Inscripción
            </button>
          )}
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por DNI, Nombre o Código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-uniq-cyan/20 focus:border-uniq-cyan outline-none transition-all"
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Código</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Postulante</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">DNI</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Carrera</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Pueblo</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Estado</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Modificado por</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredApplicants.map((app, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-mono text-[10px] font-bold text-stone-500">UNIQ-{appSettings?.textoLogo?.replace('Admisión ', '') || "2026"}-{app.id}</td>
                  <td className="p-4 font-bold text-stone-800 text-sm">{app.nombres} {app.apellido_paterno} {app.apellido_materno}</td>
                  <td className="p-4 text-sm text-stone-600">{app.dni}</td>
                  <td className="p-4 text-sm text-stone-600">{app.carrera}</td>
                  <td className="p-4 text-sm text-stone-600">{app.pueblo_indigena}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      app.estado === 'Validado' ? 'bg-uniq-cyan/10 text-uniq-cyan' : 
                      app.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.estado}
                    </span>
                  </td>
                  <td className="p-4 text-[10px] text-stone-500 font-medium italic">{app.changed_by || 'Postulante'}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {app.estado === 'Pendiente' && userRole !== 'visualizador' && (
                        <>
                          <button 
                            onClick={() => onUpdateStatus(app.id, 'Validado')}
                            className="text-uniq-cyan hover:text-cyan-700 font-bold text-[10px] uppercase tracking-wider"
                          >
                            Validar
                          </button>
                          <button 
                            onClick={() => onUpdateStatus(app.id, 'Observado')}
                            className="text-red-600 hover:text-red-700 font-bold text-[10px] uppercase tracking-wider"
                          >
                            Observar
                          </button>
                        </>
                      )}
                      <button className="text-stone-400 hover:text-stone-600 font-bold text-[10px] uppercase tracking-wider">Detalle</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApplicants.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-stone-400 text-sm">No se encontraron postulantes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-100">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
          >
            <ChevronLeft size={18} />
            Volver
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ConfigDniApiView = ({ settings, onSave, onBack }: { settings: any, onSave: (newSettings: any) => void, onBack: () => void }) => {
  const [dniApiUrl, setDniApiUrl] = useState(settings.dniApiUrl || "https://dniruc.apisperu.com/api/v1/dni/");
  const [dniApiToken, setDniApiToken] = useState(settings.dniApiToken || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dniApiUrl, dniApiToken })
      });
      if (response.ok) {
        onSave({ ...settings, dniApiUrl, dniApiToken });
        onBack();
      }
    } catch (error) {
      console.error("Error saving DNI API settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl flex items-center justify-center">
          <Globe size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Configuración API DNI</h2>
          <p className="text-stone-500 text-sm">Configure el servicio externo para validación de DNI</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">URL del Servicio (Base)</label>
          <input 
            type="text" 
            value={dniApiUrl}
            onChange={(e) => setDniApiUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
            placeholder="https://dniruc.apisperu.com/api/v1/dni/"
          />
          <p className="mt-1 text-xs text-stone-400">La URL base donde se consultará el DNI. Se le concatenará el número de DNI al final.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Token de API (Bearer Token)</label>
          <input 
            type="password" 
            value={dniApiToken}
            onChange={(e) => setDniApiToken(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
            placeholder="Ingrese su token de API"
          />
          <p className="mt-1 text-xs text-stone-400">Token proporcionado por el proveedor del servicio (apisperu.com u otro).</p>
        </div>

        <div className="pt-6 flex gap-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-uniq-cyan text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
            Guardar Configuración
          </button>
          <button 
            onClick={onBack}
            className="px-8 py-3 border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboardView = ({ registrations, userRole, onBack, onConfigCronograma, onConfigCarreras, onConfigUsers, onConfigRegistrados, onConfigModalidades, onConfigDatabase, onCheckDb, isCheckingDb, dbCheckResult, onConfigDni, onConfigInicio, appSettings }: { registrations: any[], userRole?: string, onBack: () => void, onConfigCronograma: () => void, onConfigCarreras: () => void, onConfigUsers: () => void, onConfigRegistrados: () => void, onConfigModalidades: () => void, onConfigDatabase: () => void, onCheckDb: () => void, isCheckingDb: boolean, dbCheckResult: any, onConfigDni: () => void, onConfigInicio: () => void, appSettings?: any }) => {
  useEffect(() => {
    onCheckDb();
  }, []);
  const total = registrations.length;
  const validated = registrations.filter(r => r.estado === 'Validado').length;
  const pending = registrations.filter(r => r.estado === 'Pendiente').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {isCheckingDb && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl border bg-blue-50 border-blue-100 text-blue-800 flex items-center gap-3"
        >
          <RefreshCw size={20} className="animate-spin" />
          <p className="text-sm font-bold">Validando conexión a la base de datos...</p>
        </motion.div>
      )}

      {dbCheckResult && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl border flex items-center gap-3 ${dbCheckResult.success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}
        >
          {dbCheckResult.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-bold">{dbCheckResult.message}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Total Postulantes</p>
          <p className="text-4xl font-bold text-stone-800">{total.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-uniq-cyan text-xs font-bold">
            <ChevronRight size={14} className="-rotate-90" />
            Actualizado ahora
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Pagos Validados</p>
          <p className="text-4xl font-bold text-stone-800">{validated.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-stone-400 text-xs font-bold">
            {total > 0 ? Math.round((validated / total) * 100) : 0}% del total
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Pendientes</p>
          <p className="text-4xl font-bold text-amber-600">{pending.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-stone-400 text-xs font-bold">
            Por revisar
          </div>
        </div>
      </div>

      {userRole !== 'visualizador' && (
        <div className="space-y-8">
          {[
            {
              title: "Gestión de Postulantes",
              description: "Administración de registros, pagos y resultados del proceso.",
              actions: [
                { icon: ShieldCheck, label: "Habilitar Postulantes", color: "bg-lime-50 text-lime-600", action: onConfigRegistrados },
                { icon: FileText, label: "Reporte de Pagos", color: "bg-uniq-cyan/10 text-uniq-cyan" },
                { icon: UploadCloud, label: "Subir Resultados", color: "bg-uniq-cyan/10 text-uniq-cyan" },
              ]
            },
            {
              title: "Configuración del Portal",
              description: "Personalización de la información pública y parámetros del examen.",
              actions: [
                { icon: LayoutDashboard, label: "Configurar Inicio", color: "bg-pink-50 text-pink-600", action: onConfigInicio },
                { icon: BookOpen, label: "Configurar Carreras", color: "bg-purple-50 text-purple-600", action: onConfigCarreras },
                { icon: BookOpen, label: "Configurar Modalidades", color: "bg-lime-50 text-lime-600", action: onConfigModalidades },
                { icon: Clock, label: "Eventos del Cronograma", color: "bg-indigo-50 text-indigo-600", action: onConfigCronograma },
                { icon: Info, label: "Editar Reglamento", color: "bg-amber-50 text-amber-600" },
              ]
            },
            {
              title: "Administración y Sistema",
              description: "Gestión de usuarios, base de datos y servicios externos.",
              actions: [
                { icon: User, label: "Gestionar Usuarios", color: "bg-purple-50 text-purple-600", action: onConfigUsers },
                { icon: Database, label: "Configurar Base Datos", color: "bg-indigo-50 text-indigo-600", action: onConfigDatabase },
                { icon: Globe, label: "Configurar API DNI", color: "bg-uniq-cyan/10 text-uniq-cyan", action: onConfigDni },
                { icon: RefreshCw, label: isCheckingDb ? "Verificando..." : "Probar Conexión DB", color: "bg-emerald-50 text-emerald-600", action: onCheckDb },
              ]
            }
          ].map((category, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-stone-800">{category.title}</h3>
                <p className="text-sm text-stone-500 mt-1">{category.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.actions.map((action, i) => (
                  <button 
                    key={i} 
                    onClick={action.action} 
                    className="p-6 rounded-3xl border border-stone-100 hover:border-stone-200 hover:bg-stone-50 transition-all text-left group flex flex-col h-full"
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shrink-0`}>
                      <action.icon size={20} className={action.label === "Verificando..." ? "animate-spin" : ""} />
                    </div>
                    <p className="font-bold text-stone-800 text-sm leading-tight">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 pt-8 border-t border-stone-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
        >
          <ChevronLeft size={18} />
          Volver
        </button>
      </div>
    </motion.div>
  );
};

const InscripcionAdminFormView = ({ onSave, onBack, currentUser, appSettings }: { onSave: (data: FormData) => void, onBack: () => void, currentUser?: UserAuth, appSettings?: any }) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);

  const handleDniChange = async (dni: string) => {
    setFormData(prev => ({ ...prev, dni }));
    if (dni.length === 8) {
      setLoading(true);
      try {
        // First try to fetch existing pre-registration
        const regResponse = await fetch(`/api/registrations/dni/${dni}`);
        if (regResponse.ok) {
          const data = await regResponse.json();
          setFormData({
            documentType: 'DNI',
            dni: data.dni,
            names: data.nombres,
            paternalSurname: data.apellido_paterno,
            maternalSurname: data.apellido_materno,
            birthDate: data.fecha_nacimiento ? data.fecha_nacimiento.split('T')[0] : '',
            gender: data.genero,
            email: data.email,
            phone: data.telefono,
            department: data.departamento,
            province: data.provincia,
            district: data.distrito,
            schoolName: data.colegio_nombre,
            schoolType: data.colegio_tipo,
            graduationYear: data.anio_egreso?.toString() || '',
            career: data.carrera,
            modality: data.modalidad,
            indigenousPeople: data.pueblo_indigena,
            lugarInscripcion: data.lugar_inscripcion || 'QUILLABAMBA',
            colegioRegion: data.colegio_region || '',
            colegioProvincia: data.colegio_provincia || '',
            colegioDistrito: data.colegio_distrito || '',
            procedenciaRegion: data.procedencia_region || '',
            procedenciaProvincia: data.procedencia_provincia || '',
            procedenciaDistrito: data.procedencia_distrito || '',
            procedenciaDireccion: data.procedencia_direccion || '',
            nacimientoRegion: data.nacimiento_region || '',
            nacimientoProvincia: data.nacimiento_provincia || '',
            nacimientoDistrito: data.nacimiento_distrito || '',
            idioma: data.idioma || '',
            idiomaLee: data.idioma_lee || false,
            idiomaHabla: data.idioma_habla || false,
            idiomaEscribe: data.idioma_escribe || false,
            tipoComunidad: data.tipo_comunidad || '',
            nombreApoderado: data.nombre_apoderado || '',
            celularApoderado: data.celular_apoderado || '',
            hasSpecialConditions: !!data.has_special_conditions,
            discapacidad: !!data.discapacidad,
            conadisNumber: data.conadis_number || '',
            isDeportista: !!data.is_deportista,
            isVictimaViolencia: !!data.is_victima_violencia,
            isServicioMilitar: !!data.is_servicio_militar,
            isPrimerosPuestos: !!data.is_primeros_puestos,
          });
        } else {
          // If not found in pre-registrations, try the DNI API
          const dniResponse = await fetch(`/api/dni/${dni}`);
          if (dniResponse.ok) {
            const data = await dniResponse.json();
            if (data.nombres) {
              setFormData(prev => ({
                ...prev,
                names: data.nombres,
                paternalSurname: data.apellidoPaterno,
                maternalSurname: data.apellidoMaterno,
              }));
            }
          }
        }
      } catch (e) {
        console.error("Error fetching data for DNI:", e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Nueva Inscripción</h2>
              <p className="text-stone-500">Registro manual de postulantes por {currentUser?.full_name || currentUser?.username}.</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Operador</p>
            <p className="text-sm font-bold text-stone-800">{currentUser?.full_name || currentUser?.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">DNI del Postulante</label>
              <div className="relative">
                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="text" 
                  maxLength={8}
                  value={formData.dni}
                  onChange={(e) => handleDniChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                  placeholder="Ingrese DNI para cargar datos"
                />
                {loading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-stone-200 border-t-cyan-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Nombres</label>
                <input 
                  type="text" 
                  value={formData.names}
                  onChange={(e) => setFormData({...formData, names: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Apellido Paterno</label>
                <input 
                  type="text" 
                  value={formData.paternalSurname}
                  onChange={(e) => setFormData({...formData, paternalSurname: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Carrera</label>
              <select 
                value={formData.career}
                onChange={(e) => setFormData({...formData, career: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none"
              >
                <option value="">Seleccione Carrera</option>
                {DEFAULT_CAREERS.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-6 bg-stone-50 p-6 rounded-[2rem] border border-stone-100">
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest mb-4">Información Adicional</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Teléfono</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Modalidad</label>
              <select 
                value={formData.modality}
                onChange={(e) => setFormData({...formData, modality: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none"
              >
                <option value="Ordinario">Ordinario</option>
                <option value="Extraordinario">Extraordinario</option>
                <option value="CEPRE">CEPRE</option>
              </select>
            </div>
            <div className="pt-4">
              <button 
                onClick={() => onSave(formData)}
                className="w-full py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20"
              >
                Registrar Inscripción
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-100">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
          >
            <ChevronLeft size={18} />
            Volver
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const UserManagementView = ({ onBack }: { onBack: () => void }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'visualizador' as Role,
    full_name: '',
    email: '',
    activos: true
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user: any | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '', // Don't show password
        role: user.role,
        full_name: user.full_name || '',
        email: user.email || '',
        activos: user.activos !== undefined ? !!user.activos : true
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        role: 'visualizador',
        full_name: '',
        email: '',
        activos: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || "Error al guardar usuario");
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este usuario?")) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Gestión de Usuarios</h2>
              <p className="text-stone-500">Administración de accesos y roles del sistema.</p>
            </div>
          </div>

          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
          >
            <Plus size={18} />
            Nuevo Usuario
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Usuario</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Nombre Completo</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Email</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Rol</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Estado</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-stone-400 text-sm">Cargando usuarios...</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-bold text-stone-800">{u.username}</td>
                  <td className="p-4 text-sm text-stone-600">{u.full_name || '-'}</td>
                  <td className="p-4 text-sm text-stone-600">{u.email || '-'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      u.role === 'registrador' ? 'bg-cyan-100 text-cyan-700' : 
                      'bg-stone-100 text-stone-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      u.activos ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.activos ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(u)}
                        className="p-2 text-stone-400 hover:text-uniq-cyan hover:bg-uniq-cyan/10 rounded-xl transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      {u.username !== 'admin' && (
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-100">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
          >
            <ChevronLeft size={18} />
            Volver al Dashboard
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-800">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Usuario</label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="Username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Contraseña</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder={editingUser ? "Dejar en blanco para no cambiar" : "Password"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  placeholder="Nombre completo"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Rol</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                >
                  <option value="admin">Administrador</option>
                  <option value="registrador">Registrador</option>
                  <option value="visualizador">Visualizador</option>
                </select>
              </div>

              {formData.username !== 'admin' && (
                <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, activos: !formData.activos})}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.activos ? 'bg-green-500' : 'bg-stone-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.activos ? 'left-7' : 'left-1'}`} />
                  </button>
                  <span className="text-sm font-bold text-stone-700">
                    {formData.activos ? 'Usuario Habilitado' : 'Usuario Deshabilitado'}
                  </span>
                </div>
              )}

              <div className="pt-4">
                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

const RegistradosManagementView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [registrados, setRegistrados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    dni: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    telefono: ''
  });

  const fetchRegistrados = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/registrados');
      if (response.ok) {
        const data = await response.json();
        setRegistrados(data);
      }
    } catch (error) {
      console.error("Error fetching registrados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrados();
  }, []);

  const handleSave = async () => {
    if (!formData.dni || !formData.nombres || !formData.apellido_paterno || !formData.apellido_materno) {
      alert("Por favor complete los campos obligatorios");
      return;
    }

    try {
      const response = await fetch('/api/registrados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({ dni: '', nombres: '', apellido_paterno: '', apellido_materno: '', email: '', telefono: '' });
        fetchRegistrados();
      } else {
        const data = await response.json();
        alert(data.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving registrado:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar a este postulante habilitado?")) return;

    try {
      const response = await fetch(`/api/registrados/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchRegistrados();
      }
    } catch (error) {
      console.error("Error deleting registrado:", error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Postulantes Habilitados</h2>
              <p className="text-stone-500">Lista maestra de DNI autorizados para la pre-inscripción.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onBack}
              className="px-6 py-3 border border-stone-200 text-stone-600 rounded-2xl font-bold text-sm hover:bg-stone-50 transition-all"
            >
              Volver
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
            >
              <Plus size={18} />
              Habilitar DNI
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">DNI</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Nombres y Apellidos</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Contacto</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-stone-400 text-sm">Cargando lista...</td>
                </tr>
              ) : registrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-stone-400 text-sm">No hay postulantes habilitados.</td>
                </tr>
              ) : registrados.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="p-4">
                    <span className="font-mono font-bold text-stone-700">{r.dni}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-stone-800">{r.nombres}</p>
                    <p className="text-xs text-stone-500">{r.apellido_paterno} {r.apellido_materno}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-stone-600">{r.email || '-'}</p>
                    <p className="text-xs text-stone-400">{r.telefono || '-'}</p>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(r.id)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-8 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-800">Habilitar Nuevo Postulante</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
                <X size={20} className="text-stone-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">DNI</label>
                  <input 
                    type="text" 
                    maxLength={8}
                    value={formData.dni}
                    onChange={(e) => setFormData({...formData, dni: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="8 dígitos"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Nombres</label>
                  <input 
                    type="text" 
                    value={formData.nombres}
                    onChange={(e) => setFormData({...formData, nombres: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="NOMBRES"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Apellido Paterno</label>
                  <input 
                    type="text" 
                    value={formData.apellido_paterno}
                    onChange={(e) => setFormData({...formData, apellido_paterno: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="APELLIDO PATERNO"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Apellido Materno</label>
                  <input 
                    type="text" 
                    value={formData.apellido_materno}
                    onChange={(e) => setFormData({...formData, apellido_materno: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="APELLIDO MATERNO"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Email (Opcional)</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Teléfono (Opcional)</label>
                  <input 
                    type="text" 
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="999888777"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20"
                >
                  Habilitar Postulante
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
