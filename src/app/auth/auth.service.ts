import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:7009/api/user/login'; // todo: hacer un env

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<{ token: string; id: string; role: string }> {
    const body = {
      Username: credentials.email,
      Password: credentials.password
    };
    return this.http.post<{ token: string; id: string; role: string }>(this.apiUrl, body).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('id', res.id);
        localStorage.setItem('role', res.role);
      })
    );
  }

  logout() {
    localStorage.clear();
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRole() {
    return localStorage.getItem('role');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  register(data: any) {
    const body = {
      Username: data.username,
      Password: data.password,
      ConfirmPassword: data.confirmPassword,
      Nombres: data.nombres,
      ApellidoPaterno: data.apellidoPaterno,
      ApellidoMaterno: data.apellidoMaterno,
      FechaNacimiento: data.fechaNacimiento,
      Pais: data.pais,
      Email: data.email,
      Telefono: data.telefono,
      SKU: data.sku
    };
    return this.http.post<any>('https://localhost:7009/api/user/register', body);
  }
}
