import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../Service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="min-vh-100 d-flex align-items-center bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h2 class="fw-bold text-primary">Welcome Back</h2>
                <p class="text-muted">Sign in to your account</p>
              </div>
              
              <form (ngSubmit)="login()" #f="ngForm">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Email Address</label>
                  <input class="form-control form-control-lg" 
                         placeholder="Enter your email" 
                         [(ngModel)]="user.email" 
                         name="email" 
                         type="email"
                         required>
                </div>
                
                <div class="mb-4">
                  <label class="form-label fw-semibold">Password</label>
                  <div class="input-group">
                    <input class="form-control form-control-lg" 
                           [type]="showPassword ? 'text' : 'password'" 
                           placeholder="Enter your password" 
                           [(ngModel)]="user.password" 
                           name="password" 
                           required>
                    <button class="btn btn-outline-secondary" type="button" (click)="togglePassword()">
                      {{showPassword ? '🙈' : '👁️'}}
                    </button>
                  </div>
                </div>
                
                <button class="btn btn-primary btn-lg w-100 mb-3" type="submit">
                  Sign In
                </button>
                
                <div class="text-center">
                  <span class="text-muted">Don't have an account? </span>
                  <a routerLink="/signup" class="text-primary text-decoration-none fw-semibold">Sign Up</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class LoginComponent {
  user = { email: '', password: '' };
  showPassword = false;
  
  constructor(private auth: AuthService, private router: Router){}
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login(){ 
    this.auth.login(this.user).subscribe({
      next: () => {
        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/user']);
        }
      },
      error: (e) => alert('Login failed: ' + (e.error?.message || e.message))
    });
  }
}
