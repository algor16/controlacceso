import { Routes } from '@angular/router';
import { catalogosRoutes } from './catalogos/catalogos.routes';
import { CatalogosLayoutComponent } from './shared/layout/catalogos-layout.component';
import { solicitudesRoutes } from './solicitudes/solicitudes.routes';

export const routes: Routes = [
  { path: '',
    redirectTo: 'catalogos',
    pathMatch: 'full'
  },
  { path: 'registros',
    loadChildren: () => import('./registros/registros.routes').then(m => m.REGISTROS_ROUTES),
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
