import { Routes } from '@angular/router';


export const solicitudesRoutes: Routes = [
  { path: 'solicitud',
    title: 'Nueva Solicitud',
    loadComponent: ()=> import('./solicitud/solicitud'),
   },
   { path: 'visitante',
    title: 'Visitantes',
    loadComponent: ()=> import('./visitante/visitante'),
   },
   { path: 'vehiculo',
    title: 'Vehiculos',
    loadComponent: ()=> import('./vehiculo/vehiculo'),
   },
  ];
