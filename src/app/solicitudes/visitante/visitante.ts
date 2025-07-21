import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

import { VisitantesService } from '../../services/visitantes'; // Ajusta la ruta si es necesario
import { UpsertVisitante, Visitante } from '../../interfaces/visitante.interface';
import { PaginatedResponse } from '../../interfaces/paginated-response.interface';
import { CatalogosService } from '../../services/catalogos.service';
import { CatalogoItem } from '../../interfaces/catalogo.interface';

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
     // ✅ Inicializa el formulario para el modal
    this.visitanteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      cargo: ['', Validators.required],
      tipoDocumentoId: [null, Validators.required],
      numero: [null, Validators.required],
      nivelRiesgoId: [null, Validators.required],
      estadoVisitanteId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    // Carga los datos iniciales al entrar al componente
    this.cargarVisitantes();
    this.cargarCatalogos();
    // Configura la búsqueda con debounce de 500ms
    this.searchSubscription = this.searchForm.valueChanges.pipe(
      // Espera 500ms después de que el usuario deja de teclear
      debounceTime(500),
      // No hace nada si el valor nuevo es igual al anterior
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      // Opcional: Muestra un indicador de carga mientras se busca
      tap(() => this.paginatedResponse.set(null))
    ).subscribe(() => {
      // Vuelve a la página 1 cada vez que se realiza una nueva búsqueda
      this.cargarVisitantes(1);
    });
  }

  ngOnDestroy(): void {
    // Limpia la suscripción para evitar fugas de memoria
    this.searchSubscription?.unsubscribe();
  }

  /**
   * Carga los visitantes desde el servicio usando los filtros y la paginación actual.
   * @param page - El número de página a cargar.
   */
  cargarVisitantes(page: number = 1): void {
    const { busquedaGeneral, numeroDocumento } = this.searchForm.value;

    this.visitantesService.getAll(page, 10, busquedaGeneral, numeroDocumento)
      .subscribe(response => {
        this.paginatedResponse.set(response);
      });
  }

   // ✅ Nuevo método para cargar los datos de los catálogos
  cargarCatalogos(): void {
    this.catalogosService.getAll('TiposDocumento').subscribe(data => this.tiposDocumento.set(data));
    this.catalogosService.getAll('NivelesRiesgo').subscribe(data => this.nivelesRiesgo.set(data));
    this.catalogosService.getAll('EstadosVisitante').subscribe(data => this.estadosVisitante.set(data));
  }
  /**
   * Se llama cada vez que el usuario escribe en los campos de búsqueda.
   */
  onSearchInput(): void {
    this.searchTerms.next();
  }

  /**
   * Cambia a la página anterior o siguiente.
   * @param page - El número de la nueva página.
   */
  cambiarPagina(page: number): void {
    if (page > 0 && (!this.paginatedResponse() || page <= this.paginatedResponse()!.totalPaginas)) {
      this.cargarVisitantes(page);
    }
  }

  /**
   * Abre el modal en modo "Crear".
   * Resetea el formulario y se prepara para un nuevo registro.
   */
  abrirModalCrear(): void {
    this.isEditMode.set(false);
    this.visitanteForm.reset();
    this.currentVisitorId = null;
    (document.getElementById('visitante_modal') as HTMLDialogElement)?.showModal();
  }

  /**
   * Abre el modal en modo "Editar".
   * Carga los datos del visitante seleccionado en el formulario.
   */
  abrirModalEditar(visitante: Visitante): void {
    this.isEditMode.set(true);
    this.currentVisitorId = visitante.id;

    // Llama al servicio para obtener los datos completos y editables
    this.visitantesService.getById(visitante.id).subscribe({
      next: (visitanteEditable) => {
        // Rellena el formulario con los datos recibidos de la API
        this.visitanteForm.setValue({
          nombre: visitanteEditable.nombre,
          apellido: visitanteEditable.apellido,
          cargo: visitanteEditable.cargo,
          tipoDocumentoId: visitanteEditable.tipoDocumentoId,
          numero: visitanteEditable.numero,
          nivelRiesgoId: visitanteEditable.nivelRiesgoId,
          estadoVisitanteId: visitanteEditable.estadoVisitanteId,
        });

        // Abre el modal una vez que el formulario está listo
        (document.getElementById('visitante_modal') as HTMLDialogElement)?.showModal();
      },
      error: (err) => {
        console.error("Error al obtener los datos del visitante para editar:", err);
        // Aquí podrías mostrar una alerta de error al usuario
      }
    });
  }



  /**
   * Se ejecuta al enviar el formulario del modal.
   * Decide si crear o actualizar el registro.
   */
  guardarOActualizarVisitante(): void {
    if (this.visitanteForm.invalid) {
      this.visitanteForm.markAllAsTouched();
      return;
    }

    const visitanteData: UpsertVisitante = this.visitanteForm.value;

    if (this.isEditMode()) {
      // --- LÓGICA DE ACTUALIZAR (con su propio subscribe) ---
      this.visitantesService.update(this.currentVisitorId!, visitanteData)
        .subscribe({
          next: () => {
            this.mostrarAlerta('Visitante actualizado correctamente.', 'success');
            this.cargarVisitantes(this.paginatedResponse()?.paginaActual || 1);
            (document.getElementById('visitante_modal') as HTMLDialogElement)?.close();
          },
          error: (err) => {
            this.mostrarAlerta(`Error al actualizar: ${err.message}`, 'error');
          }
        });
    } else {
      // --- LÓGICA DE CREAR (con su propio subscribe) ---
      this.visitantesService.create(visitanteData)
        .subscribe({
          next: () => {
            this.mostrarAlerta('Visitante creado correctamente.', 'success');
            this.cargarVisitantes(); // Vuelve a la primera página para ver el nuevo registro
            (document.getElementById('visitante_modal') as HTMLDialogElement)?.close();
          },
          error: (err) => {
            this.mostrarAlerta(`Error al crear: ${err.message}`, 'error');
          }
        });
    }

    // Reseteamos el formulario al final en ambos casos
    this.visitanteForm.reset();
  }

  mostrarAlerta(mensaje: string, status: AlertStatus): void {
    this.alertMessage.set(mensaje);
    this.alertStatus.set(status);
    this.showAlert.set(true);

    // Ocultar la alerta después de 5 segundos
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
      // Usamos el método que ya tienes para mostrar alertas
      this.mostrarAlerta('Visitante eliminado correctamente.', 'warning');
      this.cargarVisitantes(this.paginatedResponse()?.paginaActual || 1); // Recarga la página actual
    },
    error: (err) => {
      this.mostrarAlerta(`Error al eliminar el visitante: ${err.message}`, 'error');
    },
    complete: () => {
      this.visitanteParaEliminarId = null; // Limpia el ID al terminar
    }
  });
}

}
