import { Routes } from '@angular/router';
import { Pruebas } from './components/pruebas/pruebas';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'pruebas',
        pathMatch: 'full'
    },
    {
        path: 'pruebas',
        component: Pruebas
    }
];
