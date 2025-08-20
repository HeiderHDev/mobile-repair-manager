import { Routes } from '@angular/router';

export const clientsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('@clients/components/client-list/client-list').then(c => c.ClientList)
  },
  {
    path: ':clientId/phones',
    loadComponent: () => import('@clients/components/client-phones/client-phones').then(c => c.ClientPhones)
  }
];