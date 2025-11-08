import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudCreateDto, SolicitudDto } from '../interfaces/solicitud.interface';
import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/Solicitudes`;

  getAll(
    page: number = 1,
    limit: number = 10,
    visitante?: string,
    destino?: number,
    vehiculo?: string,
    estado?: number,
    fechaDesde?: string,
    fechaHasta?: string
  ): Observable<PaginatedResponse<SolicitudDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (visitante) params = params.set('visitante', visitante);
    if (destino) params = params.set('destinoId', destino.toString());
    if (vehiculo) params = params.set('vehiculo', vehiculo);
    if (estado) params = params.set('estadoId', estado.toString());
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);

    return this.http.get<PaginatedResponse<SolicitudDto>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<SolicitudCreateDto> {
    return this.http.get<SolicitudCreateDto>(`${this.baseUrl}/${id}/edit`);
  }

  create(solicitud: SolicitudCreateDto): Observable<SolicitudDto> {
    return this.http.post<SolicitudDto>(this.baseUrl, solicitud);
  }

  update(id: number, solicitud: SolicitudCreateDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, solicitud);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  validarSuperposicion(visitanteId: number, f_Ingreso: string, f_Salida: string, solicitudId: number | null): Observable<{ esSuperpuesto: boolean }> {
    let params = new HttpParams()
      .set('visitanteId', visitanteId.toString())
      .set('f_Ingreso', f_Ingreso)
      .set('f_Salida', f_Salida);

    if (solicitudId) {
      params = params.set('solicitudId', solicitudId.toString());
    }

    return this.http.get<{ esSuperpuesto: boolean }>(`${this.baseUrl}/validar-superposicion`, { params });
  }
}
