import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

import { VehiculoService } from '../../services/vehiculo.service';
import { VehiculoDto, VehiculoCreateDto } from '../../interfaces/vehiculo.interface';
import { PaginatedResponse } from '../../interfaces/paginated-response.interface';
import { CatalogosService } from '../../services/catalogos.service';
import { CatalogoItem } from '../../interfaces/catalogo.interface';

@Component({
  selector: 'app-vehiculo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehiculo.html',
})
export default class VehiculoComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private vehiculoService = inject(VehiculoService);
  private catalogosService = inject(CatalogosService);

  public paginatedResponse = signal<PaginatedResponse<VehiculoDto> | null>(null);
  public clasesVehiculo = signal<CatalogoItem[]>([]);

  public searchForm: FormGroup;
  public vehiculoForm: FormGroup;

  public isEditMode = signal(false);
  public currentVehiculoId: number | null = null;

  private searchSubscription?: Subscription;

  public vehiculoParaEliminarId: number | null = null;

  constructor() {
    this.searchForm = this.fb.group({
      placa: [''],
    });

    this.vehiculoForm = this.fb.group({
      placa: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(10)]],
      nombre_Empresa: [''],
      claseVehiculoId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarVehiculos();
    this.cargarCatalogos();

    this.searchSubscription = this.searchForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.paginatedResponse.set(null))
    ).subscribe(() => {
      this.cargarVehiculos(1);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  cargarVehiculos(page: number = 1): void {
    const { placa } = this.searchForm.value;
    this.vehiculoService.getAll(page, 10, placa)
      .subscribe(response => {
        this.paginatedResponse.set(response);
      });
  }

  cargarCatalogos(): void {
    this.catalogosService.getAll('ClasesVehiculo').subscribe(data => this.clasesVehiculo.set(data));
  }

  cambiarPagina(page: number): void {
    if (page > 0 && (!this.paginatedResponse() || page <= this.paginatedResponse()!.totalPaginas)) {
      this.cargarVehiculos(page);
    }
  }

  abrirModalCrear(): void {
    this.isEditMode.set(false);
    this.vehiculoForm.reset();
    this.currentVehiculoId = null;
    (document.getElementById('vehiculo_modal') as HTMLDialogElement)?.showModal();
  }

  abrirModalEditar(vehiculo: VehiculoDto): void {
    this.isEditMode.set(true);
    this.currentVehiculoId = vehiculo.id;
    const claseVehiculo = this.clasesVehiculo().find(c => c.descripcion === vehiculo.claseVehiculo);

    this.vehiculoForm.setValue({
      placa: vehiculo.placa,
      nombre_Empresa: vehiculo.nombre_Empresa || '',
      claseVehiculoId: claseVehiculo ? claseVehiculo.id : null
    });

    (document.getElementById('vehiculo_modal') as HTMLDialogElement)?.showModal();
  }

  guardarOActualizarVehiculo(): void {
    if (this.vehiculoForm.invalid) {
      this.vehiculoForm.markAllAsTouched();
      return;
    }

    const vehiculoData: VehiculoCreateDto = this.vehiculoForm.value;

    if (this.isEditMode()) {
      this.vehiculoService.update(this.currentVehiculoId!, vehiculoData)
        .subscribe({
          next: () => {
            this.cargarVehiculos(this.paginatedResponse()?.paginaActual || 1);
            (document.getElementById('vehiculo_modal') as HTMLDialogElement)?.close();
            this.vehiculoForm.reset();
          },
          error: (err) => {
            console.error('Error al actualizar', err);
          }
        });
    } else {
      this.vehiculoService.create(vehiculoData)
        .subscribe({
          next: () => {
            this.cargarVehiculos();
            (document.getElementById('vehiculo_modal') as HTMLDialogElement)?.close();
            this.vehiculoForm.reset();
          },
          error: (err) => {
            console.error('Error al crear', err);
          }
        });
    }
  }

  prepararEliminacion(id: number): void {
    this.vehiculoParaEliminarId = id;
    (document.getElementById('delete_vehiculo_modal') as HTMLDialogElement)?.showModal();
  }

  confirmarEliminacion(): void {
    if (!this.vehiculoParaEliminarId) return;

    this.vehiculoService.delete(this.vehiculoParaEliminarId).subscribe({
      next: () => {
        this.cargarVehiculos(this.paginatedResponse()?.paginaActual || 1);
        (document.getElementById('delete_vehiculo_modal') as HTMLDialogElement)?.close();
      },
      error: (err) => {
        console.error('Error al eliminar', err);
        (document.getElementById('delete_vehiculo_modal') as HTMLDialogElement)?.close();
      },
      complete: () => {
        this.vehiculoParaEliminarId = null;
      }
    });
  }
}
