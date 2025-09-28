import { Component } from '@angular/core';
import { UserService } from '../../Service/user-service';
import { User } from '../../Models/Interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  user: Partial<User> = {};
  selectedFile?: File; // ✅ Store the actual File object

  constructor(private userService: UserService, private router: Router) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  signup() {
    this.userService.createUser(this.user as User, this.selectedFile).subscribe({
      next: () => {
        alert('Signup successful! Waiting for admin verification.');
        this.router.navigate(['/login']);
      },
      error: (err) => console.error(err)
    });
  }
}
