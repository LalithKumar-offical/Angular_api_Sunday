import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WatchlistService } from '../../../Service/watchlist-service';
import { PortfolioService } from '../../../Service/portfolio-service';
import { NotificationService } from '../../../Service/notification.service';
import { AuthService } from '../../../Service/auth-service';
import { Watchlist } from '../../../Models/Interfaces';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h4>Your Watchlist</h4>
      <div *ngIf="watchlist.length === 0" class="text-muted">No items in watchlist</div>
      <div class="row">
        <div class="col-md-4" *ngFor="let item of watchlist">
          <div class="card mb-3">
            <div class="card-body">
              <div class="d-flex align-items-center mb-2">
                <img *ngIf="item.stock?.logo" [src]="getStockLogoUrl(item.stock?.logo)" 
                     alt="{{item.stock?.companyName}} Logo" 
                     class="img-thumbnail me-2" 
                     style="max-width: 50px; max-height: 40px;"
                     (error)="onImageError($event)">
                <h6 class="mb-0">{{item.stock?.companyName}}</h6>
              </div>
              <p>Price: ₹{{item.stock?.priceofStock | number:'1.2-2'}}</p>
              <small class="text-muted">Added: {{item.addedDate | date}}</small>
              <div class="mt-2">
                <button class="btn btn-success btn-sm me-2" (click)="buyFromWatchlist(item.stockId, item.stock?.priceofStock || 0)">Buy</button>
                <button class="btn btn-outline-danger btn-sm" (click)="removeFromWatchlist(item.stockId)">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WatchlistComponent implements OnInit, OnDestroy {
  watchlist: Watchlist[] = [];
  private subscription?: Subscription;

  constructor(
    private watchlistService: WatchlistService,
    private portfolioService: PortfolioService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadWatchlist();
    // Subscribe to watchlist update notifications
    this.subscription = this.notificationService.watchlistUpdate$.subscribe(() => {
      this.loadWatchlist();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  loadWatchlist() {
    const userId = this.authService.currentUser?.userId;
    if (userId) {
      this.watchlistService.getUserWatchlist(userId).subscribe({
        next: (res) => {
          console.log('Watchlist loaded:', res);
          this.watchlist = res;
        },
        error: (err) => {
          console.error('Error loading watchlist:', err);
          this.watchlist = [];
        }
      });
    }
  }

  buyFromWatchlist(stockId: number, price: number) {
    const userId = this.authService.currentUser!.userId!;
    if (confirm(`Buy this stock for ₹${price}?`)) {
      this.portfolioService.requestPurchase(userId, stockId).subscribe({
        next: () => {
          // Remove from watchlist after successful purchase request
          this.watchlistService.removeFromWatchlist(userId, stockId).subscribe({
            next: () => {
              alert('Purchase request sent (Pending admin approval)');
              this.loadWatchlist();
            },
            error: (removeErr) => {
              console.error('Failed to remove from watchlist:', removeErr);
              alert('Purchase request sent (Pending admin approval)');
              this.loadWatchlist();
            }
          });
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

  removeFromWatchlist(stockId: number) {
    const userId = this.authService.currentUser!.userId!;
    this.watchlistService.removeFromWatchlist(userId, stockId).subscribe({
      next: () => {
        alert('Removed from watchlist');
        this.loadWatchlist();
      },
      error: (e) => alert('Error: ' + (e.error?.message || e.message))
    });
  }

  getStockLogoUrl(logo: any): string {
    if (!logo) return '';
    
    try {
      if (Array.isArray(logo)) {
        const uint8Array = new Uint8Array(logo);
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64String = btoa(binary);
        return `data:image/jpeg;base64,${base64String}`;
      }
      
      if (typeof logo === 'string') {
        return `https://localhost:7076/${logo}`;
      }
    } catch (error) {
      console.error('Error converting logo:', error);
    }
    
    return '';
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }
}
