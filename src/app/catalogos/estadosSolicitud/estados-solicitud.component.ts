import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { EstadoSolicitudService } from '../../services/estados-solicitud.service';
import { EstadoSolicitud } from '../../interfaces/estado-solicitud.interface';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Component({
  selector: 'app-estados-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './estados-solicitud.component.html',
})
export default class EstadosSolicitudComponent implements OnInit {

  public title: string = 'Gestión de Estados de la Solicitud';

  private fb = inject(FormBuilder);
  private estadoSolicitudService = inject(EstadoSolicitudService);

  public listaItems = signal<EstadoSolicitud[]>([]);
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
        Validators.pattern('[A-Za-z][A-Za-z0-9\s\-]*')
      ]],
      mensaje: [''],
      esConsideradaParaRegistro: [false],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorMessage = null;
    this.estadoSolicitudService.getAll().subscribe({
      next: (datos: EstadoSolicitud[]) => {
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
      this.estadoSolicitudService.update(this.currentItemId, itemActualizado)
        .pipe(finalize(() => this.resetForm()))
        .subscribe({
          next: () => Swal.fire('Actualizado', 'El registro ha sido actualizado.', 'success'),
          error: (err: any) => {
            console.error('Error al actualizar registro', err);
            Swal.fire('Error', `Hubo un error al actualizar el registro: ${err.message || err.error?.message || err.statusText}`, 'error');
          }
        });
    } else {
      this.estadoSolicitudService.create(formData)
        .pipe(finalize(() => this.resetForm()))
        .subscribe({
          next: () => Swal.fire('Creado', 'El registro ha sido creado.', 'success'),
          error: (err: any) => {
            console.error('Error al crear registro', err);
            Swal.fire('Error', `Hubo un error al crear el registro: ${err.message || err.error?.message || err.statusText}`, 'error');
          }
        });
    }
  }

  editar(item: EstadoSolicitud): void {
    this.currentItemId = item.id;
    this.catalogoForm.patchValue(item);
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
        this.estadoSolicitudService.delete(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El registro ha sido eliminado.', 'success');
            this.cargarDatos();
          },
          error: (err: any) => {
            console.error('Error al eliminar registro', err);
            Swal.fire('Error', `Hubo un error al eliminar el registro: ${err.message || err.error?.message || err.statusText}`, 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.catalogoForm.reset({
      esConsideradaParaRegistro: false,
      activo: true
    });
    this.currentItemId = null;
    this.cargarDatos();
  }

  get descripcion() {
    return this.catalogoForm.get('descripcion');
  }

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
