import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Loader2, Image as ImageIcon, Type, List, Palette, Maximize, Layout, X, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generatePreinscriptionPDF } from '../../pdfGenerator';

const ConfiguracionPDFView = ({ onBack, onUpdate, appSettings, setAppSettings }: { onBack: () => void, onUpdate: () => void, appSettings: any, setAppSettings: (settings: any) => void }) => {
  const [pdfSettings, setPdfSettings] = useState<any>({
    titulo: 'FICHA DE PRE-INSCRIPCIÓN',
    subtitulo: appSettings?.descripcionAdmision || 'ADMISIÓN 2026',
    logo_url: '',
    logo_size: 25,
    show_side_logos: true,
    primary_color: '#000000',
    recomendaciones: [
      '1. Imprima esta ficha y preséntela el día del examen de admisión.',
      '2. Debe llevar esta ficha junto con su VOUCHER DE PAGO a la Oficina de Admisión para confirmar su inscripción.',
      '3. Lleve consigo su DNI original y carnet de postulante.',
      '4. Preséntese al local de examen con 1 hora de anticipación.',
      '5. Está prohibido el ingreso con celulares, relojes inteligentes u otros dispositivos electrónicos.'
    ],
    config_data: {
      secciones: {
        declaracion_jurada: 'DECLARACIÓN JURADA',
        ficha_general: 'FICHA GENERAL',
        ficha_informacion: 'FICHA DE INFORMACIÓN',
        ficha_contacto: 'FICHA DE CONTACTO',
        ficha_colegio: 'FICHA DE COLEGIO',
        ficha_universidad: 'FICHA DE UNIVERSIDAD',
        ficha_pago: 'FICHA DE PAGO',
        pagos_caja: 'PAGOS A REALIZAR EN CAJA',
        indicaciones_titulo: 'INDICACIONES PARA REALIZAR SU INSCRIPCIÓN'
      },
      campos: {
        escuela_profesional: 'Escuela profesional',
        dni: 'D.N.I.',
        apellido_paterno: 'Apellido paterno',
        apellido_materno: 'Apellido materno',
        nombres: 'Nombre(s)',
        genero: 'Género',
        fecha_nacimiento: 'Fecha de nacimiento',
        pais_nacionalidad: 'País / nacionalidad',
        lugar_nacimiento: 'Lugar de nacimiento',
        ubigeo_nacimiento: 'Ubigeo de nacimiento',
        lengua_materna: 'Lengua materna',
        habilidades_idioma: 'Habilidades en el idioma',
        condiciones_especiales: 'Condiciones especiales',
        celular_personal: 'Celular personal',
        apoderado: 'Apoderado',
        dni_apoderado: 'DNI del apoderado',
        celular_apoderado: 'Celular del apoderado',
        correo_personal: 'Correo personal',
        ubigeo_residencia: 'Ubigeo de residencia',
        direccion: 'Dirección',
        nombre_colegio: 'Nombre del colegio',
        lugar_colegio: 'Lugar del colegio',
        nivel: 'Nivel',
        gestion_dependencia: 'Gestión dependencia',
        año_egreso: 'Año de egreso',
        universidad: 'Universidad',
        periodo: 'Período',
        modalidad: 'Modalidad',
        lugar_inscripcion: 'Lugar de inscripción',
        tipo_pago: 'Tipo de pago',
        monto_total: 'MONTO TOTAL'
      },
      indicaciones: [
        { step: 'Paso 1: Preinscripción', text: 'Comienza tu inscripción registrando tus datos en nuestra página web. Este paso es esencial para garantizar una inscripción exitosa.' },
        { step: 'Paso 2: Visítenos', text: 'Te invitamos a nuestras instalaciones en la oficina de la dirección de Admisión para continuar con tu proceso.' },
        { step: 'Paso 3: Verificación y Orientación', text: 'Nuestro equipo te proporcionará orientación y verificará los datos ingresados en la preinscripción para asegurarse de que estén correctos.' },
        { step: 'Paso 4: Pago por Derecho de Inscripción', text: 'Realiza el pago correspondiente por el derecho de inscripción de manera segura en la caja de la UNIQ. Esto es fundamental para tu participación en el proceso de admisión.' },
        { step: 'Paso 5: Captura de foto', text: 'Nuestro personal de Dirección de Admisión tomará una foto para asegurar tu identidad.' },
        { step: 'Paso 6: Control biométrico', text: 'Realizaremos una toma de control biométrico para garantizar tu identificación a través de huellas dactilares. Esto es esencial para mantener la seguridad y autenticidad de tus registros.' },
        { step: 'Paso 7: Inscripción final', text: 'Revisa tus datos cuidadosamente y asegúrate de que todo esté correcto. Luego, completa la inscripción oficial en el proceso de admisión.' }
      ],
      documentos_requeridos: [
        '• DNI original vigente y una copia ampliada.',
        '• Certificado de estudios original y visado por la UGEL.',
        '• Recibo de pago por derecho de inscripción.'
      ],
      documentos_requeridos_titulo: 'Recuerda traer los siguientes documentos para finalizar tu inscripción:',
      mensaje_final: 'Una vez completado tu proceso de inscripción, te entregaremos una constancia de inscripción.',
      importante_titulo: 'IMPORTANTE:',
      importante_texto: 'Podrá realizar una única modificación en sus datos personales utilizando el código de seguridad: {securityCode}. Se podrá realizar 1 cambio por única vez en admisión previa coordinación.'
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'sections' | 'fields' | 'steps'>('content');

  useEffect(() => {
    fetch('/api/configuracion-pdf')
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setPdfSettings((prev: any) => ({
            ...prev,
            ...data,
            recomendaciones: Array.isArray(data.recomendaciones) ? data.recomendaciones : prev.recomendaciones,
            config_data: {
              ...prev.config_data,
              ...(data.config_data || {})
            }
          }));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching PDF config:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const url = pdfSettings.logo_url || appSettings?.imagenPortalUrl;
    if (url) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => setLogoImage(img);
      img.onerror = () => {
        console.error("Failed to load logo image");
        setLogoImage(null);
      };
    } else {
      setLogoImage(null);
    }
  }, [pdfSettings.logo_url, appSettings?.imagenPortalUrl]);

  const updatePreview = async () => {
    const dummyData = {
      career: 'Ingeniería de Sistemas',
      modality: 'Examen Ordinario',
      lugarInscripcion: 'Sede Principal',
      dni: '12345678',
      names: 'Juan Perez',
      paternalSurname: 'Gomez',
      maternalSurname: 'Silva',
      birthDate: '2000-01-01',
      gender: 'Masculino',
      email: 'juan@example.com',
      phone: '987654321',
      procedenciaRegion: 'Cusco',
      procedenciaProvincia: 'La Convención',
      procedenciaDistrito: 'Santa Ana',
      procedenciaDireccion: 'Av. Principal 123',
      nacimientoRegion: 'Cusco',
      nacimientoProvincia: 'La Convención',
      nacimientoDistrito: 'Santa Ana',
      schoolName: 'Colegio Nacional San Juan',
      schoolLevel: 'Secundaria',
      schoolType: 'Público',
      graduationYear: '2018',
      colegioRegion: 'Cusco',
      colegioProvincia: 'La Convención',
      colegioDistrito: 'Santa Ana',
      apoderadoDni: '87654321',
      apoderadoNombres: 'Maria Silva',
      apoderadoPhone: '999888777',
      idioma: 'Castellano',
      idiomaLee: true,
      idiomaHabla: true,
      idiomaEscribe: true,
      discapacidad: false
    };

    const result = await generatePreinscriptionPDF(
      dummyData,
      appSettings,
      pdfSettings,
      logoImage,
      '000123',
      'UNIQ-2026-123',
      300.00,
      false
    );
    
    if (result && typeof result === 'string') {
      try {
        const byteString = atob(result.split(',')[1]);
        const mimeString = result.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const url = URL.createObjectURL(blob);
        
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        
        setPreviewUrl(url);
      } catch (e) {
        console.error("Error creating blob for PDF preview", e);
        setPreviewUrl(result);
      }
    }
  };

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(updatePreview, 500);
      return () => clearTimeout(timer);
    }
  }, [pdfSettings, logoImage, appSettings.descripcionAdmision, loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/configuracion-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pdfSettings)
      });
      
      if (response.ok) {
        const next = { ...appSettings, pdfSettings };
        setAppSettings(next);
        localStorage.setItem('appSettings', JSON.stringify(next));
        onUpdate();
        alert('Configuración guardada correctamente');
      } else {
        alert('Error al guardar la configuración');
      }
    } catch (error) {
      console.error("Error saving PDF config:", error);
      alert('Error de conexión al guardar');
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors font-bold group">
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
            <ArrowLeft size={20} />
          </div>
          Volver al panel
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Configuración</p>
            <p className="text-sm font-bold text-stone-600">Ficha de Preinscripción PDF</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-uniq-cyan text-white rounded-2xl font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-uniq-cyan/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden">
            <div className="flex border-b border-stone-100 overflow-x-auto custom-scrollbar">
              <button 
                onClick={() => setActiveTab('content')}
                className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${activeTab === 'content' ? 'text-uniq-cyan bg-uniq-cyan/5 border-b-2 border-uniq-cyan' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <Type size={14} /> General
              </button>
              <button 
                onClick={() => setActiveTab('design')}
                className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${activeTab === 'design' ? 'text-uniq-cyan bg-uniq-cyan/5 border-b-2 border-uniq-cyan' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <Palette size={14} /> Diseño
              </button>
              <button 
                onClick={() => setActiveTab('sections')}
                className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${activeTab === 'sections' ? 'text-uniq-cyan bg-uniq-cyan/5 border-b-2 border-uniq-cyan' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <Layout size={14} /> Secciones
              </button>
              <button 
                onClick={() => setActiveTab('fields')}
                className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${activeTab === 'fields' ? 'text-uniq-cyan bg-uniq-cyan/5 border-b-2 border-uniq-cyan' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <List size={14} /> Campos
              </button>
              <button 
                onClick={() => setActiveTab('steps')}
                className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${activeTab === 'steps' ? 'text-uniq-cyan bg-uniq-cyan/5 border-b-2 border-uniq-cyan' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <RefreshCw size={14} /> Pasos
              </button>
            </div>

            <div className="p-8 max-h-[600px] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === 'content' && (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-stone-800 font-bold">
                        <Type size={18} className="text-uniq-cyan" />
                        <h3>Cabecera y Notas</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Título del Documento</label>
                          <input 
                            type="text" 
                            value={pdfSettings.titulo || ''} 
                            onChange={(e) => setPdfSettings({...pdfSettings, titulo: e.target.value})}
                            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-bold text-stone-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Subtítulo (Admisión)</label>
                          <input 
                            type="text" 
                            value={pdfSettings.subtitulo || ''} 
                            onChange={(e) => setPdfSettings({...pdfSettings, subtitulo: e.target.value})}
                            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-bold text-stone-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Título de Nota Importante</label>
                          <input 
                            type="text" 
                            value={pdfSettings.config_data?.importante_titulo || ''} 
                            onChange={(e) => setPdfSettings({...pdfSettings, config_data: {...pdfSettings.config_data, importante_titulo: e.target.value}})}
                            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-bold text-stone-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Texto de Nota Importante</label>
                          <textarea 
                            value={pdfSettings.config_data?.importante_texto || ''} 
                            onChange={(e) => setPdfSettings({...pdfSettings, config_data: {...pdfSettings.config_data, importante_texto: e.target.value}})}
                            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-medium text-stone-700 h-24 resize-none"
                          />
                          <p className="text-[10px] text-stone-400 italic">Use {'{securityCode}'} para insertar el código dinámico.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-stone-100">
                      <div className="flex items-center gap-2 text-stone-800 font-bold">
                        <List size={18} className="text-uniq-cyan" />
                        <h3>Recomendaciones e Info Final</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Recomendaciones (una por línea)</label>
                          <textarea 
                            value={(pdfSettings.recomendaciones || []).join('\n')} 
                            onChange={(e) => setPdfSettings({...pdfSettings, recomendaciones: e.target.value.split('\n')})}
                            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-medium text-stone-700 h-32 resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Mensaje Final del Documento</label>
                          <input 
                            type="text" 
                            value={pdfSettings.config_data?.mensaje_final || ''} 
                            onChange={(e) => setPdfSettings({...pdfSettings, config_data: {...pdfSettings.config_data, mensaje_final: e.target.value}})}
                            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-medium text-stone-700"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'design' && (
                  <motion.div 
                    key="design"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-stone-800 font-bold">
                        <ImageIcon size={18} className="text-uniq-cyan" />
                        <h3>Identidad Visual</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">URL del Logo Personalizado</label>
                          <div className="flex gap-3">
                            <input 
                              type="text" 
                              value={pdfSettings.logo_url || ''} 
                              onChange={(e) => setPdfSettings({...pdfSettings, logo_url: e.target.value})}
                              placeholder="Dejar vacío para usar logo del portal"
                              className="flex-1 p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-medium text-stone-700"
                            />
                            {pdfSettings.logo_url && (
                              <button 
                                onClick={() => setPdfSettings({...pdfSettings, logo_url: ''})}
                                className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
                              >
                                <X size={20} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 p-6 bg-stone-50 rounded-[2rem] border border-stone-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Maximize size={16} className="text-stone-400" />
                              <label className="text-xs font-bold text-stone-600">Tamaño del Logo</label>
                            </div>
                            <span className="text-xs font-bold text-uniq-cyan">{pdfSettings.logo_size}mm</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="50" 
                            value={pdfSettings.logo_size ?? 25} 
                            onChange={(e) => setPdfSettings({...pdfSettings, logo_size: parseInt(e.target.value)})}
                            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-uniq-cyan"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <div className="flex items-center gap-3">
                            <Layout size={18} className="text-stone-400" />
                            <span className="text-sm font-bold text-stone-700">Logos en ambos lados</span>
                          </div>
                          <button 
                            onClick={() => setPdfSettings({...pdfSettings, show_side_logos: !pdfSettings.show_side_logos})}
                            className={`w-12 h-6 rounded-full relative transition-all ${pdfSettings.show_side_logos ? 'bg-uniq-cyan' : 'bg-stone-200'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pdfSettings.show_side_logos ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-stone-100">
                      <div className="flex items-center gap-2 text-stone-800 font-bold">
                        <Palette size={18} className="text-uniq-cyan" />
                        <h3>Esquema de Colores</h3>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Color Primario (Títulos y Líneas)</label>
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-stone-100 shadow-sm">
                            <input 
                              type="color" 
                              value={pdfSettings.primary_color || '#000000'} 
                              onChange={(e) => setPdfSettings({...pdfSettings, primary_color: e.target.value})}
                              className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer"
                            />
                          </div>
                          <input 
                            type="text" 
                            value={pdfSettings.primary_color || ''} 
                            onChange={(e) => setPdfSettings({...pdfSettings, primary_color: e.target.value})}
                            className="flex-1 p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-mono font-bold text-stone-700"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'sections' && (
                  <motion.div 
                    key="sections"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 text-stone-800 font-bold mb-4">
                      <Layout size={18} className="text-uniq-cyan" />
                      <h3>Títulos de Secciones</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(pdfSettings.config_data?.secciones || {}).map(([key, value]: [string, any]) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">
                            {key.replace(/_/g, ' ')}
                          </label>
                          <input 
                            type="text" 
                            value={value} 
                            onChange={(e) => setPdfSettings({
                              ...pdfSettings, 
                              config_data: {
                                ...pdfSettings.config_data,
                                secciones: { ...pdfSettings.config_data.secciones, [key]: e.target.value }
                              }
                            })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-uniq-cyan transition-all font-bold text-stone-700 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'fields' && (
                  <motion.div 
                    key="fields"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 text-stone-800 font-bold mb-4">
                      <List size={18} className="text-uniq-cyan" />
                      <h3>Etiquetas de Campos</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(pdfSettings.config_data?.campos || {}).map(([key, value]: [string, any]) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">
                            {key.replace(/_/g, ' ')}
                          </label>
                          <input 
                            type="text" 
                            value={value} 
                            onChange={(e) => setPdfSettings({
                              ...pdfSettings, 
                              config_data: {
                                ...pdfSettings.config_data,
                                campos: { ...pdfSettings.config_data.campos, [key]: e.target.value }
                              }
                            })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-uniq-cyan transition-all font-medium text-stone-700 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'steps' && (
                  <motion.div 
                    key="steps"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-stone-800 font-bold">
                        <RefreshCw size={18} className="text-uniq-cyan" />
                        <h3>Pasos de Inscripción</h3>
                      </div>
                      <div className="space-y-4">
                        {(pdfSettings.config_data?.indicaciones || []).map((item: any, index: number) => (
                          <div key={index} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-uniq-cyan uppercase tracking-widest">Paso {index + 1}</span>
                            </div>
                            <input 
                              type="text" 
                              value={item.step} 
                              onChange={(e) => {
                                const newIndicaciones = [...pdfSettings.config_data.indicaciones];
                                newIndicaciones[index].step = e.target.value;
                                setPdfSettings({...pdfSettings, config_data: {...pdfSettings.config_data, indicaciones: newIndicaciones}});
                              }}
                              className="w-full p-2 bg-white border border-stone-200 rounded-lg font-bold text-sm"
                              placeholder="Título del paso"
                            />
                            <textarea 
                              value={item.text} 
                              onChange={(e) => {
                                const newIndicaciones = [...pdfSettings.config_data.indicaciones];
                                newIndicaciones[index].text = e.target.value;
                                setPdfSettings({...pdfSettings, config_data: {...pdfSettings.config_data, indicaciones: newIndicaciones}});
                              }}
                              className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs h-20 resize-none"
                              placeholder="Descripción del paso"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-stone-100">
                      <div className="flex items-center gap-2 text-stone-800 font-bold">
                        <ShieldCheck size={18} className="text-uniq-cyan" />
                        <h3>Documentos Requeridos</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Título de la Sección</label>
                          <input 
                            type="text" 
                            value={pdfSettings.config_data?.documentos_requeridos_titulo || ''} 
                            onChange={(e) => setPdfSettings({...pdfSettings, config_data: {...pdfSettings.config_data, documentos_requeridos_titulo: e.target.value}})}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Documentos (uno por línea)</label>
                          <textarea 
                            value={(pdfSettings.config_data?.documentos_requeridos || []).join('\n')} 
                            onChange={(e) => setPdfSettings({...pdfSettings, config_data: {...pdfSettings.config_data, documentos_requeridos: e.target.value.split('\n')}})}
                            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-uniq-cyan transition-all font-medium text-stone-700 h-32 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-7 flex flex-col h-[800px] space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Eye size={20} className="text-uniq-cyan" /> Previsualización en Tiempo Real
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Actualizado</span>
            </div>
          </div>
          
          <div className="flex-1 bg-stone-800 rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-stone-800 relative group">
            {previewUrl ? (
              <iframe 
                src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                className="w-full h-full bg-white" 
                title="PDF Preview"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 gap-4">
                <Loader2 className="animate-spin" size={48} />
                <p className="font-bold animate-pulse">Generando vista previa...</p>
              </div>
            )}
            
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-stone-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                Vista Previa de Impresión
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionPDFView;
