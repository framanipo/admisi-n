import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, Database, RefreshCw, Check, X } from 'lucide-react';

export const ConfiguracionDatabaseView = ({ onBack }: { onBack: () => void }) => {
  const [config, setConfig] = useState({ host: '', port: 3306, user: '', password: '', database: '' });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/db-config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching db config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/db-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (response.ok) {
        alert('Configuración guardada correctamente');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/db-status');
      const data = await response.json();
      if (response.ok) {
        setTestResult({ success: true, message: `Conexión exitosa a ${data.host}:${data.port}` });
      } else {
        setTestResult({ success: false, message: `${data.code || 'Error'}: ${data.details || data.message}` });
      }
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Configuración de Base de Datos</h2>
            <p className="text-stone-500">Modifica los parámetros de conexión a MySQL.</p>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-10">Cargando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-stone-700">Host</label>
              <input type="text" value={config.host} onChange={e => setConfig({...config, host: e.target.value})} className="w-full p-3 border rounded-xl" />
              
              <label className="block text-sm font-bold text-stone-700">Puerto</label>
              <input type="number" value={config.port} onChange={e => setConfig({...config, port: parseInt(e.target.value)})} className="w-full p-3 border rounded-xl" />
              
              <label className="block text-sm font-bold text-stone-700">Usuario</label>
              <input type="text" value={config.user} onChange={e => setConfig({...config, user: e.target.value})} className="w-full p-3 border rounded-xl" />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-stone-700">Contraseña</label>
              <input type="password" value={config.password} onChange={e => setConfig({...config, password: e.target.value})} className="w-full p-3 border rounded-xl" />
              
              <label className="block text-sm font-bold text-stone-700">Base de Datos</label>
              <input type="text" value={config.database} onChange={e => setConfig({...config, database: e.target.value})} className="w-full p-3 border rounded-xl" />
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50">
            <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
          <button onClick={handleTest} disabled={isTesting} className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-all disabled:opacity-50">
            <RefreshCw size={18} /> {isTesting ? 'Probando...' : 'Probar Conexión'}
          </button>
        </div>

        {testResult && (
          <div className={`mt-6 p-4 rounded-xl ${testResult.success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex items-center gap-2 font-bold">
              {testResult.success ? <Check size={20} /> : <X size={20} />}
              {testResult.success ? 'Conexión Exitosa' : 'Error de Conexión'}
            </div>
            <p className="text-sm mt-1">{testResult.message}</p>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-stone-100 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all">
            <ChevronLeft size={18} /> Volver
          </button>
        </div>
      </div>
    </motion.div>
  );
};
