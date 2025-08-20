import { Routes } from '@angular/router';

export const clientsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('@clients/components/client-list/client-list').then(c => c.ClientList)
  },
  {
    path: ':clientId/phones',
    loadComponent: () => import('@clients/components/client-phones/client-phones').then(c => c.ClientPhones)
  },
  {
    path: ':clientId/phones/:phoneId/repairs',
    loadComponent: () => import('@clients/components/phone-repairs/phone-repairs').then(c => c.PhoneRepairs)
  }
];