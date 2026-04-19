export type Step = 'personal' | 'academic' | 'career' | 'success';
export type View = 'landing' | 'login' | 'preinscripcion' | 'guia' | 'cronograma' | 'reglamento' | 'temario' | 'resultados' | 'admin-dashboard' | 'control-preinscripcion' | 'config-imagenes' | 'config-cronograma' | 'config-carreras' | 'carrera-detail' | 'inscripcion-form' | 'user-management' | 'registrados-management' | 'config-dni' | 'config-inicio' | 'preinscripciones-management' | 'config-colegios' | 'config-idiomas' | 'config-pdf' | 'ficha-pdf-view';
export type Role = 'admin' | 'registrador' | 'visualizador';

export interface UserAuth {
  username: string;
  role: Role;
  full_name?: string;
  email?: string;
  activos?: boolean;
}

export interface FormData {
  documentType: 'DNI' | 'Carnet de Extranjería';
  dni: string;
  names: string;
  paternalSurname: string;
  maternalSurname: string;
  birthDate: string;
  gender: string;
  pais: string;
  nacionalidad: string;
  email: string;
  movil: string;
  schoolName: string;
  schoolType: string;
  schoolLevel: string;
  graduationYear: string;
  career: string;
  modality: string;
  lugarInscripcion: string;
  colegioRegion: string;
  colegioProvincia: string;
  colegioDistrito: string;
  procedenciaRegion: string;
  procedenciaProvincia: string;
  procedenciaDistrito: string;
  procedenciaDireccion: string;
  nacimientoRegion: string;
  nacimientoProvincia: string;
  nacimientoDistrito: string;
  nacimientoUbigeo: string;
  idioma: string;
  idiomaLee: boolean;
  idiomaHabla: boolean;
  idiomaEscribe: boolean;
  apoderadoDni: string;
  apoderadoNombres: string;
  apoderadoApellidoPaterno: string;
  apoderadoApellidoMaterno: string;
  apoderadoMovil: string;
  hasSpecialConditions: boolean;
  discapacidad: boolean;
  conadisNumber: string;
  isDeportista: boolean;
  isVictimaViolencia: boolean;
  isServicioMilitar: boolean;
  isPrimerosPuestos: boolean;
  monto_pago: number;
}
