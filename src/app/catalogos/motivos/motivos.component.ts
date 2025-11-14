import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgClass, NgIf, NgFor, TitleCasePipe } from '@angular/common';
import { MotivosService } from '../../services/motivos.service';
import { Motivo, MotivoCreate, MotivoUpdate } from '../../interfaces/motivo.interface';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Component({
  selector: 'app-motivos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TitleCasePipe,
    NgClass,
    NgIf,
    NgFor
  ],
  templateUrl: './motivos.component.html',
  styleUrl: './motivos.component.css'
})
export default class MotivosComponent implements OnInit {
  private motivosService = inject(MotivosService);
  private fb = inject(FormBuilder);

  motivos: Motivo[] = [];
  motivoForm: FormGroup;
  isEditMode: boolean = false;
  motivoIdToEdit: number | null = null;
  loading: boolean = true;
  errorMessage: string | null = null;

  // Opciones para el tipo de motivo
  tipoMotivoOptions = ['Entrada', 'Salida'];

  constructor() {
    this.motivoForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      activo: [true],
      tipo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMotivos();
  }

  loadMotivos(): void {
    this.loading = true;
    this.errorMessage = null;
    this.motivosService.getAllMotivos().subscribe({
      next: (data) => {
        this.motivos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar motivos', err);
        this.errorMessage = 'Error al cargar los motivos.';
        this.loading = false;
      }
    });
  }

  onSave(): void {
    if (this.motivoForm.invalid) {
      this.motivoForm.markAllAsTouched();
      return;
    }

    const motivoData = this.motivoForm.value;

    if (this.isEditMode && this.motivoIdToEdit !== null) {
      this.motivosService.updateMotivo(this.motivoIdToEdit, motivoData as MotivoUpdate).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'El motivo ha sido actualizado.', 'success');
          this.resetForm();
          this.loadMotivos();
        },
        error: (err) => {
          console.error('Error al actualizar motivo', err);
          Swal.fire('Error', 'Hubo un error al actualizar el motivo.', 'error');
        }
      });
    } else {
      this.motivosService.createMotivo(motivoData as MotivoCreate).subscribe({
        next: () => {
          Swal.fire('Creado', 'El motivo ha sido creado.', 'success');
          this.resetForm();
          this.loadMotivos();
        },
        error: (err) => {
          console.error('Error al crear motivo', err);
          Swal.fire('Error', 'Hubo un error al crear el motivo.', 'error');
        }
      });
    }
  }

  onEdit(motivo: Motivo): void {
    this.isEditMode = true;
    this.motivoIdToEdit = motivo.id;
    this.motivoForm.patchValue(motivo);
  }

  onDelete(id: number): void {
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
        this.motivosService.deleteMotivo(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El motivo ha sido eliminado.', 'success');
            this.loadMotivos();
          },
          error: (err) => {
            console.error('Error al eliminar motivo', err);
            Swal.fire('Error', 'Hubo un error al eliminar el motivo.', 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.motivoForm.reset({
      activo: true,
      tipo: ''
    });
    this.isEditMode = false;
    this.motivoIdToEdit = null;
  }

  // Helper para validación de formularios
  isValidField(field: string): boolean | null {
    const control = this.motivoForm.get(field);
    return control ? control.errors && control.touched : null;
  }

  getFieldError(field: string): string | null {
    const control = this.motivoForm.get(field);
    if (!control || !control.errors) {
      return null;
    }

    const errors = control.errors;
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido.';
        case 'maxlength':
          return `Máximo ${errors['maxlength'].requiredLength} caracteres.`;
        // Puedes añadir más tipos de errores si es necesario
      }
    }
    return 'Error desconocido';
  }
}
