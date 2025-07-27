import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  public showPassword = false;
  public showConfirmPassword = false;

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
  paises: any[] = [];
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  fieldErrors: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private titleService: Title
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: [''],
      fechaNacimiento: ['', Validators.required],
      pais: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      sku: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.http.get<any[]>('assets/data/paises.json').subscribe(data => {
      this.paises = data;
    });

    this.titleService.setTitle('Registro - PowerGuardian');
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};
    const data = this.registerForm.value;
    this.authService.register(data).subscribe({
      next: () => {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;

        let msg = err?.error;
        if (typeof msg === 'string') {
          if (msg.includes('contraseña')) this.fieldErrors['password'] = msg;
          else if (msg.includes('correo')) this.fieldErrors['email'] = msg;
          else if (msg.includes('teléfono')) this.fieldErrors['telefono'] = msg;
          else if (msg.includes('SKU')) this.fieldErrors['sku'] = msg;
          else this.errorMessage = msg;
        } else if (Array.isArray(msg)) {
          this.errorMessage = msg.join(', ');
        } else {
          this.errorMessage = 'Error al registrar usuario.';
        }
      }
    });
  }
}
