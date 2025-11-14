import { Component, Input, OnInit, inject, signal  } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CatalogosService } from '../../../services/catalogos.service';
import { CatalogoItem } from '../../../interfaces/catalogo.interface';
import Swal, { SweetAlertResult } from 'sweetalert2';

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
  public listaItems = signal<any[]>([]);
  public catalogoForm: FormGroup;
  public currentItemId: number | null = null;
  public loading: boolean = true;
  public errorMessage: string | null = null;

  constructor() {
    this.catalogoForm = this.fb.group({
      descripcion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern('[A-Za-z][A-Za-z0-9\\s\\-]*')
      ]],
      activo: [true] // Añadimos el control 'activo'
    });
  }

  ngOnInit(): void {
    if (this.nombreCatalogo === 'EstadosSolicitud') {
      this.catalogoForm.addControl('mensaje', this.fb.control(''));
      this.catalogoForm.addControl('esConsideradaParaRegistro', this.fb.control(false));
    }
    this.cargarDatos();
  }

  // --- Métodos CRUD (usan la propiedad 'nombreCatalogo' del Input) ---

  cargarDatos(): void {
    this.loading = true;
    this.errorMessage = null;
    this.catalogosService.getAll(this.nombreCatalogo).subscribe({
      next: (datos) => {
        this.listaItems.set(datos);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del catálogo', err);
        this.errorMessage = 'Error al cargar los datos del catálogo.';
        this.loading = false;
      }
    });
  }

  guardarOActualizar(): void {
    if (this.catalogoForm.invalid) {
      this.catalogoForm.markAllAsTouched();
      return;
    }
    const formData = this.catalogoForm.getRawValue();

    if (this.currentItemId) {
      const itemActualizado = { id: this.currentItemId, ...formData };
      this.catalogosService.update(this.nombreCatalogo, this.currentItemId, itemActualizado)
        .pipe(finalize(() => this.resetForm()))
        .subscribe({
          next: () => Swal.fire('Actualizado', 'El registro ha sido actualizado.', 'success'),
          error: (err) => {
            console.error('Error al actualizar registro', err);
            Swal.fire('Error', `Hubo un error al actualizar el registro: ${err.message || err.error?.message || err.statusText}`, 'error');
          }
        });
    } else {
      this.catalogosService.create(this.nombreCatalogo, formData)
        .pipe(finalize(() => this.resetForm()))
        .subscribe({
          next: () => Swal.fire('Creado', 'El registro ha sido creado.', 'success'),
          error: (err) => {
            console.error('Error al crear registro', err);
            Swal.fire('Error', `Hubo un error al crear el registro: ${err.message || err.error?.message || err.statusText}`, 'error');
          }
        });
    }
  }

  editar(item: any): void {
    this.currentItemId = item.id;
    this.catalogoForm.patchValue(item); // PatchValue para manejar campos opcionales
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.catalogosService.delete(this.nombreCatalogo, id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El registro ha sido eliminado.', 'success');
            this.cargarDatos();
          },
          error: (err) => {
            console.error('Error al eliminar registro', err);
            Swal.fire('Error', `Hubo un error al eliminar el registro: ${err.message || err.error?.message || err.statusText}`, 'error');
          }
        });
      }
    });
  }

  // --- Métodos Auxiliares ---
  resetForm(): void {
    this.catalogoForm.reset({ activo: true }); // Resetear con valor por defecto para 'activo'
    this.currentItemId = null;
    this.cargarDatos();
  }

  // Helper para validación de formularios
  isValidField(field: string): boolean | null {
    const control = this.catalogoForm.get(field);
    return control ? control.errors && control.touched : null;
  }

  getFieldError(field: string): string | null {
    const control = this.catalogoForm.get(field);
    if (!control || !control.errors) {
      return null;
    }

    const errors = control.errors;
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido.';
        case 'minlength':
          return `Mínimo ${errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `Máximo ${errors['maxlength'].requiredLength} caracteres.`;
        case 'pattern':
          return 'Formato inválido. Solo letras, números, espacios y guiones.';
      }
    }
    return 'Error desconocido';
  }
}
