import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistrosService } from '../services/registros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AccionSugeridaDto, SugerenciaResponseDto } from '../interfaces/sugerencia.interface';

@Component({
  selector: 'app-registros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registros.component.html',
})
export default class RegistrosComponent {

  private fb = inject(FormBuilder);
  private registrosService = inject(RegistrosService);
  private cdr = inject(ChangeDetectorRef);

  public readonly Validators = Validators;

  public sugerenciaResponse = signal<SugerenciaResponseDto | null>(null);
  public errorMensaje = signal<string | null>(null);
  public isLoading = signal<boolean>(false);
  public registroExitoso = signal<boolean>(false);

  public busquedaForm = this.fb.group({
    numeroDocumento: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
  });

  public accionForm = this.fb.group({
    accionSeleccionada: ['', Validators.required],
    observacion: [''],
  });

  buscarSugerencias() {
    if (this.busquedaForm.invalid) {
      this.busquedaForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.sugerenciaResponse.set(null);
    this.errorMensaje.set(null);

    const numeroDocumento = Number(this.busquedaForm.value.numeroDocumento);

    this.registrosService.getSugerencia(numeroDocumento).subscribe({
      next: (response) => {
        this.sugerenciaResponse.set(response);
        this.isLoading.set(false);

        // Solo procesar acciones si el estado del visitante es Normal
        if (response.estadoVisitante === 'Normal') {
          // Pre-rellenar la observación si viene del backend
          if (response.observacionPrevia) {
            this.accionForm.patchValue({ observacion: response.observacionPrevia });
          }

          if (response.accionesSugeridas.length > 0) {
            const accionSugerida = response.accionesSugeridas[0]; // La primera es la sugerencia
            this.accionForm.patchValue({
              accionSeleccionada: JSON.stringify({
                solicitudId: accionSugerida.solicitudId,
                tipoRegistroId: accionSugerida.tipoRegistroId
              })
            });

            // Si es un ingreso manual, hacer la observación requerida
            if (accionSugerida.solicitudId === null) {
              this.accionForm.controls.observacion.setValidators([Validators.required]);
            } else {
              this.accionForm.controls.observacion.clearValidators();
            }
            this.accionForm.controls.observacion.updateValueAndValidity();
          }
        }

        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMensaje.set(err.error?.mensaje || 'Error al buscar el visitante.');
        this.isLoading.set(false);
      }
    });
  }

  // --- Helpers para el Template ---
  getAccion(tipo: 'Ingreso' | 'Salida'): AccionSugeridaDto | undefined {
    const tipoId = tipo === 'Ingreso' ? 1 : 2;
    return this.sugerenciaResponse()?.accionesSugeridas.find(a => a.tipoRegistroId === tipoId);
  }

  getAccionValue(accion: AccionSugeridaDto): string {
    return JSON.stringify({
      solicitudId: accion.solicitudId,
      tipoRegistroId: accion.tipoRegistroId
    });
  }

  registrar() {
    if (this.accionForm.invalid) { 
      this.accionForm.markAllAsTouched();
      return; 
    }
    const seleccion = JSON.parse(this.accionForm.value.accionSeleccionada!);
    const payload = {
      visitanteId: this.sugerenciaResponse()!.visitanteId,
      solicitudId: seleccion.solicitudId,
      tipoRegistroId: seleccion.tipoRegistroId,
      observacion: this.accionForm.value.observacion || undefined
    };

    this.registrosService.crearRegistro(payload).subscribe({
      next: () => {
        this.registroExitoso.set(true);
        this.reset();
        setTimeout(() => this.registroExitoso.set(false), 3000);
      },
      error: (err: HttpErrorResponse) => {
        alert(`Error al crear el registro: ${err.error.message || 'Error desconocido'}`);
      }
    });
  }

  registrarManual() {
    const observacion = this.accionForm.value.observacion;
    if (!observacion) {
      alert('Para un registro manual, la observación (ej: quién autoriza) es obligatoria.');
      return;
    }
    alert(`Registro manual iniciado con observación: "${observacion}".\n(Funcionalidad pendiente de implementación)`);
    this.reset();
  }

  reset() {
    this.busquedaForm.reset();
    this.accionForm.reset();
    this.sugerenciaResponse.set(null);
    this.errorMensaje.set(null);
    this.isLoading.set(false);
  }
}