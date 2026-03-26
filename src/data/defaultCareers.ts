export interface Career {
  id: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  profile: string;
  field: string;
  imageUrl: string;
  imageZoom?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
}

export const DEFAULT_CAREERS: Career[] = [
  {
    id: 'agronomica',
    name: "Ingeniería agronómica tropical",
    shortDesc: "Formamos profesionales capaces de innovar en la producción agrícola sostenible en la convención.",
    fullDesc: "La carrera de Ingeniería Agronómica Tropical forma profesionales con sólidos conocimientos científicos y tecnológicos para el manejo sustentable de los recursos naturales y la producción agrícola en zonas tropicales.",
    profile: "El egresado será capaz de gestionar sistemas de producción agrícola, aplicar biotecnología, y desarrollar proyectos de innovación agraria.",
    field: "Empresas agroindustriales, fundos agrícolas, instituciones de investigación, y emprendimientos propios.",
    imageUrl: "https://picsum.photos/seed/agronomy-tropical-farm/600/400"
  },
  {
    id: 'alimentos',
    name: "Ingeniería de alimentos",
    shortDesc: "Desarrolla procesos innovadores para la transformación y conservación de alimentos.",
    fullDesc: "Formamos ingenieros capaces de diseñar, optimizar y gestionar procesos de transformación, conservación y envasado de alimentos, garantizando su calidad e inocuidad.",
    profile: "Profesional con capacidad para la investigación y desarrollo de nuevos productos alimentarios, gestión de calidad y seguridad alimentaria.",
    field: "Plantas procesadoras de alimentos, laboratorios de control de calidad, empresas de desarrollo de productos.",
    imageUrl: "https://picsum.photos/seed/food-engineering-lab/600/400"
  },
  {
    id: 'civil',
    name: "Ingeniería civil",
    shortDesc: "Diseña y construye la infraestructura que el país necesita con estándares de calidad.",
    fullDesc: "La carrera prepara profesionales para planificar, diseñar, construir y gestionar obras de infraestructura civil, promoviendo el desarrollo sostenible y la seguridad.",
    profile: "Ingeniero con sólidas bases en cálculo, física y diseño estructural, capaz de liderar proyectos de construcción.",
    field: "Empresas constructoras, consultoras de ingeniería, sector público (ministerios, municipalidades).",
    imageUrl: "https://picsum.photos/seed/civil-engineering-construction/600/400"
  },
  {
    id: 'ecoturismo',
    name: "Ecoturismo",
    shortDesc: "Gestiona proyectos turísticos sostenibles revalorando nuestro patrimonio natural y cultural.",
    fullDesc: "Formamos gestores del turismo enfocados en la conservación del medio ambiente y el desarrollo de las comunidades locales a través de experiencias turísticas sostenibles.",
    profile: "Profesional emprendedor, con dominio de idiomas y capacidad para diseñar productos ecoturísticos innovadores.",
    field: "Agencias de viaje, reservas naturales, ONG ambientales, proyectos de turismo comunitario.",
    imageUrl: "https://picsum.photos/seed/ecotourism-jungle-peru/600/400"
  },
  {
    id: 'economia',
    name: "Economía",
    shortDesc: "Análisis económico para el desarrollo equitativo y sostenible de los pueblos.",
    fullDesc: "Formamos economistas con capacidad analítica para comprender los fenómenos económicos, formular políticas públicas y evaluar proyectos de inversión.",
    profile: "Analista económico, investigador y estratega capaz de optimizar recursos y promover el desarrollo socioeconómico.",
    field: "Bancos, instituciones financieras, ministerios, consultoras económicas y organismos internacionales.",
    imageUrl: "https://picsum.photos/seed/economy-community-market/600/400"
  },
  {
    id: 'contabilidad',
    name: "Contabilidad",
    shortDesc: "Formación integral en gestión financiera, tributaria y auditoría para el éxito empresarial.",
    fullDesc: "Preparamos expertos en el manejo de la información financiera, control de recursos y toma de decisiones estratégicas para el crecimiento de las organizaciones.",
    profile: "Contador público con visión gerencial, ético y experto en normativas contables, tributarias y financieras.",
    field: "Estudios contables, auditoras, gerencias financieras de empresas públicas y privadas.",
    imageUrl: "https://picsum.photos/seed/accounting-finance-desk/600/400"
  }
];
