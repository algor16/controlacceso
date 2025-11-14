export interface EstadoSolicitud {
  id: number;
  descripcion: string;
  mensaje: string;
  esConsideradaParaRegistro: boolean;
  activo: boolean;
}

export interface EstadoSolicitudCreate {
  descripcion: string;
  mensaje: string;
  esConsideradaParaRegistro: boolean;
  activo: boolean;
}
