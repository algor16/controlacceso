export interface SolicitudCreateDto {
    visitanteId: number;
    f_Ingreso: Date;
    f_Salida: Date;
    destinoId: number;
    vehiculoId?: number;
    estadoSolicitudId: number;
}

export interface SolicitudDto {
    id: number;
    visitanteNombre: string;
    f_Ingreso: string;
    f_Salida: string;
    destino: string;
    vehiculoPlaca?: string;
    estadoSolicitud: string;
}
