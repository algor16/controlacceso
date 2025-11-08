import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, tap } from 'rxjs/operators';

import { VisitantesService } from '../../services/visitantes'; // Ajusta la ruta si es necesario
import { UpsertVisitante, Visitante } from '../../interfaces/visitante.interface';
import { PaginatedResponse } from '../../interfaces/paginated-response.interface';
import { CatalogosService } from '../../services/catalogos.service';
import { CatalogoItem } from '../../interfaces/catalogo.interface';
import { HttpErrorResponse } from '@angular/common/http';

type AlertStatus = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-visitante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './visitante.html',
})
export default class VisitanteComponent implements OnInit, OnDestroy {

  // --- Inyección de Servicios ---
  private fb = inject(FormBuilder);
  private visitantesService = inject(VisitantesService);
  private catalogosService = inject(CatalogosService);


  // --- Señales para el Estado Reactivo ---
  public paginatedResponse = signal<PaginatedResponse<Visitante> | null>(null);
  public tiposDocumento = signal<CatalogoItem[]>([]);
  public nivelesRiesgo = signal<CatalogoItem[]>([]);
  public estadosVisitante = signal<CatalogoItem[]>([]);

  // --- Formulario de Búsqueda ---
  public searchForm: FormGroup;
  public visitanteForm: FormGroup;

  // --- Estado del Modal ---
  public isEditMode = signal(false);
  public currentVisitorId: number | null = null;

  // --- Lógica para Búsqueda con Retraso (debounce) ---
  private searchTerms = new Subject<void>();
  private searchSubscription?: Subscription;

  public showAlert = signal(false);
  public alertMessage = signal('');
  public alertStatus = signal<AlertStatus>('info');

  public visitanteParaEliminarId: number | null = null;

