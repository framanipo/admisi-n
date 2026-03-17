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
  Download
} from 'lucide-react';

// --- Types ---

type Step = 'personal' | 'academic' | 'career' | 'success';
type View = 'preinscripcion' | 'guia';

interface FormData {
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
}

const INITIAL_DATA: FormData = {
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

const InputField = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
      {Icon && <Icon size={14} />}
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-stone-800 placeholder:text-stone-400"
    />
  </div>
);

const SelectField = ({ label, icon: Icon, options, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
      {Icon && <Icon size={14} />}
      {label}
    </label>
    <select
      {...props}
      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-stone-800 appearance-none cursor-pointer"
    >
      <option value="">Seleccione una opción</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default function App() {
  const [view, setView] = useState<View>('preinscripcion');
  const [step, setStep] = useState<Step>('personal');
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 'personal') setStep('academic');
    else if (step === 'academic') setStep('career');
  };

  const handleBack = () => {
    if (step === 'academic') setStep('personal');
    else if (step === 'career') setStep('academic');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-900/10">
              U
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-stone-800">UNIQ</h1>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">Admisión 2026</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-6 text-sm font-medium text-stone-500">
              <button 
                onClick={() => setView('preinscripcion')}
                className={`transition-colors ${view === 'preinscripcion' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'}`}
              >
                Preinscripción
              </button>
              <button 
                onClick={() => setView('guia')}
                className={`transition-colors ${view === 'guia' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'}`}
              >
                Guía del Postulante
              </button>
              <a href="#" className="hover:text-emerald-600 transition-colors">Resultados</a>
            </nav>
            <button className="px-5 py-2 bg-stone-900 text-white text-sm font-semibold rounded-full hover:bg-stone-800 transition-all shadow-md">
              Contacto
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {view === 'preinscripcion' ? (
            <motion.div
              key="preinscripcion-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-3xl mx-auto"
            >
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
                      <InputField 
                        label="DNI / Carnet Extranjería" 
                        name="dni" 
                        value={formData.dni} 
                        onChange={handleChange} 
                        placeholder="8 dígitos"
                        icon={IdCard}
                      />
                      <InputField 
                        label="Nombres" 
                        name="names" 
                        value={formData.names} 
                        onChange={handleChange} 
                        placeholder="Nombres completos"
                      />
                      <InputField 
                        label="Apellido Paterno" 
                        name="paternalSurname" 
                        value={formData.paternalSurname} 
                        onChange={handleChange} 
                      />
                      <InputField 
                        label="Apellido Materno" 
                        name="maternalSurname" 
                        value={formData.maternalSurname} 
                        onChange={handleChange} 
                      />
                      <InputField 
                        label="Fecha de Nacimiento" 
                        name="birthDate" 
                        type="date" 
                        value={formData.birthDate} 
                        onChange={handleChange} 
                        icon={Calendar}
                      />
                      <SelectField 
                        label="Género" 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange} 
                        options={["Masculino", "Femenino", "Otro"]}
                      />
                      <InputField 
                        label="Correo Electrónico" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="ejemplo@correo.com"
                        icon={Mail}
                      />
                      <InputField 
                        label="Celular" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="999 999 999"
                        icon={Phone}
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
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField 
                          label="Tipo de Colegio" 
                          name="schoolType" 
                          value={formData.schoolType} 
                          onChange={handleChange} 
                          options={["Estatal", "Particular"]}
                        />
                        <InputField 
                          label="Año de Egreso" 
                          name="graduationYear" 
                          value={formData.graduationYear} 
                          onChange={handleChange} 
                          placeholder="Ej. 2024"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="Departamento" name="department" value={formData.department} onChange={handleChange} icon={MapPin} />
                        <InputField label="Provincia" name="province" value={formData.province} onChange={handleChange} />
                        <InputField label="Distrito" name="district" value={formData.district} onChange={handleChange} />
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
                        />
                        <SelectField 
                          label="Modalidad de Admisión" 
                          name="modality" 
                          value={formData.modality} 
                          onChange={handleChange} 
                          options={MODALITIES}
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
            </motion.div>
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
