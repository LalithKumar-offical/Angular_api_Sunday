import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Service/auth-service';
import { UserService } from '../../../Service/user-service';
import { User } from '../../../Models/Interfaces';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-settings.component.html'
})
export class AccountSettingsComponent implements OnInit {
  user: User = {} as User;
  selectedFile?: File;
  addBalanceAmount: number = 0;

  constructor(private auth: AuthService, private userService: UserService) {}

  ngOnInit() {
    // Load fresh user data from the backend
    const currentUser = this.auth.currentUser;
    if (currentUser?.userId) {
      this.userService.getUserById(currentUser.userId).subscribe({
        next: (userData) => {
          this.user = { ...userData };
          console.log('Loaded user data:', this.user);
        },
        error: (err) => {
          console.error('Error loading user data:', err);
          // Fallback to current user from auth service
          this.user = { ...this.auth.currentUser! };
        }
      });
    } else {
      this.user = { ...this.auth.currentUser! };
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  update() {
    console.log('User data being sent:', this.user);
    this.userService.updateUser(this.user, this.selectedFile).subscribe({
      next: (res) => {
        alert('Account updated successfully');
        this.auth.setCurrentUser(res);
      },
      error: (err) => {
        console.error('Update failed:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.error);
        
        // Display specific validation errors
        if (err.error && err.error.errors) {
          console.error('Validation errors:', err.error.errors);
          let errorMsg = 'Validation errors:\n';
          for (const field in err.error.errors) {
            errorMsg += `${field}: ${err.error.errors[field].join(', ')}\n`;
          }
          alert(errorMsg);
        } else {
          alert('Failed to update account. Check console for details.');
        }
      }
    });
  }

  addBalance() {
    if (this.addBalanceAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const newBalance = (this.user.balance || 0) + this.addBalanceAmount;
    
    this.userService.updateBalance(this.user.userId, newBalance).subscribe({
      next: (res) => {
        alert(`₹${this.addBalanceAmount} added successfully to database!`);
        this.addBalanceAmount = 0;
        
        // Refresh user data from database to get accurate balance
        this.userService.getUserById(this.user.userId).subscribe({
          next: (userData) => {
            this.user = { ...userData };
            this.auth.setCurrentUser(userData);
            console.log('Database balance updated:', userData.balance);
          },
          error: (err) => {
            console.error('Error refreshing user data:', err);
            // Fallback to manual update
            this.user.balance = newBalance;
            const updatedUser = { ...this.user, balance: newBalance };
            this.auth.setCurrentUser(updatedUser);
          }
        });
      },
      error: (err) => {
        console.error('Add balance error:', err);
        alert('Failed to add balance to database: ' + (err.error?.message || err.message));
      }
    });
  }
}
