import { Component, Input, OnInit, inject, signal  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CatalogosService } from '../../../services/catalogos.service';
import { CatalogoItem } from '../../../interfaces/catalogo.interface';

// Definimos un tipo para los estados de alerta
type AlertStatus = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-catalogo-crud', // Este es el nombre de la etiqueta que usaremos
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './catalogo-crud.component.html',
})
export class CatalogoCrudComponent implements OnInit {

  // --- INPUTS: Así hacemos el componente configurable ---
  @Input({ required: true }) title!: string; // Título que se mostrará (ej. "Tipos de Documento")
  @Input({ required: true }) nombreCatalogo!: string; // Nombre del endpoint de la API

  // --- Inyección de Servicios ---
  private fb = inject(FormBuilder);
  private catalogosService = inject(CatalogosService);



  // --- Propiedades del Componente ---
  public listaItems = signal<CatalogoItem[]>([]);
  public catalogoForm: FormGroup;
  public currentItemId: number | null = null;
  public itemParaEliminarId: number | null = null;

  // --- Propiedades para las Alertas ---
  public showAlert = false;
  public alertMessage = '';
  public alertStatus: AlertStatus = 'info';

  constructor() {
    this.catalogoForm = this.fb.group({
      descripcion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern('[A-Za-z][A-Za-z0-9\\s\\-]*')
      ]]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  // --- Métodos CRUD (usan la propiedad 'nombreCatalogo' del Input) ---

  cargarDatos(): void {
    this.catalogosService.getAll(this.nombreCatalogo).subscribe(datos => {
      this.listaItems.set(datos);

    });
  }

  guardarOActualizar(): void {
    if (this.catalogoForm.invalid) {
      this.catalogoForm.markAllAsTouched();
      return;
    }
    const formData = this.catalogoForm.value;

    if (this.currentItemId) {
      const itemActualizado: CatalogoItem = { id: this.currentItemId, ...formData };
      this.catalogosService.update(this.nombreCatalogo, this.currentItemId, itemActualizado)
        .pipe(finalize(() => this.resetForm()))
        .subscribe({
          next: () => this.mostrarAlerta('Registro actualizado correctamente.', 'success'),
          error: (err) => this.mostrarAlerta(`Error: ${err.message}`, 'error')
        });
    } else {
      this.catalogosService.create(this.nombreCatalogo, formData)
        .pipe(finalize(() => this.resetForm()))
        .subscribe({
          next: () => this.mostrarAlerta('Registro agregado correctamente.', 'success'),
          error: (err) => this.mostrarAlerta(`Error: ${err.message}`, 'error')
        });
    }
  }

  editar(item: CatalogoItem): void {
    this.currentItemId = item.id;
    this.catalogoForm.patchValue({ descripcion: item.descripcion });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prepararEliminacion(id: number): void {
    this.itemParaEliminarId = id;
    (document.getElementById('delete_modal_' + this.nombreCatalogo) as HTMLDialogElement)?.showModal();
  }

  confirmarEliminacion(): void {
    if (this.itemParaEliminarId) {
      this.catalogosService.delete(this.nombreCatalogo, this.itemParaEliminarId).subscribe({
        next: () => {
          this.mostrarAlerta('Registro eliminado correctamente.', 'warning');
          this.cargarDatos();
        },
        error: (err) => this.mostrarAlerta(`Error al eliminar: ${err.message}`, 'error')
      });
    }
  }

  // --- Métodos Auxiliares ---
  resetForm(): void {
    this.catalogoForm.reset();
    this.currentItemId = null;
    this.cargarDatos();
  }

  mostrarAlerta(mensaje: string, status: AlertStatus): void {
    this.alertMessage = mensaje;
    this.alertStatus = status;
    this.showAlert = true;
    setTimeout(() => { this.showAlert = false; }, 5000);
  }

  get descripcion() {
    return this.catalogoForm.get('descripcion');
  }
}
