import { Component } from '@angular/core';
import { CatalogoCrudComponent } from '../../shared/components/catalogo-crud/catalogo-crud.component';

@Component({
  selector: 'app-clases-vehiculo',
  standalone: true,
  imports: [CatalogoCrudComponent],
  templateUrl: './clases-vehiculo.component.html',
})
export default class ClasesVehiculoComponent {

}
