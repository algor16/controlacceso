import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { EstadoSolicitudService } from '../../services/estados-solicitud.service';
import { EstadoSolicitud } from '../../interfaces/estado-solicitud.interface';

type AlertStatus = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-estados-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="p-1 max-w-xl mx-auto">

  <div class="h-16"> <div
      [ngClass]="{
        'alert': true,
        'alert-success': alertStatus === 'success',
        'alert-error': alertStatus === 'error',
        'alert-warning': alertStatus === 'warning',
        'alert-info': alertStatus === 'info',
        'opacity-0': !showAlert,   'opacity-100': showAlert   }"
      class="transition-opacity duration-500 mb-4"> <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{{ alertMessage }}</span>
    </div>
  </div>

  <div>
    <form [formGroup]="catalogoForm" (ngSubmit)="guardarOActualizar()">
      <fieldset class="fieldset border-base-300 rounded-box w-auto border p-4">
        <legend class="fieldset-legend">{{ title }}</legend>
        <div class="flex flex-col gap-4">
          <input
            type="text"
            class="input w-full"
            placeholder="Descripción"
            formControlName="descripcion"/>

          <input
            type="text"
            class="input w-full"
            placeholder="Mensaje"
            formControlName="mensaje"/>

          <div class="form-control w-64">
            <label class="label cursor-pointer">
              <span class="label-text">Es considerada para registro</span>
              <input type="checkbox" class="toggle" formControlName="esConsideradaParaRegistro" />
            </label>
          </div>

        </div>
        <div class="join mt-4">
          <button type="submit" class="btn btn-soft btn-primary join-item">
            {{ currentItemId ? 'Actualizar' : 'Guardar' }}
          </button>
          @if (currentItemId) {
            <button type="button" (click)="resetForm()" class="btn btn-soft join-item">
              Cancelar
            </button>
          }
        </div>
        @if (descripcion?.invalid && (descripcion?.dirty || descripcion?.touched)) {
          <div class="text-error text-xs mt-1">
            @if (descripcion?.errors?.['required']) {
              La descripción es requerida.
            }
            @if (descripcion?.errors?.['minlength']) {
              Debe tener al menos 3 caracteres.
            }
            @if (descripcion?.errors?.['maxlength']) {
              No puede exceder los 50 caracteres.
            }
             @if (descripcion?.errors?.['pattern']) {
              Formato inválido.
            }
          </div>
        }
      </fieldset>
    </form>
  </div>

  <div class="mt-10">
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>#</th>
            <th>Descripción</th>
            <th>Mensaje</th>
            <th>Considerada Registro</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
           @for (item of listaItems(); track item.id; let i = $index) {
            <tr>
              <th>{{ i + 1 }}</th>
              <td>{{ item.descripcion }}</td>
              <td>{{ item.mensaje }}</td>
              <td>
                @if(item.esConsideradaParaRegistro){
                  <div class="badge badge-success">Si</div>
                } @else {
                  <div class="badge badge-error">No</div>
                }
              </td>
              <td class="text-right">
                <button (click)="editar(item)" class="btn btn-outline btn-info btn-sm" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" ><path d="M5 21h14c1.1 0 2-.9 2-2v-7h-2v7H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2z"></path><path d="M7 13v3c0 .55.45 1 1 1h3c.27 0 .52-.11.71-.29l9-9a.996.996 0 0 0 0-1.41l-3-3a.996.996 0 0 0-1.41 0l-9.01 8.99A1 1 0 0 0 7 13zm10-7.59L18.59 7 17.5 8.09 15.91 6.5zm-8 8 5.5-5.5 1.59 1.59-5.5 5.5H9z"></path></svg>
                </button>
                <button (click)="prepararEliminacion(item.id)" onclick="delete_modal.showModal()" class="btn btn-outline btn-error btn-sm ml-2" title="Eliminar">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="m17,6v-2c0-1.1-.9-2-2-2h-6c-1.1,0-2,.9-2,2v2H2v2h2v12c0,1.1.9,2,2,2h12c1.1,0,2-.9,2-2v-12h2v-2h-5Zm-8-2h6v2h-6v-2Zm9,16H6v-12h12v12Z"></path><path d="M14.29 10.29 12 12.59 9.71 10.29 8.29 11.71 10.59 14 8.29 16.29 9.71 17.71 12 15.41 14.29 17.71 15.71 16.29 13.41 14 15.71 11.71 14.29 10.29z"></path></svg>
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>

<dialog id="delete_modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg text-error">Confirmar Eliminación</h3>
    <p class="py-4">¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Cancelar</button>
        <button class="btn btn-error ml-2" (click)="confirmarEliminacion()">Eliminar</button>
      </form>
    </div>
  </div>
</dialog>
  `,
})
export default class EstadosSolicitudComponent implements OnInit {

  public title: string = 'Gestión de Estados de la Solicitud';

  private fb = inject(FormBuilder);
  private estadoSolicitudService = inject(EstadoSolicitudService);

  public listaItems = signal<EstadoSolicitud[]>([]);
  public catalogoForm: FormGroup;
  public currentItemId: number | null = null;
  public itemParaEliminarId: number | null = null;

  public showAlert = false;
  public alertMessage = '';
  public alertStatus: AlertStatus = 'info';

  constructor() {
    this.catalogoForm = this.fb.group({
      descripcion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern('[A-Za-z][A-Za-z0-9\s\-]*')
      ]],
      mensaje: [''],
      esConsideradaParaRegistro: [false]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.estadoSolicitudService.getAll().subscribe((datos: EstadoSolicitud[]) => {
      const datosFiltrados = datos.filter(d => d.descripcion !== 'Anulada');
      this.listaItems.set(datosFiltrados);
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
          next: () => this.mostrarAlerta('Registro actualizado correctamente.', 'success'),
          error: (err: any) => this.mostrarAlerta(`Error: ${err.message}`, 'error')
        });
    } else {
      this.estadoSolicitudService.create(formData)
        .pipe(finalize(() => this.resetForm()))
        .subscribe({
          next: () => this.mostrarAlerta('Registro agregado correctamente.', 'success'),
          error: (err: any) => this.mostrarAlerta(`Error: ${err.message}`, 'error')
        });
    }
  }

  editar(item: EstadoSolicitud): void {
    this.currentItemId = item.id;
    this.catalogoForm.patchValue({
      descripcion: item.descripcion,
      mensaje: item.mensaje,
      esConsideradaParaRegistro: item.esConsideradaParaRegistro
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prepararEliminacion(id: number): void {
    this.itemParaEliminarId = id;
    (document.getElementById('delete_modal') as HTMLDialogElement)?.showModal();
  }

  confirmarEliminacion(): void {
    if (this.itemParaEliminarId) {
      this.estadoSolicitudService.delete(this.itemParaEliminarId).subscribe({
        next: () => {
          this.mostrarAlerta('Registro eliminado correctamente.', 'warning');
          this.cargarDatos();
        },
        error: (err: any) => this.mostrarAlerta(`Error al eliminar: ${err.message}`, 'error')
      });
    }
  }

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