/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Image,
  Plus,
  Edit,
  Trash2,
  X
} from 'lucide-react';

// --- Types ---

type Step = 'personal' | 'academic' | 'career' | 'success';
type View = 'landing' | 'login' | 'preinscripcion' | 'guia' | 'cronograma' | 'reglamento' | 'temario' | 'resultados' | 'admin-dashboard' | 'control-preinscripcion' | 'config-imagenes' | 'config-cronograma' | 'config-carreras' | 'carrera-detail' | 'inscripcion-form' | 'user-management';
type Role = 'admin' | 'registrador' | 'visualizador';

interface UserAuth {
  username: string;
  role: Role;
  full_name?: string;
  email?: string;
}

interface FormData {
  tipo_documento: 'DNI' | 'Carnet de Extranjería';
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  genero: string;
  correo: string;
  telefono: string;
  departamento: string;
  provincia: string;
  distrito: string;
  nombre_colegio: string;
  tipo_colegio: string;
  anio_graduacion: string;
  carrera: string;
  modalidad: string;
  pueblo_indigena: string;
}

import { ConfiguracionImagenesView } from './ConfiguracionImagenesView';
import { ConfiguracionCronogramaView, DEFAULT_CRONOGRAMA } from './ConfiguracionCronogramaView';
import { ConfiguracionCarrerasView } from './ConfiguracionCarrerasView';
import { CarreraDetailView } from './CarreraDetailView';
import { Career, DEFAULT_CAREERS } from './data/defaultCareers';

import { UniqLogo } from './UniqLogo';

const INITIAL_DATA: FormData = {
  tipo_documento: 'DNI',
  dni: '',
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  fecha_nacimiento: '',
  genero: '',
  correo: '',
  telefono: '',
  departamento: '',
  provincia: '',
  distrito: '',
  nombre_colegio: '',
  tipo_colegio: 'Estatal',
  anio_graduacion: '',
  carrera: '',
  modalidad: 'Ordinario',
  pueblo_indigena: 'No',
};

const CAREERS = [
  "Ingeniería agronómica tropical",
  "Ingeniería de alimentos",
  "Ingeniería civil",
  "Ecoturismo",
  "Economía",
  "Contabilidad"
];

