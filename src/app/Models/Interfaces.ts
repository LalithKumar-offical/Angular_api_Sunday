export interface Stock {
  stockId: number;
  companyName?: string;
  logo?: Uint8Array | null;   // byte[] from C# maps to Uint8Array in TS
  priceofStock: number;
  lastUpdatedDate: string;    // DateTime maps to string in JSON
  watchlists?: Watchlist[];
  portfolios?: Portfolio[];
}

export enum StockStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2
}

export interface Portfolio {
  portfolioId: number;
  boughtPrice: number;
  stock_Status: StockStatus;
  boughtDate: string;
  alert: number;
  userId: number;
  user?: User;
  stockId: number;
  stock?: Stock;
}

export interface User {
  userId: number;
  userName: string;
  email: string;
  password: string;
  role: string;
  file?: string;
  isVerfied: boolean;
  pan?: string;
  balance?: number;
  watchlists?: Watchlist[];
  portfolios?: Portfolio[];
}
export interface Watchlist {
  watchlistId: number;
  addedDate: string;
  userId: number;
  user?: User;
  stockId: number;
  stock?: Stock;
}

export interface PortfolioDto {
  portfolio: Portfolio;   // the actual portfolio object
  message?: string | null; // optional profit/loss message
}