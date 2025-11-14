export interface Motivo {
    id: number;
    descripcion: string;
    activo: boolean;
    tipo: 'Entrada' | 'Salida';
}

export interface MotivoCreate {
    descripcion: string;
    activo: boolean;
    tipo: 'Entrada' | 'Salida';
}

export interface MotivoUpdate {
    descripcion: string;
    activo: boolean;
    tipo: 'Entrada' | 'Salida';
}
