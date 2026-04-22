/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generatePreinscriptionPDF } from './pdfGenerator';
import * as LucideIcons from 'lucide-react';
import { 
  User,
  Users,
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
  FileDown,
  Globe,
  Check,
  Plus,
  Edit,
  Trash2,
  X,
  Database,
  RefreshCw,
  LayoutDashboard,
  Languages
} from 'lucide-react';

import { ColegioManagementView } from './components/views/ColegioManagementView';
import { IdiomaManagementView } from './components/views/IdiomaManagementView';
import ConfiguracionPDFView from './components/views/ConfiguracionPDFView';

// PDF Viewer imports
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

declare global {
  interface Window {
    __INITIAL_SETTINGS__?: any;
  }
}

import { Step, View, Role, UserAuth, FormData } from './types';

import { ConfiguracionInicioView } from './components/views/ConfiguracionInicioView';
import { ConfiguracionAdmisionView } from './components/views/ConfiguracionPortalView';
import { ConfiguracionCronogramaView } from './components/views/ConfiguracionCronogramaView';
import { ConfiguracionCarrerasView } from './components/views/ConfiguracionCarrerasView';
import { ConfiguracionModalidadesView } from './components/views/ConfiguracionModalidadesView';
import { ConfiguracionDatabaseView } from './components/views/ConfiguracionDatabaseView';
import { CarreraDetailView } from './components/views/CarreraDetailView';
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
  pais: 'Perú',
  nacionalidad: 'Peruana',
  email: '',
  movil: '',
  schoolName: '',
  schoolType: '',
  schoolLevel: '',
  graduationYear: CURRENT_YEAR.toString(),
  career: '',
  modality: '',
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
  nacimientoUbigeo: '',
  idioma: '',
  idiomaLee: false,
  idiomaHabla: false,
  idiomaEscribe: false,
  apoderadoDni: '',
  apoderadoNombres: '',
  apoderadoApellidoPaterno: '',
  apoderadoApellidoMaterno: '',
  apoderadoMovil: '',
  hasSpecialConditions: false,
  discapacidad: false,
  conadisNumber: '',
  isDeportista: false,
  isVictimaViolencia: false,
  isServicioMilitar: false,
  isPrimerosPuestos: false,
  monto_pago: 0,
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

import { LandingPage } from './components/LandingPage';

import { InputField, SelectField, DynamicIcon } from './components/ui/FormComponents';

