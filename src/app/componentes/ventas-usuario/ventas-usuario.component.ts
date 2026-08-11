import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { VentasUserService } from '../../services/ventas-user.service';
import { VentaUsuario } from '../../models/VentaUsuario';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { ExcelGeneratorService } from '../../services/excel-generator.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ventas-usuario',
  standalone: false,
  templateUrl: './ventas-usuario.component.html',
  styleUrls: ['./ventas-usuario.component.css']
})
export class VentasUsuarioComponent implements OnInit {

  // Lista completa que llega del backend (nunca se modifica)
  ventasOriginal: VentaUsuario[] = [];
  // Lista que se filtra según el buscador
  ventasFiltradas: VentaUsuario[] = [];
  // Porción de ventasFiltradas que se muestra en la tabla (8 por página)
  ventasPaginadas: VentaUsuario[] = [];

  // Campos del buscador
  textoBusqueda: string = '';
  fechaBusqueda: string = '';

  // Control de paginación
  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 0;

  isAdmin: boolean = false;

  // IDs de las ventas que el usuario ha marcado con el checkbox
  ventasSeleccionadas: Set<number> = new Set();

  constructor(
    private ventasService: VentasUserService,
    private authService: AuthService,
    private excelService: ExcelGeneratorService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.verificarRol();
    this.obtenerVentas();
  }

