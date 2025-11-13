import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogoItem } from '../interfaces/catalogo.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {

  // Inyectamos la herramienta para hacer peticiones HTTP
  private http = inject(HttpClient);

  // La URL base de tu API en .NET
  private baseUrl = `${environment.apiUrl}/api`;

  /**
   * CREATE: Crea un nuevo item en un catálogo.
   * @param catalogo - Nombre del endpoint (ej. "TiposDocumento", "Roles").
   * @param item - El objeto a crear.
   */
  create(catalogo: string, item: Omit<CatalogoItem, 'id'>): Observable<CatalogoItem> {
    const url = `${this.baseUrl}/${catalogo}`;
    return this.http.post<CatalogoItem>(url, item);
  }

  /**
   * READ: Obtiene todos los items de un catálogo.
   * @param catalogo - Nombre del endpoint.
   * @param params - Parámetros de consulta opcionales.
   */
  getAll(catalogo: string, params?: HttpParams): Observable<CatalogoItem[]> {
    const url = `${this.baseUrl}/${catalogo}`;
    return this.http.get<CatalogoItem[]>(url, { params });
  }

  /**
   * READ: Obtiene solo los destinos activos.
   */
  getDestinosActivos(): Observable<CatalogoItem[]> {
    const url = `${this.baseUrl}/Destinos/activos`;
    return this.http.get<CatalogoItem[]>(url);
  }

  /**
   * CHECK USAGE: Verifica si un item de catálogo está en uso.
   * @param catalogo - Nombre del endpoint.
   * @param id - El ID del item a verificar.
   */
  enUso(catalogo: string, id: number): Observable<boolean> {
    const url = `${this.baseUrl}/${catalogo}/${id}/en-uso`;
    return this.http.get<boolean>(url);
  }

  /**
   * READ BY ID: Obtiene un item por su ID.
   * @param catalogo - Nombre del endpoint.
   * @param id - El ID del item.
   */
  getById(catalogo: string, id: number): Observable<CatalogoItem> {
    const url = `${this.baseUrl}/${catalogo}/${id}`;
    return this.http.get<CatalogoItem>(url);
  }

  /**
   * UPDATE: Actualiza un item existente.
   * @param catalogo - Nombre del endpoint.
   * @param id - El ID del item a actualizar.
   * @param item - El objeto con los datos actualizados.
   */
  update(catalogo: string, id: number, item: CatalogoItem): Observable<void> {
    const url = `${this.baseUrl}/${catalogo}/${id}`;
    return this.http.put<void>(url, item);
  }

  /**
   * DELETE: Elimina un item por su ID (o lo desactiva si es borrado lógico).
   * @param catalogo - Nombre del endpoint.
   * @param id - El ID del item a eliminar.
   */
  delete(catalogo: string, id: number): Observable<void> {
    const url = `${this.baseUrl}/${catalogo}/${id}`;
    return this.http.delete<void>(url);
  }

  /**
   * REACTIVATE: Reactiva un item con borrado lógico.
   * @param catalogo - Nombre del endpoint.
   * @param id - El ID del item a reactivar.
   */
  reactivar(catalogo: string, id: number): Observable<void> {
    const url = `${this.baseUrl}/${catalogo}/${id}/reactivar`;
    return this.http.post<void>(url, {});
  }
}
