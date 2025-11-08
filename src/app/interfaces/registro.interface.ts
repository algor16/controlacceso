import { SolicitudDto } from "./solicitud.interface";
import { CatalogoItem } from "./catalogo.interface";

export interface Registro {
  id: number;
  solicitudId: number;
  solicitud: SolicitudDto;
  tipoRegistroId: number;
  tipoRegistro: CatalogoItem;
  fechaHora: string;
  estadoSolicitudId: number;
  observacion: string | null;
}