const MODALITIES = [
  "Ordinario",
  "Primeros Puestos",
  "Graduados y Titulados",
  "Traslado Externo",
  "Víctimas del Terrorismo",
  "Personas con Discapacidad",
  "Deportistas Calificados"
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

const LandingPage = ({ onPreRegister, onLogin, onViewCareer, appSettings }: { onPreRegister: () => void, onLogin: () => void, onViewCareer: (career: Career) => void, appSettings: any }) => {
  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UniqLogo className="h-12 w-12" />
            <div className="hidden sm:block">
              <h1 className="font-bold text-stone-800 leading-tight text-sm max-w-[250px]">Universidad Nacional Intercultural de Quillabamba</h1>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Admisión 2026</p>
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
              className="px-6 py-2.5 bg-cyan-600 text-white font-bold text-sm rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20"
            >
              Preinscripción
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-cyan-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Proceso de Admisión Abierto
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-stone-900 leading-[1.1] tracking-tight">
              Tu futuro comienza <span className="text-cyan-600">aquí.</span>
            </h2>
            <p className="text-lg text-stone-500 leading-relaxed max-w-lg">
              Únete a la Universidad Nacional Intercultural de Quillabamba y sé parte de una comunidad académica que valora la excelencia y la diversidad cultural.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onPreRegister}
                className="px-10 py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-all shadow-2xl shadow-stone-900/20 flex items-center justify-center gap-2 group"
              >
                Iniciar Inscripción
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-4 bg-white text-stone-800 font-bold rounded-2xl border border-stone-200 hover:border-stone-300 transition-all flex items-center justify-center gap-2">
                Descargar Guía
                <Download size={18} />
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src={appSettings?.heroImage || "https://picsum.photos/seed/uniq-campus-quillabamba/800/1000"} 
                alt="UNIQ Campus Principal" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-stone-100 max-w-[240px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                  <GraduationCap size={18} />
                </div>
                <p className="font-bold text-stone-800 text-sm">Excelencia</p>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Programas acreditados y docentes de primer nivel para tu formación.
              </p>
            </div>
          </motion.div>
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
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <p className="text-4xl md:text-5xl font-bold text-stone-900">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carreras Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-stone-900">Nuestras Carreras</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              Formamos profesionales líderes con visión intercultural y compromiso social.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(appSettings?.careers || DEFAULT_CAREERS).map((career: Career) => {
              return (
              <motion.div 
                key={career.id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-stone-100 group"
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={career.imageUrl} 
                    alt={career.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-bold text-xl text-stone-800 mb-3 leading-tight">{career.name}</h3>
                  <p className="text-sm text-stone-500 mb-6 leading-relaxed">{career.shortDesc}</p>
                  <button onClick={() => onViewCareer(career)} className="text-cyan-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                    Ver más <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* Cronograma Preview */}
      <section className="py-24 px-6 bg-stone-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">Cronograma de <br />Admisión 2026</h2>
              <p className="text-stone-400 text-lg">
                No pierdas la oportunidad de postular. Revisa las fechas clave del proceso actual.
              </p>
              <div className="space-y-4">
                {(appSettings?.cronograma || DEFAULT_CRONOGRAMA).slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-cyan-400 font-mono font-bold">{item.date}</div>
                    <div className="font-bold">{item.event}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
              <h3 className="text-xl font-bold mb-6">Requisitos de Inscripción</h3>
              <ul className="space-y-4">
                {[
                  "Certificado de estudios secundarios (original).",
                  "Copia de DNI vigente.",
                  "Comprobante de pago por derecho de examen.",
                  "Fotografía tamaño carnet a color.",
                  "Ficha de preinscripción debidamente llenada."
                ].map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-stone-400 text-sm">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
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
              <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 hover:bg-cyan-50 hover:text-cyan-600 transition-all cursor-pointer">
                <Shield size={20} />
              </div>
              <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 hover:bg-cyan-50 hover:text-cyan-600 transition-all cursor-pointer">
                <Info size={20} />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-stone-800 mb-6">Proceso</h4>
            <ul className="space-y-4 text-sm text-stone-500">
              <li className="hover:text-cyan-600 cursor-pointer">Guía del Postulante</li>
              <li className="hover:text-cyan-600 cursor-pointer">Cronograma</li>
              <li className="hover:text-cyan-600 cursor-pointer">Reglamento</li>
              <li className="hover:text-cyan-600 cursor-pointer">Resultados</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-stone-800 mb-6">Contacto</h4>
            <ul className="space-y-4 text-sm text-stone-500">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-cyan-600" />
                admision@uniq.edu.pe
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-cyan-600" />
                (084) 282728
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-cyan-600" />
                Quillabamba, Cusco
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400">
          <p>© 2026 Universidad Nacional Intercultural de Quillabamba. Todos los derechos reservados.</p>
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
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

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
        { url: '/api/cronograma', setter: setCronograma, name: 'cronograma' },
        { url: '/api/reglamento', setter: setReglamento, name: 'reglamento' },
        { url: '/api/temario', setter: setTemario, name: 'temario' },
        { url: '/api/resultados', setter: setResultados, name: 'resultados' }
      ];

      let hasConnectionError = false;
      let serverIp = "34.34.229.105";

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
        setDbError(`Error de Conexión: El servidor de base de datos rechaza la conexión desde esta IP (${serverIp}). Debe autorizar esta IP en cPanel (Remote MySQL).`);
      } else {
        setDbError(null);
      }
      
      // Fetch DB status for admin
      try {
        const dbRes = await fetch('/api/db-status');
        if (dbRes.ok) {
          const status = await dbRes.json();
          setDbStatus(status);
        } else {
          const err = await dbRes.json();
          setDbStatus({ status: 'error', ...err });
        }
      } catch (e) {
        setDbStatus({ status: 'error', message: 'No se pudo contactar con el backend' });
      }
      
    } catch (error) {
      console.error('Error fetching settings or dynamic content:', error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
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
    if (user && (user.rol === 'admin' || user.rol === 'visualizador' || user.rol === 'registrador')) {
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
    
    if (name === 'tipo_documento') {
      setFormData(prev => ({ ...prev, tipo_documento: value as 'DNI' | 'Carnet de Extranjería', dni: '' }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.dni;
        return newErrors;
      });
      return;
    }

    // Validar DNI o CE
    if (name === 'dni') {
      if (formData.tipo_documento === 'DNI') {
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
        'dni', 'nombres', 'apellido_paterno', 'apellido_materno', 
        'fecha_nacimiento', 'genero', 'correo', 'telefono', 'pueblo_indigena'
      ];
      
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'Este campo es obligatorio';
        }
      });

      const requiredLength = formData.tipo_documento === 'DNI' ? 8 : 12;
      if (formData.dni && formData.dni.length !== requiredLength) {
        newErrors.dni = `El ${formData.tipo_documento === 'DNI' ? 'DNI' : 'Carnet de Extranjería'} debe tener exactamente ${requiredLength} ${formData.tipo_documento === 'DNI' ? 'dígitos' : 'caracteres'}`;
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
        'nombre_colegio', 'tipo_colegio', 'anio_graduacion', 
        'departamento', 'provincia', 'distrito'
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
    const requiredFields: (keyof FormData)[] = ['carrera', 'modalidad'];
    
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
    <div className="min-h-screen bg-[#f8f7f4] text-stone-900 font-sans selection:bg-cyan-100 selection:text-cyan-900">
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
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-stone-400">Admisión 2026</p>
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
            />
          ) : view === 'carrera-detail' && selectedCareer ? (
            <CarreraDetailView career={selectedCareer} onBack={() => setView('landing')} />
          ) : view === 'login' ? (
            <LoginView key="login" onLogin={handleLogin} onBack={() => setView('landing')} />
          ) : view === 'preinscripcion' ? (
            <motion.div
              key="preinscripcion-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Role Check */}
              {user?.role === 'visualizador' ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-xl">
                  <Info className="mx-auto text-amber-500 mb-4" size={48} />
                  <h2 className="text-2xl font-bold text-stone-800">Acceso Restringido</h2>
                  <p className="text-stone-500 mt-2">Su cuenta solo tiene permisos de visualización.</p>
                  <button onClick={() => setView('guia')} className="mt-6 px-6 py-2 bg-stone-900 text-white rounded-full font-bold">Volver a la Guía</button>
                </div>
              ) : (
                <>
                  {/* Progress Bar */}
                  {step !== 'success' && (
                <div className="mb-12">
                  <div className="flex justify-between mb-4">
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${step === 'personal' ? 'text-cyan-600' : 'text-stone-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'personal' ? 'border-cyan-600 bg-cyan-50' : 'border-stone-200'}`}>1</div>
                      Datos Personales
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${step === 'academic' ? 'text-cyan-600' : 'text-stone-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'academic' ? 'border-cyan-600 bg-cyan-50' : 'border-stone-200'}`}>2</div>
                      Académico
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${step === 'career' ? 'text-cyan-600' : 'text-stone-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'career' ? 'border-cyan-600 bg-cyan-50' : 'border-stone-200'}`}>3</div>
                      Carrera
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-cyan-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress[step]}%` }}
                      transition={{ duration: 0.5, ease: "circOut" }}
                    />
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 'personal' && (
                  <motion.div
                    key="personal"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100"
                  >
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
                        <User className="text-cyan-600" />
                        Información Personal
                      </h2>
                      <p className="text-stone-500 mt-2">Ingrese sus datos tal como aparecen en su documento de identidad.</p>
                    </div>

                    {Object.keys(errors).length > 0 && (
                      <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 animate-shake">
                        <AlertCircle size={20} className="shrink-0" />
                        <p className="text-sm font-bold">Por favor, complete todos los campos obligatorios marcados en rojo.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectField 
                        label="Tipo de Documento"
                        name="tipo_documento"
                        value={formData.tipo_documento}
                        onChange={handleChange}
                        icon={IdCard}
                        options={['DNI', 'Carnet de Extranjería']}
                      />
                      <InputField 
                        label={formData.tipo_documento === 'DNI' ? "DNI" : "Carnet de Extranjería"} 
                        name="dni" 
                        value={formData.dni} 
                        onChange={handleChange} 
                        placeholder={formData.tipo_documento === 'DNI' ? "8 dígitos" : "12 caracteres"}
                        icon={IdCard}
                        error={errors.dni}
                        maxLength={formData.tipo_documento === 'DNI' ? 8 : 12}
                      />
                      <InputField 
                        label="Nombres" 
                        name="nombres" 
                        value={formData.nombres} 
                        onChange={handleChange} 
                        placeholder="Nombres completos"
                        error={errors.nombres}
                      />
                      <InputField 
                        label="Apellido Paterno" 
                        name="apellido_paterno" 
                        value={formData.apellido_paterno} 
                        onChange={handleChange} 
                        error={errors.apellido_paterno}
                      />
                      <InputField 
                        label="Apellido Materno" 
                        name="apellido_materno" 
                        value={formData.apellido_materno} 
                        onChange={handleChange} 
                        error={errors.apellido_materno}
                      />
                      <InputField 
                        label="Fecha de Nacimiento" 
                        name="fecha_nacimiento" 
                        type="date" 
                        value={formData.fecha_nacimiento} 
                        onChange={handleChange} 
                        icon={Calendar}
                        error={errors.fecha_nacimiento}
                      />
                      <SelectField 
                        label="Género" 
                        name="genero" 
                        value={formData.genero} 
                        onChange={handleChange} 
                        options={["Masculino", "Femenino", "Otro"]}
                        error={errors.genero}
                      />
                      <InputField 
                        label="Correo Electrónico" 
                        name="correo" 
                        type="email" 
                        value={formData.correo} 
                        onChange={handleChange} 
                        placeholder="ejemplo@correo.com"
                        icon={Mail}
                        error={errors.correo}
                      />
                      <InputField 
                        label="Celular" 
                        name="telefono" 
                        value={formData.telefono} 
                        onChange={handleChange} 
                        placeholder="999 999 999"
                        icon={Phone}
                        error={errors.telefono}
                      />
                      <SelectField 
                        label="¿Pertenece a un Pueblo Andino o Amazónico?" 
                        name="pueblo_indigena" 
                        value={formData.pueblo_indigena} 
                        onChange={handleChange} 
                        options={["No", "Andino", "Amazónico"]}
                        icon={Globe}
                        error={errors.pueblo_indigena}
                      />
                    </div>

                    <div className="mt-10 flex justify-between">
                      <button 
                        onClick={() => setView('landing')}
                        className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
                      >
                        <ChevronLeft size={18} />
                        Volver
                      </button>
                      <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20 group"
                      >
                        Siguiente
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'academic' && (
                  <motion.div
                    key="academic"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100"
                  >
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
                        <GraduationCap className="text-cyan-600" />
                        Información Académica
                      </h2>
                      <p className="text-stone-500 mt-2">Detalles sobre su educación secundaria.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <InputField 
                        label="Nombre de la Institución Educativa" 
                        name="nombre_colegio" 
                        value={formData.nombre_colegio} 
                        onChange={handleChange} 
                        placeholder="Nombre completo del colegio"
                        icon={School}
                        error={errors.nombre_colegio}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField 
                          label="Tipo de Colegio" 
                          name="tipo_colegio" 
                          value={formData.tipo_colegio} 
                          onChange={handleChange} 
                          options={["Estatal", "Particular"]}
                          error={errors.tipo_colegio}
                        />
                        <InputField 
                          label="Año de Egreso" 
                          name="anio_graduacion" 
                          value={formData.anio_graduacion} 
                          onChange={handleChange} 
                          placeholder="Ej. 2024"
                          error={errors.anio_graduacion}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="Departamento" name="departamento" value={formData.departamento} onChange={handleChange} icon={MapPin} error={errors.departamento} />
                        <InputField label="Provincia" name="provincia" value={formData.provincia} onChange={handleChange} error={errors.provincia} />
                        <InputField label="Distrito" name="distrito" value={formData.distrito} onChange={handleChange} error={errors.distrito} />
                      </div>
                    </div>

                    <div className="mt-10 flex justify-between">
                      <button 
                        onClick={handleBack}
                        className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
                      >
                        <ChevronLeft size={18} />
                        Atrás
                      </button>
                      <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20 group"
                      >
                        Siguiente
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'career' && (
                  <motion.div
                    key="career"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100"
                  >
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
                        <BookOpen className="text-cyan-600" />
                        Elección de Carrera
                      </h2>
                      <p className="text-stone-500 mt-2">Seleccione la carrera a la que desea postular y la modalidad.</p>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-1 gap-6">
                        <SelectField 
                          label="Carrera Profesional" 
                          name="career" 
                          value={formData.career} 
                          onChange={handleChange} 
                          options={CAREERS}
                          error={errors.career}
                        />
                        <SelectField 
                          label="Modalidad de Admisión" 
                          name="modalidad" 
                          value={formData.modalidad} 
                          onChange={handleChange} 
                          options={MODALITIES}
                          error={errors.modalidad}
                        />
                      </div>

                      <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                        <h3 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4">Resumen de Postulación</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-stone-500">Postulante:</span>
                            <span className="font-semibold">{formData.nombres} {formData.apellido_paterno}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">DNI:</span>
                            <span className="font-semibold">{formData.dni}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Carrera:</span>
                            <span className="font-semibold text-cyan-700">{formData.carrera || 'No seleccionada'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="mt-0.5 text-amber-600">
                          <CheckCircle size={16} />
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Al hacer clic en "Finalizar Inscripción", declaro que la información proporcionada es verdadera y acepto los términos y condiciones del proceso de admisión 2026.
                        </p>
                      </div>
                    </div>

                    <div className="mt-10 flex justify-between">
                      <button 
                        onClick={handleBack}
                        className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
                      >
                        <ChevronLeft size={18} />
                        Atrás
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.career}
                        className={`flex items-center gap-2 px-10 py-4 bg-stone-900 text-white font-bold rounded-xl transition-all shadow-lg shadow-stone-900/20 ${isSubmitting || !formData.career ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-800 hover:-translate-y-0.5'}`}
                      >
                        {isSubmitting ? 'Procesando...' : 'Finalizar Inscripción'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-3xl shadow-2xl shadow-cyan-900/10 border border-cyan-100 text-center"
                  >
                    <div className="w-20 h-20 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-stone-800 mb-4">¡Inscripción Exitosa!</h2>
                    <p className="text-stone-600 mb-8 max-w-md mx-auto">
                      Tu registro ha sido procesado correctamente. Hemos enviado un correo de confirmación a <span className="font-bold text-stone-800">{formData.email}</span> con los siguientes pasos.
                    </p>
                    
                    <div className="bg-stone-50 p-6 rounded-2xl mb-8 text-left inline-block w-full max-w-sm border border-stone-200">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-3">Código de Registro</p>
                      <p className="text-2xl font-mono font-bold text-cyan-700">UNIQ-2026-8842</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20">
                        Descargar Constancia
                      </button>
                      <button 
                        onClick={() => {
                          setStep('personal');
                          setFormData(INITIAL_DATA);
                        }}
                        className="px-8 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
                      >
                        Nuevo Registro
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
          ) : view === 'user-management' ? (
            <UserManagementView onBack={() => setView('admin-dashboard')} />
          ) : view === 'control-preinscripcion' ? (
            <ControlPreinscripcionView 
              registrations={registrations} 
              onUpdateStatus={updateRegistrationStatus}
              userRole={user?.role}
              onBack={() => setView(user?.role === 'admin' ? 'admin-dashboard' : 'guia')}
              onNewInscripcion={() => setView('inscripcion-form')}
            />
          ) : view === 'inscripcion-form' ? (
            <InscripcionAdminFormView 
              onSave={async (data) => {
                await handlePreRegister(data);
                setView('control-preinscripcion');
              }}
              onBack={() => setView('control-preinscripcion')}
              currentUser={user}
            />
          ) : view === 'cronograma' ? (
            <CronogramaView key="cronograma-view" cronograma={cronograma} onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'reglamento' ? (
            <ReglamentoView key="reglamento-view" reglamento={reglamento} onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'temario' ? (
            <TemarioView key="temario-view" temario={temario} onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'resultados' ? (
            <ResultadosView key="resultados-view" resultados={resultados} isAdmin={user?.role === 'admin'} onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'admin-dashboard' ? (
            <AdminDashboardView 
              registrations={registrations} 
              userRole={user?.role} 
              dbStatus={dbStatus}
              onBack={() => setView('guia')} 
              onConfigImages={() => setView('config-imagenes')} 
              onConfigCronograma={() => setView('config-cronograma')} 
              onConfigCarreras={() => setView('config-carreras')} 
              onConfigUsers={() => setView('user-management')}
            />
          ) : view === 'config-imagenes' ? (
            <ConfiguracionImagenesView 
              appSettings={appSettings} 
              onSave={(newSettings) => setAppSettings(newSettings)} 
              onBack={() => setView('admin-dashboard')} 
            />
          ) : view === 'config-cronograma' ? (
            <ConfiguracionCronogramaView 
              cronograma={cronograma} 
              onSave={() => fetchSettings()} 
              onBack={() => setView('admin-dashboard')} 
            />
          ) : view === 'config-carreras' ? (
            <ConfiguracionCarrerasView 
              appSettings={appSettings} 
              onSave={(newSettings) => setAppSettings(newSettings)} 
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
                <h2 className="text-4xl font-bold text-stone-800 mb-4">Guía del Postulante 2026</h2>
                <p className="text-stone-500 max-w-2xl mx-auto">Todo lo que necesitas saber para formar parte de la Universidad Nacional Intercultural de Quillabamba.</p>
              </div>

              {/* Secciones de la Guía */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100">
                  <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4">Requisitos Generales</h3>
                  <ul className="space-y-3 text-stone-600 text-sm">
                    <li className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-cyan-500 mt-0.5 shrink-0" />
                      Certificado de estudios secundarios (original).
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-cyan-500 mt-0.5 shrink-0" />
                      Copia del Documento Nacional de Identidad (DNI).
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-cyan-500 mt-0.5 shrink-0" />
                      Recibo de pago por derecho de examen de admisión.
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-cyan-500 mt-0.5 shrink-0" />
                      Fotografía tamaño carnet a color con fondo blanco.
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4">Cronograma de Admisión</h3>
                  <div className="space-y-4">
                    {(appSettings?.cronograma || DEFAULT_CRONOGRAMA).slice(0, 3).map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-stone-400 uppercase">{item.event}</p>
                          <p className="text-sm font-semibold text-stone-700">{item.date}</p>
                        </div>
                        {item.status === 'activo' && (
                          <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-[10px] font-bold rounded">ACTIVO</span>
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
                  {CAREERS.map((c, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-md border border-stone-100 hover:border-cyan-500 transition-all group cursor-pointer">
                      <div className="w-10 h-10 bg-stone-50 text-stone-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all">
                        <BookOpen size={20} />
                      </div>
                      <h4 className="font-bold text-sm text-stone-800 leading-tight">{c}</h4>
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
                  <div className="w-12 h-12 bg-cyan-600 text-white rounded-2xl flex items-center justify-center">
                    <Download size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-cyan-900">Prospecto de Admisión Completo</h4>
                    <p className="text-sm text-cyan-700/70">Descarga el PDF con toda la información detallada.</p>
                  </div>
                </div>
                <button className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20">
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
              <li><a href="#" className="hover:text-cyan-600">Cronograma de Admisión</a></li>
              <li><a href="#" className="hover:text-cyan-600">Reglamento de Admisión</a></li>
              <li><a href="#" className="hover:text-cyan-600">Temario del Examen</a></li>
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
          <p className="text-xs text-stone-400">© 2026 Universidad Nacional Intercultural de Quillabamba. Todos los derechos reservados.</p>
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

const LoginView = ({ onLogin, onBack }: { onLogin: (nu: string, r: Role, nc?: string, c?: string) => void, onBack: () => void, key?: string }) => {
  const [nombre_usuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
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
        body: JSON.stringify({ username: nombre_usuario, password: contrasena }),
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
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-stone-100"
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
                value={nombre_usuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
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
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Iniciar Sesión"
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
        </form>

        <div className="mt-8 pt-8 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-400">¿Problemas para acceder? Contacte a soporte técnico.</p>
        </div>
      </motion.div>
    </div>
  );
};

const CronogramaView = ({ onBack, cronograma, key }: { onBack: () => void, cronograma: any[], key?: string }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
          <Clock size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Cronograma de Admisión 2026</h2>
          <p className="text-stone-500">Fechas oficiales del proceso de selección.</p>
        </div>
      </div>

      <div className="space-y-4">
        {(cronograma.length > 0 ? cronograma : DEFAULT_CRONOGRAMA).map((item: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-5 bg-stone-50 rounded-2xl border border-stone-100 hover:border-blue-200 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${item.estado === 'activo' ? 'bg-cyan-500 animate-pulse' : item.estado === 'completado' ? 'bg-stone-300' : 'bg-blue-400'}`} />
              <div>
                <p className="font-bold text-stone-800">{item.evento}</p>
                <p className="text-xs text-stone-500">{item.fecha}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.estado === 'activo' ? 'bg-cyan-100 text-cyan-700' : item.estado === 'completado' ? 'bg-stone-200 text-stone-500' : 'bg-blue-50 text-blue-600'}`}>
              {item.estado}
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

const ReglamentoView = ({ onBack, reglamento, key }: { onBack: () => void, reglamento: any[], key?: string }) => (
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
              <h3 className="text-lg font-bold text-stone-800">{item.capitulo}: {item.titulo}</h3>
              <p className="text-sm leading-relaxed">{item.contenido}</p>
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
        <button className="px-6 py-2 bg-cyan-600 rounded-xl font-bold text-sm hover:bg-cyan-700 transition-all">Descargar PDF</button>
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
                {area.area}
              </h3>
              <ul className="space-y-2">
                {(area.topicos || '').split('\n').map((t: string, j: number) => (
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

const ResultadosView = ({ isAdmin, resultados, onBack, key }: { isAdmin: boolean, resultados: any[], onBack: () => void, key?: string }) => {
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<string | null>(null);

  const filteredResults = (resultados.length > 0 ? resultados : [
    { posicion: 1, nombre: "GARCIA LOPEZ, MARCO", puntaje: "18.450", estado: "Ingresó" },
    { posicion: 2, nombre: "QUISPE MAMANI, ELENA", puntaje: "17.920", estado: "Ingresó" },
    { posicion: 3, nombre: "HUAMAN ROJAS, JORGE", puntaje: "17.100", estado: "Ingresó" },
    { posicion: 4, nombre: "TORRES VELA, LUCIA", puntaje: "16.850", estado: "No Ingresó" },
  ]).filter(r => 
    r.nombre.toLowerCase().includes(search.toLowerCase()) || 
    (r.dni && r.dni.includes(search))
  );

  const handleUpload = () => {
    setUploading(true);
    // Simulate file selection and upload
    setTimeout(() => {
      setUploading(false);
      setPdfFile('Resultados_Admision_2026_Final.pdf');
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center">
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
                className="flex items-center gap-2 px-6 py-3 bg-cyan-50 text-cyan-700 rounded-2xl font-bold text-sm hover:bg-cyan-100 transition-all"
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
                    <td className="p-4 font-mono font-bold text-stone-400">#{res.posicion}</td>
                    <td className="p-4 font-bold text-stone-800">{res.nombre}</td>
                    <td className="p-4 font-mono text-cyan-700 font-bold">{res.puntaje}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${res.estado === 'Ingresó' ? 'bg-cyan-100 text-cyan-700' : 'bg-red-50 text-red-600'}`}>
                        {res.estado}
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

const ControlPreinscripcionView = ({ registrations, onUpdateStatus, userRole, onBack, onNewInscripcion }: { registrations: any[], onUpdateStatus: (id: string, status: string) => void, userRole?: string, onBack: () => void, onNewInscripcion: () => void }) => {
  const [search, setSearch] = useState('');
  
  const filteredApplicants = registrations.filter(app => 
    (app.dni && app.dni.includes(search)) || 
    (app.nombres && `${app.nombres} ${app.apellido_paterno} ${app.apellido_materno}`.toLowerCase().includes(search.toLowerCase())) ||
    (app.id && app.id.toString().includes(search.toUpperCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center">
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
            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
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
                  <td className="p-4 font-mono text-xs font-bold text-stone-400">#{app.id}</td>
                  <td className="p-4 font-bold text-stone-800 text-sm">{app.nombres} {app.apellido_paterno} {app.apellido_materno}</td>
                  <td className="p-4 text-sm text-stone-600">{app.dni}</td>
                  <td className="p-4 text-sm text-stone-600">{app.carrera}</td>
                  <td className="p-4 text-sm text-stone-600">{app.pueblo_indigena}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      app.estado === 'Validado' ? 'bg-cyan-100 text-cyan-700' : 
                      app.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.estado}
                    </span>
                  </td>
                  <td className="p-4 text-[10px] text-stone-500 font-medium italic">{app.modificado_por || 'Postulante'}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {app.estado === 'Pendiente' && userRole !== 'visualizador' && (
                        <>
                          <button 
                            onClick={() => onUpdateStatus(app.id, 'Validado')}
                            className="text-cyan-600 hover:text-cyan-700 font-bold text-[10px] uppercase tracking-wider"
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

const AdminDashboardView = ({ registrations, userRole, dbStatus, onBack, onConfigImages, onConfigCronograma, onConfigCarreras, onConfigUsers }: { registrations: any[], userRole?: string, dbStatus?: any, onBack: () => void, onConfigImages: () => void, onConfigCronograma: () => void, onConfigCarreras: () => void, onConfigUsers: () => void }) => {
  const total = registrations.length;
  const validated = registrations.filter(r => r.estado === 'Validado').length;
  const pending = registrations.filter(r => r.estado === 'Pendiente').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Total Postulantes</p>
          <p className="text-4xl font-bold text-stone-800">{total.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-cyan-600 text-xs font-bold">
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
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Estado Base de Datos</p>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${dbStatus?.status === 'connected' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
            <p className={`text-xl font-bold ${dbStatus?.status === 'connected' ? 'text-emerald-600' : 'text-red-600'}`}>
              {dbStatus?.status === 'connected' ? 'En Línea' : 'Error'}
            </p>
          </div>
          <div className="mt-4 text-[10px] text-stone-400 font-bold uppercase tracking-tight">
            {dbStatus?.status === 'connected' ? `${dbStatus.host}:${dbStatus.port}` : (dbStatus?.code || 'Desconectado')}
          </div>
        </div>
      </div>

      {userRole !== 'visualizador' && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
          <h3 className="text-xl font-bold text-stone-800 mb-6">Acciones Rápidas de Administrador</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: UploadCloud, label: "Subir Resultados", color: "bg-blue-50 text-blue-600" },
              { icon: FileText, label: "Reporte de Pagos", color: "bg-cyan-50 text-cyan-600" },
              { icon: User, label: "Gestionar Usuarios", color: "bg-purple-50 text-purple-600", action: onConfigUsers },
              { icon: Info, label: "Editar Reglamento", color: "bg-amber-50 text-amber-600" },
              { icon: Image, label: "Configurar Inicio", color: "bg-pink-50 text-pink-600", action: onConfigImages },
              { icon: BookOpen, label: "Configurar Carreras", color: "bg-purple-50 text-purple-600", action: onConfigCarreras },
              { icon: Clock, label: "Configurar Cronograma", color: "bg-indigo-50 text-indigo-600", action: onConfigCronograma },
            ].map((action, i) => (
              <button key={i} onClick={action.action} className="p-6 rounded-3xl border border-stone-100 hover:border-stone-200 hover:bg-stone-50 transition-all text-left group">
                <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon size={20} />
                </div>
                <p className="font-bold text-stone-800 text-sm">{action.label}</p>
              </button>
            ))}
          </div>
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

const InscripcionAdminFormView = ({ onSave, onBack, currentUser }: { onSave: (data: FormData) => void, onBack: () => void, currentUser?: UserAuth }) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);

  const handleDniChange = async (dni: string) => {
    setFormData(prev => ({ ...prev, dni }));
    if (dni.length === 8) {
      setLoading(true);
      try {
        const response = await fetch(`/api/registrations/dni/${dni}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            tipo_documento: 'DNI',
            dni: data.dni,
            nombres: data.nombres,
            apellido_paterno: data.apellido_paterno,
            apellido_materno: data.apellido_materno,
            fecha_nacimiento: data.fecha_nacimiento ? data.fecha_nacimiento.split('T')[0] : '',
            genero: data.genero,
            correo: data.correo,
            telefono: data.telefono,
            departamento: data.departamento,
            provincia: data.provincia,
            distrito: data.distrito,
            nombre_colegio: data.colegio_nombre,
            tipo_colegio: data.colegio_tipo,
            anio_graduacion: data.anio_egreso?.toString() || '',
            carrera: data.carrera,
            modalidad: data.modalidad,
            pueblo_indigena: data.pueblo_indigena,
          });
        }
      } catch (e) {
        console.error("Error fetching pre-registration:", e);
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
                  value={formData.nombres}
                  onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Apellido Paterno</label>
                <input 
                  type="text" 
                  value={formData.apellido_paterno}
                  onChange={(e) => setFormData({...formData, apellido_paterno: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Carrera</label>
              <select 
                value={formData.carrera}
                onChange={(e) => setFormData({...formData, carrera: e.target.value})}
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
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Email</label>
                <input 
                  type="email" 
                  value={formData.correo}
                  onChange={(e) => setFormData({...formData, correo: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Modalidad</label>
              <select 
                value={formData.modalidad}
                onChange={(e) => setFormData({...formData, modalidad: e.target.value})}
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
    email: ''
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
        email: user.email || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        role: 'visualizador',
        full_name: '',
        email: ''
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
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(u)}
                        className="p-2 text-stone-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
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
