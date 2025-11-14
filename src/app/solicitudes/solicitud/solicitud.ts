import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, map, catchError } from 'rxjs/operators';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { SolicitudesService } from '../../services/solicitudes.service';
import { SolicitudDto, SolicitudCreateDto } from '../../interfaces/solicitud.interface';
import { PaginatedResponse } from '../../interfaces/paginated-response.interface';
import { CatalogosService } from '../../services/catalogos.service';
import { CatalogoItem } from '../../interfaces/catalogo.interface';
import { VisitantesService } from '../../services/visitantes';
import { VehiculoService } from '../../services/vehiculo.service';
import { Visitante } from '../../interfaces/visitante.interface';
import { VehiculoDto } from '../../interfaces/vehiculo.interface';

@Component({
  selector: 'app-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './solicitud.html',
})
export default class SolicitudComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private solicitudesService = inject(SolicitudesService);
  private catalogosService = inject(CatalogosService);
  private visitantesService = inject(VisitantesService);
  private vehiculoService = inject(VehiculoService);

  public paginatedResponse = signal<PaginatedResponse<SolicitudDto> | null>(null);
  public destinos = signal<CatalogoItem[]>([]);
  public estadosSolicitud = signal<CatalogoItem[]>([]);
  public visitantes = signal<Visitante[]>([]);
  public vehiculos = signal<VehiculoDto[]>([]);

  public searchForm: FormGroup;
  public advancedSearchForm: FormGroup;
  public solicitudForm: FormGroup;

  public isEditMode = signal(false);
  public currentSolicitudId: number | null = null;

  private searchSubscription?: Subscription;

  public minSalidaDate = '';

  constructor() {
    this.searchForm = this.fb.group({
      busquedaGeneral: [''],
    });

    this.advancedSearchForm = this.fb.group({
      destino: [''],
      estado: [''],
      fechaDesde: [''],
      fechaHasta: [''],
    });

    this.solicitudForm = this.fb.group({
      visitanteId: [null, Validators.required],
      f_Ingreso: ['', Validators.required],
      f_Salida: [{ value: '', disabled: true }, Validators.required],
      destinoId: [null, Validators.required],
      vehiculoId: [null],
      estadoSolicitudId: [null, Validators.required],
    }, 
    {
      validators: this.fechaSalidaValidator(),
      asyncValidators: this.superposicionValidator(),
      updateOn: 'blur'
    });

    this.solicitudForm.get('f_Ingreso')?.valueChanges.subscribe(value => {
      const fSalidaControl = this.solicitudForm.get('f_Salida');
      if (value) {
        fSalidaControl?.enable();
        const ingresoDate = new Date(value);
        ingresoDate.setHours(ingresoDate.getHours() + 1);
        this.minSalidaDate = this.formatDateForInput(ingresoDate);

        if (fSalidaControl?.value && new Date(fSalidaControl.value) < ingresoDate) {
          fSalidaControl.setValue(this.minSalidaDate);
        }
      } else {
        fSalidaControl?.disable();
        fSalidaControl?.reset();
        this.minSalidaDate = '';
      }
    });
  }

  private fechaSalidaValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const ingresoCtrl = group.get('f_Ingreso');
      const salidaCtrl = group.get('f_Salida');

      if (!ingresoCtrl?.value || !salidaCtrl?.value) {
        return null;
      }

      const ingresoDate = new Date(ingresoCtrl.value);
      const salidaDate = new Date(salidaCtrl.value);

      const minSalidaDate = new Date(ingresoDate.getTime());
      minSalidaDate.setHours(minSalidaDate.getHours() + 1);

      if (salidaDate < minSalidaDate) {
        return { fechaSalidaInvalida: true };
      }

      return null;
    };
  }

  private superposicionValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const group = control as FormGroup;
      const visitanteId = group.get('visitanteId')?.value;
      const f_Ingreso = group.get('f_Ingreso')?.value;
      const f_Salida = group.get('f_Salida')?.value;

      if (!visitanteId || !f_Ingreso || !f_Salida || group.hasError('fechaSalidaInvalida')) {
        return of(null);
      }

      return this.solicitudesService.validarSuperposicion(visitanteId, f_Ingreso, f_Salida, this.currentSolicitudId).pipe(
        map(response => (response.esSuperpuesto ? { superposicion: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  ngOnInit(): void {
    this.cargarSolicitudes();
    this.cargarCatalogos();

    this.searchSubscription = this.searchForm.get('busquedaGeneral')!.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.paginatedResponse.set(null))
    ).subscribe(() => {
      this.cargarSolicitudes(1);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  cargarSolicitudes(page: number = 1): void {
    const { busquedaGeneral } = this.searchForm.value;
    const { destino, estado, fechaDesde, fechaHasta } = this.advancedSearchForm.value;

    let estadoId: number | undefined;
    if (estado && String(estado).trim() !== '') {
      const parsedId = parseInt(String(estado), 10);
      if (!isNaN(parsedId)) {
        estadoId = parsedId;
      }
    }

    this.solicitudesService.getAll(page, 10, busquedaGeneral, destino, undefined, estadoId, fechaDesde, fechaHasta)
      .subscribe(response => {
        this.paginatedResponse.set(response);
      });
  }

  cargarCatalogos(): void {
    this.catalogosService.getDestinosActivos().subscribe(data => this.destinos.set(data));
    this.catalogosService.getAll('EstadosSolicitud').subscribe(data => {
      const filteredData = data.filter(item => item.descripcion !== 'Anulada');
      this.estadosSolicitud.set(filteredData);
    });
    this.visitantesService.getAll(1, 1000).pipe(
      map(res => res.items.filter(v => v.estadoVisitante !== 'Inactivo'))
    ).subscribe(data => this.visitantes.set(data));
    this.vehiculoService.getAll(1, 1000).pipe(map(res => res.items)).subscribe(data => this.vehiculos.set(data));
  }

  cambiarPagina(page: number): void {
    if (page > 0 && (!this.paginatedResponse() || page <= this.paginatedResponse()!.totalPaginas)) {
      this.cargarSolicitudes(page);
    }
  }

  abrirModalBusquedaAvanzada(): void {
    (document.getElementById('advanced_search_modal') as HTMLDialogElement)?.showModal();
  }

  aplicarFiltrosAvanzados(): void {
    this.cargarSolicitudes(1);
    (document.getElementById('advanced_search_modal') as HTMLDialogElement)?.close();
  }

  abrirModalCrear(): void {
    this.isEditMode.set(false);
    this.solicitudForm.reset();
    this.currentSolicitudId = null;
    (document.getElementById('solicitud_modal') as HTMLDialogElement)?.showModal();
  }

  abrirModalEditar(solicitud: SolicitudDto): void {
    this.isEditMode.set(true);
    this.currentSolicitudId = solicitud.id;

    this.solicitudesService.getById(solicitud.id).subscribe({
      next: (solicitudEditable) => {
        const formattedSolicitud = {
          ...solicitudEditable,
          f_Ingreso: this.formatDateForInput(solicitudEditable.f_Ingreso),
          f_Salida: this.formatDateForInput(solicitudEditable.f_Salida),
        };
        this.solicitudForm.patchValue(formattedSolicitud);
        (document.getElementById('solicitud_modal') as HTMLDialogElement)?.showModal();
      },
      error: (err) => {
        console.error("Error al obtener los datos de la solicitud para editar:", err);
        Swal.fire('Error', `Error al obtener los datos de la solicitud: ${err.message}`, 'error');
      }
    });
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const hours = ('0' + d.getHours()).slice(-2);
    const minutes = ('0' + d.getMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  guardarOActualizarSolicitud(): void {
    this.solicitudForm.markAllAsTouched();

    if (this.solicitudForm.invalid) {
      if (this.solicitudForm.hasError('fechaSalidaInvalida')) {
        Swal.fire('Error de Validación', 'La fecha de salida debe ser al menos una hora posterior a la fecha de ingreso.', 'error');
        document.getElementById('f_Salida_input')?.focus();
      } else if (this.solicitudForm.hasError('superposicion')) {
        Swal.fire('Error de Validación', 'El visitante ya tiene una solicitud para este rango de fechas.', 'error');
      } else {
        Swal.fire('Error de Validación', 'Por favor, complete todos los campos requeridos.', 'warning');
      }
      return;
    }

    const formValue = this.solicitudForm.value;
    const solicitudData: SolicitudCreateDto = {
      ...formValue,
      f_Ingreso: new Date(formValue.f_Ingreso),
      f_Salida: new Date(formValue.f_Salida),
    };

    if (this.isEditMode()) {
      this.solicitudesService.update(this.currentSolicitudId!, solicitudData)
        .subscribe({
          next: () => {
            Swal.fire('Actualizada', 'Solicitud actualizada correctamente.', 'success');
            this.cargarSolicitudes(this.paginatedResponse()?.paginaActual || 1);
            (document.getElementById('solicitud_modal') as HTMLDialogElement)?.close();
            this.solicitudForm.reset();
          },
          error: (err) => {
            Swal.fire('Error', `Error al actualizar: ${err.message}`, 'error');
          }
        });
    } else {
      this.solicitudesService.create(solicitudData)
        .subscribe({
          next: () => {
            Swal.fire('Creada', 'Solicitud creada correctamente.', 'success');
            this.cargarSolicitudes();
            (document.getElementById('solicitud_modal') as HTMLDialogElement)?.close();
            this.solicitudForm.reset();
          },
          error: (err) => {
            Swal.fire('Error', `Error al crear: ${err.message}`, 'error');
          }
        });
    }
  }

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'La solicitud será anulada y no se podrá revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, anular!',
      cancelButtonText: 'Cancelar'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.solicitudesService.delete(id).subscribe({
          next: () => {
            Swal.fire('Anulada', 'La solicitud ha sido anulada.', 'success');
            this.cargarSolicitudes(this.paginatedResponse()?.paginaActual || 1);
          },
          error: (err) => {
            Swal.fire('Error', `Error al anular la solicitud: ${err.message}`, 'error');
          }
        });
      }
    });
  }
}