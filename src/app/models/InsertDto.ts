export interface InsertDto {
    nombre: string;
    categoria: string;
    precio: number;
    cantidad: number;
    aempsCode?: string | null;
  }