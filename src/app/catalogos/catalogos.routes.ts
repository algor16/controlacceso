import { Routes } from '@angular/router';

import ClasesVehiculoComponent from './clasesVehiculos/clases-vehiculo.component';
import  DestinosComponent  from './destinos/destinos.component';
import  EstadosSolicitudComponent  from './estadosSolicitud/estados-solicitud.component';
import  EstadosVisitanteComponent  from './estadosVisitante/estados-visitante.component';
import  NivelesRiesgoComponent  from './NivelesRiesgo/niveles-riesgo.component';
import  RolesComponent  from './roles/roles.component';
import  TiposDocumentoComponent  from './tiposDocumento/tipos-documento.component';
import  TiposRegistroComponent  from './tiposRegistro/tipos-registro.component';

export const catalogosRoutes: Routes = [
  { path: 'tipos-documento',
    title: 'Tipos de Documento',
    loadComponent: ()=> import('./tiposDocumento/tipos-documento.component'),
   },
  { path: 'tipos-registro',
    title: 'Tipos de Registro' ,
    loadComponent: ()=> import('./tiposRegistro/tipos-registro.component'),
   },
  { path: 'tipos-visitante',
    title: 'Tipos de Visitante',
    loadComponent: ()=> import('./tiposVisitante/tipos-visitante.component'),
   },
   { path: 'destinos',
    title: 'Destinos',
    loadComponent: ()=> import('./destinos/destinos.component')
   },
  { path: 'estados-solicitud',
    title: 'Estados de Solicitud',
    loadComponent: ()=> import('./estadosSolicitud/estados-solicitud.component'),
   },
  { path: 'estados-visitante',
    title: 'Estados de Visitante',
    loadComponent: ()=> import('./estadosVisitante/estados-visitante.component'),
   },
  { path: 'clases-vehiculos',
    title: 'Clases de Vehículos',
    loadComponent: ()=> import('./clasesVehiculos/clases-vehiculo.component')
  },
  { path: 'niveles-riesgo',
    title: 'Niveles de Riesgo',
    loadComponent: ()=> import('./NivelesRiesgo/niveles-riesgo.component'),
   },
  { path: 'roles',
    title: 'Roles',
    loadComponent: ()=> import('./roles/roles.component'),
   },
  { path: 'motivos',
    title: 'Motivos',
    loadComponent: ()=> import('./motivos/motivos.component'),
   },

  { path: '',
    redirectTo: 'clases-vehiculos',
    pathMatch: 'full'
  },
];
