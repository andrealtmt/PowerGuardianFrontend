import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:7009/api/user/login'; // TODO: mover a environments
  private userSubject = new BehaviorSubject<any>(this.cargarUsuarioDesdeStorage());
  usuario$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<{
    nombre: string;
    nombres: string;
    apellidoPaterno: string; token: string; id: string; role: string
}> {
    const body = {
      Username: credentials.email,
      Password: credentials.password
    };

    return this.http.post<any>(this.apiUrl, body).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('id', res.id);
        localStorage.setItem('role', res.role);
        localStorage.setItem('nombre', res.nombre || 'Usuario');
        localStorage.setItem('nombres', res.nombres || '');
        localStorage.setItem('apellidoPaterno', res.apellidoPaterno || '');
        this.userSubject.next(this.cargarUsuarioDesdeStorage());
      })
    );
  }

  logout() {
    localStorage.clear();
    this.userSubject.next(null);
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

  getToken() {
    return localStorage.getItem('token');
  }

  getRole() {
    return localStorage.getItem('role');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  getUsuario() {
    return this.userSubject.value;
  }

  actualizarNombre(nombres: string) {
    localStorage.setItem('nombres', nombres);
    this.userSubject.next(this.cargarUsuarioDesdeStorage());
  }

  private cargarUsuarioDesdeStorage() {
    return {
      id: localStorage.getItem('id'),
      rol: localStorage.getItem('role'),
      nombre: localStorage.getItem('nombre') || 'Usuario',
      nombres: localStorage.getItem('nombres') || '',
      apellidoPaterno: localStorage.getItem('apellidoPaterno') || ''
    };
  }
}
