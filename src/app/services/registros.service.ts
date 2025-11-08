import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Registro } from '../interfaces/registro.interface';
import { SugerenciaResponseDto } from '../interfaces/sugerencia.interface';

export interface RegistroCreatePayload {
  solicitudId: number;
  tipoRegistroId: number;
  observacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrosService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/registros`;

  getSugerencia(numeroDocumento: number) {
    const params = new HttpParams().set('numeroDocumento', numeroDocumento.toString());
    return this.http.get<SugerenciaResponseDto>(`${this.baseUrl}/sugerencia`, { params });
  }

  crearRegistro(payload: RegistroCreatePayload) {
    return this.http.post<Registro>(this.baseUrl, payload);
  }
}
