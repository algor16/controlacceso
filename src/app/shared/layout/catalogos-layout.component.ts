import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule, Routes } from '@angular/router';

@Component({
  selector: 'app-catalogos-layout',
  standalone:true,
  imports: [CommonModule, RouterModule],
  templateUrl: './catalogos-layout.component.html',
})
export class CatalogosLayoutComponent {
  private activatedRoute = inject(ActivatedRoute);
  public catalogoRoutes: Routes = [];

  constructor() {
    this.catalogoRoutes = this.activatedRoute.routeConfig?.children?.filter(route => route && route.title) || [];
  }

  closeDrawer(): void {
    const drawer = document.getElementById('my-drawer-2') as HTMLInputElement;
    if (drawer) {
      drawer.checked = false;
    }
  }
 }
