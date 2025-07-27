import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HistorialComprasService {
  private apiUrl = 'https://localhost:7009/api/compras';

  constructor(private http: HttpClient) {}

  obtenerHistorial(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis`);
  }

  enviarResena(data: any): Observable<any> {
    return this.http.post('https://localhost:7009/api/resena', data);
  }
}
