import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Motivo, MotivoCreate, MotivoUpdate } from '../interfaces/motivo.interface';

@Injectable({
  providedIn: 'root'
})
export class MotivosService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/Motivos`;

  getAllMotivos(): Observable<Motivo[]> {
    return this.http.get<Motivo[]>(this.baseUrl);
  }

  getMotivoById(id: number): Observable<Motivo> {
    return this.http.get<Motivo>(`${this.baseUrl}/${id}`);
  }

  createMotivo(motivo: MotivoCreate): Observable<Motivo> {
    return this.http.post<Motivo>(this.baseUrl, motivo);
  }

  updateMotivo(id: number, motivo: MotivoUpdate): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, motivo);
  }

  deleteMotivo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
