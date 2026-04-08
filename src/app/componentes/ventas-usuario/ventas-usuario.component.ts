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

  ventasOriginal: VentaUsuario[] = [];
  ventasFiltradas: VentaUsuario[] = [];
  paginatedArticulos: VentaUsuario[] = [];

  textoBusqueda: string = '';
  fechaBusqueda: string = '';

  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 0;

  isAdmin: boolean = false;

  selectedVentas: Set<number> = new Set();

  constructor(
    private ventasService: VentasUserService,
    private authService: AuthService,
    private excelService: ExcelGeneratorService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.checkRole();
    this.obtenerVentas();
  }

  checkRole(): void {
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

  cambiarIdioma(idioma: string) {
    this.translate.use(idioma);
  }

  obtenerVentas(): void {
    this.ventasService.cargarVentas().subscribe(
      (data) => {
        this.ventasOriginal = data;
        this.ventasFiltradas = data;
        this.calcularPaginacion();
      },
      (error) => {
        // TODO: añadir manejo de error UI
      }
    );
  }

  aplicarFiltros(): void {
    let temporal = this.ventasOriginal;

    if (this.textoBusqueda) {
      const texto = this.textoBusqueda.toLowerCase();
      temporal = temporal.filter(v =>
        (v.username && v.username.toLowerCase().includes(texto)) ||
        (v.dnicliente && v.dnicliente.toLowerCase().includes(texto)) ||
        (v.nameproducto && v.nameproducto.toLowerCase().includes(texto))
      );
    }

    if (this.fechaBusqueda) {
      temporal = temporal.filter(v =>
        v.fecha && v.fecha.toString().startsWith(this.fechaBusqueda)
      );
    }

    this.ventasFiltradas = temporal;
    this.currentPage = 1;
    this.calcularPaginacion();
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.fechaBusqueda = '';
    this.ventasFiltradas = this.ventasOriginal;
    this.currentPage = 1;
    this.selectedVentas.clear();
    this.calcularPaginacion();
  }

  calcularPaginacion(): void {
    this.totalPages = Math.ceil(this.ventasFiltradas.length / this.rowsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;

    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;

    this.paginatedArticulos = this.ventasFiltradas.slice(start, end);
  }

  cambiarPagina(delta: number): void {
    const nuevaPagina = this.currentPage + delta;
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPages) {
      this.currentPage = nuevaPagina;
      this.selectedVentas.clear();
      this.calcularPaginacion();
    }
  }

  toggleSeleccion(id: number): void {
    if (this.selectedVentas.has(id)) {
      this.selectedVentas.delete(id);
    } else {
      this.selectedVentas.add(id);
    }
  }

  estaSeleccionado(id: number): boolean {
    return this.selectedVentas.has(id);
  }

  get todosSeleccionados(): boolean {
    return this.paginatedArticulos.length > 0 &&
      this.paginatedArticulos.every(v => this.selectedVentas.has(v.id));
  }

  get numSeleccionados(): number {
    return this.selectedVentas.size;
  }

  toggleSeleccionTodo(): void {
    if (this.todosSeleccionados) {
      this.paginatedArticulos.forEach(v => this.selectedVentas.delete(v.id));
    } else {
      this.paginatedArticulos.forEach(v => this.selectedVentas.add(v.id));
    }
  }

  cancelarSeleccionadas(): void {
    const ids = [...this.selectedVentas];

    Swal.fire({
      title: this.translate.instant('HISTORIAL.MSG.CANCELAR_TITULO'),
      text: this.translate.instant('HISTORIAL.MSG.CANCELAR_TEXTO'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translate.instant('HISTORIAL.MSG.BTN_SI_CANCELAR'),
      cancelButtonText: this.translate.instant('HISTORIAL.MSG.BTN_NO_VOLVER')
    }).then((result) => {
      if (!result.isConfirmed) return;

      const token = this.authService.getToken();
      let responsable = 'Desconocido';
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          responsable = decoded.sub || decoded.username || 'Admin';
        } catch (e) {}
      }

      forkJoin(ids.map(id => this.ventasService.cancelarVenta(id, responsable))).subscribe({
        next: () => {
          Swal.fire(
            this.translate.instant('HISTORIAL.MSG.EXITO_TITULO'),
            this.translate.instant('HISTORIAL.MSG.EXITO_TEXTO'),
            'success'
          );
          this.selectedVentas.clear();
          this.obtenerVentas();
        },
        error: () => {
          Swal.fire(
            this.translate.instant('HISTORIAL.MSG.ERROR_TITULO'),
            this.translate.instant('HISTORIAL.MSG.ERROR_TEXTO'),
            'error'
          );
          this.selectedVentas.clear();
          this.obtenerVentas();
        }
      });
    });
  }

  cancelarVenta(venta: any): void {
    // SWEET ALERT TRADUCIDO 🍬
    Swal.fire({
      title: this.translate.instant('HISTORIAL.MSG.CANCELAR_TITULO'),
      text: this.translate.instant('HISTORIAL.MSG.CANCELAR_TEXTO'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translate.instant('HISTORIAL.MSG.BTN_SI_CANCELAR'),
      cancelButtonText: this.translate.instant('HISTORIAL.MSG.BTN_NO_VOLVER')
    }).then((result) => {

      if (result.isConfirmed) {

        const token = this.authService.getToken();
        let responsable = 'Desconocido';
        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            responsable = decoded.sub || decoded.username || 'Admin';
          } catch (e) {
            // TODO: añadir manejo de error UI
          }
        }

        this.ventasService.cancelarVenta(venta.id, responsable).subscribe({
          next: (response) => {
            Swal.fire(
              this.translate.instant('HISTORIAL.MSG.EXITO_TITULO'),
              this.translate.instant('HISTORIAL.MSG.EXITO_TEXTO'),
              'success'
            );
            this.obtenerVentas();
          },
          error: (err) => {
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
      }
    });
  }

  descargarExcel(): void {
    this.excelService.exportarHistorialVentas(this.ventasFiltradas);
  }

}