  // Lee el token JWT para saber si el usuario es administrador
  verificarRol(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.isAdmin = decoded.role === 'ADMIN' || decoded.role === 'ROLE_ADMIN' || decoded.role === 'SUPERADMIN' || decoded.role === 'ROLE_SUPERADMIN';
      } catch (e) {
        this.isAdmin = false;
      }
    }
  }

  // Pide todas las ventas al backend y las muestra en la tabla
  obtenerVentas(): void {
    this.ventasService.cargarVentas().subscribe(
      (ventas) => {
        this.ventasOriginal  = ventas;
        this.ventasFiltradas = ventas;
        this.calcularPaginacion();
      },
      (error) => {}
    );
  }

  // Filtra la lista según el texto escrito y/o la fecha seleccionada
  aplicarFiltros(): void {
    let resultado = this.ventasOriginal;

    if (this.textoBusqueda) {
      const texto = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(venta =>
        (venta.username     && venta.username.toLowerCase().includes(texto))     ||
        (venta.dnicliente   && venta.dnicliente.toLowerCase().includes(texto))   ||
        (venta.nameproducto && venta.nameproducto.toLowerCase().includes(texto))
      );
    }

    if (this.fechaBusqueda) {
      resultado = resultado.filter(venta =>
        venta.fecha && venta.fecha.toString().startsWith(this.fechaBusqueda)
      );
    }

    this.ventasFiltradas = resultado;
    this.currentPage = 1;
    this.calcularPaginacion();
  }

  // Borra los filtros y vuelve a mostrar todas las ventas
  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.fechaBusqueda = '';
    this.ventasFiltradas = this.ventasOriginal;
    this.currentPage = 1;
    this.ventasSeleccionadas.clear();
    this.calcularPaginacion();
  }

  // Calcula el total de páginas y recorta la lista para mostrar solo la página actual
  calcularPaginacion(): void {
    this.totalPages = Math.ceil(this.ventasFiltradas.length / this.rowsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;

    const inicio = (this.currentPage - 1) * this.rowsPerPage;
    const fin    = inicio + this.rowsPerPage;

    this.ventasPaginadas = this.ventasFiltradas.slice(inicio, fin);
  }

  // Avanza o retrocede una página (+1 o -1)
  cambiarPagina(delta: number): void {
    const nuevaPagina = this.currentPage + delta;
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPages) {
      this.currentPage = nuevaPagina;
      this.ventasSeleccionadas.clear();
      this.calcularPaginacion();
    }
  }

  // Marca o desmarca una venta individual por su ID
  toggleSeleccion(id: number): void {
    if (this.ventasSeleccionadas.has(id)) {
      this.ventasSeleccionadas.delete(id);
    } else {
      this.ventasSeleccionadas.add(id);
    }
  }

  // Devuelve true si una venta está marcada
  estaSeleccionado(id: number): boolean {
    return this.ventasSeleccionadas.has(id);
  }

  // True si todas las ventas de la página actual están marcadas
  get todosSeleccionados(): boolean {
    return this.ventasPaginadas.length > 0 &&
      this.ventasPaginadas.every(venta => this.ventasSeleccionadas.has(venta.id));
  }

  // Número de ventas actualmente seleccionadas
  get numSeleccionados(): number {
    return this.ventasSeleccionadas.size;
  }

  // Marca todas las ventas de la página actual, o las desmarca si ya estaban todas marcadas
  toggleSeleccionTodo(): void {
    if (this.todosSeleccionados) {
      this.ventasPaginadas.forEach(venta => this.ventasSeleccionadas.delete(venta.id));
    } else {
      this.ventasPaginadas.forEach(venta => this.ventasSeleccionadas.add(venta.id));
    }
  }

  // Cancela en lote todas las ventas marcadas con checkbox
  cancelarSeleccionadas(): void {
    const ids = [...this.ventasSeleccionadas];

    Swal.fire({
      title:             this.translate.instant('HISTORIAL.MSG.CANCELAR_TITULO'),
      text:              this.translate.instant('HISTORIAL.MSG.CANCELAR_TEXTO'),
      icon:              'warning',
      showCancelButton:  true,
      confirmButtonColor: '#d33',
      cancelButtonColor:  '#3085d6',
      confirmButtonText: this.translate.instant('HISTORIAL.MSG.BTN_SI_CANCELAR'),
      cancelButtonText:  this.translate.instant('HISTORIAL.MSG.BTN_NO_VOLVER')
    }).then((resultado) => {
      if (!resultado.isConfirmed) return;

      // Extraemos el nombre del responsable del token para registrarlo en la cancelación
      const token = this.authService.getToken();
      let responsable = 'Desconocido';
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          responsable = decoded.sub || decoded.username || 'Admin';
        } catch (e) {}
      }

      // forkJoin lanza todas las cancelaciones a la vez y espera a que todas terminen
      forkJoin(ids.map(id => this.ventasService.cancelarVenta(id, responsable))).subscribe({
        next: () => {
          Swal.fire(
            this.translate.instant('HISTORIAL.MSG.EXITO_TITULO'),
            this.translate.instant('HISTORIAL.MSG.EXITO_TEXTO'),
            'success'
          );
          this.ventasSeleccionadas.clear();
          this.obtenerVentas();
        },
        error: () => {
          Swal.fire(
            this.translate.instant('HISTORIAL.MSG.ERROR_TITULO'),
            this.translate.instant('HISTORIAL.MSG.ERROR_TEXTO'),
            'error'
          );
          this.ventasSeleccionadas.clear();
          this.obtenerVentas();
        }
      });
    });
  }

  // Cancela una venta individual tras confirmación del usuario
  cancelarVenta(venta: any): void {
    Swal.fire({
      title:             this.translate.instant('HISTORIAL.MSG.CANCELAR_TITULO'),
      text:              this.translate.instant('HISTORIAL.MSG.CANCELAR_TEXTO'),
      icon:              'warning',
      showCancelButton:  true,
      confirmButtonColor: '#d33',
      cancelButtonColor:  '#3085d6',
      confirmButtonText: this.translate.instant('HISTORIAL.MSG.BTN_SI_CANCELAR'),
      cancelButtonText:  this.translate.instant('HISTORIAL.MSG.BTN_NO_VOLVER')
    }).then((resultado) => {
      if (!resultado.isConfirmed) return;

      const token = this.authService.getToken();
      let responsable = 'Desconocido';
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          responsable = decoded.sub || decoded.username || 'Admin';
        } catch (e) {}
      }

      this.ventasService.cancelarVenta(venta.id, responsable).subscribe({
        next: () => {
          Swal.fire(
            this.translate.instant('HISTORIAL.MSG.EXITO_TITULO'),
            this.translate.instant('HISTORIAL.MSG.EXITO_TEXTO'),
            'success'
          );
          this.obtenerVentas();
        },
        error: (err) => {
          // El backend a veces devuelve 200 dentro del error por un bug de Angular/HTTP
          if (err.status === 200) {
            Swal.fire(
              this.translate.instant('HISTORIAL.MSG.EXITO_TITULO'),
              this.translate.instant('HISTORIAL.MSG.EXITO_TEXTO'),
              'success'
            );
            this.obtenerVentas();
          } else {
            Swal.fire(
              this.translate.instant('HISTORIAL.MSG.ERROR_TITULO'),
              this.translate.instant('HISTORIAL.MSG.ERROR_TEXTO'),
              'error'
            );
          }
        }
      });
    });
  }

  // Exporta las ventas actualmente filtradas a un fichero Excel
  descargarExcel(): void {
    this.excelService.exportarHistorialVentas(this.ventasFiltradas);
  }
}
