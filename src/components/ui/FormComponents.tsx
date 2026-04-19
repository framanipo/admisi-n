import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ChevronRight, RefreshCw } from 'lucide-react';

export const InputField = ({ label, icon: Icon, error, loading, ...props }: any) => (
  <div className="space-y-1.5 relative">
    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
      {Icon && <Icon size={14} />}
      {label}
    </label>
    <div className="relative">
      <input
        {...props}
        className={`w-full px-4 py-2.5 bg-white border ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-stone-200 focus:ring-cyan-500/20 focus:border-cyan-500'} rounded-lg outline-none transition-all text-stone-800 placeholder:text-stone-400 disabled:opacity-50`}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <RefreshCw size={16} className="animate-spin text-uniq-cyan" />
        </div>
      )}
    </div>
    {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{error}</p>}
  </div>
);

export const SelectField = ({ label, icon: Icon, options, error, loading, placeholder, ...props }: any) => (
  <div className="space-y-1.5 relative">
    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
      {Icon && <Icon size={14} />}
      {label}
    </label>
    <div className="relative">
      <select
        {...props}
        disabled={loading || props.disabled}
        className={`w-full px-4 py-2.5 bg-white border ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-stone-200 focus:ring-cyan-500/20 focus:border-cyan-500'} rounded-lg outline-none transition-all text-stone-800 appearance-none cursor-pointer disabled:opacity-50`}
      >
        <option value="">{placeholder || 'Seleccione una opción'}</option>
        {options.map((opt: any, i: number) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return <option key={`${val}-${i}`} value={val}>{lbl}</option>;
        })}
      </select>
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
        {loading ? (
          <RefreshCw size={16} className="text-stone-400 animate-spin" />
        ) : (
          <ChevronRight size={16} className="text-stone-400 rotate-90" />
        )}
      </div>
    </div>
    {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{error}</p>}
  </div>
);

export const DynamicIcon = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
};
