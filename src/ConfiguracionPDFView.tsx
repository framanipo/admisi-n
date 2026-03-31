import React, { useState } from 'react';
import { ArrowLeft, Save, Upload } from 'lucide-react';

const ConfiguracionPDFView = ({ onBack, appSettings, setAppSettings }: { onBack: () => void, appSettings: any, setAppSettings: (settings: any) => void }) => {
  const [pdfSettings, setPdfSettings] = useState(appSettings.pdfSettings || {
    titulo: 'FICHA DE PRE-INSCRIPCIÓN',
    subtitulo: 'ADMISIÓN 2026',
    recomendaciones: [
      '1. Imprima esta ficha y preséntela el día del examen de admisión.',
      '2. Debe llevar esta ficha junto con su VOUCHER DE PAGO a la Oficina de Admisión para confirmar su inscripción.',
      '3. Lleve consigo su DNI original y carnet de postulante.',
      '4. Preséntese al local de examen con 1 hora de anticipación.',
      '5. Está prohibido el ingreso con celulares, relojes inteligentes u otros dispositivos electrónicos.'
    ]
  });

  const handleSave = () => {
    const next = { ...appSettings, pdfSettings };
    setAppSettings(next);
    localStorage.setItem('appSettings', JSON.stringify(next));
    alert('Configuración guardada correctamente');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-6">
        <ArrowLeft size={20} /> Volver al Dashboard
      </button>
      
      <h2 className="text-2xl font-bold text-stone-800 mb-6">Configuración del PDF</h2>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Título del PDF</label>
          <input 
            type="text" 
            value={pdfSettings.titulo} 
            onChange={(e) => setPdfSettings({...pdfSettings, titulo: e.target.value})}
            className="w-full p-3 border border-stone-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Subtítulo del PDF</label>
          <input 
            type="text" 
            value={pdfSettings.subtitulo} 
            onChange={(e) => setPdfSettings({...pdfSettings, subtitulo: e.target.value})}
            className="w-full p-3 border border-stone-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Recomendaciones (una por línea)</label>
          <textarea 
            value={pdfSettings.recomendaciones.join('\n')} 
            onChange={(e) => setPdfSettings({...pdfSettings, recomendaciones: e.target.value.split('\n')})}
            className="w-full p-3 border border-stone-300 rounded-lg h-40"
          />
        </div>

        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-uniq-cyan text-white rounded-lg font-bold hover:bg-cyan-700">
          <Save size={20} /> Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default ConfiguracionPDFView;
