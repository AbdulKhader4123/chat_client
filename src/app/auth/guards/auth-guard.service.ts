// import { AuthenticationService } from '../../shared/authentication.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor( private _router: Router ){
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
     if(localStorage.getItem("phone")){
       return true
     }
     else{
      this._router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
      return false;
     }
  }
}