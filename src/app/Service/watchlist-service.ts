import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Watchlist, Portfolio } from '../Models/Interfaces';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7076/api/Watchlist'; 

  addToWatchlist(userId: number, stockId: number): Observable<Watchlist | null> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('stockId', stockId.toString());

    return this.http.post<Watchlist | null>(`${this.baseUrl}/add`, null, { params });
  }

  removeFromWatchlist(userId: number, stockId: number): Observable<boolean> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('stockId', stockId.toString());

    return this.http.delete<boolean>(`${this.baseUrl}/remove`, { params });
  }
  
  buyFromWatchlist(userId: number, stockId: number, boughtPrice: number): Observable<Portfolio | null> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('stockId', stockId.toString())
      .set('boughtPrice', boughtPrice.toString());

    return this.http.post<Portfolio | null>(`${this.baseUrl}/buy`, null, { params })
      .pipe(
        catchError(error => {
          console.error('Buy request failed:', error);
          throw error;
        })
      );
  }
}
