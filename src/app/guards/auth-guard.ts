import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private jwtHelper = new JwtHelperService();

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');

    // ✅ Check if token exists
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    // ✅ Check if token expired
    if (this.jwtHelper.isTokenExpired(token)) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return false;
    }

    // ✅ Decode token and check role
    const decodedToken = this.jwtHelper.decodeToken(token);
    const expectedRoles = route.data['roles'] as Array<string>;

    if (expectedRoles && expectedRoles.length > 0) {
      if (!decodedToken || !expectedRoles.includes(decodedToken.role)) {
        this.router.navigate(['/forbidden']); // redirect if role not allowed
        return false;
      }
    }

    return true;
  }
}
