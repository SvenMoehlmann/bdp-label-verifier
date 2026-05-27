import { ActivatedRouteSnapshot, CanActivateFn, RedirectCommand, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { Setup } from '../setup/setup/setup';
import { Dashboard } from '../dashboard/dashboard/dashboard';
import { inject } from '@angular/core';
import { AppAudioContext } from '../dashboard/app-audio-context';

const audioContextGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const audioContext = inject(AppAudioContext);
  const router = inject(Router);

  if(!audioContext.audioBuffer()) {
    return new RedirectCommand(router.parseUrl(''), {replaceUrl: true})
  }

  return true;
};

export const routes: Routes = [
  {
    path: '',
    component: Setup
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [audioContextGuard]
  }
];
