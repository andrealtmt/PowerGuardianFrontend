import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ManualService {
  private apiUrl = 'https://localhost:7009/api/manuales';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  subir(manualData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, manualData);
  }

  eliminar(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/eliminar`, {});
  }
}
