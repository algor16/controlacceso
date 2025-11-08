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
  templateUrl: './estados-solicitud.component.html',
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
      this.listaItems.set(datos);
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
