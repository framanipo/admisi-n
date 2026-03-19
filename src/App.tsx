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
  Check
} from 'lucide-react';

// --- Types ---

type Step = 'personal' | 'academic' | 'career' | 'success';
type View = 'landing' | 'login' | 'preinscripcion' | 'guia' | 'cronograma' | 'reglamento' | 'temario' | 'resultados' | 'admin-dashboard' | 'control-preinscripcion';
type Role = 'admin' | 'registrador' | 'visualizador';

interface UserAuth {
  username: string;
  role: Role;
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
}

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
  graduationYear: '',
  career: '',
  modality: 'Ordinario',
  indigenousPeople: 'No',
};

const CAREERS = [
  "Ingeniería Agronómica Tropical",
  "Ingeniería de Alimentos",
  "Ingeniería Civil",
  "Ecoturismo",
  "Contabilidad",
  "Economía"
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
      className={`w-full px-4 py-2.5 bg-white border ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-stone-200 focus:ring-emerald-500/20 focus:border-emerald-500'} rounded-lg outline-none transition-all text-stone-800 placeholder:text-stone-400`}
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
      className={`w-full px-4 py-2.5 bg-white border ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-stone-200 focus:ring-emerald-500/20 focus:border-emerald-500'} rounded-lg outline-none transition-all text-stone-800 appearance-none cursor-pointer`}
    >
      <option value="">Seleccione una opción</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{error}</p>}
  </div>
);

