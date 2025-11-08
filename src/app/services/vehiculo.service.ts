import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { VehiculoDto, VehiculoCreateDto } from '../interfaces/vehiculo.interface';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/Vehiculos`;

  /**
   * GET: Obtiene una lista paginada de vehículos.
   * @param page - Número de página.
   * @param limit - Cantidad de registros por página.
   * @param placa - Placa para buscar.
   */
  getAll(page: number = 1, limit: number = 10, placa?: string): Observable<PaginatedResponse<VehiculoDto>> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', limit.toString());

    if (placa) {
      params = params.set('placa', placa);
    }

    return this.http.get<PaginatedResponse<VehiculoDto>>(this.baseUrl, { params });
  }

  /**
   * GET BY ID: Obtiene un vehículo por su ID.
   */
  getById(id: number): Observable<VehiculoDto> {
    return this.http.get<VehiculoDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * CREATE: Crea un nuevo vehículo.
   */
  create(vehiculo: VehiculoCreateDto): Observable<VehiculoDto> {
    return this.http.post<VehiculoDto>(this.baseUrl, vehiculo);
  }

  /**
   * UPDATE: Actualiza un vehículo existente.
   */
  update(id: number, vehiculo: VehiculoCreateDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, vehiculo);
  }

  /**
   * DELETE: Elimina un vehículo por su ID.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
