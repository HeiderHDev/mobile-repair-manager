import { Routes } from '@angular/router';
import { Layout } from '@/app/core/layout/layout';

export const routes: Routes = [
    {
        path: '',
        component: Layout,
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'repairs',
                redirectTo: 'dashboard'
            },
            {
                path: 'customers',
                redirectTo: 'dashboard'
            },
            {
                path: 'inventory',
                redirectTo: 'dashboard'
            },
            {
                path: 'finance',
                redirectTo: 'dashboard'
            },
            {
                path: 'settings',
                redirectTo: 'dashboard'
            }
        ]
    }
];
