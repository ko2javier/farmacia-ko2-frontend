export interface Articulo {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
    cantidad: number;
    codigo: string;
    aempsCode?: string | null;
    laboratorio?: string | null;
    version?: number;
  }
