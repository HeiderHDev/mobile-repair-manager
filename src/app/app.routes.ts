import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from '@core/guards/auth-guard';
import { Layout } from '@core/layout/layout';

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