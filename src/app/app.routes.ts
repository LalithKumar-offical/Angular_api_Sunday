import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard';
import { StocksComponent } from './components/user-dashboard/stocks/stocks';
import { WatchlistComponent } from './components/user-dashboard/watchlist/watchlist';
import { PortfolioComponent } from './components/user-dashboard/portfolio/portfolio';
import { AccountSettingsComponent } from './components/user-dashboard/account-settings/account-settings';
import { ForbiddenComponent } from './forbidden/forbidden';
import { AuthGuard } from './guards/auth-guard';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'user',
    component: UserDashboardComponent,
    canActivate: [AuthGuard],
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