  constructor() {
    this.searchForm = this.fb.group({
      busquedaGeneral: [''],
      numeroDocumento: ['']
    });

    this.visitanteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      cargo: ['', Validators.required],
      tipoDocumentoId: [null, Validators.required],
      numero: [null, { validators: [Validators.required], asyncValidators: [this.numeroDocumentoValidator()], updateOn: 'blur' }],
      nivelRiesgoId: [null, Validators.required],
      estadoVisitanteId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarVisitantes();
    this.cargarCatalogos();
    this.searchSubscription = this.searchForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      tap(() => this.paginatedResponse.set(null))
    ).subscribe(() => {
      this.cargarVisitantes(1);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  numeroDocumentoValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || this.isEditMode()) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(value => 
          this.visitantesService.verificarNumeroDocumento(value).pipe(
            map(existe => (existe ? { documentoExistente: true } : null)),
            catchError(() => of(null)) // En caso de error en la API, no bloquear el formulario
          )
        )
      );
    };
  }

  cargarVisitantes(page: number = 1): void {
    const { busquedaGeneral, numeroDocumento } = this.searchForm.value;

    this.visitantesService.getAll(page, 10, busquedaGeneral, numeroDocumento)
      .subscribe(response => {
        this.paginatedResponse.set(response);
      });
  }

  cargarCatalogos(): void {
    this.catalogosService.getAll('TiposDocumento').subscribe(data => this.tiposDocumento.set(data));
    this.catalogosService.getAll('NivelesRiesgo').subscribe(data => this.nivelesRiesgo.set(data));
    this.catalogosService.getAll('EstadosVisitante').subscribe(data => {
      const estadosFiltrados = data.filter(estado => estado.descripcion !== 'Inactivo');
      this.estadosVisitante.set(estadosFiltrados);
    });
  }

  onSearchInput(): void {
    this.searchTerms.next();
  }

  cambiarPagina(page: number): void {
    if (page > 0 && (!this.paginatedResponse() || page <= this.paginatedResponse()!.totalPaginas)) {
      this.cargarVisitantes(page);
    }
  }

  abrirModalCrear(): void {
    this.isEditMode.set(false);
    this.visitanteForm.reset();
    this.currentVisitorId = null;
    this.visitanteForm.get('numero')?.setAsyncValidators(this.numeroDocumentoValidator());
    this.visitanteForm.get('numero')?.updateValueAndValidity();
    (document.getElementById('visitante_modal') as HTMLDialogElement)?.showModal();
  }

  abrirModalEditar(visitante: Visitante): void {
    this.isEditMode.set(true);
    this.currentVisitorId = visitante.id;
    this.visitanteForm.get('numero')?.clearAsyncValidators();
    this.visitanteForm.get('numero')?.updateValueAndValidity();

    this.visitantesService.getById(visitante.id).subscribe({
      next: (visitanteEditable) => {
        this.visitanteForm.setValue({
          nombre: visitanteEditable.nombre,
          apellido: visitanteEditable.apellido,
          cargo: visitanteEditable.cargo,
          tipoDocumentoId: visitanteEditable.tipoDocumentoId,
          numero: visitanteEditable.numero,
          nivelRiesgoId: visitanteEditable.nivelRiesgoId,
          estadoVisitanteId: visitanteEditable.estadoVisitanteId,
        });
        (document.getElementById('visitante_modal') as HTMLDialogElement)?.showModal();
      },
      error: (err) => {
        this.mostrarAlerta(`Error al cargar visitante: ${err.message}`, 'error');
      }
    });
  }

  guardarOActualizarVisitante(): void {
    if (this.visitanteForm.invalid) {
      this.visitanteForm.markAllAsTouched();
      return;
    }

    const visitanteData: UpsertVisitante = this.visitanteForm.value;

    if (this.isEditMode()) {
      this.visitantesService.update(this.currentVisitorId!, visitanteData).subscribe({
        next: () => {
          this.mostrarAlerta('Visitante actualizado correctamente.', 'success');
          this.cargarVisitantes(this.paginatedResponse()?.paginaActual || 1);
          (document.getElementById('visitante_modal') as HTMLDialogElement)?.close();
          this.visitanteForm.reset();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) {
            this.visitanteForm.get('numero')?.setErrors({ documentoExistente: true });
            this.mostrarAlerta('El número de documento ya pertenece a otro visitante.', 'error');
          } else {
            this.mostrarAlerta(`Error al actualizar: ${err.error?.mensaje || err.message}`, 'error');
          }
        }
      });
    } else {
      this.visitantesService.create(visitanteData).subscribe({
        next: () => {
          this.mostrarAlerta('Visitante creado correctamente.', 'success');
          this.cargarVisitantes(1); // Volver a la página 1 para ver el nuevo registro
          (document.getElementById('visitante_modal') as HTMLDialogElement)?.close();
          this.visitanteForm.reset();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) {
            this.visitanteForm.get('numero')?.setErrors({ documentoExistente: true });
            this.mostrarAlerta('El número de documento ya está registrado.', 'error');
          } else {
            this.mostrarAlerta(`Error al crear: ${err.error?.mensaje || err.message}`, 'error');
          }
        }
      });
    }
  }

  mostrarAlerta(mensaje: string, status: AlertStatus): void {
    this.alertMessage.set(mensaje);
    this.alertStatus.set(status);
    this.showAlert.set(true);
    setTimeout(() => {
      this.showAlert.set(false);
    }, 5000);
  }

  prepararEliminacion(id: number): void {
    this.visitanteParaEliminarId = id;
    (document.getElementById('delete_visitor_modal') as HTMLDialogElement)?.showModal();
  }

  confirmarEliminacion(): void {
    if (!this.visitanteParaEliminarId) return;

    this.visitantesService.delete(this.visitanteParaEliminarId).subscribe({
      next: () => {
        this.mostrarAlerta('Visitante eliminado correctamente.', 'warning');
        this.cargarVisitantes(this.paginatedResponse()?.paginaActual || 1);
      },
      error: (err) => {
        this.mostrarAlerta(`Error al eliminar el visitante: ${err.message}`, 'error');
      },
      complete: () => {
        this.visitanteParaEliminarId = null;
      }
    });
  }
}
