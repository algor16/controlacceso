/**
 * Representa la estructura común de un item
 * en cualquiera de tus catálogos (Roles, Destinos, etc.)
 */
export interface CatalogoItem {
  id: number;
  descripcion: string;
  activo?: boolean;
}
