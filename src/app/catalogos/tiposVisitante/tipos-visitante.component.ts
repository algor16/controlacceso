import { Component } from '@angular/core';
import { CatalogoCrudComponent } from '../../shared/components/catalogo-crud/catalogo-crud.component';

@Component({
  selector: 'app-tipos-visitante',
  standalone: true,
  imports: [CatalogoCrudComponent],
  templateUrl: './tipos-visitante.component.html',
})
export default class TiposVisitanteComponent {
  // Este componente es un wrapper simple para el CatalogoCrudComponent genérico.
  // Toda la lógica CRUD se maneja dentro de CatalogoCrudComponent.
}
