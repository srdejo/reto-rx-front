import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/application/use-cases/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css'
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly birthDate = signal('');
  readonly error = signal('');
  readonly loading = signal(false);

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl(this.auth.getRole() === 'ADMIN' ? '/admin' : '/user');
    }
  }

  async submit(): Promise<void> {
    if (this.loading()) return;
    this.error.set('');
    this.loading.set(true);
    try {
      await this.auth.register({
        name: this.name().trim(),
        email: this.email().trim(),
        password: this.password(),
        birthDate: this.birthDate()
      });
      this.router.navigateByUrl('/user');
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 409) {
        this.error.set(err.error?.message ?? 'Este correo ya está registrado.');
      } else {
        this.error.set('No fue posible completar el registro. Intenta de nuevo.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
