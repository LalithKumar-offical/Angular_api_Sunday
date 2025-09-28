import { Component, OnInit } from '@angular/core';
import { WatchlistService } from '../../../Service/watchlist-service';
import { AuthService } from '../../../Service/auth-service';
import { PortfolioService } from '../../../Service/portfolio-service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
})
export class WatchlistComponent implements OnInit {
  watchlist: any[] = [];

  constructor(
    private watchlistService: WatchlistService,
    private portfolioService: PortfolioService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadWatchlist();
  }

  loadWatchlist() {
    const userId = this.authService.currentUser!.userId!;
    // You can create WatchlistService.getUserWatchlist(userId)
    // For now, assume it fetches watchlist
  }

  buyFromWatchlist(stockId: number, price: number) {
    const userId = this.authService.currentUser!.userId!;
    if (confirm(`Buy this stock for ₹${price}?`)) {
      this.watchlistService.buyFromWatchlist(userId, stockId, price).subscribe(() => {
        alert('Purchase request sent (Pending approval)');
        this.loadWatchlist();
      });
    }
  }
}
