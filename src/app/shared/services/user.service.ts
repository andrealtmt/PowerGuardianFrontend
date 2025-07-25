import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7009/api/user';

  constructor(private http: HttpClient) {}

  obtenerPerfil(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  actualizarPerfil(data: {
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    email?: string;
    telefono?: string;
    pais?: string;
    fechaNacimiento?: Date;
  }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/me`, data);
  }

  cambiarPassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/me/password`, {
      currentPassword,
      newPassword
    });
  }

  // Método temporal para debug
  debugClaims(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/debug-claims`);
  }
}
