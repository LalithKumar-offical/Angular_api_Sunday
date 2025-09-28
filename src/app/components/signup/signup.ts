import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../Service/user-service';
import { User } from '../../Models/Interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  user: Partial<User> = {};
  selectedFile?: File;
  emailError = '';
  passwordError = '';
  showPassword = false;

  constructor(private userService: UserService, private router: Router) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  validateEmail() {
    const email = this.user.email || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = !emailRegex.test(email) ? 'Please enter a valid email address' : '';
  }

  validatePassword() {
    const password = this.user.password || '';
    if (password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])/.test(password)) {
      this.passwordError = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      this.passwordError = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(password)) {
      this.passwordError = 'Password must contain at least one number';
    } else if (!/(?=.*[@$!%*?&])/.test(password)) {
      this.passwordError = 'Password must contain at least one special character (@$!%*?&)';
    } else {
      this.passwordError = '';
    }
  }

  signup() {
    console.log('Signup button clicked');
    console.log('User data:', this.user);
    
    // Basic validation
    if (!this.user.userName?.trim()) {
      alert('Please enter your full name');
      return;
    }
    
    if (!this.user.email?.trim()) {
      alert('Please enter your email');
      return;
    }
    
    if (!this.user.password?.trim()) {
      alert('Please enter a password');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Password validation
    if (this.user.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    console.log('All validations passed, calling userService.createUser');
    
    this.userService.createUser(this.user as User, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
        alert('Account created successfully! Please wait for admin verification.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Signup failed:', err);
        alert('Signup failed: ' + (err.error?.message || err.message || 'Please try again'));
      }
    });
  }
}
