import { Component } from '@angular/core';
import { CatalogoCrudComponent } from '../../shared/components/catalogo-crud/catalogo-crud.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CatalogoCrudComponent],
  templateUrl: './roles.component.html',
})
export default class RolesComponent {

}
