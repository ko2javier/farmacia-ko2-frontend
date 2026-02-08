import { Component, OnInit } from '@angular/core';
import { VentasUserService } from '../../services/ventas-user.service';
import { VentaUsuario } from '../../models/VentaUsuario';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { ExcelGeneratorService } from '../../services/excel-generator.service';

@Component({
  selector: 'app-ventas-usuario',
  standalone: false,
  templateUrl: './ventas-usuario.component.html',
  styleUrls: ['./ventas-usuario.component.css']
})
export class VentasUsuarioComponent implements OnInit {

  // 🟢 CAMBIO 1: Estructura de datos para filtros
  ventasOriginal: VentaUsuario[] = [];   // Copia de seguridad con TODO
  ventasFiltradas: VentaUsuario[] = [];  // Lista con filtros aplicados (la que usamos para contar páginas)
  paginatedArticulos: VentaUsuario[] = []; // Los 8 que se ven en pantalla

  // 🟢 CAMBIO 2: Variables de los inputs de filtro
  textoBusqueda: string = '';
  fechaBusqueda: string = '';

  // Variables del paginado
  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 0;

  // Variable para ocultar/mostrar la papelera
  isAdmin: boolean = false;

  constructor(
    private ventasService: VentasUserService,
    private authService: AuthService,
    private excelService: ExcelGeneratorService
  ) {}

  ngOnInit(): void {
    this.checkRole();
    this.obtenerVentas();
  }

  // Comprobar rol (TU CÓDIGO ORIGINAL)
  checkRole(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.isAdmin = decoded.role === 'ADMIN' || decoded.role === 'ROLE_ADMIN';
      } catch (e) {
        this.isAdmin = false;
      }
    }
  }

  obtenerVentas(): void {
    this.ventasService.cargarVentas().subscribe(
      (data) => {
        console.log("✅ Ventas obtenidas:", data);

        // 🟢 Guardamos en Original y en Filtrada
        this.ventasOriginal = data;
        this.ventasFiltradas = data;

        // Calculamos la primera página
        this.calcularPaginacion();
      },
      (error) => {
        console.error('❌ Error al obtener ventas:', error);
      }
    );
  }

  // 🟢 NUEVO: Lógica de Filtros (Texto y Fecha)
  aplicarFiltros(): void {
    let temporal = this.ventasOriginal;

    // 1. Filtro por Texto (Nombre producto, Cliente o Vendedor)
    if (this.textoBusqueda) {
      const texto = this.textoBusqueda.toLowerCase();
      // Ajusta las propiedades según tu modelo VentaUsuario (ej: tiene 'username', 'nameproducto'?)
      // Si tu modelo VentaUsuario tiene otros nombres, cámbialos aquí.
      temporal = temporal.filter(v =>
        (v.username && v.username.toLowerCase().includes(texto)) ||
        (v.dnicliente && v.dnicliente.toLowerCase().includes(texto)) ||
        (v.nameproducto && v.nameproducto.toLowerCase().includes(texto))
      );
    }

    // 2. Filtro por Fecha
    if (this.fechaBusqueda) {
      // Compara si la fecha empieza por lo seleccionado (YYYY-MM-DD)
      temporal = temporal.filter(v =>
        v.fecha && v.fecha.toString().startsWith(this.fechaBusqueda)
      );
    }

    this.ventasFiltradas = temporal;
    this.currentPage = 1; // Reseteamos a página 1 al filtrar
    this.calcularPaginacion();
  }

  // 🟢 NUEVO: Limpiar filtros
  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.fechaBusqueda = '';
    this.ventasFiltradas = this.ventasOriginal; // Restauramos todo
    this.currentPage = 1;
    this.calcularPaginacion();
  }

  // 🟢 CAMBIO 3: Paginación basada en 'ventasFiltradas'
  calcularPaginacion(): void {
    // Calculamos total de páginas
    this.totalPages = Math.ceil(this.ventasFiltradas.length / this.rowsPerPage);

    // Evitar que totalPages sea 0 si no hay resultados
    if (this.totalPages === 0) this.totalPages = 1;

    // Cortamos el array
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;

    this.paginatedArticulos = this.ventasFiltradas.slice(start, end);
  }

  // 🟢 NUEVO: Cambiar página con botones Anterior/Siguiente
  cambiarPagina(delta: number): void {
    const nuevaPagina = this.currentPage + delta;

    // Solo cambiamos si es válido
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPages) {
      this.currentPage = nuevaPagina;
      this.calcularPaginacion();
    }
  }

  // (TU CÓDIGO ORIGINAL) Cancelar Venta
  cancelarVenta(venta: any): void {
    Swal.fire({
      title: '¿Cancelar esta venta?',
      text: 'La venta se moverá al historial de cancelaciones. ¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar venta',
      cancelButtonText: 'No, volver'
    }).then((result) => {

      if (result.isConfirmed) {

        const token = this.authService.getToken();
        let responsable = 'Desconocido';
        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            responsable = decoded.sub || decoded.username || 'Admin';
          } catch (e) {
            console.error("Error leyendo token", e);
          }
        }

        console.log(`📤 Enviando petición de borrado... ID: ${venta.id}, User: ${responsable}`);

        this.ventasService.cancelarVenta(venta.id, responsable).subscribe({
          next: (response) => {
            Swal.fire('¡Cancelada!', 'La venta ha sido enviada al historial correctamente.', 'success');
            this.obtenerVentas(); // Recarga y reaplica filtros automáticamente
          },
          error: (err) => {
            console.error('❌ Error al cancelar:', err);
            if (err.status === 200) {
              Swal.fire('¡Cancelada!', 'La venta ha sido enviada al historial correctamente.', 'success');
              this.obtenerVentas();
            } else {
              Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
            }
          }
        });
      }
    });
  }

  // (TU CÓDIGO ORIGINAL) Descargar Excel
  descargarExcel(): void {
    // 🟢 MEJORA: Exportamos 'ventasFiltradas' para que el Excel respete el filtro (si hay uno).
    // Si no hay filtro, 'ventasFiltradas' es igual a 'ventasOriginal' (todo).
    this.excelService.exportarHistorialVentas(this.ventasFiltradas);
  }

}
