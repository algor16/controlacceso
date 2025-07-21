import { Component } from '@angular/core';
import { CatalogoCrudComponent } from '../../shared/components/catalogo-crud/catalogo-crud.component';

@Component({
  selector: 'app-estados-visitante',
  standalone: true,
  imports: [CatalogoCrudComponent],
  templateUrl: './estados-visitante.component.html',
})
export default class EstadosVisitanteComponent {

}
