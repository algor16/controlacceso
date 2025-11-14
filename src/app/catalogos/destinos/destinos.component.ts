import { Component, OnInit, inject, signal  } from '@angular/core';
import { CommonModule, NgClass, NgIf, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, startWith } from 'rxjs';
import { CatalogosService } from '../../services/catalogos.service';
import { CatalogoItem } from '../../interfaces/catalogo.interface';
import { HttpParams } from '@angular/common/http';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Component({
  selector: 'app-destinos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgClass, NgIf],
  templateUrl: './destinos.component.html',
})
export default class DestinosComponent implements OnInit {

  public title: string = "Gestión de Destinos";
  public nombreCatalogo: string = "Destinos";

  private fb = inject(FormBuilder);
  private catalogosService = inject(CatalogosService);

  public listaItems = signal<CatalogoItem[]>([]);
  public catalogoForm: FormGroup;
  public filtroForm: FormGroup;
  public itemParaEliminarInfo: { id: number | null, enUso: boolean } = { id: null, enUso: false };
  public currentItemId: number | null = null;

  public loading: boolean = true;
  public errorMessage: string | null = null;

  constructor() {
    this.catalogoForm = this.fb.group({
      descripcion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern('^[A-Za-z0-9\\s\\-]+$')
      ]],
      activo: [true] // Añadimos el control 'activo'
    });

    this.filtroForm = this.fb.group({
      estado: ['activos'] // Opciones: 'todos', 'activos', 'inactivos'
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.filtroForm.get('estado')?.valueChanges.subscribe(() => {
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorMessage = null;
    const estado = this.filtroForm.get('estado')?.value;
    let params = new HttpParams();
    if (estado === 'activos') {
      params = params.set('activo', 'true');
    } else if (estado === 'inactivos') {
      params = params.set('activo', 'false');
    }

    this.catalogosService.getAll(this.nombreCatalogo, params).subscribe({
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

  editar(item: CatalogoItem): void {
    this.currentItemId = item.id;
    this.catalogoForm.patchValue(item); // PatchValue para manejar campos opcionales
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: number): void {
    this.catalogosService.enUso(this.nombreCatalogo, id).subscribe({
      next: (enUso) => {
        let title = '¿Estás seguro?';
        let text = 'No podrás revertir esto!';
        let confirmButtonText = 'Sí, eliminar!';
        let icon: 'warning' | 'error' | 'success' | 'info' | 'question' = 'warning';

        if (enUso) {
          title = '¿Estás seguro de desactivar?';
          text = 'Este destino ha sido utilizado. Se desactivará y no se podrá seleccionar para nuevas solicitudes, pero no afectará a los registros existentes.';
          confirmButtonText = 'Sí, desactivar!';
          icon = 'warning';
        } else {
          title = '¿Estás seguro de eliminar?';
          text = 'Este destino no ha sido utilizado. Se eliminará permanentemente. Esta acción no se puede deshacer.';
          confirmButtonText = 'Sí, eliminar permanentemente!';
          icon = 'error';
        }

        Swal.fire({
          title: title,
          text: text,
          icon: icon,
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: confirmButtonText,
          cancelButtonText: 'Cancelar'
        }).then((result: SweetAlertResult) => {
          if (result.isConfirmed) {
            this.catalogosService.delete(this.nombreCatalogo, id).subscribe({
              next: () => {
                Swal.fire('Procesado', `El destino ha sido ${enUso ? 'desactivado' : 'eliminado'}.`, 'success');
                this.cargarDatos();
              },
              error: (err) => {
                console.error('Error al procesar destino', err);
                Swal.fire('Error', `Hubo un error al procesar el destino: ${err.message || err.error?.message || err.statusText}`, 'error');
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al verificar uso del destino', err);
        Swal.fire('Error', `Hubo un error al verificar el uso del destino: ${err.message || err.error?.message || err.statusText}`, 'error');
      }
    });
  }

  reactivar(id: number): void {
    Swal.fire({
      title: '¿Estás seguro de activar?',
      text: 'El destino se activará y podrá ser seleccionado para nuevas solicitudes.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, activar!',
      cancelButtonText: 'Cancelar'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.catalogosService.reactivar(this.nombreCatalogo, id).subscribe({
          next: () => {
            Swal.fire('Activado', 'El destino ha sido activado correctamente.', 'success');
            this.cargarDatos();
          },
          error: (err) => {
            console.error('Error al activar destino', err);
            Swal.fire('Error', `Hubo un error al activar el destino: ${err.message || err.error?.message || err.statusText}`, 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.catalogoForm.reset({ activo: true });
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
