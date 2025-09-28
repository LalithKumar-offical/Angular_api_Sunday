import { Routes } from '@angular/router';
import { Login as LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard';
import { StocksComponent } from './components/user-dashboard/stocks/stocks';
import { WatchlistComponent } from './components/user-dashboard/watchlist/watchlist';
import { Portfolio as PortfolioComponent } from './components/user-dashboard/portfolio/portfolio';
import { AccountSettingsComponent } from './components/user-dashboard/account-settings/account-settings';
import { ForbiddenComponent } from './forbidden/forbidden';

export const rout: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    // add your guard here
  },
  {
    path: 'user',
    component: UserDashboardComponent,
    children: [
      { path: 'stocks', component: StocksComponent },
      { path: 'watchlist', component: WatchlistComponent },
      { path: 'portfolio', component: PortfolioComponent },
      { path: 'account-settings', component: AccountSettingsComponent },
      { path: '', redirectTo: 'stocks', pathMatch: 'full' }
    ]
  },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
