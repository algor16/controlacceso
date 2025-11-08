export interface VehiculoDto {
  id: number;
  placa: string;
  nombre_Empresa?: string;
  claseVehiculo: string;
}

export interface VehiculoCreateDto {
  placa: string;
  empresaId?: number;
  nombre_Empresa?: string;
  claseVehiculoId: number;
}
