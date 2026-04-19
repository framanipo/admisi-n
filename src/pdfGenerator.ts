import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePreinscriptionPDF = async (
  formData: any,
  appSettings: any,
  pdfSettings: any,
  logoImage: HTMLImageElement | null,
  id: string | number | undefined,
  registrationId: string | number | undefined,
  montoPago: number,
  autoDownload: boolean = true
): Promise<string | void> => {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Load the UNIQ logo
  const loadLogo = (): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = 'https://upload.wikimedia.org/wikipedia/commons/9/96/Logo_uniq_.png';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
    });
  };

  let uniqLogo: HTMLImageElement | null = null;
  try {
    uniqLogo = await loadLogo();
  } catch (e) {
    console.error("Failed to load UNIQ logo", e);
    uniqLogo = logoImage; // Fallback to the provided logo if any
  }
  
  const admissionName = appSettings?.textoLogo || `ADMISIÓN ${new Date().getFullYear()}`;
  const securityCode = formData.securityCode || (formData.dni ? `C${formData.dni.substring(formData.dni.length - 4)}` : 'C4534');
  
  const pdfTitle = pdfSettings?.titulo || 'FICHA DE PREINSCRIPCIÓN';
  const pdfSubtitle = pdfSettings?.subtitulo || admissionName.toUpperCase();

  const configData = pdfSettings?.config_data || {};
  const secciones = configData.secciones || {};
  const campos = configData.campos || {};
  const indicaciones = configData.indicaciones || [
    { step: 'Paso 1: Preinscripción', text: 'Comienza tu inscripción registrando tus datos en nuestra página web. Este paso es esencial para garantizar una inscripción exitosa.' },
    { step: 'Paso 2: Visítenos', text: 'Te invitamos a nuestras instalaciones en la oficina de la dirección de Admisión para continuar con tu proceso.' },
    { step: 'Paso 3: Verificación y Orientación', text: 'Nuestro equipo te proporcionará orientación y verificará los datos ingresados en la preinscripción para asegurarse de que estén correctos.' },
    { step: 'Paso 4: Pago por Derecho de Inscripción', text: 'Realiza el pago correspondiente por el derecho de inscripción de manera segura en la caja de la UNIQ. Esto es fundamental para tu participación en el proceso de admisión.' },
    { step: 'Paso 5: Captura de foto', text: 'Nuestro personal de Dirección de Admisión tomará una foto para asegurar tu identidad.' },
    { step: 'Paso 6: Control biométrico', text: 'Realizaremos una toma de control biométrico para garantizar tu identificación a través de huellas dactilares. Esto es esencial para mantener la seguridad y autenticidad de tus registros.' },
    { step: 'Paso 7: Inscripción final', text: 'Revisa tus datos cuidadosamente y asegúrate de que todo esté correcto. Luego, completa la inscripción oficial en el proceso de admisión.' }
  ];
  const documentosRequeridos = configData.documentos_requeridos || [
    '• DNI original vigente y una copia ampliada.',
    '• Certificado de estudios original y visado por la UGEL.',
    '• Recibo de pago por derecho de inscripción.'
  ];
  const documentosRequeridosTitulo = configData.documentos_requeridos_titulo || 'Recuerda traer los siguientes documentos para finalizar tu inscripción:';
  const mensajeFinal = configData.mensaje_final || 'Una vez completado tu proceso de inscripción, te entregaremos una constancia de inscripción.';
  const importanteTitulo = configData.importante_titulo || 'IMPORTANTE:';
  const importanteTexto = configData.importante_texto || `Podrá realizar una única modificación en sus datos personales utilizando el código de seguridad: {securityCode}. Se podrá realizar 1 cambio por única vez en admisión previa coordinación.`;

  // UNIQ Colors
  const colors = {
    darkBlue: pdfSettings?.primary_color || '#003865',
    cyan: '#00A1DF',
    green: '#008C45',
    yellow: '#FFC20E',
    orange: '#F37021',
    red: '#E31B23',
    gray: '#F3F4F6',
    darkGray: '#374151',
    lightGray: '#9CA3AF'
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const addHeader = (pageNumber: number) => {
    const logoSize = pdfSettings?.logo_size || 18; // Use custom logo size
    // Left Logo
    if (uniqLogo) {
      try {
        doc.addImage(uniqLogo, 'PNG', 15, 12, logoSize, logoSize);
      } catch (e) {
        console.error("Error adding left logo to PDF", e);
      }
    }
    
    // Right Logo
    if (uniqLogo && pdfSettings?.show_side_logos !== false) {
      try {
        doc.addImage(uniqLogo, 'PNG', pageWidth - 15 - logoSize, 12, logoSize, logoSize);
      } catch (e) {
        console.error("Error adding right logo to PDF", e);
      }
    }
    
    // Header Text
    doc.setFont('helvetica', 'bold');
    let rgb = hexToRgb(colors.darkBlue);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFontSize(12); // Reduced from 14
    doc.text('UNIVERSIDAD NACIONAL INTERCULTURAL DE QUILLABAMBA', pageWidth / 2, 18, { align: 'center' });
    
    rgb = hexToRgb(colors.cyan);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFontSize(10); // Reduced from 11
    doc.text('DIRECCIÓN DE ADMISIÓN', pageWidth / 2, 23, { align: 'center' });
    
    rgb = hexToRgb(colors.red);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFontSize(11); // Reduced from 12
    doc.text(pdfTitle.toUpperCase(), pageWidth / 2, 29, { align: 'center' });
    
    rgb = hexToRgb(colors.orange);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFontSize(9); // Reduced from 10
    doc.text(pdfSubtitle.toUpperCase(), pageWidth / 2, 34, { align: 'center' });

    // Registration ID
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    if (registrationId) {
      doc.text(`ID: ${registrationId}`, 15, 34, { align: 'left' });
    }
    
    // Intercultural Color Line
    const lineColors = [colors.cyan, colors.green, colors.yellow, colors.orange, colors.red];
    const segmentWidth = (pageWidth - 30) / lineColors.length;
    lineColors.forEach((color, i) => {
      const c = hexToRgb(color);
      doc.setDrawColor(c.r, c.g, c.b);
      doc.setLineWidth(1.5);
      doc.line(15 + i * segmentWidth, 38, 15 + (i + 1) * segmentWidth, 38);
    });
  };

  const addFooter = (pageNumber: number, totalPages: number) => {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    const rgb = hexToRgb(colors.lightGray);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    const dateStr = new Date().toLocaleString('es-PE');
    doc.text(`Generado el: ${dateStr}`, 15, pageHeight - 10);
    doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    
    doc.setDrawColor(rgb.r, rgb.g, rgb.b);
    doc.setLineWidth(0.2);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
  };

  let startY = 45;
  
  const checkPageBreak = (neededSpace: number) => {
    if (startY + neededSpace > pageHeight - 20) {
      doc.addPage();
      startY = 45;
    }
  };

  // Modification Note
  let bgRgb = hexToRgb('#FEF2F2');
  doc.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b); // Light red background
  let borderRgb = hexToRgb(colors.red);
  doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, startY, pageWidth - 30, 16, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(borderRgb.r, borderRgb.g, borderRgb.b);
  doc.text(importanteTitulo, 18, startY + 5);
  
  doc.setFont('helvetica', 'normal');
  let textRgb = hexToRgb(colors.darkGray);
  doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
  const noteText = importanteTexto.replace('{securityCode}', securityCode);
  const splitNote = doc.splitTextToSize(noteText, pageWidth - 36);
  doc.text(splitNote, 18, startY + 10);
  
  startY += 22;

  const sectionColors = [colors.darkBlue, colors.cyan, colors.green, colors.orange, colors.red];
  let sectionIndex = 0;

  const addSection = (title: string, data: any[][], useColon: boolean = true) => {
    checkPageBreak(25); // Need at least 25mm for title + 1 row

    const sectionColor = sectionColors[sectionIndex % sectionColors.length];
    sectionIndex++;

    // Section Title Background
    let bg = hexToRgb(colors.gray);
    doc.setFillColor(bg.r, bg.g, bg.b);
    doc.rect(15, startY, pageWidth - 30, 8, 'F');
    
    // Section Title Left Border
    let border = hexToRgb(sectionColor);
    doc.setFillColor(border.r, border.g, border.b);
    doc.rect(15, startY, 3, 8, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    let titleColor = hexToRgb(colors.darkBlue);
    doc.setTextColor(titleColor.r, titleColor.g, titleColor.b);
    doc.text(title.toUpperCase(), 22, startY + 5.5);
    
    startY += 8;
    
    const bodyData = data.map(row => {
      if (useColon && row.length > 1) {
        return [row[0], `: ${row[1]}`];
      }
      return row;
    });

    autoTable(doc, {
      startY: startY,
      margin: { top: 45, right: 15, bottom: 20, left: 15 },
      body: bodyData,
      theme: 'plain',
      styles: { 
        fontSize: 8, 
        cellPadding: 1, 
        textColor: [textRgb.r, textRgb.g, textRgb.b], 
        font: 'helvetica' 
      },
      columnStyles: { 
        0: { fontStyle: 'bold', cellWidth: 50, textColor: [titleColor.r, titleColor.g, titleColor.b] },
        1: { cellWidth: 'auto' }
      },
    });
    
    startY = (doc as any).lastAutoTable.finalY + 3;
  };

  // Declaración Jurada
  addSection(secciones.declaracion_jurada || 'DECLARACIÓN JURADA', [
    ['Si', 'cuenta con su DNI vigente.'],
    ['Si', 'cuenta con el certificado de estudios original concluido la educación secundaria.'],
  ], false);

  // Ficha General
  addSection(secciones.ficha_general || 'FICHA GENERAL', [
    [campos.escuela_profesional || 'Escuela profesional', formData.career || ''],
    [campos.dni || 'D.N.I.', formData.dni || ''],
    [campos.apellido_paterno || 'Apellido paterno', formData.paternalSurname || ''],
    [campos.apellido_materno || 'Apellido materno', formData.maternalSurname || ''],
    [campos.nombres || 'Nombre(s)', formData.names || ''],
    [campos.genero || 'Género', formData.gender || ''],
  ]);

  // Ficha de Información
  let habilidadesIdioma = [];
  if (formData.languageRead) habilidadesIdioma.push('Lee');
  if (formData.languageSpeak) habilidadesIdioma.push('Habla');
  if (formData.languageWrite) habilidadesIdioma.push('Escribe');

  let condicionesEspeciales = [];
  if (formData.discapacidad) condicionesEspeciales.push(`Discapacidad (CONADIS: ${formData.conadisNumber || 'No especificado'})`);
  if (formData.isDeportista) condicionesEspeciales.push('Deportista Calificado');
  if (formData.isVictimaViolencia) condicionesEspeciales.push('Víctima de Violencia');
  if (formData.isServicioMilitar) condicionesEspeciales.push('Servicio Militar');
  if (formData.isPrimerosPuestos) condicionesEspeciales.push('Primeros Puestos');

  addSection(secciones.ficha_informacion || 'FICHA DE INFORMACIÓN', [
    [campos.fecha_nacimiento || 'Fecha de nacimiento', formData.birthDate || ''],
    [campos.pais_nacionalidad || 'País / nacionalidad', `${formData.pais || 'Perú'} - ${formData.nacionalidad || 'Peruana'}`],
    [campos.lugar_nacimiento || 'Lugar de nacimiento', `${formData.nacimientoRegion || ''} - ${formData.nacimientoProvincia || ''} - ${formData.nacimientoDistrito || ''}`],
    [campos.ubigeo_nacimiento || 'Ubigeo de nacimiento', formData.nacimientoUbigeo || ''],
    [campos.lengua_materna || 'Lengua materna', formData.idioma || 'Español'],
    [campos.habilidades_idioma || 'Habilidades en el idioma', habilidadesIdioma.length > 0 ? habilidadesIdioma.join(', ') : 'Ninguna'],
    [campos.condiciones_especiales || 'Condiciones especiales', condicionesEspeciales.length > 0 ? condicionesEspeciales.join(', ') : 'Ninguna'],
  ]);

  // Ficha de Contacto
  addSection(secciones.ficha_contacto || 'FICHA DE CONTACTO', [
    [campos.celular_personal || 'Móvil personal', formData.movil || formData.phone || ''],
    [campos.correo_personal || 'Correo personal', formData.email || ''],
    [campos.apoderado || 'Apoderado', `${formData.apoderadoNombres || ''} ${formData.apoderadoApellidoPaterno || ''} ${formData.apoderadoApellidoMaterno || ''}`.trim() || 'No especificado'],
    [campos.dni_apoderado || 'DNI del apoderado', formData.apoderadoDni || ''],
    [campos.celular_apoderado || 'Celular del apoderado', formData.apoderadoTelefono || formData.apoderadoMovil || formData.apoderadoPhone || ''],
    [campos.ubigeo_residencia || 'Ubigeo de residencia', `${formData.procedenciaRegion || ''} - ${formData.procedenciaProvincia || ''} - ${formData.procedenciaDistrito || ''}`],
    [campos.direccion || 'Dirección', formData.procedenciaDireccion || ''],
  ]);

  // Ficha de Colegio
  addSection(secciones.ficha_colegio || 'FICHA DE COLEGIO', [
    [campos.nombre_colegio || 'Nombre del colegio', formData.schoolName || ''],
    [campos.lugar_colegio || 'Lugar del colegio', `${formData.colegioRegion || ''} - ${formData.colegioProvincia || ''} - ${formData.colegioDistrito || ''}`],
    [campos.nivel || 'Nivel', formData.schoolLevel || ''],
    [campos.gestion_dependencia || 'Gestión dependencia', formData.schoolType || ''],
    [campos.año_egreso || 'Año de egreso', formData.graduationYear || ''],
  ]);

  // Ficha de Universidad
  addSection(secciones.ficha_universidad || 'FICHA DE UNIVERSIDAD', [
    [campos.universidad || 'Universidad', `Ninguna`],
  ]);

  // Ficha de Pago
  addSection(secciones.ficha_pago || 'FICHA DE PAGO', [
    [campos.periodo || 'Período', admissionName],
    [campos.modalidad || 'Modalidad', formData.modality || ''],
    [campos.lugar_inscripcion || 'Lugar de inscripción', formData.lugarInscripcion || 'Sede Principal'],
  ]);

  // --- PAGE 2 ---
  doc.addPage();
  startY = 45;

  addSection(secciones.pagos_caja || 'PAGOS A REALIZAR EN CAJA', [
    [campos.tipo_pago || 'Tipo de pago', formData.modality || ''],
    [campos.monto_total || 'MONTO TOTAL', `S/ ${Number(montoPago || 0).toFixed(2)}`],
  ]);

  startY += 5;
  
  checkPageBreak(70); // Ensure space for indicaciones

  // Indicaciones Title
  let cyanRgb = hexToRgb(colors.cyan);
  doc.setFillColor(cyanRgb.r, cyanRgb.g, cyanRgb.b);
  doc.rect(15, startY, pageWidth - 30, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(secciones.indicaciones_titulo || 'INDICACIONES PARA REALIZAR SU INSCRIPCIÓN', pageWidth / 2, startY + 5.5, { align: 'center' });
  
  startY += 11;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  let darkGrayRgb = hexToRgb(colors.darkGray);
  doc.setTextColor(darkGrayRgb.r, darkGrayRgb.g, darkGrayRgb.b);
  
  let orangeRgb = hexToRgb(colors.orange);
  let darkBlueRgb = hexToRgb(colors.darkBlue);

  indicaciones.forEach((item: any, index: number) => {
    checkPageBreak(12);
    
    // Step number circle
    doc.setFillColor(orangeRgb.r, orangeRgb.g, orangeRgb.b);
    doc.circle(18, startY + 1.5, 2.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(`${index + 1}`, 18, startY + 2.5, { align: 'center' });
    
    // Step title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkBlueRgb.r, darkBlueRgb.g, darkBlueRgb.b);
    doc.setFontSize(9);
    doc.text(item.step.includes(':') ? item.step.split(':')[1].trim() : item.step, 23, startY + 2.5);
    
    startY += 5;
    
    // Step description
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGrayRgb.r, darkGrayRgb.g, darkGrayRgb.b);
    doc.setFontSize(8);
    const splitText = doc.splitTextToSize(item.text, pageWidth - 38);
    doc.text(splitText, 23, startY);
    
    startY += (splitText.length * 3.5) + 3;
  });

  startY += 2;
  
  checkPageBreak(40);

  // Required Documents Box
  let lightGreenRgb = hexToRgb('#ECFDF5');
  doc.setFillColor(lightGreenRgb.r, lightGreenRgb.g, lightGreenRgb.b); // Light green
  let greenRgb = hexToRgb(colors.green);
  doc.setDrawColor(greenRgb.r, greenRgb.g, greenRgb.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, startY, pageWidth - 30, 26, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(greenRgb.r, greenRgb.g, greenRgb.b);
  doc.setFontSize(9);
  doc.text(documentosRequeridosTitulo, 20, startY + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGrayRgb.r, darkGrayRgb.g, darkGrayRgb.b);
  doc.setFontSize(8);
  documentosRequeridos.forEach((docText: string, i: number) => {
    doc.text(docText, 20, startY + 12 + (i * 5));
  });
  
  startY += 32;
  
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(darkBlueRgb.r, darkBlueRgb.g, darkBlueRgb.b);
  doc.setFontSize(8);
  doc.text(mensajeFinal, pageWidth / 2, startY, { align: 'center' });

  // Add Headers and Footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeader(i);
    addFooter(i, totalPages);
  }

  if (autoDownload) {
    doc.save(`Ficha_Preinscripcion_${formData.dni || 'Pendiente'}.pdf`);
  }
  
  return doc.output('datauristring');
};
