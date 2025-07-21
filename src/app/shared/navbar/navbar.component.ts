
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core'; // 1. Importa OnInit
import { Router, RouterModule, Routes } from '@angular/router';

export type valorTema = 'light' | 'dark';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);
  public menuItems = signal<Routes>([]);
  valorSw = signal<boolean>(false);

  ngOnInit(): void {
    this.asignarTema();
    this.menuItems.set(
      this.router.config
        .filter(route => route && route.path && route.title)
    );
    console.log(this.menuItems());
  }

  guardarTema(sw: boolean) {
    const temaActual = sw ? 'dark' : 'light';
    this.valorSw.set(sw);
    localStorage.setItem('theme', temaActual);
  }

  asignarTema() {
    const temaGuardado = localStorage.getItem('theme') as valorTema || 'light';
    this.valorSw.set(temaGuardado === 'dark');
  }

  closeMenu(detailsElement: HTMLDetailsElement): void {
    // Esto quita el atributo 'open' del elemento <details>, cerrándolo.
    detailsElement.open = false;
  }

}
