export interface EstadoSolicitud {
  id: number;
  descripcion: string;
  mensaje: string;
  esConsideradaParaRegistro: boolean;
}

export interface EstadoSolicitudCreate {
  descripcion: string;
  mensaje: string;
  esConsideradaParaRegistro: boolean;
}
