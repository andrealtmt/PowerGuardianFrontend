import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  fieldErrors: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private titleService: Title
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Iniciar Sesión - PowerGuardian');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.fieldErrors = {};

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        const role = this.authService.getRole();
        this.loading = false;

        if (role === 'Admin') {
          this.router.navigate(['admin/dashboard']);
        } else if (role === 'Cliente') {
          this.router.navigate(['client/panel']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.loading = false;
        let msg = err?.error;
        if (typeof msg === 'string') {
          if (msg.toLowerCase().includes('usuario')) this.fieldErrors['email'] = msg;
          else if (msg.toLowerCase().includes('credencial') || msg.toLowerCase().includes('contraseña')) this.fieldErrors['password'] = msg;
          else this.errorMessage = msg;
        } else {
          this.errorMessage = 'Credenciales incorrectas o error de conexión.';
        }
      }
    });
  }
}
