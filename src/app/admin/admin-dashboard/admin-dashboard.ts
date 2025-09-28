import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Service/user-service';
import { PortfolioService } from '../../Service/portfolio-service';
import { User, Portfolio } from '../../Models/Interfaces';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  users: User[] = [];
  pendingPortfolios: Portfolio[] = [];
  pendingUsers: User[] = [];

  activeTab: string = 'users';

  constructor(
    private userService: UserService,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadPendingPortfolios();
    this.loadPendingUsers();
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (res) => this.users = res,
      error: (err) => console.error('Error loading users', err)
    });
  }

  loadPendingPortfolios() {
    this.portfolioService.getPendingPortfolios().subscribe({
      next: (res) => this.pendingPortfolios = res,
      error: (err) => console.error('Error loading portfolios', err)
    });
  }

  loadPendingUsers() {
    this.userService.getPendingUsers().subscribe({
      next: (res) => this.pendingUsers = res,
      error: (err) => console.error('Error loading pending users', err)
    });
  }

  approvePortfolio(portfolioId: number, approve: boolean) {
    this.portfolioService.approvePurchase(portfolioId, approve).subscribe({
      next: () => this.loadPendingPortfolios(),
      error: (err) => console.error('Error approving portfolio', err)
    });
  }

  approveUser(userId: number) {
    this.userService.approveUser(userId).subscribe({
      next: () => this.loadPendingUsers(),
      error: (err) => console.error('Error approving user', err)
    });
  }
}
