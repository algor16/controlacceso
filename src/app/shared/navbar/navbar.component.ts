// src/app/shared/navbar/navbar.component.ts
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router'; // No borres RouterModule
import { LayoutService } from '../../services/layout.service'; // <-- Importa el servicio

export type valorTema = 'light' | 'dark';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule], // <-- RouterModule se queda
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {

  // Inyecta el servicio de layout
  public layoutService = inject(LayoutService);

  valorSw = signal<boolean>(false);

  // BORRAMOS:
  // private router = inject(Router);
  // public menuItems = signal<Routes>([]);
  // Y todo el .set(this.router.config...) de ngOnInit

  ngOnInit(): void {
    this.asignarTema();
    // La lógica del menú se fue al sidebar
  }

  // Esta función es NUEVA. Llama al servicio.
  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  // ... (El resto de tus funciones: guardarTema, asignarTema, aplicarTema... se quedan igual) ...
  // ... (Asegúrate de copiar aquí el resto de tus funciones de tema) ...
  guardarTema(sw: boolean) {
    const temaActual = sw ? 'dark' : 'light';
    this.valorSw.set(sw);
    localStorage.setItem('theme', temaActual);
    this.aplicarTema(temaActual);
  }

  asignarTema() {
    const temaGuardado = localStorage.getItem('theme') as valorTema;
    if (temaGuardado) {
      this.valorSw.set(temaGuardado === 'dark');
      this.aplicarTema(temaGuardado);
    } else {
      const prefiereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const temaInicial = prefiereDark ? 'dark' : 'light';
      this.valorSw.set(prefiereDark);
      this.aplicarTema(temaInicial);
    }
  }

  aplicarTema(tema: valorTema) {
    document.documentElement.setAttribute('data-theme', tema);
  }
}
