import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../Service/user-service';
import { PortfolioService } from '../../Service/portfolio-service';
import { StockService } from '../../Service/stock-service';
import { AuthService } from '../../Service/auth-service';
import { ThemeService } from '../../Service/theme.service';
import { User, Portfolio, Stock } from '../../Models/Interfaces';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  users: User[] = [];
  pendingPortfolios: Portfolio[] = [];
  pendingUsers: User[] = [];
  stocks: Stock[] = [];

  activeTab: string = 'users';
  
  // Stock management
  editingStock: Stock | null = null;
  newStock = { companyName: '', priceofStock: 0 };
  selectedLogoFile: File | null = null;
  newStockLogoFile: File | null = null;
  showCreateForm = false;
  showImageModal = false;
  modalImageSrc = '';
  modalImageAlt = '';

  constructor(
    private userService: UserService,
    private portfolioService: PortfolioService,
    private stockService: StockService,
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated and is admin
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/forbidden']);
      return;
    }
    
    console.log('Admin authenticated, loading data...');
    console.log('Current token:', this.authService.getToken());
    console.log('Current user:', this.authService.currentUser);
    this.loadUsers();
    this.loadPendingPortfolios();
    this.loadPendingUsers();
    this.loadStocks();
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (res) => {
        console.log('Users loaded:', res);
        this.users = res;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        alert('Failed to load users: ' + (err.error?.message || err.message));
      }
    });
  }

  loadPendingPortfolios() {
    console.log('Making request to /api/Portfolio/pending with token:', this.authService.getToken());
    this.portfolioService.getPendingPortfolios().subscribe({
      next: (res) => {
        console.log('Pending portfolios loaded:', res);
        this.pendingPortfolios = res;
      },
      error: (err) => {
        console.error('Error loading portfolios:', err);
        console.error('Full error:', err);
        alert('Failed to load pending portfolios: ' + (err.error?.message || err.message));
      }
    });
  }

  loadPendingUsers() {
    console.log('Making request to /api/User/Pending with token:', this.authService.getToken());
    this.userService.getPendingUsers().subscribe({
      next: (res) => {
        console.log('Pending users loaded:', res);
        console.log('First pending user PAN:', res[0]?.pan);
        this.pendingUsers = res;
      },
      error: (err) => {
        console.error('Error loading pending users:', err);
        console.error('Full error:', err);
        alert('Failed to load pending users: ' + (err.error?.message || err.message));
      }
    });
  }

  approvePortfolio(portfolioId: number, approve: boolean) {
    if (approve) {
      // Find the portfolio to check funds
      const portfolio = this.pendingPortfolios.find(p => p.portfolioId === portfolioId);
      if (portfolio && this.hasInsufficientFunds(portfolio.userId, portfolio.boughtPrice)) {
        alert('Cannot approve: User has insufficient funds!');
        return;
      }
    }
    
    this.portfolioService.approvePurchase(portfolioId, approve).subscribe({
      next: () => {
        alert(`Stock purchase ${approve ? 'approved' : 'rejected'} successfully!`);
        // Refresh both portfolios and users to show updated balances
        this.loadPendingPortfolios();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error approving portfolio', err);
        alert('Error processing request: ' + (err.error?.message || err.message));
      }
    });
  }

  approveUser(user: User) {
    this.userService.approveUser(user).subscribe({
      next: () => {
        alert('User account verified successfully!');
        this.loadPendingUsers();
      },
      error: (err) => {
        console.error('Error approving user', err);
        alert('Error verifying user: ' + (err.error?.message || err.message));
      }
    });
  }

  loadStocks() {
    this.stockService.getAll().subscribe({
      next: (res) => this.stocks = res,
      error: (err) => console.error('Error loading stocks', err)
    });
  }

  updateStock(stock: Stock) {
    console.log('Updating stock with logo file:', this.selectedLogoFile);
    console.log('Current token:', this.authService.getToken());
    console.log('Current user:', this.authService.currentUser);
    
    // Check if user is still authenticated
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      alert('Session expired. Please login again.');
      this.router.navigate(['/login']);
      return;
    }
    
    this.stockService.updateStock(stock.stockId, stock, this.selectedLogoFile || undefined).subscribe({
      next: (response) => {
        console.log('Stock update response:', response);
        alert('Stock updated successfully!');
        this.editingStock = null;
        this.selectedLogoFile = null;
        // Reload stocks to see updated logo
        setTimeout(() => {
          this.loadStocks();
        }, 500);
      },
      error: (err) => {
        console.error('Stock update error:', err);
        console.error('Error status:', err.status);
        console.error('Error headers:', err.headers);
        
        if (err.status === 403) {
          alert('Access denied. Please check your admin permissions and try logging in again.');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          alert('Error updating stock: ' + (err.error?.message || err.message));
        }
      }
    });
  }

  onLogoFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogoFile = file;
      console.log('Logo file selected:', file.name);
    }
  }

  deleteStock(stockId: number) {
    if (confirm('Are you sure you want to delete this stock?')) {
      this.stockService.deleteStock(stockId).subscribe({
        next: () => {
          alert('Stock deleted successfully!');
          this.loadStocks();
        },
        error: (err) => alert('Error deleting stock: ' + (err.error?.message || err.message))
      });
    }
  }

  startEdit(stock: Stock) {
    this.editingStock = { ...stock };
  }

  cancelEdit() {
    this.editingStock = null;
    this.selectedLogoFile = null;
  }

  getFileUrl(filePath: string): string {
    if (!filePath) return '';
    
    console.log('File path received:', filePath);
    
    // Remove leading slash if present and construct proper URL
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullUrl = `https://localhost:7076/${cleanPath}`;
    
    console.log('Constructed URL:', fullUrl);
    return fullUrl;
  }

  getStockLogoUrl(logo: any): string {
    if (!logo) {
      return '';
    }
    
    try {
      // If logo is already a base64 string, add data URL prefix
      if (typeof logo === 'string') {
        // Check if it's already a data URL
        if (logo.startsWith('data:')) {
          return logo;
        }
        // Check if it's a base64 string (starts with common base64 image prefixes)
        if (logo.startsWith('iVBORw0KGgo') || logo.startsWith('/9j/') || logo.startsWith('UklGR')) {
          // Determine image type based on base64 prefix
          let mimeType = 'image/png';
          if (logo.startsWith('/9j/')) mimeType = 'image/jpeg';
          if (logo.startsWith('UklGR')) mimeType = 'image/webp';
          
          return `data:${mimeType};base64,${logo}`;
        }
        // Otherwise treat as file path
        return `https://localhost:7076/${logo}`;
      }
      
      // If logo is byte array, convert to base64
      if (Array.isArray(logo) && logo.length > 0) {
        const uint8Array = new Uint8Array(logo);
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64String = btoa(binary);
        return `data:image/png;base64,${base64String}`;
      }
      
    } catch (error) {
      console.error('Error converting logo:', error);
    }
    
    return '';
  }

  onImageError(event: any) {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZpbGUgbm90IGZvdW5kPC90ZXh0Pjwvc3ZnPg==';
  }

  showImageInModal(src: string, alt: string) {
    this.modalImageSrc = src;
    this.modalImageAlt = alt;
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
  }

  getUserBalance(userId: number): number {
    const user = this.users.find(u => u.userId === userId);
    return user?.balance || 0;
  }

  hasInsufficientFunds(userId: number, boughtPrice: number): boolean {
    const userBalance = this.getUserBalance(userId);
    return userBalance < boughtPrice;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  get isDarkMode(): boolean {
    return this.themeService.currentTheme;
  }

  createStock() {
    if (!this.newStock.companyName || !this.newStock.priceofStock) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if user is still authenticated
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      alert('Session expired. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    this.stockService.createStock(this.newStock, this.newStockLogoFile || undefined).subscribe({
      next: (response) => {
        alert('Stock created successfully!');
        this.newStock = { companyName: '', priceofStock: 0 };
        this.newStockLogoFile = null;
        this.showCreateForm = false;
        this.loadStocks();
      },
      error: (err) => {
        console.error('Stock creation error:', err);
        
        if (err.status === 403) {
          alert('Access denied. Please check your admin permissions and try logging in again.');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          alert('Error creating stock: ' + (err.error?.message || err.message));
        }
      }
    });
  }

  onNewStockLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newStockLogoFile = file;
      console.log('New stock logo file selected:', file.name);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
