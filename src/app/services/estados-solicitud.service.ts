import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EstadoSolicitud, EstadoSolicitudCreate } from '../interfaces/estado-solicitud.interface';

@Injectable({
  providedIn: 'root'
})
export class EstadoSolicitudService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/EstadosSolicitud`;

  create(item: EstadoSolicitudCreate): Observable<EstadoSolicitud> {
    return this.http.post<EstadoSolicitud>(this.baseUrl, item);
  }

  getAll(): Observable<EstadoSolicitud[]> {
    return this.http.get<EstadoSolicitud[]>(this.baseUrl);
  }

  update(id: number, item: EstadoSolicitud): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<void>(url, item);
  }

  delete(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
