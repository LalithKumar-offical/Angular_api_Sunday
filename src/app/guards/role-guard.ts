import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  private jwtHelper = new JwtHelperService();

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    const decodedToken = this.jwtHelper.decodeToken(token);
    const expectedRoles = route.data['roles'] as Array<string>;

    if (!decodedToken || !expectedRoles.includes(decodedToken.role)) {
      this.router.navigate(['/forbidden']);
      return false;
    }

    return true;
  }
}
