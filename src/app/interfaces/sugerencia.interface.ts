export interface SugerenciaRequestDto {
  numeroDocumento: number;
}

export interface AccionSugeridaDto {
  solicitudId: number;
  tipoRegistroId: number;
  descripcionAccion: string;
}

export interface SugerenciaResponseDto {
  visitanteId: number;
  nombreVisitante: string;
  estadoVisitante: string;
  accionesSugeridas: AccionSugeridaDto[];
  mensaje: string;
  observacionPrevia?: string;
}
