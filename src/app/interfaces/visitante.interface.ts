/**
 * Representa la estructura de un Visitante cuando se OBTIENE desde la API.
 */

export interface Visitante {
  id: number;
  numero: number;
  nombreCompleto: string;
  cargo: string;
  tipoDocumento: string;
  nivelRiesgo: string;
  estadoVisitante: string;
  estadoVisitanteId?: number | null;
}

/**
 * Representa la estructura de datos para CREAR o ACTUALIZAR un Visitante.
 */
export interface UpsertVisitante {
  tipoDocumentoId: number;
  numero: number;
  nombre: string;
  apellido: string;
  cargo: string;
  nivelRiesgoId: number;
  estadoVisitanteId: number;
}

export interface VisitanteEditable {
  id: number;
  nombre: string;
  apellido: string;
  cargo: string;
  numero: number;
  tipoDocumentoId: number;
  nivelRiesgoId: number;
  estadoVisitanteId: number;
}
