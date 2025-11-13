import { Component, OnInit, inject, signal  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, startWith } from 'rxjs';
import { CatalogosService } from '../../services/catalogos.service';
import { CatalogoItem } from '../../interfaces/catalogo.interface';
import { HttpParams } from '@angular/common/http';

type AlertStatus = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-destinos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
      ]]
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
    const estado = this.filtroForm.get('estado')?.value;
    let params = new HttpParams();
    if (estado === 'activos') {
      params = params.set('activo', 'true');
    } else if (estado === 'inactivos') {
      params = params.set('activo', 'false');
    }

    this.catalogosService.getAll(this.nombreCatalogo, params).subscribe(datos => {
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
      this.catalogosService.update(this.nombreCatalogo, this.currentItemId, itemActualizado)
        .pipe(finalize(() => this.resetForm()))
        .subscribe({
          next: () => {
            this.mostrarAlerta('Registro actualizado correctamente.', 'success');
          },
          error: (err) => {
            this.mostrarAlerta(`Error: ${err.message}`, 'error');
          }
        });
    } else {
      this.catalogosService.create(this.nombreCatalogo, formData)
        .pipe(finalize(() => this.resetForm()))
        .subscribe({
          next: () => {
            this.mostrarAlerta('Registro agregado correctamente.', 'success');
          },
          error: (err) => {
            this.mostrarAlerta(`Error: ${err.message}`, 'error');
          }
        });
    }
  }

  editar(item: CatalogoItem): void {
    this.currentItemId = item.id;
    this.catalogoForm.patchValue({ descripcion: item.descripcion });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prepararEliminacion(id: number): void {
    this.catalogosService.enUso(this.nombreCatalogo, id).subscribe(enUso => {
      this.itemParaEliminarInfo = { id: id, enUso: enUso };
      (document.getElementById('delete_modal') as HTMLDialogElement)?.showModal();
    });
  }

  confirmarEliminacion(): void {
    if (this.itemParaEliminarInfo.id) {
      this.catalogosService.delete(this.nombreCatalogo, this.itemParaEliminarInfo.id).subscribe({
        next: () => {
          const accion = this.itemParaEliminarInfo.enUso ? 'desactivado' : 'eliminado';
          this.mostrarAlerta(`Destino ${accion} correctamente.`, 'warning');
          this.cargarDatos();
        },
        error: (err) => {
          this.mostrarAlerta(`Error al procesar la solicitud: ${err.message}`, 'error');
        }
      });
    }
  }

  reactivar(id: number): void {
    this.catalogosService.reactivar(this.nombreCatalogo, id).subscribe({
      next: () => {
        this.mostrarAlerta('Destino activado correctamente.', 'success');
        this.cargarDatos();
      },
      error: (err) => {
        this.mostrarAlerta(`Error al activar: ${err.message}`, 'error');
      }
    });
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
