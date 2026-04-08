export interface SugerenciaIA {
  id: string;
  nombre: string;
  confianza: number;
  laboratorio: string;
}

export interface ValidacionIAResponse {
  sugerencias: SugerenciaIA[];
}
