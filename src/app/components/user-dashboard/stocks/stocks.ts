import { Component, OnInit } from '@angular/core';
import { StockService } from '../../../Service/stock-service';
import { WatchlistService } from '../../../Service/watchlist-service';
import { PortfolioService } from '../../../Service/portfolio-service';
import { Stock } from '../../../Models/Interfaces';
import { AuthService } from '../../../Service/auth-service';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
})
export class StocksComponent implements OnInit {
  stocks: Stock[] = [];
  filterName: string = '';
  fromDate?: Date;
  toDate?: Date;

  constructor(
    private stockService: StockService,
    private watchlistService: WatchlistService,
    private portfolioService: PortfolioService,
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
    if (this.fromDate) {
      this.stockService.filterByDate(this.fromDate, this.toDate).subscribe(res => this.stocks = res);
    }
  }

  addToWatchlist(stockId: number) {
    const userId = this.authService.currentUser!.userId!;
    this.watchlistService.addToWatchlist(userId, stockId).subscribe(() => alert('Added to watchlist'));
  }

  buyStock(stockId: number, price: number) {
    const userId = this.authService.currentUser!.userId!;
    if (confirm(`Do you want to buy this stock for ₹${price}?`)) {
      this.portfolioService.requestPurchase(userId, stockId).subscribe(() => alert('Purchase request sent (Pending approval)'));
    }
  }
}
