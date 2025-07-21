
export interface PaginatedResponse<T> {
  items: T[];
  paginaActual: number;
  totalPaginas: number;
  tamanoPagina: number;
  totalRegistros: number;
  tienePaginaAnterior: boolean;
  tienePaginaSiguiente: boolean;
}