const LandingPage = ({ onPreRegister, onLogin }: { onPreRegister: () => void, onLogin: () => void }) => {
  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-900/20">
              U
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-stone-800 leading-tight">UNIQ</h1>
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
              className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Proceso de Admisión Abierto
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-stone-900 leading-[1.1] tracking-tight">
              Tu futuro comienza <span className="text-emerald-600">aquí.</span>
            </h2>
            <p className="text-lg text-stone-500 leading-relaxed max-w-lg">
              Únete a la Universidad Nacional Intercultural de Quillabamba y sé parte de una comunidad académica que valora la excelencia y la diversidad cultural.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onPreRegister}
                className="px-10 py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-all shadow-2xl shadow-stone-900/20 flex items-center justify-center gap-2 group"
              >
                Iniciar Preinscripción
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
                src="https://picsum.photos/seed/uniq-campus-quillabamba/800/1000" 
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
            {[
              { 
                name: "Ingeniería Agronómica Tropical", 
                img: "tropical-agri-intercultural",
                desc: "Desarrollo agrícola sostenible con saberes ancestrales y tecnología moderna."
              },
              { 
                name: "Ingeniería de Alimentos", 
                img: "food-tech-culture",
                desc: "Transformación de productos nativos con estándares globales de calidad."
              },
              { 
                name: "Ingeniería Civil", 
                img: "civil-eng-andes",
                desc: "Infraestructura resiliente integrada al paisaje y cultura regional."
              },
              { 
                name: "Ecoturismo", 
                img: "ecotourism-amazon-culture",
                desc: "Gestión turística que revaloriza el patrimonio natural y cultural."
              },
              { 
                name: "Contabilidad", 
                img: "accounting-intercultural-finance",
                desc: "Gestión financiera transparente para organizaciones diversas y globales."
              },
              { 
                name: "Economía", 
                img: "economy-community-market",
                desc: "Análisis económico para el desarrollo equitativo y sostenible de los pueblos."
              }
            ].map((career, i) => (
              <motion.div 
                key={career.name}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-stone-100 group"
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${career.img}/600/400`} 
                    alt={career.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-bold text-xl text-stone-800 mb-3 leading-tight">{career.name}</h3>
                  <p className="text-sm text-stone-500 mb-6 leading-relaxed">{career.desc}</p>
                  <button className="text-emerald-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                    Ver más <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cronograma Preview */}
      <section className="py-24 px-6 bg-stone-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">Cronograma de <br />Admisión 2026</h2>
              <p className="text-stone-400 text-lg">
                No pierdas la oportunidad de postular. Revisa las fechas clave del proceso actual.
              </p>
              <div className="space-y-4">
                {[
                  { date: "01 Feb - 15 Mar", event: "Inscripciones Ordinario" },
                  { date: "22 de Marzo", event: "Examen de Admisión" },
                  { date: "23 de Marzo", event: "Publicación de Resultados" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-emerald-400 font-mono font-bold">{item.date}</div>
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
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
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
              <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">U</div>
              <h1 className="font-bold text-stone-800 text-xl">UNIQ Admisión</h1>
            </div>
            <p className="text-stone-500 max-w-sm leading-relaxed">
              Universidad Nacional Intercultural de Quillabamba. Formando profesionales para el mundo desde el corazón de la Amazonía cusqueña.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer">
                <Shield size={20} />
              </div>
              <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer">
                <Info size={20} />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-stone-800 mb-6">Proceso</h4>
            <ul className="space-y-4 text-sm text-stone-500">
              <li className="hover:text-emerald-600 cursor-pointer">Guía del Postulante</li>
              <li className="hover:text-emerald-600 cursor-pointer">Cronograma</li>
              <li className="hover:text-emerald-600 cursor-pointer">Reglamento</li>
              <li className="hover:text-emerald-600 cursor-pointer">Resultados</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-stone-800 mb-6">Contacto</h4>
            <ul className="space-y-4 text-sm text-stone-500">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-emerald-600" />
                admision@uniq.edu.pe
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-emerald-600" />
                (084) 282728
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-emerald-600" />
                Quillabamba, Cusco
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400">
          <p>© 2026 UNIQ. Todos los derechos reservados.</p>
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
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setRegistrations(prev => prev.map(reg => reg.id === id ? { ...reg, estado: status } : reg));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleLogin = (username: string, role: Role) => {
    setUser({ username, role });
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
    <div className="min-h-screen bg-[#f8f7f4] text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      {view !== 'login' && view !== 'landing' && (
        <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView(user?.role === 'admin' ? 'admin-dashboard' : 'guia')}>
              <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-900/10">
                U
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight tracking-tight text-stone-800">UNIQ</h1>
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-stone-400">Admisión 2026</p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-6">
              <nav className="flex gap-4 text-xs font-bold uppercase tracking-wider text-stone-500">
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => setView('admin-dashboard')}
                    className={`transition-colors py-2 px-3 rounded-lg ${view === 'admin-dashboard' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                  >
                    Dashboard
                  </button>
                )}
                {(user?.role === 'admin' || user?.role === 'registrador') && (
                  <button 
                    onClick={() => setView('preinscripcion')}
                    className={`transition-colors py-2 px-3 rounded-lg ${view === 'preinscripcion' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                  >
                    Preinscripción
                  </button>
                )}
                {(user?.role === 'admin' || user?.role === 'registrador' || user?.role === 'visualizador') && (
                  <button 
                    onClick={() => setView('control-preinscripcion')}
                    className={`transition-colors py-2 px-3 rounded-lg ${view === 'control-preinscripcion' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                  >
                    Control
                  </button>
                )}
                {user?.role === 'visualizador' && (
                  <button 
                    onClick={() => setView('admin-dashboard')}
                    className={`transition-colors py-2 px-3 rounded-lg ${view === 'admin-dashboard' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                  >
                    Estadísticas
                  </button>
                )}
                <button 
                  onClick={() => setView('cronograma')}
                  className={`transition-colors py-2 px-3 rounded-lg ${view === 'cronograma' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                >
                  Cronograma
                </button>
                <button 
                  onClick={() => setView('reglamento')}
                  className={`transition-colors py-2 px-3 rounded-lg ${view === 'reglamento' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                >
                  Reglamento
                </button>
                <button 
                  onClick={() => setView('temario')}
                  className={`transition-colors py-2 px-3 rounded-lg ${view === 'temario' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                >
                  Temario
                </button>
                <button 
                  onClick={() => setView('resultados')}
                  className={`transition-colors py-2 px-3 rounded-lg ${view === 'resultados' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                >
                  Resultados
                </button>
              </nav>
              
              <div className="h-8 w-px bg-stone-200 mx-2" />
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-stone-400 uppercase leading-none">{user?.role}</p>
                  <p className="text-xs font-bold text-stone-800">{user?.username}</p>
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
            />
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
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${step === 'personal' ? 'text-emerald-600' : 'text-stone-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'personal' ? 'border-emerald-600 bg-emerald-50' : 'border-stone-200'}`}>1</div>
                      Datos Personales
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${step === 'academic' ? 'text-emerald-600' : 'text-stone-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'academic' ? 'border-emerald-600 bg-emerald-50' : 'border-stone-200'}`}>2</div>
                      Académico
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${step === 'career' ? 'text-emerald-600' : 'text-stone-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'career' ? 'border-emerald-600 bg-emerald-50' : 'border-stone-200'}`}>3</div>
                      Carrera
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-600"
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
                        <User className="text-emerald-600" />
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
                        name="documentType"
                        value={formData.documentType}
                        onChange={handleChange}
                        icon={IdCard}
                        options={['DNI', 'Carnet de Extranjería']}
                      />
                      <InputField 
                        label={formData.documentType === 'DNI' ? "DNI" : "Carnet de Extranjería"} 
                        name="dni" 
                        value={formData.dni} 
                        onChange={handleChange} 
                        placeholder={formData.documentType === 'DNI' ? "8 dígitos" : "12 caracteres"}
                        icon={IdCard}
                        error={errors.dni}
                        maxLength={formData.documentType === 'DNI' ? 8 : 12}
                      />
                      <InputField 
                        label="Nombres" 
                        name="names" 
                        value={formData.names} 
                        onChange={handleChange} 
                        placeholder="Nombres completos"
                        error={errors.names}
                      />
                      <InputField 
                        label="Apellido Paterno" 
                        name="paternalSurname" 
                        value={formData.paternalSurname} 
                        onChange={handleChange} 
                        error={errors.paternalSurname}
                      />
                      <InputField 
                        label="Apellido Materno" 
                        name="maternalSurname" 
                        value={formData.maternalSurname} 
                        onChange={handleChange} 
                        error={errors.maternalSurname}
                      />
                      <InputField 
                        label="Fecha de Nacimiento" 
                        name="birthDate" 
                        type="date" 
                        value={formData.birthDate} 
                        onChange={handleChange} 
                        icon={Calendar}
                        error={errors.birthDate}
                      />
                      <SelectField 
                        label="Género" 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange} 
                        options={["Masculino", "Femenino", "Otro"]}
                        error={errors.gender}
                      />
                      <InputField 
                        label="Correo Electrónico" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="ejemplo@correo.com"
                        icon={Mail}
                        error={errors.email}
                      />
                      <InputField 
                        label="Celular" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="999 999 999"
                        icon={Phone}
                        error={errors.phone}
                      />
                      <SelectField 
                        label="¿Pertenece a un Pueblo Andino o Amazónico?" 
                        name="indigenousPeople" 
                        value={formData.indigenousPeople} 
                        onChange={handleChange} 
                        options={["No", "Andino", "Amazónico"]}
                        icon={Globe}
                        error={errors.indigenousPeople}
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
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 group"
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
                        <GraduationCap className="text-emerald-600" />
                        Información Académica
                      </h2>
                      <p className="text-stone-500 mt-2">Detalles sobre su educación secundaria.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <InputField 
                        label="Nombre de la Institución Educativa" 
                        name="schoolName" 
                        value={formData.schoolName} 
                        onChange={handleChange} 
                        placeholder="Nombre completo del colegio"
                        icon={School}
                        error={errors.schoolName}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField 
                          label="Tipo de Colegio" 
                          name="schoolType" 
                          value={formData.schoolType} 
                          onChange={handleChange} 
                          options={["Estatal", "Particular"]}
                          error={errors.schoolType}
                        />
                        <InputField 
                          label="Año de Egreso" 
                          name="graduationYear" 
                          value={formData.graduationYear} 
                          onChange={handleChange} 
                          placeholder="Ej. 2024"
                          error={errors.graduationYear}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="Departamento" name="department" value={formData.department} onChange={handleChange} icon={MapPin} error={errors.department} />
                        <InputField label="Provincia" name="province" value={formData.province} onChange={handleChange} error={errors.province} />
                        <InputField label="Distrito" name="district" value={formData.district} onChange={handleChange} error={errors.district} />
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
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 group"
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
                        <BookOpen className="text-emerald-600" />
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
                          name="modality" 
                          value={formData.modality} 
                          onChange={handleChange} 
                          options={MODALITIES}
                          error={errors.modality}
                        />
                      </div>

                      <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                        <h3 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4">Resumen de Postulación</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-stone-500">Postulante:</span>
                            <span className="font-semibold">{formData.names} {formData.paternalSurname}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">DNI:</span>
                            <span className="font-semibold">{formData.dni}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Carrera:</span>
                            <span className="font-semibold text-emerald-700">{formData.career || 'No seleccionada'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="mt-0.5 text-amber-600">
                          <CheckCircle size={16} />
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Al hacer clic en "Finalizar Preinscripción", declaro que la información proporcionada es verdadera y acepto los términos y condiciones del proceso de admisión UNIQ 2026.
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
                        {isSubmitting ? 'Procesando...' : 'Finalizar Preinscripción'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-3xl shadow-2xl shadow-emerald-900/10 border border-emerald-100 text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-stone-800 mb-4">¡Preinscripción Exitosa!</h2>
                    <p className="text-stone-600 mb-8 max-w-md mx-auto">
                      Tu registro ha sido procesado correctamente. Hemos enviado un correo de confirmación a <span className="font-bold text-stone-800">{formData.email}</span> con los siguientes pasos.
                    </p>
                    
                    <div className="bg-stone-50 p-6 rounded-2xl mb-8 text-left inline-block w-full max-w-sm border border-stone-200">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-3">Código de Registro</p>
                      <p className="text-2xl font-mono font-bold text-emerald-700">UNIQ-2026-8842</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
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
          ) : view === 'control-preinscripcion' ? (
            <ControlPreinscripcionView 
              registrations={registrations} 
              onUpdateStatus={updateRegistrationStatus}
              userRole={user?.role}
              onBack={() => setView(user?.role === 'admin' ? 'admin-dashboard' : 'guia')}
            />
          ) : view === 'cronograma' ? (
            <CronogramaView key="cronograma-view" onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'reglamento' ? (
            <ReglamentoView key="reglamento-view" onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'temario' ? (
            <TemarioView key="temario-view" onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'resultados' ? (
            <ResultadosView key="resultados-view" isAdmin={user?.role === 'admin'} onBack={() => setView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'guia') : 'landing')} />
          ) : view === 'admin-dashboard' ? (
            <AdminDashboardView registrations={registrations} userRole={user?.role} onBack={() => setView('guia')} />
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
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4">Requisitos Generales</h3>
                  <ul className="space-y-3 text-stone-600 text-sm">
                    <li className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      Certificado de estudios secundarios (original).
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      Copia del Documento Nacional de Identidad (DNI).
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      Recibo de pago por derecho de examen de admisión.
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
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
                    <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase">Inscripciones</p>
                        <p className="text-sm font-semibold text-stone-700">01 Feb - 15 Mar</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">ACTIVO</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase">Examen Ordinario</p>
                        <p className="text-sm font-semibold text-stone-700">22 de Marzo, 2026</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase">Resultados</p>
                        <p className="text-sm font-semibold text-stone-700">23 de Marzo, 2026</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pasos */}
              <div className="bg-stone-900 text-white p-10 rounded-[3rem] shadow-2xl">
                <h3 className="text-2xl font-bold mb-10 text-center">Pasos para tu Inscripción</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                    { step: "01", title: "Preinscripción", desc: "Completa el formulario web con tus datos." },
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
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-md border border-stone-100 hover:border-emerald-500 transition-all group cursor-pointer">
                      <div className="w-10 h-10 bg-stone-50 text-stone-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
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
              <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center">
                    <Download size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900">Prospecto de Admisión Completo</h4>
                    <p className="text-sm text-emerald-700/70">Descarga el PDF con toda la información detallada.</p>
                  </div>
                </div>
                <button className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
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
            <h3 className="font-bold text-stone-800 mb-4">UNIQ Admisión</h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              Universidad Nacional Intercultural de Quillabamba. Comprometidos con la excelencia académica y la interculturalidad.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-stone-800 mb-4">Enlaces Rápidos</h3>
            <ul className="text-sm text-stone-500 space-y-2">
              <li><a href="#" className="hover:text-emerald-600">Cronograma de Admisión</a></li>
              <li><a href="#" className="hover:text-emerald-600">Reglamento de Admisión</a></li>
              <li><a href="#" className="hover:text-emerald-600">Temario del Examen</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-stone-800 mb-4">Soporte</h3>
            <p className="text-sm text-stone-500 mb-2">¿Tienes dudas? Contáctanos:</p>
            <p className="text-sm font-bold text-emerald-700">admision@uniq.edu.pe</p>
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

const LoginView = ({ onLogin, onBack }: { onLogin: (u: string, r: Role) => void, onBack: () => void, key?: string }) => {
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
        const user = await response.json();
        onLogin(user.username, user.role);
      } else {
        const data = await response.json();
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Error de conexión: Tiempo de espera agotado (Timeout). Verifique que el servidor de base de datos permita conexiones externas en el puerto 3306.');
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
          <div className="w-16 h-16 bg-emerald-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl shadow-emerald-900/20">
            U
          </div>
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
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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

const CronogramaView = ({ onBack, key }: { onBack: () => void, key?: string }) => (
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
        {[
          { event: "Lanzamiento de Convocatoria", date: "15 de Enero", status: "completado" },
          { event: "Inscripciones Ordinario y Extraordinario", date: "01 Feb - 15 Mar", status: "activo" },
          { event: "Cierre de Inscripciones", date: "15 de Marzo", status: "pendiente" },
          { event: "Examen de Admisión Ordinario", date: "22 de Marzo", status: "pendiente" },
          { event: "Publicación de Resultados", date: "23 de Marzo", status: "pendiente" },
          { event: "Entrega de Constancias", date: "25 - 27 de Marzo", status: "pendiente" },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-5 bg-stone-50 rounded-2xl border border-stone-100 hover:border-blue-200 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${item.status === 'activo' ? 'bg-emerald-500 animate-pulse' : item.status === 'completado' ? 'bg-stone-300' : 'bg-blue-400'}`} />
              <div>
                <p className="font-bold text-stone-800">{item.event}</p>
                <p className="text-xs text-stone-500">{item.date}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.status === 'activo' ? 'bg-emerald-100 text-emerald-700' : item.status === 'completado' ? 'bg-stone-200 text-stone-500' : 'bg-blue-50 text-blue-600'}`}>
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

const ReglamentoView = ({ onBack, key }: { onBack: () => void, key?: string }) => (
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
      </div>

      <div className="mt-10 p-6 bg-stone-900 text-white rounded-3xl flex items-center justify-between">
        <div>
          <p className="font-bold">¿Necesitas el documento completo?</p>
          <p className="text-xs text-stone-400">Descarga el PDF oficial con todos los artículos.</p>
        </div>
        <button className="px-6 py-2 bg-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all">Descargar PDF</button>
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

const TemarioView = ({ onBack, key }: { onBack: () => void, key?: string }) => (
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
        {[
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

const ResultadosView = ({ isAdmin, onBack }: { isAdmin: boolean, onBack: () => void, key?: string }) => {
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<string | null>(null);

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
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
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
                className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-all"
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
            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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
              {[
                { pos: 1, name: "GARCIA LOPEZ, MARCO", score: "18.450", status: "Ingresó" },
                { pos: 2, name: "QUISPE MAMANI, ELENA", score: "17.920", status: "Ingresó" },
                { pos: 3, name: "HUAMAN ROJAS, JORGE", score: "17.100", status: "Ingresó" },
                { pos: 4, name: "TORRES VELA, LUCIA", score: "16.850", status: "No Ingresó" },
              ].map((res, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-stone-400">#{res.pos}</td>
                  <td className="p-4 font-bold text-stone-800">{res.name}</td>
                  <td className="p-4 font-mono text-emerald-700 font-bold">{res.score}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${res.status === 'Ingresó' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
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

const ControlPreinscripcionView = ({ registrations, onUpdateStatus, userRole, onBack }: { registrations: any[], onUpdateStatus: (id: string, status: string) => void, userRole?: string, onBack: () => void }) => {
  const [search, setSearch] = useState('');
  
  const filteredApplicants = registrations.filter(app => 
    (app.dni && app.dni.includes(search)) || 
    (app.nombres && `${app.nombres} ${app.apellido_paterno} ${app.apellido_materno}`.toLowerCase().includes(search.toLowerCase())) ||
    (app.id && app.id.toString().includes(search.toUpperCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ListChecks size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Control de Preinscripciones</h2>
            <p className="text-stone-500">Gestión y validación de postulantes registrados.</p>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por DNI, Nombre o Código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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
                      app.estado === 'Validado' ? 'bg-emerald-100 text-emerald-700' : 
                      app.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.estado}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {app.estado === 'Pendiente' && userRole !== 'visualizador' && (
                        <>
                          <button 
                            onClick={() => onUpdateStatus(app.id, 'Validado')}
                            className="text-emerald-600 hover:text-emerald-700 font-bold text-[10px] uppercase tracking-wider"
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

const AdminDashboardView = ({ registrations, userRole, onBack }: { registrations: any[], userRole?: string, onBack: () => void }) => {
  const total = registrations.length;
  const validated = registrations.filter(r => r.estado === 'Validado').length;
  const pending = registrations.filter(r => r.estado === 'Pendiente').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Total Postulantes</p>
          <p className="text-4xl font-bold text-stone-800">{total.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 text-xs font-bold">
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
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
          <h3 className="text-xl font-bold text-stone-800 mb-6">Acciones Rápidas de Administrador</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: UploadCloud, label: "Subir Resultados", color: "bg-blue-50 text-blue-600" },
              { icon: FileText, label: "Reporte de Pagos", color: "bg-emerald-50 text-emerald-600" },
              { icon: User, label: "Gestionar Usuarios", color: "bg-purple-50 text-purple-600" },
              { icon: Info, label: "Editar Reglamento", color: "bg-amber-50 text-amber-600" },
            ].map((action, i) => (
              <button key={i} className="p-6 rounded-3xl border border-stone-100 hover:border-stone-200 hover:bg-stone-50 transition-all text-left group">
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
