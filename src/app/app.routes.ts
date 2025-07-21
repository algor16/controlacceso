import { Routes } from '@angular/router';
import { catalogosRoutes } from './catalogos/catalogos.routes';
import { CatalogosLayoutComponent } from './shared/layout/catalogos-layout.component';
import { solicitudesRoutes } from './solicitudes/solicitudes.routes';

export const routes: Routes = [
  { path: '',
    redirectTo: 'catalogos',
    pathMatch: 'full'
  },
  { path: 'registro',
    loadChildren: () => import('./catalogos/catalogos.routes').then(m => m.catalogosRoutes),
    title: 'Registros',
  },
  { path: 'solicitudes',
    component: CatalogosLayoutComponent,
    children: solicitudesRoutes,
    title: 'Solicitudes',
  },
  { path: 'catalogos',
    component: CatalogosLayoutComponent,
    children: catalogosRoutes,
    title: 'Catalogos',
  },

];
