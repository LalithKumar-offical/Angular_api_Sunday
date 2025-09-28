import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../Service/portfolio-service';
import { AuthService } from '../../../Service/auth-service';
import { PortfolioDto } from '../../../Models/Interfaces';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.html'
})
export class PortfolioComponent implements OnInit {
  portfolios: PortfolioDto[] = [];
  notifications: { portfolioId: number, message: string }[] = [];

  constructor(
    private portfolioService: PortfolioService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPortfolio();
  }

  loadPortfolio() {
    const userId = this.authService.currentUser?.userId;
    if (userId) {
      this.portfolioService.getUserPortfolios(userId).subscribe({
        next: (res) => {
          // Show all portfolios regardless of messages
          this.portfolios = res;
          // Extract notifications from items with messages
          this.notifications = res
            .filter(item => item.message)
            .map(item => ({
              portfolioId: item.portfolio.portfolioId,
              message: item.message!
            }));
        },
        error: (e) => {
          console.error('Error loading portfolio', e);
          // Set empty array to prevent UI issues
          this.portfolios = [];
          this.notifications = [];
          
          if (e.status === 500) {
            console.log('Server error loading portfolio - showing empty portfolio');
          } else if (e.status === 404) {
            console.log('No portfolio found for user - showing empty portfolio');
          }
        }
      });
    }
  }

  dismissNotification(portfolioId: number) {
    // Remove from UI immediately
    this.notifications = this.notifications.filter(n => n.portfolioId !== portfolioId);
    
    // Mark as read on backend (optional - you can add this endpoint)
    this.portfolioService.markMessageAsRead(portfolioId).subscribe({
      next: () => console.log('Message marked as read'),
      error: (e) => console.error('Error marking message as read', e)
    });
  }

  getStatusName(status: number): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Approved': return 'badge bg-success';
      case 'Pending': return 'badge bg-warning';
      case 'Rejected': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  sellStock(portfolioId: number, stockName: string) {
    if (confirm(`Are you sure you want to sell ${stockName}?`)) {
      const userId = this.authService.currentUser?.userId;
      if (!userId) {
        alert('User not authenticated');
        return;
      }
      
      // Get current stock price for selling
      const portfolio = this.portfolios.find(p => p.portfolio.portfolioId === portfolioId);
      const sellPrice = portfolio?.portfolio.stock?.priceofStock || 0;
      
      this.portfolioService.sellStock(portfolioId, userId, sellPrice).subscribe({
        next: () => {
          alert('Stock sold successfully!');
          // Refresh user data to get updated balance
          this.authService.refreshCurrentUser();
          this.loadPortfolio();
        },
        error: (err) => {
          console.error('Error selling stock:', err);
          
          if (err.status === 500) {
            alert('Server error occurred while selling stock. Please try again later.');
          } else if (err.status === 404) {
            alert('Stock not found or already sold.');
            this.loadPortfolio(); // Refresh to show current state
          } else {
            alert('Error selling stock: ' + (err.error?.message || err.message));
          }
        }
      });
    }
  }

  getProfitLoss(boughtPrice: number, currentPrice: number): { amount: number, percentage: number, isProfit: boolean } {
    const amount = currentPrice - boughtPrice;
    const percentage = (amount / boughtPrice) * 100;
    return {
      amount,
      percentage,
      isProfit: amount >= 0
    };
  }

  getGraphHeight(boughtPrice: number, currentPrice: number): number {
    const ratio = currentPrice / boughtPrice;
    // Scale the height between 30% and 100% for better visualization
    if (ratio >= 1) {
      // Profit: scale from 50% to 100%
      return Math.min(50 + (ratio - 1) * 100, 100);
    } else {
      // Loss: scale from 30% to 50%
      return Math.max(30, 50 * ratio);
    }
  }
}
