import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, Database, RefreshCw, Check, X, Upload, CheckCircle, FileUp } from 'lucide-react';

export const ConfiguracionDatabaseView = ({ onBack }: { onBack: () => void }) => {
  const [config, setConfig] = useState({ host: '', port: 3306, user: '', password: '', database: '' });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [restoreSuccess, setRestoreSuccess] = useState<{ successes: number, errors: number } | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [timezoneInfo, setTimezoneInfo] = useState<{ osTimezone: string, osTime: string, dbTimezone: string, dbTime: string } | null>(null);

  useEffect(() => {
    fetchConfig();
    fetchTimezoneInfo();
  }, []);

  const fetchTimezoneInfo = async () => {
    try {
      const response = await fetch('/api/db-timezone');
      if (response.ok) {
        const data = await response.json();
        setTimezoneInfo(data);
      }
    } catch (error) {
      console.error('Error fetching db timezone:', error);
    }
  };

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setRestoreSuccess(null);
      setRestoreProgress(0);
    }
  };

  const startRestore = async () => {
    if (!selectedFile) return;

    if (!window.confirm("¿Estás seguro de que deseas importar esta base de datos? Esto reemplazará TODOS los datos actuales de forma permanente.")) {
      setSelectedFile(null);
      return;
    }

    setIsRestoring(true);
    setRestoreProgress(0);

    try {
      const text = await selectedFile.text();
      const lines = text.split('\n');
      let currentStatement = '';
      const statements: string[] = [];

      for (const line of lines) {
        if (line.trim().startsWith('--') || line.trim() === '') continue;
        currentStatement += line + '\n';
        if (line.trim().endsWith(';')) {
          statements.push(currentStatement);
          currentStatement = '';
        }
      }

      const total = statements.length;
      if (total === 0) {
        alert("El archivo no contiene sentencias SQL válidas.");
        setIsRestoring(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const BATCH_SIZE = 50;

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = statements.slice(i, i + BATCH_SIZE);
        const response = await fetch('/api/admin/database/restore/chunk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statements: batch })
        });

        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        successCount += data.successCount || 0;
        errorCount += data.errorCount || 0;

        setRestoreProgress(Math.min(100, Math.round(((i + batch.length) / total) * 100)));
        
        // Artificial delay so the progress bar is visible even with few statements
        if (total < 100) {
          await new Promise(r => setTimeout(r, 100));
        }
      }

      setRestoreSuccess({ successes: successCount, errors: errorCount });
      setRestoreProgress(100);

    } catch (error: any) {
      console.error(error);
      alert('Error en la restauración: ' + error.message);
    } finally {
      // NOTE: We don't set isRestoring to false if it's successful so the success message can be shown without flicker
      // Let's set it back to false only if there's no success object (i.e. error)
      setIsRestoring(false);
      setSelectedFile(null); // clear input
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

        <div className="mt-8 p-6 bg-stone-50 border border-stone-200 rounded-xl relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-stone-800">Estado de Zona Horaria</h3>
            <button 
              onClick={fetchTimezoneInfo}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              title="Refrescar Zona Horaria"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          {timezoneInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Sistema Operativo</span>
                <p className="font-mono text-sm text-stone-800 truncate" title={timezoneInfo.osTimezone}>{timezoneInfo.osTimezone}</p>
                <p className="text-sm text-stone-600">{timezoneInfo.osTime}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Base de Datos MySQL</span>
                <p className="font-mono text-sm text-stone-800 truncate" title={timezoneInfo.dbTimezone}>{timezoneInfo.dbTimezone || 'Desconocida'}</p>
                <p className="text-sm text-stone-600">{timezoneInfo.dbTime || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-500">Cargando información de zona horaria...</p>
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-stone-100 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Respaldo de Base de Datos</h3>
            <button 
              onClick={async () => {
                setIsBackupLoading(true);
                try {
                  const res = await fetch('/api/admin/database/backup');
                  if (res.ok) {
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `backup_${new Date().toISOString().slice(0, 10)}.sql`;
                    a.click();
                  } else {
                    alert('Error al generar el backup');
                  }
                } finally {
                  setIsBackupLoading(false);
                }
              }}
              disabled={isBackupLoading}
              className="flex items-center gap-2 px-6 py-3 bg-[#0891b2] text-white font-bold rounded-xl hover:bg-[#0891b2]/90 transition-all disabled:opacity-50"
            >
              {isBackupLoading ? <RefreshCw size={18} className="animate-spin" /> : <Database size={18} />} 
              {isBackupLoading ? 'Generando...' : 'Generar Backup (.sql)'}
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Restaurar Base de Datos</h3>
            {restoreSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-0.5 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-green-900">Restauración Completada Satisfactoriamente</h4>
                  <p className="text-sm mt-1">Se han importado los datos correctamente.</p>
                  <ul className="text-sm mt-2 list-disc pl-4 opacity-80">
                    <li>Consultas exitosas: {restoreSuccess.successes}</li>
                    {restoreSuccess.errors > 0 && <li>Errores ignorados: {restoreSuccess.errors}</li>}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      Recargar y Aplicar
                    </button>
                    <button 
                      onClick={() => { setRestoreSuccess(null); setRestoreProgress(0); setSelectedFile(null); }}
                      className="px-4 py-2 bg-transparent text-green-800 hover:bg-green-100 text-sm font-bold rounded-lg transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-stone-500 mb-4">Esta acción reemplazará toda la base de datos actual con un archivo .sql.</p>
                
                <div className="flex flex-col gap-3">
                  <input 
                     type="file" 
                     accept=".sql"
                     id="sql-upload"
                     className="hidden"
                     onChange={handleFileChange}
                     disabled={isRestoring}
                  />
                  <label 
                     htmlFor="sql-upload"
                     className={`inline-flex items-center gap-3 px-4 py-3 border-2 border-dashed ${selectedFile ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-stone-300 bg-stone-50 text-stone-600 hover:border-indigo-300 hover:bg-stone-100'} cursor-pointer font-bold rounded-xl transition-all`}
                  >
                    <FileUp size={20} className={selectedFile ? "text-indigo-600" : "text-stone-400"} />
                    <span className="truncate">
                      {selectedFile ? selectedFile.name : 'Seleccionar archivo .sql'}
                    </span>
                  </label>

                  {selectedFile && !isRestoring && (
                    <button
                      onClick={startRestore}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md"
                    >
                      <Upload size={18} /> Subir Importación
                    </button>
                  )}
                  
                  {isRestoring && (
                    <div className="mt-4 bg-stone-50 p-5 border border-stone-200 rounded-xl space-y-3 shadow-inner">
                      <div className="flex justify-between items-center text-sm font-bold text-stone-700">
                        <div className="flex items-center gap-2">
                          <RefreshCw size={16} className="animate-spin text-indigo-600" />
                          <span>Importando datos...</span>
                        </div>
                        <span className="text-indigo-700">{Math.round(restoreProgress)}%</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-3 rounded-full transition-all duration-300 ease-out flex items-center justify-center relative overflow-hidden" 
                          style={{ 
                            width: `${restoreProgress}%`, 
                            background: `linear-gradient(90deg, #6366f1, #3b82f6, #10b981)`,
                            backgroundSize: '200% 100%'
                          }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                      <p className="text-xs text-stone-500 text-center">Por favor, no cierres esta ventana.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-100 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-all">
            <ChevronLeft size={18} /> Volver
          </button>
        </div>
      </div>
    </motion.div>
  );
};
