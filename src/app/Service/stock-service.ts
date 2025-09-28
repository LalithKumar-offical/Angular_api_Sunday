import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../Models/Interfaces';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7076/api/Stock';

  // Get all stocks
  getAll(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.baseUrl);
  }

  // Get stock by ID
  getById(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.baseUrl}/${id}`);
  }

  // Create stock with optional logo
  addStock(stock: Partial<Stock>, file?: File): Observable<Stock> {
    const formData = new FormData();

    if (stock.companyName) formData.append('companyName', stock.companyName);
    if (stock.priceofStock !== undefined && stock.priceofStock !== null) 
      formData.append('priceOfStock', stock.priceofStock.toString());

    if (file) formData.append('logo', file, file.name);

    return this.http.post<Stock>(this.baseUrl, formData);
  }

  // Create stock (alias for addStock)
  createStock(stock: Partial<Stock>, file?: File): Observable<Stock> {
    return this.addStock(stock, file);
  }

  // Update stock (only fields provided will be updated)
  updateStock(stockId: number, stock: Partial<Stock>, file?: File): Observable<Stock> {
    const formData = new FormData();

    formData.append('stockId', stockId.toString());

    if (stock.companyName) formData.append('companyName', stock.companyName);
    if (stock.priceofStock !== undefined && stock.priceofStock !== null) 
      formData.append('priceOfStock', stock.priceofStock.toString());

    if (file) formData.append('logo', file, file.name);

    return this.http.put<Stock>(this.baseUrl, formData);
  }

  // Delete stock
  deleteStock(id: number): Observable<Stock> {
    return this.http.delete<Stock>(`${this.baseUrl}/${id}`);
  }

  // Search by name
  searchByName(name: string): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.baseUrl}/search/${name}`);
  }

  // Filter by date range
  filterByDate(fromDate: Date, toDate?: Date): Observable<Stock[]> {
    let params = new HttpParams().set('fromDate', fromDate.toISOString());
    if (toDate) params = params.set('toDate', toDate.toISOString());

    return this.http.get<Stock[]>(`${this.baseUrl}/filter`, { params });
  }
}
