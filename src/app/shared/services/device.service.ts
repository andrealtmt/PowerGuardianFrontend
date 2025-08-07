import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private apiUrl = 'https://localhost:7009/api/dispositivos';
  private recargaSubject = new Subject<void>();

  recargar$ = this.recargaSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Listar dispositivos del usuario actual
  listarMisDispositivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis`);
  }

  // Cambiar estado del dispositivo (on/off)
  cambiarEstado(id: string, estado: 'on' | 'off'): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { estado });
  }

  // Asociar dispositivo por SKU
  asociarDispositivo(sku: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/asociar`, { sku });
  }

  // Obtener consumo actual
  obtenerConsumo(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/consumo`);
  }

  // (Opcional) Obtener historial de consumo
  obtenerHistorial(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/historial`);
  }

  emitirRecarga() {
    this.recargaSubject.next();
  }
}
