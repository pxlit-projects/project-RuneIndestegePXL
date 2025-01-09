import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const expectedRole = route.data['role'];
    if(!authService.isLoggedIn()){
      router.navigate(['/']);
      return false;
    }
    if(authService.getUserRole() === expectedRole){
      return true;
    }
    if(expectedRole==='editor' && authService.getUserRole()==='head_editor'){
      return true;
    }
    if(expectedRole==='guest' && (authService.getUserRole()==='editor' || authService.getUserRole()==='head_editor')){
      return true;
    } else {
      return false;
    }
}
