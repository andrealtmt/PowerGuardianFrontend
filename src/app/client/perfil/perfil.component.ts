import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  perfilForm: FormGroup;
  passwordForm: FormGroup;
  mensaje: string = '';
  isError: boolean = false;

  paises: { nombre: string }[] = [
    { nombre: 'México' },
    { nombre: 'Argentina' },
    { nombre: 'Chile' },
    { nombre: 'Colombia' },
    { nombre: 'Perú' },
    { nombre: 'España' },
    { nombre: 'Estados Unidos' },
  ];

  showCurrentPassword = false;
  showNewPassword = false;
  showRepeatPassword = false;
  togglePasswordVisibility(field: 'currentPassword' | 'nuevaPassword' | 'repitePassword') {
    if (field === 'currentPassword') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'nuevaPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'repitePassword') {
      this.showRepeatPassword = !this.showRepeatPassword;
    }
  }

  constructor(private fb: FormBuilder, private userService: UserService, private auth: AuthService, private router: Router) {
    this.perfilForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: [''],
      email: [{ value: '', disabled: true }],
      telefono: [''],
      pais: [''],
      fechaNacimiento: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
      repitePassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userService.obtenerPerfil().subscribe({
      next: (user) => {
        this.perfilForm.patchValue({
          nombres: user.nombres,
          apellidoPaterno: user.apellidoPaterno,
          apellidoMaterno: user.apellidoMaterno,
          email: user.email,
          telefono: user.phoneNumber,
          pais: user.pais,
          fechaNacimiento: user.fechaNacimiento ? new Date(user.fechaNacimiento).toISOString().split('T')[0] : ''
        });
      },
      error: (error) => {
        this.isError = true;
        if (error.status === 401) {
          this.mensaje = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else {
          this.mensaje = 'Error al cargar el perfil.';
        }
        setTimeout(() => { this.mensaje = ''; this.isError = false; }, 3000);
      }
    });
  }

  guardarPerfil(): void {
    if (this.perfilForm.invalid) return;

    const formValue = this.perfilForm.value;
    const updateData = {
      nombres: formValue.nombres,
      apellidoPaterno: formValue.apellidoPaterno,
      apellidoMaterno: formValue.apellidoMaterno,
      telefono: formValue.telefono,
      pais: formValue.pais,
      fechaNacimiento: formValue.fechaNacimiento ? new Date(formValue.fechaNacimiento) : undefined
    };

    this.userService.actualizarPerfil(updateData).subscribe({
      next: () => {
        this.mensaje = '¡Perfil actualizado!';
        this.isError = false;
        this.auth.actualizarNombre(formValue.nombres);
        localStorage.setItem('apellidoPaterno', formValue.apellidoPaterno);
        this.auth["userSubject"].next(this.auth["cargarUsuarioDesdeStorage"]());
        setTimeout(() => { this.mensaje = ''; }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al actualizar el perfil.';
        this.isError = true;
        setTimeout(() => { this.mensaje = ''; this.isError = false; }, 3000);
      }
    });
  }

  cambiarPassword(): void {
    const { currentPassword, nuevaPassword, repitePassword } = this.passwordForm.value;
    if (this.passwordForm.invalid) {
      this.mensaje = 'Completa todos los campos correctamente.';
      this.isError = true;
      setTimeout(() => { this.mensaje = ''; this.isError = false; }, 3000);
      return;
    }
    if (nuevaPassword !== repitePassword) {
      this.mensaje = 'Las contraseñas no coinciden.';
      this.isError = true;
      setTimeout(() => { this.mensaje = ''; this.isError = false; }, 3000);
      return;
    }
    if (currentPassword === nuevaPassword) {
      this.mensaje = 'La nueva contraseña no puede ser igual a la actual.';
      this.isError = true;
      setTimeout(() => { this.mensaje = ''; this.isError = false; }, 3000);
      return;
    }

    this.userService.cambiarPassword(currentPassword, nuevaPassword).subscribe({
      next: () => {
        this.mensaje = '¡Contraseña actualizada!';
        this.isError = false;
        this.passwordForm.reset();
        setTimeout(() => { this.mensaje = ''; }, 3000);
      },
      error: (error) => {
        if (error?.error?.message) {
          this.mensaje = error.error.message;
        } else if (error?.status === 400 && error?.error?.errors) {
          const errores = error.error.errors;
          if (errores && Array.isArray(errores)) {
            this.mensaje = errores.join(' ');
          } else if (typeof errores === 'string') {
            this.mensaje = errores;
          } else {
            this.mensaje = 'La nueva contraseña no cumple con los requisitos.';
          }
        } else if (error?.status === 401) {
          this.mensaje = 'La contraseña actual es incorrecta.';
        } else {
          this.mensaje = 'La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una letra minúscula y un carácter especial.';
        }
        this.isError = true;
        setTimeout(() => { this.mensaje = ''; this.isError = false; }, 3000);
      }
    });
  }
}
