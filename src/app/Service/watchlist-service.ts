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

    console.log('Adding to watchlist:', { userId, stockId });
    console.log('Request URL:', `${this.baseUrl}/add`);
    console.log('Request params:', params.toString());

    return this.http.post<Watchlist | null>(`${this.baseUrl}/add`, null, { params })
      .pipe(
        catchError(error => {
          console.error('Add to watchlist failed:', error);
          throw error;
        })
      );
  }

  removeFromWatchlist(userId: number, stockId: number): Observable<boolean> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('stockId', stockId.toString());

    return this.http.delete<boolean>(`${this.baseUrl}/remove`, { params });
  }
  
  buyFromWatchlist(userId: number, stockId: number, boughtPrice: number): Observable<Portfolio | null> {
    // Use direct URL construction to avoid parameter encoding issues
    const url = `${this.baseUrl}/buy?userId=${userId}&stockId=${stockId}&boughtPrice=${boughtPrice}`;
    
    console.log('Buy request URL:', url);
    console.log('Buy request params:', { userId, stockId, boughtPrice });

    return this.http.post<Portfolio | null>(url, null)
      .pipe(
        catchError(error => {
          console.error('Buy request failed:', error);
          console.error('Error details:', error.error);
          throw error;
        })
      );
  }

 getUserWatchlist(userId: number): Observable<Watchlist[]> {
  return this.http.get<Watchlist[]>(`${this.baseUrl}/GetByUser/${userId}`);
}
}