export default function App() {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [view, setView] = useState<View>('landing');
  const [step, setStep] = useState<Step>('personal');
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPreinscripcion, setSelectedPreinscripcion] = useState<any>(null);
  const [appSettings, setAppSettings] = useState<any>(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_SETTINGS__) {
      return window.__INITIAL_SETTINGS__;
    }
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {};
  });
  const [cronograma, setCronograma] = useState<any[]>(() => {
    const saved = localStorage.getItem('cronograma');
    return saved ? JSON.parse(saved) : [];
  });
  const [reglamento, setReglamento] = useState<any[]>([]);
  const [temario, setTemario] = useState<any[]>([]);
  const [resultados, setResultados] = useState<any[]>([]);
  const [carrerasDetalladas, setCarrerasDetalladas] = useState<any[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [lastRegistrationId, setLastRegistrationId] = useState<number | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [dbCheckResult, setDbCheckResult] = useState<{success: boolean, message: string} | null>(null);
  const [regiones, setRegiones] = useState<any[]>([]);
  const [procedenciaProvincias, setProcedenciaProvincias] = useState<any[]>([]);
  const [procedenciaDistritos, setProcedenciaDistritos] = useState<any[]>([]);
  const [colegioProvincias, setColegioProvincias] = useState<any[]>([]);
  const [colegioDistritos, setColegioDistritos] = useState<any[]>([]);
  const [colegiosList, setColegiosList] = useState<any[]>([]);
  const [nacimientoProvincias, setNacimientoProvincias] = useState<any[]>([]);
  const [nacimientoDistritos, setNacimientoDistritos] = useState<any[]>([]);

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
          setAppSettings((prev: any) => {
            const next = { ...prev, ...data };
            localStorage.setItem('appSettings', JSON.stringify(next));
            return next;
          });
        }
      }
      
      // Fetch dynamic content from DB
      const endpoints = [
        { url: '/api/cronograma', setter: (data: any) => {
          const sorted = data.sort((a: any, b: any) => (a.indice_orden || 0) - (b.indice_orden || 0));
          setCronograma(sorted);
          localStorage.setItem('cronograma', JSON.stringify(sorted));
        }, name: 'cronograma' },
        { url: '/api/reglamento', setter: setReglamento, name: 'reglamento' },
        { url: '/api/temario', setter: setTemario, name: 'temario' },
        { url: '/api/resultados', setter: setResultados, name: 'resultados' },
        { url: '/api/carreras-detalladas', setter: setCarrerasDetalladas, name: 'carreras-detalladas' },
        { url: '/api/carreras', setter: (data: any) => setAppSettings((prev: any) => {
          const next = { ...prev, careers: data };
          localStorage.setItem('appSettings', JSON.stringify(next));
          return next;
        }), name: 'carreras' },
        { url: '/api/configuracion-inicio', setter: (data: any) => setAppSettings((prev: any) => {
          const next = { ...prev, descripcionAdmision: data.descripcion_admision, configuracionInicio: data };
          localStorage.setItem('appSettings', JSON.stringify(next));
          return next;
        }), name: 'configuracion-inicio' },
        { url: '/api/configuracion-pdf', setter: (data: any) => setAppSettings((prev: any) => {
          const next = { ...prev, pdfSettings: data };
          localStorage.setItem('appSettings', JSON.stringify(next));
          return next;
        }), name: 'configuracion-pdf' },
        { url: '/api/configuracion-cronograma', setter: (data: any) => setAppSettings((prev: any) => {
          const next = { ...prev, cronogramaConfig: data };
          localStorage.setItem('appSettings', JSON.stringify(next));
          return next;
        }), name: 'configuracion-cronograma' }
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
    fetch('/api/regiones')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setRegiones(data);
        } else {
          console.error('Expected array for regiones, got:', data);
        }
      })
      .catch(err => console.error('Error fetching regiones:', err));
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

  const handlePreRegister = async (data: FormData): Promise<{ error: string | null, id?: number, securityCode?: string }> => {
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
        return { error: null, id: result.id, securityCode: result.securityCode };
      } else {
        const errorData = await response.json().catch(() => null);
        return { error: errorData?.error || 'Error al enviar la inscripción.' };
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      return { error: 'Error de conexión con el servidor.' };
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

    // Validation for email and mobile numbers
    if (name === 'email') {
      if (!value.includes('@')) {
        setErrors(prev => ({ ...prev, email: 'El email debe contener @' }));
      }
    }
    
    if (name === 'movil' || name === 'apoderadoMovil') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 9) {
        setFormData(prev => ({ ...prev, [name]: onlyNums }));
      }
      if (onlyNums.length !== 9) {
        setErrors(prev => ({ ...prev, [name]: 'Debe tener 9 dígitos' }));
      }
    }
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    if (step === 'personal') {
      const requiredFields: (keyof FormData)[] = [
        'dni', 'names', 'paternalSurname', 'maternalSurname', 
        'birthDate', 'gender', 'email', 'movil', 'idioma'
      ];
      
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'Este campo es obligatorio';
        }
      });
      if (formData.email && !formData.email.includes('@')) {
        newErrors.email = 'El correo electrónico debe contener un símbolo "@"';
      }
      
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
        'schoolName', 'schoolType', 'schoolLevel', 'graduationYear', 
        'colegioRegion', 'colegioProvincia', 'colegioDistrito',
        'procedenciaRegion', 'procedenciaProvincia', 'procedenciaDistrito',
        'nacimientoRegion', 'nacimientoProvincia', 'nacimientoDistrito'
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
            <div className="flex items-center gap-4">
              <UniqLogo className="h-10 w-10" />
              <div className="hidden sm:block">
                <h1 className="font-bold text-sm leading-tight tracking-tight text-stone-800 max-w-[250px]">Universidad Nacional Intercultural de Quillabamba</h1>
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-stone-400">{appSettings?.descripcionAdmision || "Admisión 2026"}</p>
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
              </nav>
              
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
              onNavigate={(v) => setView(v)}
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
                  setIsSubmitting={setIsSubmitting}
                  careers={appSettings.careers || []}
                  appSettings={appSettings}
                  regiones={regiones}
                  procedenciaProvincias={procedenciaProvincias}
                  procedenciaDistritos={procedenciaDistritos}
                  setProcedenciaProvincias={setProcedenciaProvincias}
                  setProcedenciaDistritos={setProcedenciaDistritos}
                  colegioProvincias={colegioProvincias}
                  colegioDistritos={colegioDistritos}
                  colegiosList={colegiosList}
                  setColegiosList={setColegiosList}
                  setColegioProvincias={setColegioProvincias}
                  setColegioDistritos={setColegioDistritos}
                  nacimientoProvincias={nacimientoProvincias}
                  nacimientoDistritos={nacimientoDistritos}
                  setNacimientoProvincias={setNacimientoProvincias}
                  setNacimientoDistritos={setNacimientoDistritos}
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
            <TemarioView temario={temario} onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'resultados' ? (
            <ResultadosView resultados={resultados} isAdmin={user?.role === 'admin'} appSettings={appSettings} onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'ficha-pdf-view' ? (
            <FichaPDFView 
              preinscripcion={selectedPreinscripcion} 
              onBack={() => setView('admin-dashboard')}                
              appSettings={appSettings}
            />
          ) : view === 'config-colegios' ? (
            <ColegioManagementView onBack={() => setView('admin-dashboard')} />
          ) : view === 'registrados-management' ? (
            <RegistradosManagementView onBack={() => setView('admin-dashboard')} />
          ) : view === 'config-idiomas' ? (
            <IdiomaManagementView onBack={() => setView('admin-dashboard')} />
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
              onConfigColegios={() => setView('config-colegios')}
              onConfigIdiomas={() => setView('config-idiomas')}
              onConfigUsers={() => setView('user-management')}
              onConfigRegistrados={() => setView('registrados-management')}
              onCheckDb={checkDbStatus}
              isCheckingDb={isCheckingDb}
              dbCheckResult={dbCheckResult}
              onConfigDni={() => setView('config-dni')}
              onConfigInicio={() => setView('config-inicio')}
              onConfigAdmision={() => setView('config-admision')}
            />
          ) : view === 'config-admision' ? (
            <ConfiguracionAdmisionView 
              onBack={() => setView('admin-dashboard')} 
              onUpdate={fetchSettings}
            />
          ) : view === 'config-ubicaciones' ? (
            <LocationManagementView onBack={() => setView('admin-dashboard')} />
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
          ) : view === 'config-pdf' ? (
            <ConfiguracionPDFView 
              onBack={() => setView('admin-dashboard')} 
              onUpdate={fetchSettings}
              appSettings={appSettings}
              setAppSettings={setAppSettings}
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
                <h2 className="text-4xl font-bold text-stone-800 mb-4">Guía del Postulante {appSettings?.descripcionAdmision?.replace('Admisión ', '') || "2026"}</h2>
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
                    {cronograma.filter((item: any) => item.status !== 'completado').slice(0, 3).map((item: any, i: number) => (
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
                value={username || ''}
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
                value={password || ''}
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
  onSubmit: (data: FormData) => Promise<{ error: string | null, id?: number, securityCode?: string }>,
  onCancel: () => void,
  isSubmitting: boolean,
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  careers: any[],
  appSettings?: any,
  regiones: any[],
  procedenciaProvincias: any[],
  procedenciaDistritos: any[],
  setProcedenciaProvincias: React.Dispatch<React.SetStateAction<any[]>>,
  setProcedenciaDistritos: React.Dispatch<React.SetStateAction<any[]>>,
  colegioProvincias: any[],
  colegioDistritos: any[],
  colegiosList: any[],
  setColegiosList: React.Dispatch<React.SetStateAction<any[]>>,
  setColegioProvincias: React.Dispatch<React.SetStateAction<any[]>>,
  setColegioDistritos: React.Dispatch<React.SetStateAction<any[]>>,
  nacimientoProvincias: any[],
  nacimientoDistritos: any[],
  setNacimientoProvincias: React.Dispatch<React.SetStateAction<any[]>>,
  setNacimientoDistritos: React.Dispatch<React.SetStateAction<any[]>>
}> = ({ formData, setFormData, onSubmit, onCancel, isSubmitting, setIsSubmitting, careers, appSettings, regiones, procedenciaProvincias, procedenciaDistritos, setProcedenciaProvincias, setProcedenciaDistritos, colegioProvincias, colegioDistritos, colegiosList, setColegiosList, setColegioProvincias, setColegioDistritos, nacimientoProvincias, nacimientoDistritos, setNacimientoProvincias, setNacimientoDistritos }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalidades, setModalidades] = useState<any[]>([]);
  const [isLoadingModalidades, setIsLoadingModalidades] = useState(true);

  const calculatedMontoPago = useMemo(() => {
    const selectedModality = modalidades.find(m => m.nombre === formData.modality);
    if (!selectedModality) return 0;
    
    const type = (formData.schoolType || '').toLowerCase();
    if (type.includes('privad') || type.includes('particular')) {
      return Number(selectedModality.costo_privado) || 0;
    } else {
      return Number(selectedModality.costo_nacional) || 0;
    }
  }, [formData.modality, formData.schoolType, modalidades]);

  useEffect(() => {
    if (calculatedMontoPago !== formData.monto_pago) {
      setFormData(prev => ({ ...prev, monto_pago: calculatedMontoPago }));
    }
  }, [calculatedMontoPago, formData.monto_pago, setFormData]);

  const [isSearchingDni, setIsSearchingDni] = useState(false);
  const [isSearchingApoderadoDni, setIsSearchingApoderadoDni] = useState(false);
  const [lastSearchedDni, setLastSearchedDni] = useState('');
  const [lastCheckedModality, setLastCheckedModality] = useState('');
  const [lastSearchedApoderadoDni, setLastSearchedApoderadoDni] = useState('');
  const [idiomas, setIdiomas] = useState<any[]>([]);
  const [paises, setPaises] = useState<any[]>([]);
  const [aniosEgreso, setAniosEgreso] = useState<any[]>([]);
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<number | null>(null);

  // Security code states
  const [isDniRegistered, setIsDniRegistered] = useState(false);
  const [showSecurityCodeInput, setShowSecurityCodeInput] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [isCodeValidating, setIsCodeValidating] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [originalRegistrationId, setOriginalRegistrationId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/idiomas')
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => setIdiomas(data))
      .catch(err => console.error('Error fetching idiomas:', err));

    setLoadingFields(prev => ({ ...prev, pais: true }));
    fetch('/api/paises')
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => setPaises(data))
      .catch(err => console.error('Error fetching paises:', err))
      .finally(() => setLoadingFields(prev => ({ ...prev, pais: false })));

    fetch('/api/anios-egreso')
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => setAniosEgreso(data))
      .catch(err => console.error('Error fetching anios-egreso:', err));
  }, []);

  const handleValidateCode = async () => {
    if (securityCode.length !== 5) {
      setCodeError('El código debe tener 5 dígitos');
      return;
    }

    setIsCodeValidating(true);
    setCodeError('');
    try {
      const response = await fetch('/api/registrations/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: formData.dni, code: securityCode, modality: formData.modality }),
      });

      const data = await response.json();
      if (response.ok) {
        // Load registration data into form
        const reg = data.registration;
        
        // Fetch dependent data for the selects to show correctly
        const getProvincias = async (regionName: string) => {
          const region = regiones.find(r => r.nombre.trim().toUpperCase() === (regionName || "").trim().toUpperCase());
          if (region) {
            const res = await fetch(`/api/provincias?region_id=${region.id}`);
            const provs = res.ok ? await res.json() : [];
            return { regionName: region.nombre, provinces: provs };
          }
          return { regionName: regionName, provinces: [] };
        };

        const getDistritos = async (provName: string, provinces: any[]) => {
          const prov = provinces.find(p => p.nombre.trim().toUpperCase() === (provName || "").trim().toUpperCase());
          if (prov) {
            const res = await fetch(`/api/distritos?provincia_id=${prov.id}`);
            const dists = res.ok ? await res.json() : [];
            return { provName: prov.nombre, districts: dists };
          }
          return { provName: provName, districts: [] };
        };

        const getColegios = async (distName: string, districts: any[]) => {
          const dist = districts.find(d => d.nombre.trim().toUpperCase() === (distName || "").trim().toUpperCase());
          if (dist) {
            const res = await fetch(`/api/colegios?distrito_id=${dist.id}`);
            const cols = res.ok ? await res.json() : [];
            return { distName: dist.nombre, colegios: cols };
          }
          return { distName: distName, colegios: [] };
        };

        const pLoc = await getProvincias(reg.procedencia_region);
        setProcedenciaProvincias(pLoc.provinces);
        const pProv = await getDistritos(reg.procedencia_provincia, pLoc.provinces);
        setProcedenciaDistritos(pProv.districts);
        const pDist = pProv.districts.find((d: any) => d.nombre.trim().toUpperCase() === (reg.procedencia_distrito || "").trim().toUpperCase());

        const cLoc = await getProvincias(reg.colegio_region);
        setColegioProvincias(cLoc.provinces);
        const cProv = await getDistritos(reg.colegio_provincia, cLoc.provinces);
        setColegioDistritos(cProv.districts);
        const cCols = await getColegios(reg.colegio_distrito, cProv.districts);
        setColegiosList(cCols.colegios);
        const cDist = cProv.districts.find((d: any) => d.nombre.trim().toUpperCase() === (reg.colegio_distrito || "").trim().toUpperCase());

        const nLoc = await getProvincias(reg.nacimiento_region);
        setNacimientoProvincias(nLoc.provinces);
        const nProv = await getDistritos(reg.nacimiento_provincia, nLoc.provinces);
        setNacimientoDistritos(nProv.districts);
        const nDist = nProv.districts.find((d: any) => d.nombre.trim().toUpperCase() === (reg.nacimiento_distrito || "").trim().toUpperCase());

        setFormData({
          ...formData,
          modality: reg.modalidad || '',
          career: reg.carrera || '',
          careerCode: reg.codigo_carrera || '',
          names: reg.nombres || '',
          paternalSurname: reg.apellido_paterno || '',
          maternalSurname: reg.apellido_materno || '',
          birthDate: reg.fecha_nacimiento ? reg.fecha_nacimiento.split('T')[0] : '',
          gender: reg.genero ? reg.genero.toUpperCase() : '',
          email: reg.correo || reg.email || '',
          movil: reg.movil || '',
          pais: reg.pais || '',
          nacionalidad: reg.nacionalidad || '',
          lugarInscripcion: reg.lugar_inscripcion || '',
          idioma: reg.idioma || '',
          idiomaLee: !!reg.idioma_lee,
          idiomaHabla: !!reg.idioma_habla,
          idiomaEscribe: !!reg.idioma_escribe,
          procedenciaRegion: pLoc.regionName,
          procedenciaProvincia: pProv.provName,
          procedenciaDistrito: pDist ? pDist.nombre : (reg.procedencia_distrito || ''),
          procedenciaDireccion: (reg.procedencia_direccion || '').trim(),
          colegioRegion: cLoc.regionName,
          colegioProvincia: cProv.provName,
          colegioDistrito: cDist ? cDist.nombre : (reg.colegio_distrito || ''),
          schoolName: (reg.colegio_nombre || '').trim(),
          schoolType: (reg.colegio_tipo || '').trim(),
          schoolLevel: (reg.colegio_nivel || '').trim(),
          graduationYear: reg.anio_egreso ? reg.anio_egreso.toString() : '',
          nacimientoRegion: nLoc.regionName,
          nacimientoProvincia: nProv.provName,
          nacimientoDistrito: nDist ? nDist.nombre : (reg.nacimiento_distrito || ''),
          nacimientoUbigeo: (reg.nacimiento_ubigeo || '').trim(),
          apoderadoDni: reg.apoderado_dni || '',
          apoderadoNombres: reg.apoderado_nombres || '',
          apoderadoApellidoPaterno: reg.apoderado_apellido_paterno || '',
          apoderadoApellidoMaterno: reg.apoderado_apellido_materno || '',
          apoderadoMovil: reg.apoderado_movil || '',
          hasSpecialConditions: !!reg.tiene_condiciones_especiales,
          discapacidad: !!reg.discapacidad,
          conadisNumber: reg.numero_conadis || '',
          isDeportista: !!reg.es_deportista,
          isVictimaViolencia: !!reg.es_victima_violencia,
          isServicioMilitar: !!reg.es_servicio_militar,
          isPrimerosPuestos: !!reg.es_primeros_puestos,
          monto_pago: Number(reg.monto_pago) || 0,
          securityCode: securityCode
        });
        setOriginalRegistrationId(reg.id);
        setIsModifying(true);
        setShowSecurityCodeInput(false);
        setCurrentStep(1);
        // Success message
        alert('Código validado correctamente. Ya puede proceder a modificar su preinscripción.');
      } else {
        setCodeError(data.message || data.error || 'Código inválido o ya usado');
      }
    } catch (error) {
      console.error('Error validating code:', error);
      setCodeError('Error de conexión al validar el código');
    } finally {
      setIsCodeValidating(false);
    }
  };

  const handleApoderadoDniLookup = async (dni: string) => {
    if (dni.length === 8 && dni !== lastSearchedApoderadoDni) {
      setIsSearchingApoderadoDni(true);
      setLastSearchedApoderadoDni(dni);
      try {
        const response = await fetch(`/api/dni/${dni}`);
        const data = await response.json();
        
        if (response.ok && data && (data.nombres || data.nombre)) {
          const nombres = data.nombres || data.nombre;
          const apPaterno = data.apellidoPaterno || data.paterno || '';
          const apMaterno = data.apellidoMaterno || data.materno || '';
          
          setFormData(prev => ({
            ...prev,
            apoderadoNombres: nombres,
            apoderadoApellidoPaterno: apPaterno,
            apoderadoApellidoMaterno: apMaterno
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            apoderadoNombres: '',
            apoderadoApellidoPaterno: '',
            apoderadoApellidoMaterno: ''
          }));
        }
      } catch (error) {
        console.error("Error looking up apoderado DNI:", error);
      } finally {
        setIsSearchingApoderadoDni(false);
      }
    }
  };

  const [lugaresInscripcion, setLugaresInscripcion] = useState<any[]>([]);
  const [isLoadingLugares, setIsLoadingLugares] = useState(true);

  useEffect(() => {
    setIsLoadingLugares(true);
    fetch('/api/lugares-inscripcion')
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => {
        if (Array.isArray(data)) {
          setLugaresInscripcion(data);
        } else {
          setLugaresInscripcion([]);
        }
      })
      .catch(err => {
        console.error("Error fetching lugares de inscripción:", err);
        setLugaresInscripcion([]);
      })
      .finally(() => setIsLoadingLugares(false));
  }, []);

  useEffect(() => {
    const lookupDni = async () => {
      // If DNI is cleared or not 8 digits, reset lastSearchedDni and clear personal data
      if (formData.dni.length !== 8) {
        if (lastSearchedDni !== '') {
          setLastSearchedDni('');
          setLastCheckedModality('');
          setFormData(prev => ({
            ...prev,
            names: '',
            paternalSurname: '',
            maternalSurname: ''
          }));
        }
        return;
      }

      let nameDataExtracted = false;

      // Only perform external DNI lookup if DNI is exactly 8 digits and different from last searched
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
            nameDataExtracted = true;
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
            return;
          }
        } catch (error) {
          console.error("Error looking up DNI:", error);
          setErrors(prev => ({ ...prev, dni: 'Error de conexión' }));
          return;
        } finally {
          setIsSearchingDni(false);
        }
      } else {
        nameDataExtracted = true;
      }

      // Check registration if DNI fetch succeeded or was previously fetched
      if (nameDataExtracted && (formData.dni !== lastSearchedDni || formData.modality !== lastCheckedModality)) {
          setLastCheckedModality(formData.modality);
          try {
            const url = formData.modality 
              ? `/api/registrations/check-dni/${formData.dni}?modality=${encodeURIComponent(formData.modality)}`
              : `/api/registrations/check-dni/${formData.dni}`;
            const checkRes = await fetch(url);
            const checkData = await checkRes.json();
            if (checkRes.ok && checkData.exists) {
              setIsDniRegistered(true);
              if (checkData.canModify) {
                setShowSecurityCodeInput(true);
              } else {
                setShowSecurityCodeInput(false);
                setErrors(prev => ({ ...prev, dni: 'Este DNI ya está registrado en la modalidad seleccionada' }));
              }
            } else {
              setIsDniRegistered(false);
              setShowSecurityCodeInput(false);
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.dni;
                return newErrors;
              });
            }
          } catch (err) {
            console.error("Error checking DNI registration:", err);
          }
      }
    };
    lookupDni();
  }, [formData.dni, formData.modality, setFormData, lastSearchedDni, lastCheckedModality]);

  useEffect(() => {
    setIsLoadingModalidades(true);
    fetch('/api/modalidades')
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => {
        if (Array.isArray(data)) {
          // Fetch all non-deleted modalities to check their status
          setModalidades(data.filter((m: any) => !m.eliminado));
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

  useEffect(() => {
    if (formData.modality) {
      const selectedModality = modalidades.find(m => m.nombre === formData.modality);
      if (selectedModality) {
        const now = new Date();
        const peruTime = new Date(now.getTime() + (now.getTimezoneOffset() - 300) * 60000);
        
        if (selectedModality.fecha) {
          const [year, month, day] = selectedModality.fecha.split('T')[0].split('-').map(Number);
          const deadline = new Date(year, month - 1, day, 12, 59, 59);
          
          if (peruTime > deadline) {
            setErrors(prev => ({ ...prev, modality: "Fuera de fecha de registro" }));
          } else {
            setErrors(prev => {
              const { modality, ...rest } = prev;
              return rest;
            });
          }
        } else {
          setErrors(prev => {
            const { modality, ...rest } = prev;
            return rest;
          });
        }
      }
    }
  }, [formData.modality, modalidades]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Step 1 fields (Inscripción)
    if (!formData.modality) {
      newErrors.modality = "Seleccione una modalidad";
    } else {
      const selectedModality = modalidades.find(m => m.nombre === formData.modality);
      if (selectedModality) {
        const now = new Date();
        const peruTime = new Date(now.getTime() + (now.getTimezoneOffset() - 300) * 60000);
        
        if (selectedModality.fecha) {
          const [year, month, day] = selectedModality.fecha.split('T')[0].split('-').map(Number);
          const deadline = new Date(year, month - 1, day, 12, 59, 59);
          
          if (peruTime > deadline) {
            newErrors.modality = "Fuera de fecha de registro";
          }
        }
      }
    }
    if (!formData.career) newErrors.career = "Seleccione una carrera";
    if (!formData.dni || formData.dni.length !== 8) newErrors.dni = "DNI inválido (8 dígitos)";
    
    // Step 2 fields (Personales)
    if (!formData.names) newErrors.names = "Requerido";
    if (!formData.paternalSurname) newErrors.paternalSurname = "Requerido";
    if (!formData.maternalSurname) newErrors.maternalSurname = "Requerido";
    if (!formData.birthDate) newErrors.birthDate = "Requerido";
    if (!formData.gender) newErrors.gender = "Requerido";
    
    if (!formData.email) {
      newErrors.email = "Requerido";
    } else if (!formData.email.includes('@')) {
      newErrors.email = "Debe contener @";
    }
    
    if (!formData.movil) {
      newErrors.movil = "Requerido";
    } else if (formData.movil.length !== 9) {
      newErrors.movil = "Debe tener 9 dígitos";
    }
    
    if (!formData.lugarInscripcion) newErrors.lugarInscripcion = "Requerido";
    if (!formData.idioma) newErrors.idioma = "Requerido";

    // Step 3 fields (Ubicación y Educación)
    if (!formData.procedenciaRegion) newErrors.procedenciaRegion = "Requerido";
    if (!formData.procedenciaProvincia) newErrors.procedenciaProvincia = "Requerido";
    if (!formData.procedenciaDistrito) newErrors.procedenciaDistrito = "Requerido";
    if (!formData.procedenciaDireccion) newErrors.procedenciaDireccion = "Requerido";
    
    if (!formData.colegioRegion) newErrors.colegioRegion = "Requerido";
    if (!formData.colegioProvincia) newErrors.colegioProvincia = "Requerido";
    if (!formData.colegioDistrito) newErrors.colegioDistrito = "Requerido";
    if (!formData.schoolName) newErrors.schoolName = "Requerido";
    if (!formData.graduationYear) newErrors.graduationYear = "Requerido";
    
    // Step 4 fields (Lugar de Nacimiento)
    if (!formData.nacimientoRegion) newErrors.nacimientoRegion = "Requerido";
    if (!formData.nacimientoProvincia) newErrors.nacimientoProvincia = "Requerido";
    if (!formData.nacimientoDistrito) newErrors.nacimientoDistrito = "Requerido";
    
    // Step 5 fields (Información Adicional)
    if (!formData.apoderadoDni || formData.apoderadoDni.length !== 8) newErrors.apoderadoDni = "DNI inválido (8 dígitos)";
    if (!formData.apoderadoNombres) newErrors.apoderadoNombres = "Requerido";
    if (!formData.apoderadoApellidoPaterno) newErrors.apoderadoApellidoPaterno = "Requerido";
    if (!formData.apoderadoApellidoMaterno) newErrors.apoderadoApellidoMaterno = "Requerido";
    
    if (!formData.apoderadoMovil) {
      newErrors.apoderadoMovil = "Requerido";
    } else if (formData.apoderadoMovil.length !== 9) {
      newErrors.apoderadoMovil = "Debe tener 9 dígitos";
    }

    if (formData.hasSpecialConditions && formData.discapacidad && !formData.conadisNumber) {
      newErrors.conadisNumber = "Requerido";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // Find the first error and scroll to it
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementsByName(firstErrorField)[0];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
    }
    
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
    if (isModifying && originalRegistrationId) {
      // Handle modification
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const response = await fetch(`/api/registrations/${originalRegistrationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...formData, 
            isPublicUpdate: true,
            securityCode: securityCode
          }),
        });

        const result = await response.json();
        if (response.ok) {
          setRegistrationId(originalRegistrationId);
          try {
            await generatePDF(false, originalRegistrationId); // Generate for preview
          } catch (e) {
            console.error("Error generating PDF preview", e);
          }
          setCurrentStep(2);
        } else {
          setSubmitError(result.error || 'Error al actualizar la preinscripción');
        }
      } catch (error) {
        console.error('Error updating registration:', error);
        setSubmitError('Error de conexión al actualizar');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setSubmitError(null);
    const result = await onSubmit(formData);
    if (!result.error) {
      if (result.id) {
        setRegistrationId(result.id);
      }
      if (result.securityCode) {
        setFormData(prev => ({ ...prev, securityCode: result.securityCode }));
      }
      try {
        await generatePDF(false, result.id, result.securityCode); // Generate for preview
      } catch (e) {
        console.error("Error generating PDF preview", e);
      }
      setCurrentStep(2);
    } else {
      setSubmitError(result.error);
    }
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

    if (name === 'apoderadoDni') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 8) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: onlyNums,
          // Liberar datos del apoderado si el DNI cambia
          apoderadoNombres: '',
          apoderadoApellidoPaterno: '',
          apoderadoApellidoMaterno: ''
        }));
        if (onlyNums.length === 8) {
          handleApoderadoDniLookup(onlyNums);
        }
      }
      return;
    }

    if (name === 'movil' || name === 'apoderadoMovil') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 9) {
        setFormData(prev => ({ ...prev, [name]: onlyNums }));
      }
      return;
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      const specialConditionSubFields = ['discapacidad', 'isDeportista', 'isVictimaViolencia', 'isServicioMilitar', 'isPrimerosPuestos'];
      
      if (name === 'hasSpecialConditions') {
        setFormData(prev => ({ 
          ...prev, 
          [name]: checked,
          // Reset all special condition sub-fields if parent un-checked
          discapacidad: checked ? prev.discapacidad : false,
          isDeportista: checked ? prev.isDeportista : false,
          isVictimaViolencia: checked ? prev.isVictimaViolencia : false,
          isServicioMilitar: checked ? prev.isServicioMilitar : false,
          isPrimerosPuestos: checked ? prev.isPrimerosPuestos : false,
          conadisNumber: checked ? prev.conadisNumber : ''
        }));
      } else if (specialConditionSubFields.includes(name) && checked) {
        // If one of these is checked, uncheck all others
        setFormData(prev => ({
          ...prev,
          discapacidad: false,
          isDeportista: false,
          isVictimaViolencia: false,
          isServicioMilitar: false,
          isPrimerosPuestos: false,
          [name]: true,
          // Maintain conadisNumber only if current name is discapacidad
          conadisNumber: name === 'discapacidad' ? prev.conadisNumber : ''
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          [name]: checked,
          // If unchecking discapacidad, also clear the number
          conadisNumber: (name === 'discapacidad' && !checked) ? '' : prev.conadisNumber
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (name === 'pais') {
        const selectedPais = paises.find(p => p.pais === value);
        if (selectedPais) {
          setFormData(prev => ({ ...prev, nacionalidad: selectedPais.nacionalidad }));
        }
      }

      // Handle location dependencies
      if (name === 'procedenciaRegion') {
        const region = regiones.find(r => r.nombre === value);
        if (region) {
          setLoadingFields(prev => ({ ...prev, procedenciaProvincia: true }));
          fetch(`/api/provincias?region_id=${region.id}`)
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(data => setProcedenciaProvincias(data))
            .catch(err => console.error('Error fetching provincias:', err))
            .finally(() => setLoadingFields(prev => ({ ...prev, procedenciaProvincia: false })));
          setFormData(prev => ({ ...prev, procedenciaProvincia: '', procedenciaDistrito: '' }));
          setProcedenciaDistritos([]);
        }
      } else if (name === 'procedenciaProvincia') {
        const provincia = procedenciaProvincias.find(p => p.nombre === value);
        if (provincia) {
          setLoadingFields(prev => ({ ...prev, procedenciaDistrito: true }));
          fetch(`/api/distritos?provincia_id=${provincia.id}`)
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(data => setProcedenciaDistritos(data))
            .catch(err => console.error('Error fetching distritos:', err))
            .finally(() => setLoadingFields(prev => ({ ...prev, procedenciaDistrito: false })));
          setFormData(prev => ({ ...prev, procedenciaDistrito: '' }));
        }
      } else if (name === 'colegioRegion') {
        const region = regiones.find(r => r.nombre === value);
        if (region) {
          setLoadingFields(prev => ({ ...prev, colegioProvincia: true }));
          fetch(`/api/provincias?region_id=${region.id}`)
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(data => setColegioProvincias(data))
            .catch(err => console.error('Error fetching provincias:', err))
            .finally(() => setLoadingFields(prev => ({ ...prev, colegioProvincia: false })));
          setFormData(prev => ({ ...prev, colegioProvincia: '', colegioDistrito: '', schoolName: '', schoolType: '', schoolLevel: '' }));
          setColegioDistritos([]);
          setColegiosList([]);
        }
      } else if (name === 'colegioProvincia') {
        const provincia = colegioProvincias.find(p => p.nombre === value);
        if (provincia) {
          setLoadingFields(prev => ({ ...prev, colegioDistrito: true }));
          fetch(`/api/distritos?provincia_id=${provincia.id}`)
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(data => setColegioDistritos(data))
            .catch(err => console.error('Error fetching distritos:', err))
            .finally(() => setLoadingFields(prev => ({ ...prev, colegioDistrito: false })));
          setFormData(prev => ({ ...prev, colegioDistrito: '', schoolName: '', schoolType: '', schoolLevel: '' }));
          setColegiosList([]);
        }
      } else if (name === 'colegioDistrito') {
        const distrito = colegioDistritos.find(d => d.nombre === value);
        if (distrito) {
          setLoadingFields(prev => ({ ...prev, schoolName: true }));
          fetch(`/api/colegios?distrito_id=${distrito.id}`)
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(data => setColegiosList(data))
            .catch(err => console.error('Error fetching colegios:', err))
            .finally(() => setLoadingFields(prev => ({ ...prev, schoolName: false })));
          setFormData(prev => ({ ...prev, colegioDistrito: value, schoolName: '', schoolType: '', schoolLevel: '' }));
        } else {
          setFormData(prev => ({ ...prev, colegioDistrito: value }));
        }
      } else if (name === 'schoolName') {
        const colegio = colegiosList.find(c => c.nombre === value);
        if (colegio) {
          let mappedType = colegio.gestion || '';
          const lowerGestion = mappedType.toLowerCase();
          if (lowerGestion.includes('privad') || lowerGestion.includes('particular')) {
            mappedType = 'Privado';
          } else if (lowerGestion.includes('públic') || lowerGestion.includes('public') || lowerGestion.includes('estatal') || lowerGestion.includes('nacional')) {
            mappedType = 'Público';
          } else {
            mappedType = 'Público'; // Default to Público if unknown, or keep original? Let's keep original if it doesn't match, or default to Público.
          }
          setFormData(prev => ({ ...prev, schoolName: value, schoolType: mappedType, schoolLevel: colegio.nivel || '' }));
        } else {
          setFormData(prev => ({ ...prev, schoolName: value, schoolType: '', schoolLevel: '' }));
        }
      } else if (name === 'idioma') {
        setFormData(prev => ({ ...prev, idioma: value }));
      } else if (name === 'nacimientoRegion') {
        const region = regiones.find(r => r.nombre === value);
        if (region) {
          setLoadingFields(prev => ({ ...prev, nacimientoProvincia: true }));
          fetch(`/api/provincias?region_id=${region.id}`)
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(data => setNacimientoProvincias(data))
            .catch(err => console.error('Error fetching provincias:', err))
            .finally(() => setLoadingFields(prev => ({ ...prev, nacimientoProvincia: false })));
          setFormData(prev => ({ ...prev, nacimientoProvincia: '', nacimientoDistrito: '' }));
          setNacimientoDistritos([]);
        }
      } else if (name === 'nacimientoProvincia') {
        const provincia = nacimientoProvincias.find(p => p.nombre === value);
        if (provincia) {
          setLoadingFields(prev => ({ ...prev, nacimientoDistrito: true }));
          fetch(`/api/distritos?provincia_id=${provincia.id}`)
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(data => setNacimientoDistritos(data))
            .catch(err => console.error('Error fetching distritos:', err))
            .finally(() => setLoadingFields(prev => ({ ...prev, nacimientoDistrito: false })));
          setFormData(prev => ({ ...prev, nacimientoDistrito: '' }));
        }
      } else if (name === 'nacimientoDistrito') {
        const distrito = nacimientoDistritos.find(d => d.nombre === value);
        if (distrito) {
          setFormData(prev => ({ ...prev, nacimientoDistrito: value, nacimientoUbigeo: distrito.id.toString() }));
        } else {
          setFormData(prev => ({ ...prev, nacimientoDistrito: value, nacimientoUbigeo: '' }));
        }
      }
    }
  };

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (appSettings?.imagenPortalUrl) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = appSettings.imagenPortalUrl;
      img.onload = () => setLogoImage(img);
      img.onerror = () => console.error("Failed to load logo image");
    }
  }, [appSettings?.imagenPortalUrl]);

  const generatePDF = async (autoDownload = true, id?: number, securityCode?: string) => {
    let montoPago = 0;
    const selectedModality = modalidades.find(m => m.nombre === formData.modality);
    if (selectedModality) {
      const type = (formData.schoolType || '').toLowerCase();
      if (type.includes('privad') || type.includes('particular')) {
        montoPago = Number(selectedModality.costo_privado || 0);
      } else {
        montoPago = Number(selectedModality.costo_nacional || 0);
      }
    }

    const dataUri = await generatePreinscriptionPDF(
      { ...formData, securityCode: securityCode || formData.securityCode },
      appSettings,
      appSettings?.pdfSettings || {},
      logoImage,
      id,
      registrationId,
      montoPago,
      autoDownload
    );
    
    if (dataUri) {
      setPdfUrl(dataUri);
    }
    return dataUri;
  };

  if (isLoadingModalidades) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-32 text-center">
        <div className="w-12 h-12 border-4 border-uniq-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-stone-500 font-medium">Cargando modalidades de examen...</p>
      </div>
    );
  }

  if (modalidades.filter(m => {
    if (!m.fecha) return true;
    const now = new Date();
    const peruTime = new Date(now.getTime() + (now.getTimezoneOffset() - 300) * 60000);
    const [year, month, day] = m.fecha.split('T')[0].split('-').map(Number);
    const deadline = new Date(year, month - 1, day, 12, 59, 59);
    return peruTime <= deadline;
  }).length === 0) {
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
                  value={formData.modality || ''}
                  onChange={handleChange}
                  options={modalidades.map(m => {
                    const now = new Date();
                    const peruTime = new Date(now.getTime() + (now.getTimezoneOffset() - 300) * 60000);
                    let status = '';
                    if (m.fecha) {
                      const [year, month, day] = m.fecha.split('T')[0].split('-').map(Number);
                      const deadline = new Date(year, month - 1, day, 12, 59, 59);
                      if (peruTime > deadline) {
                        status = ' (Cerrado)';
                      }
                    }
                    return { value: m.nombre, label: `${m.nombre}${status}` };
                  })}
                  loading={isLoadingModalidades}
                  error={errors.modality}
                />
                <SelectField
                  label="Seleccionar Carrera"
                  name="career"
                  value={formData.career || ''}
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
                    value={formData.dni || ''}
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

                {showSecurityCodeInput && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-full bg-amber-50 p-6 rounded-2xl border border-amber-100 space-y-4"
                  >
                    <div className="flex items-center gap-3 text-amber-800">
                      <Lock size={20} />
                      <p className="font-bold">Este DNI ya está registrado</p>
                    </div>
                    <p className="text-sm text-amber-700">
                      Si desea modificar su preinscripción (permitido solo una vez), ingrese el código de seguridad de 5 dígitos que se encuentra en su ficha PDF
                    </p>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <InputField
                          label="Código de Seguridad"
                          name="securityCode"
                          value={securityCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length <= 5) setSecurityCode(val);
                          }}
                          placeholder="00000"
                          maxLength={5}
                          error={codeError}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleValidateCode}
                        disabled={isCodeValidating || securityCode.length !== 5}
                        className="h-[46px] px-8 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isCodeValidating ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                        Validar Código
                      </button>
                    </div>
                  </motion.div>
                )}
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
                <InputField label="Nombres" name="names" value={formData.names || ''} onChange={handleChange} error={errors.names} />
                <InputField label="Apellido Paterno" name="paternalSurname" value={formData.paternalSurname || ''} onChange={handleChange} error={errors.paternalSurname} />
                <InputField label="Apellido Materno" name="maternalSurname" value={formData.maternalSurname || ''} onChange={handleChange} error={errors.maternalSurname} />
                <InputField label="Fecha de Nacimiento" name="birthDate" type="date" value={formData.birthDate || ''} onChange={handleChange} error={errors.birthDate} />
                <SelectField label="Sexo" name="gender" value={formData.gender || ''} onChange={handleChange} options={['MASCULINO', 'FEMENINO']} error={errors.gender} />
                <SelectField 
                  label="País" 
                  name="pais" 
                  value={formData.pais || ''} 
                  onChange={handleChange} 
                  options={paises.map(p => p.pais)} 
                  loading={loadingFields.pais}
                  error={errors.pais}
                />
                <InputField label="Nacionalidad" name="nacionalidad" value={formData.nacionalidad || ''} onChange={handleChange} error={errors.nacionalidad} readOnly disabled />
                <InputField 
                  label="Email" 
                  name="email" 
                  value={formData.email || ''} 
                  onChange={handleChange} 
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    if (value && !value.includes('@')) {
                      setErrors(prev => ({ ...prev, email: 'El correo electrónico debe contener un símbolo "@"' }));
                    } else {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.email;
                        return newErrors;
                      });
                    }
                  }}
                  error={errors.email} 
                />
                <InputField label="Móvil" name="movil" value={formData.movil || ''} onChange={handleChange} error={errors.movil} />
                <SelectField 
                  label="Lugar de inscripción" 
                  name="lugarInscripcion" 
                  value={formData.lugarInscripcion || ''} 
                  onChange={handleChange} 
                  options={lugaresInscripcion.map((l: any) => l.nombre)} 
                  loading={isLoadingLugares}
                  error={errors.lugarInscripcion} 
                />
                <SelectField 
                  label="Idioma" 
                  name="idioma" 
                  value={formData.idioma || ''} 
                  onChange={handleChange} 
                  options={idiomas.map(i => i.nombre)} 
                  loading={loadingFields.idioma}
                  error={errors.idioma}
                />
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
              </div>
            </div>

            {/* Section 3: Ubicación y Educación */}
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">Lugar de Procedencia</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SelectField label="Región" name="procedenciaRegion" value={formData.procedenciaRegion || ''} onChange={handleChange} options={[...new Set(regiones.map(r => r.nombre))]} loading={loadingFields.procedenciaRegion} error={errors.procedenciaRegion} />
                  <SelectField label="Provincia" name="procedenciaProvincia" value={formData.procedenciaProvincia || ''} onChange={handleChange} options={[...new Set(procedenciaProvincias.map(p => p.nombre))]} loading={loadingFields.procedenciaProvincia} error={errors.procedenciaProvincia} />
                  <SelectField label="Distrito" name="procedenciaDistrito" value={formData.procedenciaDistrito || ''} onChange={handleChange} options={[...new Set(procedenciaDistritos.map(d => d.nombre))]} loading={loadingFields.procedenciaDistrito} error={errors.procedenciaDistrito} />
                </div>
                <div className="w-full">
                  <InputField label="Dirección" name="procedenciaDireccion" value={formData.procedenciaDireccion || ''} onChange={handleChange} error={errors.procedenciaDireccion} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                  <div className="w-8 h-8 bg-lime-50 text-lime-600 rounded-lg flex items-center justify-center">
                    <School size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">Colegio de Procedencia</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SelectField label="Región" name="colegioRegion" value={formData.colegioRegion || ''} onChange={handleChange} options={[...new Set(regiones.map(r => r.nombre))]} loading={loadingFields.colegioRegion} error={errors.colegioRegion} />
                  <SelectField label="Provincia" name="colegioProvincia" value={formData.colegioProvincia || ''} onChange={handleChange} options={[...new Set(colegioProvincias.map(p => p.nombre))]} loading={loadingFields.colegioProvincia} error={errors.colegioProvincia} />
                  <SelectField label="Distrito" name="colegioDistrito" value={formData.colegioDistrito || ''} onChange={handleChange} options={[...new Set(colegioDistritos.map(d => d.nombre))]} loading={loadingFields.colegioDistrito} error={errors.colegioDistrito} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <SelectField 
                      label="Colegio" 
                      name="schoolName" 
                      value={formData.schoolName || ''} 
                      onChange={handleChange} 
                      options={[...new Set(colegiosList.map(c => c.nombre))]} 
                      loading={loadingFields.schoolName} 
                      error={errors.schoolName}
                    />
                  </div>
                  <InputField label="Nivel" name="schoolLevel" value={formData.schoolLevel || ''} readOnly disabled />
                  <InputField label="Tipo de Colegio" name="schoolType" value={formData.schoolType || ''} readOnly disabled />
                  <InputField label="Monto a Pagar" name="monto_pago" value={formData.monto_pago ? `S/ ${Number(formData.monto_pago).toFixed(2)}` : 'S/ 0.00'} readOnly disabled />
                  <SelectField label="Año Egreso" name="graduationYear" value={formData.graduationYear || ''} onChange={handleChange} options={aniosEgreso.map(a => a.anio.toString())} placeholder="Seleccione año" error={errors.graduationYear} />
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
                <SelectField label="Región" name="nacimientoRegion" value={formData.nacimientoRegion || ''} onChange={handleChange} options={[...new Set(regiones.map(r => r.nombre))]} loading={loadingFields.nacimientoRegion} error={errors.nacimientoRegion} />
                <SelectField label="Provincia" name="nacimientoProvincia" value={formData.nacimientoProvincia || ''} onChange={handleChange} options={[...new Set(nacimientoProvincias.map(p => p.nombre))]} loading={loadingFields.nacimientoProvincia} error={errors.nacimientoProvincia} />
                <SelectField label="Distrito" name="nacimientoDistrito" value={formData.nacimientoDistrito || ''} onChange={handleChange} options={[...new Set(nacimientoDistritos.map(d => d.nombre))]} loading={loadingFields.nacimientoDistrito} error={errors.nacimientoDistrito} />
                <InputField label="Ubigeo" name="nacimientoUbigeo" value={formData.nacimientoUbigeo || ''} onChange={handleChange} readOnly disabled />
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
                <div className="relative">
                  <InputField 
                    label="DNI Apoderado" 
                    name="apoderadoDni" 
                    value={formData.apoderadoDni || ''} 
                    onChange={handleChange} 
                    maxLength={8}
                    placeholder="12345678"
                    loading={isSearchingApoderadoDni}
                    error={errors.apoderadoDni}
                  />
                </div>
                <InputField label="Nombres Apoderado" name="apoderadoNombres" value={formData.apoderadoNombres || ''} onChange={handleChange} error={errors.apoderadoNombres} />
                <InputField label="Apellido Paterno Apoderado" name="apoderadoApellidoPaterno" value={formData.apoderadoApellidoPaterno || ''} onChange={handleChange} error={errors.apoderadoApellidoPaterno} />
                <InputField label="Apellido Materno Apoderado" name="apoderadoApellidoMaterno" value={formData.apoderadoApellidoMaterno || ''} onChange={handleChange} error={errors.apoderadoApellidoMaterno} />
                <InputField label="Móvil Apoderado" name="apoderadoMovil" value={formData.apoderadoMovil || ''} onChange={handleChange} error={errors.apoderadoMovil} />
              </div>
              
              <div className="flex flex-wrap gap-8 bg-stone-50 p-6 rounded-2xl border border-stone-100">
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
                              value={formData.conadisNumber || ''} 
                              onChange={handleChange} 
                              placeholder="Ingrese nro. carnet"
                              error={errors.conadisNumber}
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

            <div className="flex flex-col gap-4 pt-8 border-t border-stone-100">
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                  <AlertCircle size={18} />
                  {submitError}
                </div>
              )}
              <div className="flex gap-4">
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
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[3rem] shadow-2xl border border-stone-100 text-center space-y-8 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-stone-800">¡Pre-Inscripción Exitosa!</h2>
                  <p className="text-stone-500 text-sm">Su registro ha sido procesado correctamente.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => generatePDF(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-all"
                >
                  <Download size={14} />
                  Descargar PDF
                </button>
              </div>
            </div>

            {/* HTML Summary instead of PDF Preview to avoid iframe blocking */}
            <div className="w-full bg-stone-50 rounded-2xl border border-stone-200 shadow-inner p-8 text-left">
              <div className="flex justify-between items-start mb-6 border-b border-stone-200 pb-6">
                <div>
                  <h3 className="text-xl font-bold text-uniq-cyan mb-1">UNIVERSIDAD NACIONAL INTERCULTURAL DE QUILLABAMBA</h3>
                  <p className="text-stone-500 font-medium">FICHA DE PRE-INSCRIPCIÓN - {appSettings?.descripcionAdmision?.toUpperCase() || "ADMISIÓN 2026"}</p>
                </div>
                {logoImage && (
                  <img src={logoImage.src} alt="Logo UNIQ" className="w-16 h-16 object-contain" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-stone-800 border-b border-stone-200 pb-2 mb-3">Datos de Inscripción</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold text-stone-600">Código:</span> {registrationId ? registrationId.toString().padStart(6, '0') : 'Pendiente'}</p>
                      <p><span className="font-semibold text-stone-600">Carrera:</span> {formData.career}</p>
                      <p><span className="font-semibold text-stone-600">Modalidad:</span> {formData.modality}</p>
                      <p><span className="font-semibold text-stone-600">Lugar de Inscripción:</span> {formData.lugarInscripcion}</p>
                      <p><span className="font-semibold text-stone-600">Monto a Pagar:</span> S/ {(() => {
                        const selectedModality = modalidades.find(m => m.nombre === formData.modality);
                        if (selectedModality) {
                          const type = (formData.schoolType || '').toLowerCase();
                          if (type.includes('privad') || type.includes('particular')) {
                            return Number(selectedModality.costo_privado || 0).toFixed(2);
                          } else {
                            return Number(selectedModality.costo_nacional || 0).toFixed(2);
                          }
                        }
                        return '0.00';
                      })()}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-800 border-b border-stone-200 pb-2 mb-3">Datos Personales</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold text-stone-600">DNI:</span> {formData.dni}</p>
                      <p><span className="font-semibold text-stone-600">Nombres:</span> {formData.names}</p>
                      <p><span className="font-semibold text-stone-600">Apellidos:</span> {formData.paternalSurname} {formData.maternalSurname}</p>
                      <p><span className="font-semibold text-stone-600">Email:</span> {formData.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-stone-800 border-b border-stone-200 pb-2 mb-3">Datos Académicos</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold text-stone-600">Colegio:</span> {formData.schoolName}</p>
                      <p><span className="font-semibold text-stone-600">Nivel/Tipo:</span> {formData.schoolLevel} / {formData.schoolType}</p>
                      <p><span className="font-semibold text-stone-600">Año de Egreso:</span> {formData.graduationYear}</p>
                    </div>
                  </div>

                  <div className="bg-uniq-cyan/5 p-4 rounded-xl border border-uniq-cyan/20">
                    <h4 className="font-bold text-uniq-cyan mb-2 flex items-center gap-2">
                      <AlertCircle size={16} />
                      Importante
                    </h4>
                    <p className="text-sm text-stone-600">
                      Por favor, descargue e imprima su Ficha de Pre-Inscripción en formato PDF. Deberá presentarla el día del examen junto con su DNI original.
                    </p>
                    <button 
                      onClick={() => generatePDF(true)}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-uniq-cyan text-white font-bold rounded-xl hover:bg-uniq-blue transition-all"
                    >
                      <Download size={18} />
                      Descargar Ficha PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <button 
                onClick={onCancel}
                className="px-12 py-4 bg-stone-100 text-stone-600 font-bold rounded-2xl hover:bg-stone-200 transition-all uppercase text-sm"
              >
                Finalizar y Volver al Inicio
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
          <h2 className="text-2xl font-bold text-stone-800">Cronograma de {appSettings?.descripcionAdmision || "Admisión 2026"}</h2>
          <p className="text-stone-500">Fechas oficiales del proceso de selección.</p>
        </div>
      </div>

      <div className="space-y-4">
        {cronograma.filter((item: any) => item.status !== 'completado').map((item: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-5 bg-stone-50 rounded-2xl border border-stone-100 hover:border-cyan-200 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${item.status === 'activo' ? 'bg-cyan-500 animate-pulse' : 'bg-cyan-400'}`} />
              <div>
                <p className="font-bold text-stone-800">{item.event}</p>
                <p className="text-xs text-stone-500">{item.date}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.status === 'activo' ? 'bg-uniq-cyan/10 text-uniq-cyan' : 'bg-uniq-cyan/5 text-uniq-cyan'}`}>
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

const TemarioView = ({ onBack, temario }: { onBack: () => void, temario: any[] }) => (
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
  const [selectedYear, setSelectedYear] = useState<string>('todos');
  const [selectedModality, setSelectedModality] = useState<string>('todos');
  const [selectedCareer, setSelectedCareer] = useState<string>('todos');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<string | null>(null);

  const filterOptions = useMemo(() => {
    const data = resultados.length > 0 ? resultados : [
      { id: 1, pos: 1, name: "GARCIA LOPEZ, MARCO", score: "18.450", status: "INGRESA", ano_admision: 2026, modalidad: "EXAMEN ORDINARIO", carrera: "CONTABILIDAD", colegio_procedencia: "I.E. MATEO PUMACAHUA", dni: "60473384" },
      { id: 2, pos: 2, name: "QUISPE MAMANI, ELENA", score: "17.920", status: "INGRESA", ano_admision: 2026, modalidad: "EXAMEN ORDINARIO", carrera: "INGENIERÍA CIVIL", colegio_procedencia: "I.E. SAN JUAN", dni: "61538488" }
    ];
    return {
      years: Array.from(new Set(data.map(r => r.ano_admision).filter(Boolean))).sort((a, b) => Number(b) - Number(a)),
      modalities: Array.from(new Set(data.map(r => r.modalidad).filter(Boolean))).sort(),
      careers: Array.from(new Set(data.map(r => r.carrera).filter(Boolean))).sort()
    };
  }, [resultados]);

  const fallbackData = [
      { id: 1, pos: 1, name: "GARCIA LOPEZ, MARCO", score: "18.450", status: "INGRESA", ano_admision: 2026, modalidad: "EXAMEN ORDINARIO", carrera: "CONTABILIDAD", colegio_procedencia: "I.E. MATEO PUMACAHUA", dni: "60473384" },
      { id: 2, pos: 2, name: "QUISPE MAMANI, ELENA", score: "17.920", status: "INGRESA", ano_admision: 2026, modalidad: "EXAMEN ORDINARIO", carrera: "INGENIERÍA CIVIL", colegio_procedencia: "I.E. SAN JUAN", dni: "61538488" },
      { id: 3, pos: 3, name: "HUAMAN ROJAS, JORGE", score: "17.100", status: "INGRESA", ano_admision: 2026, modalidad: "PRIMEROS PUESTOS", carrera: "ECONOMÍA", colegio_procedencia: "I.E. MATEO PUMACAHUA", dni: "61650914" },
      { id: 4, pos: 4, name: "TORRES VELA, LUCIA", score: "16.850", status: "NO INGRESA", ano_admision: 2026, modalidad: "EXAMEN ORDINARIO", carrera: "ECOTURISMO", colegio_procedencia: "I.E. SAN JUAN", dni: "60202667" },
  ];

  const currentData = resultados.length > 0 ? resultados : fallbackData;

  const filteredResults = currentData.filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) || (r.dni && r.dni.includes(search));
    const matchYear = selectedYear === 'todos' || String(r.ano_admision) === selectedYear;
    const matchModality = selectedModality === 'todos' || r.modalidad === selectedModality;
    const matchCareer = selectedCareer === 'todos' || r.carrera === selectedCareer;
    return matchSearch && matchYear && matchModality && matchCareer;
  });

  const handleUpload = () => {
    setUploading(true);
    // Simulate file selection and upload
    setTimeout(() => {
      setUploading(false);
      setPdfFile(`Resultados_${appSettings?.descripcionAdmision?.replace(/ /g, '_') || "Admision_2026"}_Final.pdf`);
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl flex items-center justify-center shrink-0">
              <FileSearch size={24} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-stone-800">Resultados de Admisión</h2>
              <p className="text-stone-500 text-sm md:text-base">Consulta de puntajes y vacantes adjudicadas.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isAdmin && (
              <a 
                href="/formato_resultados.csv" 
                download 
                className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-700 rounded-2xl font-bold text-sm hover:bg-stone-200 transition-all w-full md:w-auto justify-center"
              >
                <FileDown size={18} />
                Descargar Plantilla
              </a>
            )}
            {pdfFile && (
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl font-bold text-sm hover:bg-uniq-cyan/20 transition-all w-full md:w-auto justify-center"
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
                className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-stone-800 transition-all disabled:opacity-50 w-full md:w-auto justify-center"
              >
                <UploadCloud size={18} />
                {uploading ? 'Subiendo...' : 'Subir CSV de Resultados'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative col-span-1 md:col-span-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por DNI o Apellidos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            />
          </div>
          
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(e.target.value)}
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          >
            <option value="todos">Todos los Años</option>
            {filterOptions.years.map((y, i) => (
              <option key={i} value={String(y)}>{y}</option>
            ))}
          </select>
          <select 
            value={selectedModality} 
            onChange={e => setSelectedModality(e.target.value)}
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          >
            <option value="todos">Todas las Modalidades</option>
            {filterOptions.modalities.map((m, i) => (
              <option key={i} value={String(m)}>{m}</option>
            ))}
          </select>
          <select 
            value={selectedCareer} 
            onChange={e => setSelectedCareer(e.target.value)}
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none md:col-span-2"
          >
            <option value="todos">Todas las Carreras</option>
            {filterOptions.careers.map((c, i) => (
              <option key={i} value={String(c)}>{c}</option>
            ))}
          </select>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start gap-4 mb-8">
          <AlertCircle className="text-amber-600 shrink-0" size={24} />
          <div>
            <p className="font-bold text-amber-900">Resultados Oficiales</p>
            <p className="text-sm text-amber-800">Haz clic en cualquier postulante para ver más detalles sobre su admisión (Colegio de procedencia, modalidad y carrera adjudicada).</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Puesto</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Postulante</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 hidden sm:table-cell">Carrera</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Puntaje</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500 font-medium">No se encontraron resultados para los filtros seleccionados.</td>
                </tr>
              ) : filteredResults.map((res, i) => (
                <React.Fragment key={res.id || i}>
                  <tr 
                    onClick={() => setExpandedId(expandedId === (res.id || i) ? null : (res.id || i))}
                    className="hover:bg-stone-50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-mono font-bold text-stone-400">#{res.pos}</td>
                    <td className="p-4 font-bold text-stone-800 group-hover:text-uniq-cyan transition-colors">
                      {res.name}
                      <span className="block sm:hidden text-xs text-stone-500 font-normal mt-1">{res.carrera}</span>
                    </td>
                    <td className="p-4 text-sm text-stone-600 font-medium hidden sm:table-cell">{res.carrera || 'No especificada'}</td>
                    <td className="p-4 font-mono text-uniq-cyan font-bold">{res.score}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${res.status?.toLowerCase().includes('ingresa') && !res.status?.toLowerCase().includes('no') ? 'bg-cyan-50 text-cyan-700' : 'bg-stone-100 text-stone-500'}`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedId === (res.id || i) && (
                      <motion.tr 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <td colSpan={5} className="p-0 border-b-0">
                          <div className="bg-stone-50/50 p-6 md:px-10 border-t border-stone-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">DNI</p>
                                <p className="text-sm font-medium text-stone-800">{res.dni || '***'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Año Admisión</p>
                                <p className="text-sm font-medium text-stone-800">{res.ano_admision || 'No registrado'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Modalidad</p>
                                <p className="text-sm font-medium text-stone-800 truncate" title={res.modalidad}>{res.modalidad || 'No registrada'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Colegio de Procedencia</p>
                                <p className="text-sm font-medium text-stone-800 truncate" title={res.colegio_procedencia}>{res.colegio_procedencia || 'No registrado'}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-100 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all"
          >
            <ChevronLeft size={18} />
            Volver
          </button>
          <div className="text-sm text-stone-400 font-medium">
            Total: {filteredResults.length} registros
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ControlPreinscripcionView = ({ registrations, onUpdateStatus, userRole, onBack, onNewInscripcion, appSettings }: { registrations: any[], onUpdateStatus: (id: string, status: string) => void, userRole?: string, onBack: () => void, onNewInscripcion: () => void, appSettings?: any }) => {
  const [search, setSearch] = useState('');
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (appSettings?.imagenPortalUrl) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = appSettings.imagenPortalUrl;
      img.onload = () => setLogoImage(img);
      img.onerror = () => console.error("Failed to load logo image");
    }
  }, [appSettings?.imagenPortalUrl]);

  const handleDownloadPDF = async (app: any) => {
    const formData = {
      names: app.nombres,
      paternalSurname: app.apellido_paterno,
      maternalSurname: app.apellido_materno,
      dni: app.dni,
      email: app.email,
      phone: app.telefono,
      birthDate: app.fecha_nacimiento,
      gender: app.genero,
      language: app.idioma,
      languageRead: app.idioma_lee === 1,
      languageSpeak: app.idioma_habla === 1,
      languageWrite: app.idioma_escribe === 1,
      originRegion: app.procedenciaRegion,
      originProvince: app.procedenciaProvincia,
      originDistrict: app.procedenciaDistrito,
      originAddress: app.procedenciaDireccion,
      birthRegion: app.nacimientoRegion,
      birthProvince: app.nacimientoProvincia,
      birthDistrict: app.nacimientoDistrito,
      schoolName: app.schoolName,
      schoolType: app.schoolType,
      schoolLevel: app.schoolLevel,
      schoolRegion: app.colegioRegion,
      schoolProvince: app.colegioProvincia,
      schoolDistrict: app.colegioDistrito,
      schoolYear: app.graduationYear,
      career: app.carrera,
      modality: app.modalidad,
      lugarInscripcion: app.lugar_inscripcion,
      apoderadoNames: app.apoderado_nombres,
      apoderadoPaternalSurname: app.apoderado_apellido_paterno,
      apoderadoMaternalSurname: app.apoderado_apellido_materno,
      apoderadoDni: app.apoderado_dni,
      apoderadoPhone: app.apoderado_movil,
      isDeportista: app.is_deportista === 1,
      isVictimaViolencia: app.is_victima_violencia === 1,
      isServicioMilitar: app.is_servicio_militar === 1,
      isPrimerosPuestos: app.is_primeros_puestos === 1,
      discapacidad: app.discapacidad === 1,
      conadisNumber: app.conadis_number
    };

    try {
      await generatePreinscriptionPDF(
        formData,
        appSettings,
        appSettings?.pdfSettings || {},
        logoImage,
        app.id,
        undefined,
        app.monto_pago ? parseFloat(app.monto_pago) : 0,
        true
      );
    } catch (e) {
      console.error("Error generating PDF", e);
      alert("Error al generar el PDF");
    }
  };
  
  const filteredApplicants = registrations.filter(app => {
    const searchLower = search.toLowerCase();
    const fullName = `${app.nombres} ${app.apellido_paterno} ${app.apellido_materno}`.toLowerCase();
    const regCode = `UNIQ-${appSettings?.descripcionAdmision?.replace('Admisión ', '') || "2026"}-${app.id}`.toLowerCase();
    
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
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Móvil Apoderado</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Estado</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Código Seguridad</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Modificado por</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredApplicants.map((app, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-mono text-[10px] font-bold text-stone-500">UNIQ-{appSettings?.descripcionAdmision?.replace('Admisión ', '') || "2026"}-{app.id}</td>
                  <td className="p-4 font-bold text-stone-800 text-sm">{app.nombres} {app.apellido_paterno} {app.apellido_materno}</td>
                  <td className="p-4 text-sm text-stone-600">{app.dni}</td>
                  <td className="p-4 text-sm text-stone-600">{app.carrera}</td>
                  <td className="p-4 text-sm text-stone-600">{app.apoderado_movil}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      app.estado === 'Validado' ? 'bg-uniq-cyan/10 text-uniq-cyan' : 
                      app.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.estado}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-stone-600">
                    {app.security_code || '-'}
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
                      <button 
                        onClick={() => handleDownloadPDF(app)}
                        className="text-uniq-cyan hover:text-cyan-700 font-bold text-[10px] uppercase tracking-wider"
                      >
                        PDF
                      </button>
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

const AdminDashboardView = ({ registrations, userRole, onBack, onConfigCronograma, onConfigCarreras, onConfigUsers, onConfigRegistrados, onConfigModalidades, onConfigDatabase, onCheckDb, isCheckingDb, dbCheckResult, onConfigDni, onConfigInicio, onConfigAdmision, onConfigColegios, onConfigIdiomas, appSettings }: { registrations: any[], userRole?: string, onBack: () => void, onConfigCronograma: () => void, onConfigCarreras: () => void, onConfigUsers: () => void, onConfigRegistrados: () => void, onConfigModalidades: () => void, onConfigDatabase: () => void, onCheckDb: () => void, isCheckingDb: boolean, dbCheckResult: any, onConfigDni: () => void, onConfigInicio: () => void, onConfigAdmision: () => void, onConfigColegios: () => void, onConfigIdiomas: () => void, appSettings?: any }) => {
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
              title: "Gestión de Preinscripción",
              description: "Configuración y parámetros del proceso de preinscripción.",
              actions: [
                { icon: School, label: "Gestionar Colegios", color: "bg-amber-50 text-amber-600", action: onConfigColegios },
              ]
            },
            {
              title: "Gestión de Postulantes",
              description: "Administración de registros, pagos y resultados del proceso.",
              actions: [
                { icon: ShieldCheck, label: "Habilitar Postulantes", color: "bg-lime-50 text-lime-600", action: onConfigRegistrados },
                { icon: Languages, label: "Gestionar Idiomas", color: "bg-blue-50 text-blue-600", action: onConfigIdiomas },
                { icon: FileText, label: "Reporte de Pagos", color: "bg-uniq-cyan/10 text-uniq-cyan" },
                { icon: UploadCloud, label: "Subir Resultados", color: "bg-uniq-cyan/10 text-uniq-cyan" },
              ]
            },
            {
              title: "Configuración del Portal",
              description: "Personalización de la información pública y parámetros del examen.",
              actions: [
                { icon: Calendar, label: "Configurar Admisión", color: "bg-uniq-cyan/10 text-uniq-cyan", action: onConfigAdmision },
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
  const [idiomas, setIdiomas] = useState<any[]>([]);
  const [paises, setPaises] = useState<any[]>([]);
  const [ubigeoNacimientoList, setUbigeoNacimientoList] = useState<any[]>([]);
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>({});
  const [modalidades, setModalidades] = useState<any[]>([]);

  const calculatedMontoPago = useMemo(() => {
    const selectedModality = modalidades.find(m => m.nombre === formData.modality);
    if (!selectedModality) return 0;
    
    const type = (formData.schoolType || '').toLowerCase();
    if (type.includes('privad') || type.includes('particular')) {
      return Number(selectedModality.costo_privado) || 0;
    } else {
      return Number(selectedModality.costo_nacional) || 0;
    }
  }, [formData.modality, formData.schoolType, modalidades]);

  useEffect(() => {
    if (calculatedMontoPago !== formData.monto_pago) {
      setFormData(prev => ({ ...prev, monto_pago: calculatedMontoPago }));
    }
  }, [calculatedMontoPago, formData.monto_pago]);

  useEffect(() => {
    fetch('/api/modalidades')
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => {
        if (Array.isArray(data)) {
          setModalidades(data.filter((m: any) => !m.eliminado));
        }
      })
      .catch(err => console.error('Error fetching modalidades:', err));

    fetch('/api/mapeo-idiomas')
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => setIdiomas(data))
      .catch(err => console.error('Error fetching idiomas:', err));

    fetch('/api/paises')
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => setPaises(data))
      .catch(err => console.error('Error fetching paises:', err));

    fetch('/api/ubigeo-nacimiento')
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => setUbigeoNacimientoList(data))
      .catch(err => console.error('Error fetching ubigeo-nacimiento:', err));
  }, []);

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
            pais: data.pais || 'Perú',
            nacionalidad: data.nacionalidad || 'Peruana',
            email: data.email,
            phone: data.telefono,
            schoolName: data.schoolName || '',
            schoolType: data.schoolType || '',
            graduationYear: data.graduationYear?.toString() || '',
            career: data.carrera,
            modality: data.modalidad,
            lugarInscripcion: data.lugar_inscripcion || 'QUILLABAMBA',
            colegioRegion: data.colegioRegion || '',
            colegioProvincia: data.colegioProvincia || '',
            colegioDistrito: data.colegioDistrito || '',
            procedenciaRegion: data.procedenciaRegion || '',
            procedenciaProvincia: data.procedenciaProvincia || '',
            procedenciaDistrito: data.procedenciaDistrito || '',
            procedenciaDireccion: data.procedenciaDireccion || '',
            nacimientoRegion: data.nacimientoRegion || '',
            nacimientoProvincia: data.nacimientoProvincia || '',
            nacimientoDistrito: data.nacimientoDistrito || '',
            nacimientoUbigeo: data.nacimientoUbigeo || '',
            idioma: data.idioma || '',
            idiomaLee: data.idioma_lee || false,
            idiomaHabla: data.idioma_habla || false,
            idiomaEscribe: data.idioma_escribe || false,
            nombreApoderado: data.nombre_apoderado || '',
            celularApoderado: data.apoderado_movil || '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'idioma') {
      setLoadingFields(prev => ({ ...prev, idioma: true }));
      fetch(`/api/mapeo-idiomas/${value}`)
        .then(res => res.ok ? res.json() : Promise.reject(res.status))
        .then(data => {
          setFormData(prev => ({
            ...prev,
            idioma: value
          }));
        })
        .catch(err => {
          console.error('Error fetching idioma mapping:', err);
          setFormData(prev => ({
            ...prev,
            idioma: value
          }));
        })
        .finally(() => setLoadingFields(prev => ({ ...prev, idioma: false })));
    } else if (name === 'pais') {
      const selectedPais = paises.find(p => p.pais === value);
      setFormData(prev => ({ 
        ...prev, 
        pais: value, 
        nacionalidad: selectedPais ? selectedPais.nacionalidad : '' 
      }));
    } else if (name === 'nacimientoUbigeo') {
      const selectedUbigeo = ubigeoNacimientoList.find(u => u.ubigeo.toString() === value);
      if (selectedUbigeo) {
        setFormData(prev => ({ 
          ...prev, 
          nacimientoUbigeo: value,
          nacimientoRegion: selectedUbigeo.region,
          nacimientoProvincia: selectedUbigeo.provincia,
          nacimientoDistrito: selectedUbigeo.distrito
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
                  value={formData.dni || ''}
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
                  value={formData.names || ''}
                  onChange={(e) => setFormData({...formData, names: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Apellido Paterno</label>
                <input 
                  type="text" 
                  value={formData.paternalSurname || ''}
                  onChange={(e) => setFormData({...formData, paternalSurname: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Carrera</label>
              <select 
                value={formData.career || ''}
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
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">País</label>
                <select 
                  name="pais"
                  value={formData.pais || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none"
                >
                  <option value="">Seleccione País</option>
                  {paises.map(p => <option key={p.id} value={p.pais}>{p.pais}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Nacionalidad</label>
                <input 
                  type="text" 
                  name="nacionalidad"
                  value={formData.nacionalidad || ''}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-2xl outline-none text-stone-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Móvil</label>
                <input 
                  type="text" 
                  name="movil"
                  value={formData.movil || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Idioma</label>
                <div className="relative">
                  <select 
                    name="idioma"
                    value={formData.idioma || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none"
                  >
                    <option value="">Seleccione Idioma</option>
                    {idiomas.map(i => <option key={i.id} value={i.idioma}>{i.idioma}</option>)}
                  </select>
                  {loadingFields.idioma && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                      <RefreshCw size={14} className="animate-spin text-uniq-cyan" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Lugar de Nacimiento (Ubigeo)</label>
              <select 
                name="nacimientoUbigeo"
                value={formData.nacimientoUbigeo || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none"
              >
                <option value="">Seleccione Ubigeo</option>
                {ubigeoNacimientoList.map(u => <option key={u.ubigeo} value={u.ubigeo}>{u.distrito} ({u.ubigeo})</option>)}
              </select>
            </div>
            {formData.nacimientoUbigeo && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Región</label>
                  <input type="text" value={formData.nacimientoRegion || ''} readOnly className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none text-stone-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Provincia</label>
                  <input type="text" value={formData.nacimientoProvincia || ''} readOnly className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none text-stone-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Distrito</label>
                  <input type="text" value={formData.nacimientoDistrito || ''} readOnly className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none text-stone-500" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Modalidad</label>
              <select 
                name="modality"
                value={formData.modality || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none"
              >
                <option value="">Seleccione Modalidad</option>
                {modalidades.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Monto a Pagar</label>
              <input 
                type="text" 
                value={formData.monto_pago ? `S/ ${Number(formData.monto_pago).toFixed(2)}` : 'S/ 0.00'} 
                readOnly 
                disabled 
                className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-2xl outline-none text-stone-500 font-bold" 
              />
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
                    value={formData.username || ''}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="Username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Contraseña</label>
                  <input 
                    type="password" 
                    value={formData.password || ''}
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
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  placeholder="Nombre completo"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Rol</label>
                <select 
                  value={formData.role || ''}
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

const LocationManagementView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [regiones, setRegiones] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [distritos, setDistritos] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [selectedProvincia, setSelectedProvincia] = useState<any>(null);

  const fetchRegiones = async () => {
    const res = await fetch('/api/regiones');
    if (res.ok) {
      const data = await res.json();
      setRegiones(data);
    }
  };

  const fetchProvincias = async (regionId: number) => {
    const res = await fetch(`/api/provincias?region_id=${regionId}`);
    if (res.ok) {
      const data = await res.json();
      setProvincias(data);
    }
  };

  const fetchDistritos = async (provinciaId: number) => {
    const res = await fetch(`/api/distritos?provincia_id=${provinciaId}`);
    if (res.ok) {
      const data = await res.json();
      setDistritos(data);
    }
  };

  useEffect(() => {
    fetchRegiones();
  }, []);

  useEffect(() => {
    if (selectedRegion) fetchProvincias(selectedRegion.id);
    else setProvincias([]);
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedProvincia) fetchDistritos(selectedProvincia.id);
    else setDistritos([]);
  }, [selectedProvincia]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ nombre: string; descripcion: string }>({ nombre: '', descripcion: '' });
  const [addingType, setAddingType] = useState<'region' | 'provincia' | 'distrito' | null>(null);
  const [addData, setAddData] = useState<{ nombre: string; descripcion: string }>({ nombre: '', descripcion: '' });

  const handleAdd = async (type: 'region' | 'provincia' | 'distrito', data: any) => {
    const endpoint = type === 'region' ? 'regiones' : type === 'provincia' ? 'provincias' : 'distritos';
    const body = { ...data, ...(type === 'provincia' ? { region_id: selectedRegion.id } : type === 'distrito' ? { provincia_id: selectedProvincia.id } : {}), ubigeo: '00' };
    
    const res = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (res.ok) {
      if (type === 'region') fetchRegiones();
      else if (type === 'provincia') fetchProvincias(selectedRegion.id);
      else fetchDistritos(selectedProvincia.id);
      setAddingType(null);
      setAddData({ nombre: '', descripcion: '' });
    }
  };

  const handleEdit = async (type: 'region' | 'provincia' | 'distrito', id: number, data: any) => {
    const endpoint = type === 'region' ? 'regiones' : type === 'provincia' ? 'provincias' : 'distritos';
    const res = await fetch(`/api/${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      if (type === 'region') fetchRegiones();
      else if (type === 'provincia') fetchProvincias(selectedRegion.id);
      else fetchDistritos(selectedProvincia.id);
      setEditingId(null);
    }
  };

  const handleDelete = async (type: 'region' | 'provincia' | 'distrito', id: number) => {
    if (!confirm("¿Está seguro de eliminar este elemento?")) return;
    const endpoint = type === 'region' ? 'regiones' : type === 'provincia' ? 'provincias' : 'distritos';
    const res = await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
    
    if (res.ok) {
      if (type === 'region') { setSelectedRegion(null); fetchRegiones(); }
      else if (type === 'provincia') { setSelectedProvincia(null); fetchProvincias(selectedRegion.id); }
      else fetchDistritos(selectedProvincia.id);
    }
  };

  const renderCard = (item: any, type: 'region' | 'provincia' | 'distrito') => (
    <div key={item.id} className={`p-4 rounded-xl mb-3 shadow-sm border ${editingId === item.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-stone-100'}`}>
      {editingId === item.id ? (
        <div className="space-y-2">
          <input className="w-full p-2 border rounded" value={editData.nombre || ''} onChange={e => setEditData({...editData, nombre: e.target.value})} placeholder="Nombre" />
          <input className="w-full p-2 border rounded" value={editData.descripcion || ''} onChange={e => setEditData({...editData, descripcion: e.target.value})} placeholder="Descripción" />
          <div className="flex gap-2">
            <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => handleEdit(type, item.id, editData)}>Guardar</button>
            <button className="bg-stone-300 text-white px-3 py-1 rounded" onClick={() => setEditingId(null)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="font-bold text-stone-800">{item.nombre}</div>
          <div className="text-sm text-stone-500 mb-2">{item.descripcion}</div>
          <div className="flex gap-2">
            <button className="text-blue-600 text-xs font-semibold" onClick={() => { setEditingId(item.id); setEditData({ nombre: item.nombre, descripcion: item.descripcion }); }}>Editar</button>
            <button className="text-red-600 text-xs font-semibold" onClick={() => handleDelete(type, item.id)}>Eliminar</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-stone-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-900">Gestión de Ubicaciones</h2>
            <p className="text-stone-500 mt-1">Administra regiones, provincias y distritos para la preinscripción.</p>
          </div>
          <button onClick={onBack} className="px-6 py-3 bg-stone-100 text-stone-700 rounded-2xl font-bold text-sm hover:bg-stone-200 transition-all">Volver al Panel</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {/* Regiones */}
          <div className="flex flex-col border border-stone-200 rounded-3xl p-4 bg-stone-100/50">
            <h3 className="font-bold text-lg mb-4 text-stone-700">Regiones</h3>
            <div className="flex-1 overflow-y-auto pr-2">
              {regiones.map(r => (
                <div key={r.id} className={`cursor-pointer ${selectedRegion?.id === r.id ? 'ring-2 ring-blue-400' : ''}`} onClick={() => { setSelectedRegion(r); setSelectedProvincia(null); }}>
                  {renderCard(r, 'region')}
                </div>
              ))}
            </div>
            <button onClick={() => setAddingType('region')} className="mt-4 w-full bg-stone-900 text-white p-3 rounded-xl font-semibold hover:bg-stone-800">+ Agregar Región</button>
          </div>

          {/* Provincias */}
          <div className="flex flex-col border border-stone-200 rounded-3xl p-4 bg-stone-100/50">
            <h3 className="font-bold text-lg mb-4 text-stone-700">Provincias</h3>
            <div className="flex-1 overflow-y-auto pr-2">
              {selectedRegion ? provincias.map(p => (
                <div key={p.id} className={`cursor-pointer ${selectedProvincia?.id === p.id ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSelectedProvincia(p)}>
                  {renderCard(p, 'provincia')}
                </div>
              )) : <p className="text-stone-400 text-sm italic">Selecciona una región</p>}
            </div>
            {selectedRegion && <button onClick={() => setAddingType('provincia')} className="mt-4 w-full bg-stone-900 text-white p-3 rounded-xl font-semibold hover:bg-stone-800">+ Agregar Provincia</button>}
          </div>

          {/* Distritos */}
          <div className="flex flex-col border border-stone-200 rounded-3xl p-4 bg-stone-100/50">
            <h3 className="font-bold text-lg mb-4 text-stone-700">Distritos</h3>
            <div className="flex-1 overflow-y-auto pr-2">
              {selectedProvincia ? distritos.map(d => renderCard(d, 'distrito')) : <p className="text-stone-400 text-sm italic">Selecciona una provincia</p>}
            </div>
            {selectedProvincia && <button onClick={() => setAddingType('distrito')} className="mt-4 w-full bg-stone-900 text-white p-3 rounded-xl font-semibold hover:bg-stone-800">+ Agregar Distrito</button>}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {addingType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm">
            <h3 className="font-bold text-xl mb-4">Agregar {addingType}</h3>
            <input className="w-full p-3 border rounded-xl mb-3" value={addData.nombre || ''} onChange={e => setAddData({...addData, nombre: e.target.value})} placeholder="Nombre" />
            <input className="w-full p-3 border rounded-xl mb-4" value={addData.descripcion || ''} onChange={e => setAddData({...addData, descripcion: e.target.value})} placeholder="Descripción" />
            <div className="flex gap-3">
              <button className="flex-1 bg-stone-900 text-white p-3 rounded-xl font-semibold" onClick={() => handleAdd(addingType, addData)}>Guardar</button>
              <button className="flex-1 bg-stone-200 text-stone-700 p-3 rounded-xl font-semibold" onClick={() => setAddingType(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const mapDBToPdfFormData = (app: any) => ({
  names: app.nombres,
  paternalSurname: app.apellido_paterno,
  maternalSurname: app.apellido_materno,
  dni: app.dni,
  email: app.email,
  movil: app.movil,
  phone: app.movil,
  birthDate: app.fecha_nacimiento ? app.fecha_nacimiento.split('T')[0] : '',
  gender: app.genero,
  pais: app.pais,
  nacionalidad: app.nacionalidad,
  idioma: app.idioma,
  languageRead: app.idioma_lee == 1 || app.idioma_lee === true || app.idioma_lee === '1',
  languageSpeak: app.idioma_habla == 1 || app.idioma_habla === true || app.idioma_habla === '1',
  languageWrite: app.idioma_escribe == 1 || app.idioma_escribe === true || app.idioma_escribe === '1',
  procedenciaRegion: app.procedenciaRegion,
  procedenciaProvincia: app.procedenciaProvincia,
  procedenciaDistrito: app.procedenciaDistrito,
  procedenciaDireccion: app.procedenciaDireccion,
  nacimientoRegion: app.nacimientoRegion,
  nacimientoProvincia: app.nacimientoProvincia,
  nacimientoDistrito: app.nacimientoDistrito,
  nacimientoUbigeo: app.nacimientoUbigeo,
  schoolName: app.schoolName,
  schoolType: app.schoolType,
  schoolLevel: app.schoolLevel,
  colegioRegion: app.colegioRegion,
  colegioProvincia: app.colegioProvincia,
  colegioDistrito: app.colegioDistrito,
  graduationYear: app.graduationYear,
  career: app.carrera,
  modality: app.modalidad,
  lugarInscripcion: app.lugar_inscripcion,
  apoderadoNombres: app.apoderado_nombres,
  apoderadoApellidoPaterno: app.apoderado_apellido_paterno,
  apoderadoApellidoMaterno: app.apoderado_apellido_materno,
  apoderadoDni: app.apoderado_dni,
  apoderadoTelefono: app.apoderado_movil,
  apoderadoMovil: app.apoderado_movil,
  isDeportista: app.is_deportista == 1 || app.is_deportista === true || app.is_deportista === '1',
  isVictimaViolencia: app.is_victima_violencia == 1 || app.is_victima_violencia === true || app.is_victima_violencia === '1',
  isServicioMilitar: app.is_servicio_militar == 1 || app.is_servicio_militar === true || app.is_servicio_militar === '1',
  isPrimerosPuestos: app.is_primeros_puestos == 1 || app.is_primeros_puestos === true || app.is_primeros_puestos === '1',
  discapacidad: app.discapacidad == 1 || app.discapacidad === true || app.discapacidad === '1',
  conadisNumber: app.conadis_number,
  securityCode: app.security_code || `C${app.dni?.substring(app.dni.length - 4)}`
});

const PreinscripcionesManagementView: React.FC<{ 
  onBack: () => void, 
  appSettings?: any, 
  onConfigPDF: () => void,
  onViewFicha: (reg: any) => void
}> = ({ onBack, appSettings, onConfigPDF, onViewFicha }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const filteredRegistrations = registrations.filter(reg => 
    (reg.nombres?.toLowerCase().includes(search.toLowerCase())) ||
    (reg.apellido_paterno?.toLowerCase().includes(search.toLowerCase())) ||
    (reg.apellido_materno?.toLowerCase().includes(search.toLowerCase())) ||
    (reg.dni?.includes(search)) ||
    (reg.carrera?.toLowerCase().includes(search.toLowerCase())) ||
    (reg.id?.toString().includes(search))
  );

  useEffect(() => {
    if (appSettings?.imagenPortalUrl) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = appSettings.imagenPortalUrl;
      img.onload = () => setLogoImage(img);
      img.onerror = () => console.error("Failed to load logo image");
    }
  }, [appSettings?.imagenPortalUrl]);

  const handleDownloadPDF = async (app: any) => {
    const pdfFormData = mapDBToPdfFormData(app);

    try {
      await generatePreinscriptionPDF(
        pdfFormData,
        appSettings,
        appSettings?.pdfSettings || {},
        logoImage,
        app.id,
        undefined,
        app.monto_pago ? parseFloat(app.monto_pago) : 0,
        true
      );
    } catch (e) {
      console.error("Error generating PDF", e);
      alert("Error al generar el PDF");
    }
  };

  const handlePreviewPDF = async (app: any) => {
    const pdfFormData = mapDBToPdfFormData(app);

    try {
      const dataUri = await generatePreinscriptionPDF(
        pdfFormData,
        appSettings,
        appSettings?.pdfSettings || {},
        logoImage,
        app.id,
        undefined,
        app.monto_pago ? parseFloat(app.monto_pago) : 0,
        false
      );
      if (typeof dataUri === 'string') {
        setPreviewUrl(dataUri);
        setShowPreviewModal(true);
      }
    } catch (e) {
      console.error("Error generating PDF preview", e);
      alert("Error al generar la previsualización del PDF");
    }
  };

  const fetchRegistrations = async () => {
    try {
      const res = await fetch('/api/registrations');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCreate = () => {
    setEditingId(null);
    setError(null);
    setFormData({
      names: '',
      paternalSurname: '',
      maternalSurname: '',
      dni: '',
      email: '',
      movil: '',
      birthDate: '',
      gender: '',
      schoolName: '',
      schoolType: '',
      graduationYear: '',
      career: '',
      modality: '',
      lugarInscripcion: '',
      hasSpecialConditions: false,
      conadisNumber: '',
      isDeportista: false,
      isVictimaViolencia: false,
      isServicioMilitar: false,
      isPrimerosPuestos: false,
      apoderadoDni: '',
      apoderadoNombres: '',
      apoderadoApellidoPaterno: '',
      apoderadoApellidoMaterno: ''
    });
    setShowModal(true);
  };

  const handleEdit = (reg: any) => {
    setEditingId(reg.id);
    setError(null);
    setFormData({
      names: reg.nombres,
      paternalSurname: reg.apellido_paterno,
      maternalSurname: reg.apellido_materno,
      dni: reg.dni,
      email: reg.email,
      movil: reg.telefono,
      birthDate: reg.fecha_nacimiento ? reg.fecha_nacimiento.split('T')[0] : '',
      gender: reg.genero,
      schoolName: reg.schoolName || '',
      schoolType: reg.schoolType || '',
      graduationYear: reg.graduationYear?.toString() || '',
      career: reg.carrera,
      modality: reg.modalidad,
      lugarInscripcion: reg.lugar_inscripcion,
      hasSpecialConditions: reg.has_special_conditions,
      conadisNumber: reg.conadis_number,
      isDeportista: reg.is_deportista,
      isVictimaViolencia: reg.is_victima_violencia,
      isServicioMilitar: reg.is_servicio_militar,
      isPrimerosPuestos: reg.is_primeros_puestos,
      apoderadoDni: reg.apoderado_dni,
      apoderadoNombres: reg.apoderado_nombres,
      apoderadoApellidoPaterno: reg.apoderado_apellido_paterno,
      apoderadoApellidoMaterno: reg.apoderado_apellido_materno
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta preinscripción?')) {
      try {
        await fetch(`/api/registrations/${id}`, { method: 'DELETE' });
        fetchRegistrations();
      } catch (err) {
        console.error('Error deleting registration:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/registrations/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({...formData, movil: formData.movil})
        });
      } else {
        res = await fetch(`/api/admin/registrations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({...formData, movil: formData.movil})
        });
      }
      
      if (!res.ok) {
        let errorMsg = 'Ocurrió un error al guardar';
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } else {
          errorMsg = `Error del servidor: ${res.status}`;
        }
        setError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      setShowModal(false);
      setIsSubmitting(false);
      fetchRegistrations();
    } catch (err) {
      console.error('Error saving registration:', err);
      setError('Error de conexión');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-stone-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Gestión de Preinscritos</h1>
            <p className="text-stone-500">Crear, modificar o eliminar preinscripciones</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nombre, DNI, carrera o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-uniq-cyan/20 focus:border-uniq-cyan outline-none transition-all"
            />
          </div>
          <button onClick={onConfigPDF} className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-colors">
            <LucideIcons.Settings size={20} />
            <span>Configurar PDF</span>
          </button>
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-uniq-cyan text-white font-bold rounded-xl hover:bg-cyan-700 transition-colors">
            <Plus size={20} />
            <span>Crear Preinscripción</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="animate-spin text-uniq-cyan" size={32} /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">DNI</th>
                  <th className="px-6 py-4 font-semibold">Postulante</th>
                  <th className="px-6 py-4 font-semibold">Carrera</th>
                  <th className="px-6 py-4 font-semibold">Móvil Apoderado</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRegistrations.map(reg => (
                  <tr key={reg.id} className="hover:bg-stone-50/50">
                    <td className="px-6 py-4 font-mono text-stone-500">{reg.id}</td>
                    <td className="px-6 py-4 font-medium">{reg.dni}</td>
                    <td className="px-6 py-4">{reg.nombres} {reg.apellido_paterno} {reg.apellido_materno}</td>
                    <td className="px-6 py-4">{reg.carrera}</td>
                    <td className="px-6 py-4">{reg.apoderado_movil}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onViewFicha(reg)} className="p-2 text-stone-600 hover:bg-stone-50 rounded-lg" title="Ver Ficha"><Search size={16} /></button>
                        <button onClick={() => handlePreviewPDF(reg)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Previsualizar PDF"><Eye size={16} /></button>
                        <button onClick={() => handleDownloadPDF(reg)} className="p-2 text-uniq-cyan hover:bg-cyan-50 rounded-lg" title="Descargar PDF"><FileText size={16} /></button>
                        <button onClick={() => handleEdit(reg)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(reg.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h2 className="text-xl font-bold text-stone-800">Previsualización de Ficha</h2>
                <p className="text-sm text-stone-500">Vista previa del documento PDF generado</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = previewUrl || '';
                    link.download = `Ficha_Preinscripcion.pdf`;
                    link.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-uniq-cyan text-white text-sm font-bold rounded-xl hover:bg-cyan-700 transition-colors"
                >
                  <Download size={18} />
                  <span>Descargar</span>
                </button>
                <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-stone-200 p-4 overflow-hidden">
              {previewUrl ? (
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full rounded-xl shadow-inner bg-white"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-stone-500">
                  No se pudo cargar la previsualización
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Editar' : 'Crear'} Preinscripción</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-stone-100 rounded-full"><X size={20} /></button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">DNI</label>
                  <input type="text" value={formData.dni || ''} onChange={e => setFormData({...formData, dni: e.target.value})} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Correo Electrónico</label>
                  <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Móvil</label>
                  <input type="text" value={formData.movil || ''} onChange={e => setFormData({...formData, movil: e.target.value})} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nombres</label>
                  <input type="text" value={formData.names || ''} onChange={e => setFormData({...formData, names: e.target.value})} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Apellido Paterno</label>
                  <input type="text" value={formData.paternalSurname || ''} onChange={e => setFormData({...formData, paternalSurname: e.target.value})} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Apellido Materno</label>
                  <input type="text" value={formData.maternalSurname || ''} onChange={e => setFormData({...formData, maternalSurname: e.target.value})} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Carrera</label>
                  <input type="text" value={formData.career || ''} onChange={e => setFormData({...formData, career: e.target.value})} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Modalidad</label>
                  <input type="text" value={formData.modality || ''} onChange={e => setFormData({...formData, modality: e.target.value})} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl" required />
                </div>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-stone-100">
                {editingId ? (
                  <button 
                    type="button" 
                    onClick={() => {
                      const regToDownload = registrations.find(r => r.id === editingId);
                      if (regToDownload) handleDownloadPDF(regToDownload);
                    }} 
                    className="flex items-center gap-2 px-4 py-2 text-uniq-cyan font-bold hover:bg-cyan-50 rounded-xl transition-colors"
                  >
                    <Download size={18} /> Descargar PDF
                  </button>
                ) : <div></div>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-stone-500 font-bold hover:bg-stone-50 rounded-xl">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-uniq-cyan text-white font-bold rounded-xl hover:bg-cyan-700 disabled:opacity-50">
                    {isSubmitting && <RefreshCw size={16} className="animate-spin" />}
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </form>
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
                    value={formData.dni || ''}
                    onChange={(e) => setFormData({...formData, dni: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="8 dígitos"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Nombres</label>
                  <input 
                    type="text" 
                    value={formData.nombres || ''}
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
                    value={formData.apellido_paterno || ''}
                    onChange={(e) => setFormData({...formData, apellido_paterno: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="APELLIDO PATERNO"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Apellido Materno</label>
                  <input 
                    type="text" 
                    value={formData.apellido_materno || ''}
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
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Teléfono (Opcional)</label>
                  <input 
                    type="text" 
                    value={formData.telefono || ''}
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

const FichaPDFView: React.FC<{ preinscripcion: any, onBack: () => void, appSettings: any }> = ({ preinscripcion, onBack, appSettings }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    if (appSettings?.imagenPortalUrl) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = appSettings.imagenPortalUrl;
      img.onload = () => setLogoImage(img);
    }
  }, [appSettings?.imagenPortalUrl]);

  useEffect(() => {
    if (preinscripcion) {
      const generate = async () => {
        const pdfFormData = mapDBToPdfFormData(preinscripcion);

        const dataUri = await generatePreinscriptionPDF(
          pdfFormData,
          appSettings,
          appSettings?.pdfSettings || {},
          logoImage,
          preinscripcion.id,
          undefined,
          preinscripcion.monto_pago ? parseFloat(preinscripcion.monto_pago) : 0,
          false
        );
        if (typeof dataUri === 'string') {
          setPdfUrl(dataUri);
        }
      };
      generate();
    }
  }, [preinscripcion, appSettings, logoImage]);

  if (!preinscripcion) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto p-6 flex flex-col h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-stone-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Ficha de Preinscripción</h1>
            <p className="text-stone-500">{preinscripcion.nombres} {preinscripcion.apellido_paterno} {preinscripcion.apellido_materno}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const link = document.createElement('a');
              link.href = pdfUrl || '';
              link.download = `Ficha_${preinscripcion.dni}.pdf`;
              link.click();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-uniq-cyan text-white font-bold rounded-xl hover:bg-cyan-700 transition-colors"
          >
            <Download size={20} />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden flex">
        {/* Left: Data Summary */}
        <div className="w-1/3 border-r border-stone-100 overflow-y-auto p-8 bg-stone-50/30">
          <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
            <Info size={20} className="text-uniq-cyan" />
            Datos del Postulante
          </h3>
          
          <div className="space-y-6">
            <section>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Información Personal</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">DNI:</span>
                  <span className="font-semibold text-stone-800">{preinscripcion.dni}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Género:</span>
                  <span className="font-semibold text-stone-800">{preinscripcion.genero}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Fecha Nac.:</span>
                  <span className="font-semibold text-stone-800">{preinscripcion.fecha_nacimiento ? new Date(preinscripcion.fecha_nacimiento).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Postulación</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Carrera:</span>
                  <span className="font-semibold text-stone-800">{preinscripcion.carrera}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Modalidad:</span>
                  <span className="font-semibold text-stone-800">{preinscripcion.modalidad}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Monto:</span>
                  <span className="font-semibold text-uniq-cyan">S/ {Number(preinscripcion.monto_pago || 0).toFixed(2)}</span>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Estado</h4>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                preinscripcion.estado === 'Validado' ? 'bg-green-100 text-green-700' :
                preinscripcion.estado === 'Observado' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {preinscripcion.estado}
              </div>
            </section>
          </div>
        </div>

        {/* Right: PDF Viewer */}
        <div className="flex-1 bg-stone-200">
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
            {pdfUrl ? (
              <Viewer 
                fileUrl={pdfUrl}
                plugins={[defaultLayoutPluginInstance]}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="animate-spin text-uniq-cyan" size={32} />
              </div>
            )}
          </Worker>
        </div>
      </div>
    </motion.div>
  );
};
