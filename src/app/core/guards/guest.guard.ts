import { CanActivateFn } from '@angular/router';

export const GuestGuard: CanActivateFn = (route, state) => {
  return true;
};
