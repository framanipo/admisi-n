/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';

// --- Types ---

type Step = 'personal' | 'academic' | 'career' | 'success';
type View = 'login' | 'preinscripcion' | 'guia' | 'cronograma' | 'reglamento' | 'temario' | 'resultados' | 'admin-dashboard' | 'control-preinscripcion';
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
  "Ecoturismo"
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

export default function App() {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [view, setView] = useState<View>('login');
  const [step, setStep] = useState<Step>('personal');
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = (username: string, role: Role) => {
    setUser({ username, role });
    if (role === 'admin') setView('admin-dashboard');
    else if (role === 'registrador') setView('preinscripcion');
    else setView('guia');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep('success');
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
      {view !== 'login' && (
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
                {(user?.role === 'admin' || user?.role === 'registrador') && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setView('preinscripcion')}
                      className={`transition-colors py-2 px-3 rounded-lg ${view === 'preinscripcion' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                    >
                      Preinscripción
                    </button>
                    <button 
                      onClick={() => setView('control-preinscripcion')}
                      className={`transition-colors py-2 px-3 rounded-lg ${view === 'control-preinscripcion' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50 hover:text-stone-800'}`}
                    >
                      Control
                    </button>
                  </div>
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

      <main className={`${view === 'login' ? '' : 'max-w-5xl mx-auto px-6 py-12'}`}>
        <AnimatePresence mode="wait">
          {view === 'login' ? (
            <LoginView key="login" onLogin={handleLogin} />
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

                    <div className="mt-10 flex justify-end">
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
            <ControlPreinscripcionView key="control-view" />
          ) : view === 'cronograma' ? (
            <CronogramaView key="cronograma-view" />
          ) : view === 'reglamento' ? (
            <ReglamentoView key="reglamento-view" />
          ) : view === 'temario' ? (
            <TemarioView key="temario-view" />
          ) : view === 'resultados' ? (
            <ResultadosView key="resultados-view" isAdmin={user?.role === 'admin'} />
          ) : view === 'admin-dashboard' ? (
            <AdminDashboardView key="admin-view" />
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

const LoginView = ({ onLogin }: { onLogin: (u: string, r: Role) => void, key?: string }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('visualizador');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'fmamani' && password === 'Ast3r1sk') {
      onLogin(username, role);
      setError(false);
    } else {
      setError(true);
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
              Credenciales incorrectas
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

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Tipo de Cuenta</label>
            <div className="grid grid-cols-3 gap-3">
              {(['admin', 'registrador', 'visualizador'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-tighter transition-all ${role === r ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300'}`}
                >
                  {r === 'admin' ? <Shield size={14} className="mx-auto mb-1" /> : r === 'registrador' ? <ShieldCheck size={14} className="mx-auto mb-1" /> : <Eye size={14} className="mx-auto mb-1" />}
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 mt-4"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-400">¿Problemas para acceder? Contacte a soporte técnico.</p>
        </div>
      </motion.div>
    </div>
  );
};

const CronogramaView = () => (
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
    </div>
  </motion.div>
);

const ReglamentoView = () => (
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
    </div>
  </motion.div>
);

const TemarioView = () => (
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
    </div>
  </motion.div>
);

const ResultadosView = ({ isAdmin }: { isAdmin: boolean, key?: string }) => {
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
      </div>
    </motion.div>
  );
};

const ControlPreinscripcionView = () => {
  const [search, setSearch] = useState('');
  
  const applicants = [
    { id: 'UNIQ-001', name: 'GARCIA LOPEZ, MARCO', dni: '72839401', career: 'Ingeniería Civil', status: 'Validado', indigenous: 'No' },
    { id: 'UNIQ-002', name: 'QUISPE MAMANI, ELENA', dni: '45678912', career: 'Ecoturismo', status: 'Pendiente', indigenous: 'Andino' },
    { id: 'UNIQ-003', name: 'HUAMAN ROJAS, JORGE', dni: '12345678', career: 'Ingeniería de Alimentos', status: 'Validado', indigenous: 'No' },
    { id: 'UNIQ-004', name: 'TORRES VELA, LUCIA', dni: '87654321', career: 'Ingeniería Agronómica Tropical', status: 'Observado', indigenous: 'Amazónico' },
  ];

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
              {applicants.map((app, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-stone-400">{app.id}</td>
                  <td className="p-4 font-bold text-stone-800 text-sm">{app.name}</td>
                  <td className="p-4 text-sm text-stone-600">{app.dni}</td>
                  <td className="p-4 text-sm text-stone-600">{app.career}</td>
                  <td className="p-4 text-sm text-stone-600">{app.indigenous}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      app.status === 'Validado' ? 'bg-emerald-100 text-emerald-700' : 
                      app.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-wider">Ver Detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboardView = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Total Postulantes</p>
        <p className="text-4xl font-bold text-stone-800">1,248</p>
        <div className="mt-4 flex items-center gap-2 text-emerald-600 text-xs font-bold">
          <ChevronRight size={14} className="-rotate-90" />
          +12% esta semana
        </div>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Pagos Validados</p>
        <p className="text-4xl font-bold text-stone-800">856</p>
        <div className="mt-4 flex items-center gap-2 text-stone-400 text-xs font-bold">
          68% del total
        </div>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Vacantes Disponibles</p>
        <p className="text-4xl font-bold text-emerald-700">320</p>
        <div className="mt-4 flex items-center gap-2 text-stone-400 text-xs font-bold">
          4 carreras activas
        </div>
      </div>
    </div>

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
  </motion.div>
);
