import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../../Service/stock-service';
import { WatchlistService } from '../../../Service/watchlist-service';
import { PortfolioService } from '../../../Service/portfolio-service';
import { NotificationService } from '../../../Service/notification.service';
import { Stock } from '../../../Models/Interfaces';
import { AuthService } from '../../../Service/auth-service';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stocks.component.html',
})
export class StocksComponent implements OnInit {
  stocks: Stock[] = [];
  filterName: string = '';
  fromDate?: string;
  toDate?: string;
  showImageModal = false;
  modalImageSrc = '';
  modalImageAlt = '';

  constructor(
    private stockService: StockService,
    private watchlistService: WatchlistService,
    private portfolioService: PortfolioService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStocks();
  }

  loadStocks() {
    this.stockService.getAll().subscribe(res => this.stocks = res);
  }

  searchByName() {
    if (this.filterName) {
      this.stockService.searchByName(this.filterName).subscribe(res => this.stocks = res);
    } else this.loadStocks();
  }

  filterByDate() {
    if (!this.fromDate) {
      alert('Please select a from date');
      return;
    }
    
    const fromDateObj = new Date(this.fromDate);
    const toDateObj = this.toDate ? new Date(this.toDate) : undefined;
    
    // Validate dates
    if (isNaN(fromDateObj.getTime())) {
      alert('Invalid from date');
      return;
    }
    
    if (toDateObj && isNaN(toDateObj.getTime())) {
      alert('Invalid to date');
      return;
    }
    
    console.log('Filtering by date:', { 
      fromDate: this.fromDate, 
      toDate: this.toDate,
      fromDateObj: fromDateObj.toISOString(),
      toDateObj: toDateObj?.toISOString()
    });
    
    this.stockService.filterByDate(fromDateObj, toDateObj).subscribe({
      next: (res) => {
        console.log('Date filter response:', res);
        this.stocks = res;
        if (res.length === 0) {
          alert('No stocks found for the selected date range');
        }
      },
      error: (err) => {
        console.error('Date filter error:', err);
        alert('Error filtering by date: ' + (err.error?.message || err.message));
        // Reload all stocks on error
        this.loadStocks();
      }
    });
  }

  addToWatchlist(stockId: number) {
    const userId = this.authService.currentUser!.userId!;
    console.log('Adding stock to watchlist:', { userId, stockId });
    
    this.watchlistService.addToWatchlist(userId, stockId).subscribe({
      next: (res) => {
        console.log('Watchlist add response:', res);
        if (res) {
          alert('Added to watchlist successfully!');
          // Notify watchlist component to refresh
          this.notificationService.notifyWatchlistUpdate();
          // Optionally reload watchlist to verify
          this.verifyWatchlistAdd(userId);
        } else {
          alert('Failed to add to watchlist - no response data');
        }
      },
      error: (err) => {
        console.error('Watchlist error:', err);
        console.error('Full error response:', err.error);
        alert('Error adding to watchlist: ' + (err.error?.message || err.message));
      }
    });
  }

  private verifyWatchlistAdd(userId: number) {
    this.watchlistService.getUserWatchlist(userId).subscribe({
      next: (watchlist) => {
        console.log('Current user watchlist:', watchlist);
      },
      error: (err) => console.error('Error loading watchlist:', err)
    });
  }

  buyStock(stockId: number, price: number) {
    const userId = this.authService.currentUser!.userId!;
    if (confirm(`Do you want to buy this stock for ₹${price}?`)) {
      this.portfolioService.requestPurchase(userId, stockId).subscribe({
        next: () => {
          alert('Purchase request sent (Pending approval)');
          // Refresh user balance after purchase request
          this.authService.refreshCurrentUser();
        },
        error: (err) => {
          console.error('Purchase error:', err);
          const errorMessage = err.error?.message || err.message || '';
          if (errorMessage.toLowerCase().includes('insufficient') || errorMessage.toLowerCase().includes('balance')) {
            alert('Insufficient balance! Please add money to your account.');
          } else {
            alert('Purchase failed: ' + errorMessage);
          }
        }
      });
    }
  }

  getStockLogoUrl(logo: any): string {
    if (!logo) return '';
    
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
      if (Array.isArray(logo)) {
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
    event.target.style.display = 'none';
  }

  showImageInModal(src: string, alt: string) {
    this.modalImageSrc = src;
    this.modalImageAlt = alt;
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
  }
}
