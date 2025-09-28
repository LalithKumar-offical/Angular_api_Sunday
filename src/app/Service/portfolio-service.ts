import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Portfolio, PortfolioDto } from '../Models/Interfaces';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7076/api/Portfolio'; // your API base
  
  // Demo data storage
  private demoPendingPortfolios: Portfolio[] = [];
  private demoPortfolioId = 1;

  // 1️⃣ User requests a stock purchase (Pending status)
  requestPurchase(userId: number, stockId: number): Observable<Portfolio> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('stockId', stockId.toString());

    return this.http.post<Portfolio>(`${this.baseUrl}/request`, null, { params });
  }

  // 2️⃣ Admin approves or rejects a purchase
  approvePurchase(portfolioId: number, approve: boolean): Observable<Portfolio> {
    const params = new HttpParams()
      .set('portfolioId', portfolioId.toString())
      .set('approve', approve.toString());

    return this.http.post<Portfolio>(`${this.baseUrl}/approve`, null, { params });
  }

  // 3️⃣ User sells a stock
  sellStock(portfolioId: number, userId: number, sellPrice: number): Observable<void> {
    const params = new HttpParams()
      .set('portfolioId', portfolioId.toString())
      .set('userId', userId.toString())
      .set('sellPrice', sellPrice.toString());

    return this.http.post<void>(`${this.baseUrl}/sell`, null, { params });
  }

  // 4️⃣ Admin gets all pending portfolios
  getPendingPortfolios(): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(`${this.baseUrl}/pending`);
  }

  // 5️⃣ Get all portfolios of a user with profit/loss messages
  getUserPortfolios(userId: number): Observable<PortfolioDto[]> {
    return this.http.get<PortfolioDto[]>(`${this.baseUrl}/user/${userId}`);
  }

  // Mark message as read (you'll need to add this endpoint to backend)
  markMessageAsRead(portfolioId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/message/read/${portfolioId}`, {});
  }
}
