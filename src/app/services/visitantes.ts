
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// 1. Importa las interfaces necesarias
import { Visitante, UpsertVisitante, VisitanteEditable } from '../interfaces/visitante.interface';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VisitantesService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/Visitantes`;

  /**
   * Verifica si un número de documento ya existe en la base de datos.
   * @param numero - El número de documento a verificar.
   * @returns Un `Observable<boolean>` que emite `true` si el documento existe, `false` en caso contrario.
   */
  verificarNumeroDocumento(numero: string | number): Observable<boolean> {
    const url = `${this.baseUrl}/verificar-documento/${numero}`;
    return this.http.get<{ existe: boolean }>(url).pipe(
      map(response => response.existe)
    );
  }


  /**
   * READ: Obtiene una lista paginada y filtrada de visitantes.
   * @param pageNumber - El número de página a solicitar.
   * @param pageSize - La cantidad de registros por página.
   * @param busquedaGeneral - (Opcional) Término de búsqueda para nombres, cargos, etc.
   * @param numeroDocumento - (Opcional) Número de documento específico para buscar.
   */
  getAll(
    pageNumber: number = 1,
    pageSize: number = 10,
    busquedaGeneral?: string, // Parámetro opcional
    numeroDocumento?: number   // Parámetro opcional
  ): Observable<PaginatedResponse<Visitante>> { // 2. El tipo de retorno ahora es la respuesta paginada

    // 3. Construye los parámetros de forma dinámica
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    // Añade los parámetros de búsqueda solo si tienen un valor
    if (busquedaGeneral) {
      params = params.append('busquedaGeneral', busquedaGeneral);
    }
    if (numeroDocumento) {
      params = params.append('numeroDocumento', numeroDocumento.toString());
    }

    // 4. Realiza la petición GET esperando la nueva estructura
    return this.http.get<PaginatedResponse<Visitante>>(this.baseUrl, { params });
  }


  create(visitanteData: UpsertVisitante): Observable<Visitante> {
    return this.http.post<Visitante>(this.baseUrl, visitanteData);
  }

  getById(id: number): Observable<VisitanteEditable> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<VisitanteEditable>(url);
  }

  update(id: number, visitanteData: UpsertVisitante): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<void>(url, visitanteData);
  }

  delete(id: number): Observable<any> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<any>(url);
  }
}
