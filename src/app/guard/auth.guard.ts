import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard{
  
  constructor(
    protected readonly router: Router,
    protected readonly keycloak: KeycloakService
  ) {
    super(router, keycloak);
   
  }

  isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    
      return new Promise(async (resolve, reject) => {
        if (!this.authenticated) {
          this.keycloakAngular.login();
          return;
        }
        console.log('role restriction given at app-routing.module for this route', route.data['roles']);
        console.log('User roles coming after login from keycloak :', this.roles);
        
        const tokenParsed  = this.keycloak.getKeycloakInstance().tokenParsed;
        console.log("token", tokenParsed)
        const groups = tokenParsed?.['groups'];
        console.log("Groupsdd", groups)
        const requiredRoles = route.data['roles'];
        let granted: boolean = false;
        if (!requiredRoles || requiredRoles.length === 0) {
          granted = true;
        } else {
          for (const requiredRole of requiredRoles) {
            if (this.roles.indexOf(requiredRole) > -1) {
              granted = true;
              break;
            }
          }
        }
  
        if(granted === false) {
          this.router.navigate(['/']);
        }
        resolve(granted);
  
      });
  }
  
  async isAccessAllowed_old(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    
    if (!this.authenticated) {
      await this.keycloak.login({
        redirectUri: window.location.origin + state.url,
      });
    }
    console.log('role restriction given at app-routing.module for this route', route.data['roles']);
    console.log('User roles coming after login from keycloak :', this.roles);
    return this.authenticated;
  }
}
