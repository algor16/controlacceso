// src/app/shared/sidebar/sidebar.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../services/layout.service'; // <-- Importa el servicio

// Define la interfaz del menú (puedes moverla a su propio archivo)
export interface MenuItem {
  title: string;
  path?: string;
  isHeader?: boolean;
  icon?: string; // SVG path
}

@Component({
  selector: 'app-sidebar', // <--- Este será el tag
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export default class SidebarComponent {

  // Inyecta el servicio de layout
  public layoutService = inject(LayoutService);

  // 1. Cierra el menú en móvil después de hacer clic
  closeDrawer(): void {
    const drawer = document.getElementById('my-drawer-responsive') as HTMLInputElement;
    if (drawer) {
      drawer.checked = false;
    }
  }

  // 2. Define la estructura completa del menú (basado en tu imagen)
  public menuItems = signal<MenuItem[]>([
    {
      title: 'Dashboard',
      path: '/dashboard', // Asegúrate de tener esta ruta o cámbiala
      icon: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z'
    },
    {
      title: 'Registros',
      path: '/registros',
      icon: 'M16 4v2.53a2 2 0 001.29 1.87l.02.01 3.5 1.75a1 1 0 01.59.9V17a2 2 0 01-2 2h-1.1a1 1 0 00-.9.55l-.8 1.6a1 1 0 01-.9.45H9.2a1 1 0 01-.9-.45l-.8-1.6a1 1 0 00-.9-.55H5a2 2 0 01-2-2v-5.94a1 1 0 01.59-.9l3.5-1.75.02-.01A2 2 0 008 6.53V4a2 2 0 012-2h4a2 2 0 012 2zM9 9l-3 1.5V17h2v-4a1 1 0 011-1h2a1 1 0 011 1v4h2v-6.5L9 9z'
    },
    {
      title: 'SOLICITUDES', // Encabezado
      isHeader: true,
    },
    {
      title: 'Lista Solicitudes',
      path: '/solicitudes/solicitud',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
    },
    {
      title: 'Nuevo Visitante',
      path: '/solicitudes/visitante',
      icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
    },
    {
      title: 'Nuevo Vehículo',
      path: '/solicitudes/vehiculo',
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z'
    },
    {
      title: 'CATÁLOGOS', // Encabezado
      isHeader: true,
    },
    { title: 'Tipos de Documento', path: '/catalogos/tipos-documento', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { title: 'Tipos de Registro', path: '/catalogos/tipos-registro', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { title: 'Destinos', path: '/catalogos/destinos', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { title: 'Estados Solicitud', path: '/catalogos/estados-solicitud', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Estados Visitante', path: '/catalogos/estados-visitante', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
    { title: 'Clases de Vehículos', path: '/catalogos/clases-vehiculos', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { title: 'Niveles de Riesgo', path: '/catalogos/niveles-riesgo', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { title: 'Roles', path: '/catalogos/roles', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ]);
}
