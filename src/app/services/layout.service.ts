// src/app/services/layout.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  // Esta señal (signal) controlará el estado del sidebar
  // true = colapsado (solo iconos), false = expandido (iconos + texto)
  public isSidebarCollapsed = signal(false);

  // Función para cambiar el estado
  public toggleSidebar(): void {
    this.isSidebarCollapsed.update(value => !value);
  }
}
