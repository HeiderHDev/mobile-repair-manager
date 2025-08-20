// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, noAuthGuard, roleGuard } from '@core/guards/auth-guard';
import { Layout } from '@core/layout/layout';
import { UserRole } from '@core/enum/auth/user-role.enum';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/clients',
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
        canActivate: [roleGuard([UserRole.SUPER_ADMIN])],
        loadChildren: () => import('@users/users.routes').then(r => r.usersRoutes)
      },
      {
        path: 'clients',
        loadChildren: () => import('@clients/clients.routes').then(r => r.clientsRoutes)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/clients'
  }
];