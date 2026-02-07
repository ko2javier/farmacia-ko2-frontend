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
  styleUrls: ['./ventas-usuario.component.css'] // Corregido styleUrl -> styleUrls
})
export class VentasUsuarioComponent implements OnInit {

  ventas: VentaUsuario[] = [];
  
  // Variables del paginado
  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedArticulos: VentaUsuario[] = [];

  // Variable para ocultar/mostrar la papelera
  isAdmin: boolean = false;

  constructor(
    private ventasService: VentasUserService,
    private authService: AuthService,private excelService: ExcelGeneratorService
  ) {}

  ngOnInit(): void {
    this.checkRole();
    this.obtenerVentas();
  }

  // Comprobar rol
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
        this.totalPages = Math.ceil(data.length / this.rowsPerPage);
        this.ventas = data;
        this.displayTable(1);
      },
      (error) => {
        console.error('❌ Error al obtener ventas:', error);
      }
    );
  }

  // Paginación
  displayTable(page: number): void {
    if (!this.ventas.length) return;
    const start = (page - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedArticulos = this.ventas.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.displayTable(page);
    }
  }

 cancelarVenta(venta: any): void {
    // 1. Lanzamos el SweetAlert de confirmación
    Swal.fire({
      title: '¿Cancelar esta venta?',
      text: 'La venta se moverá al historial de cancelaciones. ¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',   // Rojo para indicar "Cuidado"
      cancelButtonColor: '#3085d6', // Azul para cancelar
      confirmButtonText: 'Sí, cancelar venta',
      cancelButtonText: 'No, volver'
    }).then((result) => {
      
      // 2. Si el usuario pulsa "Sí, cancelar venta"
      if (result.isConfirmed) {
        
        // --- LÓGICA DE USUARIO (TOKEN) ---
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

        // --- LLAMADA AL SERVICIO ---
        this.ventasService.cancelarVenta(venta.id, responsable).subscribe({
          next: (response) => {
            // ÉXITO REAL
            Swal.fire(
              '¡Cancelada!',
              'La venta ha sido enviada al historial correctamente.',
              'success'
            );
            this.obtenerVentas(); // Recargamos la tabla
          },
          error: (err) => {
            console.error('❌ Error al cancelar:', err);
            
            // MANEJO DEL FALSO ERROR (Status 200 pero entra en error por texto plano)
            if (err.status === 200) {
              Swal.fire(
                '¡Cancelada!',
                'La venta ha sido enviada al historial correctamente.',
                'success'
              );
              this.obtenerVentas();
            } else {
              // ERROR REAL
              Swal.fire(
                'Error',
                'Hubo un problema al conectar con el servidor.',
                'error'
              );
            }
          }
        });
      }
    });
  }

  // 3. Función del botón descargar excels!!
  descargarExcel(): void {
    // OJO: Pasamos 'this.ventas' (TODAS) y no 'paginatedArticulos' (solo la página actual)
    // Queremos exportar todo el historial, no solo lo que se ve en pantalla.
    this.excelService.exportarHistorialVentas(this.ventas);
  }

} // <--- ESTA LLAVE FINAL ES LA IMPORTANTE