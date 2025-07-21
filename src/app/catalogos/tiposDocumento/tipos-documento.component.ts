import { Component } from '@angular/core';
// 1. Importa tu nuevo componente reutilizable
import { CatalogoCrudComponent } from '../../shared/components/catalogo-crud/catalogo-crud.component';

@Component({
  selector: 'app-tipos-documento',
  standalone: true,
  // 2. Añádelo a los imports
  imports: [CatalogoCrudComponent],
  // 3. Usa el componente en el template, pasándole los inputs
  templateUrl: './tipos-documento.component.html',
})
export default class TiposDocumentoComponent {
  // ¡No necesitas más lógica aquí! Todo está encapsulado.
}
