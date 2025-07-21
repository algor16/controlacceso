import { Component } from '@angular/core';
import { CatalogoCrudComponent } from '../../shared/components/catalogo-crud/catalogo-crud.component';

@Component({
  selector: 'app-destinos',
  standalone: true,
  imports: [CatalogoCrudComponent],
  templateUrl: './destinos.component.html'
})
export default class DestinosComponent {

}
