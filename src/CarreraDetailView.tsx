import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Briefcase, GraduationCap, MapPin } from 'lucide-react';

export const CarreraDetailView = ({ career, onBack }: { career: any, onBack: () => void }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 pb-12">
      <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors font-bold mt-8">
        <ChevronLeft size={20} /> Volver
      </button>

      <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-stone-100">
        <div className="h-64 md:h-96 w-full relative">
          <img src={career.imagen_url} alt={career.nombre} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">{career.nombre}</h1>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Sobre la Carrera</h2>
            <p className="text-stone-600 leading-relaxed text-lg">{career.descripcion_completa}</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
              <div className="w-12 h-12 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-4">Perfil del Egresado</h3>
              <p className="text-stone-600 leading-relaxed">{career.perfil_egresado}</p>
            </div>

            <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
              <div className="w-12 h-12 bg-uniq-cyan/10 text-uniq-cyan rounded-2xl flex items-center justify-center mb-6">
                <Briefcase size={24} />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-4">Campo Laboral</h3>
              <p className="text-stone-600 leading-relaxed">{career.campo_laboral}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
