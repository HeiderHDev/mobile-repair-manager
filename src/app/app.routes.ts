// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from '@core/guards/auth-guard';
import { Layout } from '@core/layout/layout';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('@auth/login/login').then(c => c.Login)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'users',
        loadChildren: () => import('@users/users.routes').then(r => r.usersRoutes)
      },
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];