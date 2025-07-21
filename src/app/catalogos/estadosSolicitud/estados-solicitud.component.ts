import { Component } from '@angular/core';
import { CatalogoCrudComponent } from '../../shared/components/catalogo-crud/catalogo-crud.component';

@Component({
  selector: 'app-estados-solicitud',
  standalone: true,
  imports: [CatalogoCrudComponent],
  templateUrl: './estados-solicitud.component.html',
})
export default class EstadosSolicitudComponent {

}
