import { Component } from '@angular/core';
import { AuthService } from '../../../Service/auth-service';
import { UserService } from '../../../Service/user-service';
import { User } from '../../../Models/Interfaces';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html'
})
export class AccountSettingsComponent {
  user: User;
  selectedFile?: File;

  constructor(private auth: AuthService, private userService: UserService) {
    // clone current user to avoid modifying the subject directly
    this.user = { ...this.auth.currentUser! };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  update() {
    this.userService.updateUser(this.user, this.selectedFile).subscribe({
      next: (res) => {
        alert('Account updated successfully');
        // Update the current user in AuthService safely
        this.auth.setCurrentUser(res);
      },
      error: (err) => {
        console.error(err);
        alert('Failed to update account');
      }
    });
  }
}
