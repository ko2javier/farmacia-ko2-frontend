import {Component, EventEmitter, Output, Input, ViewChild} from '@angular/core';
import { ArticuloService } from '../../services/articulo.service';
import { Articulo } from '../../models/articulo';
import Swal from 'sweetalert2';
import { ToastService } from '../../services/toast.service';
import { UpdateDto } from '../../models/UpdateDTO';
import { InsertDto } from '../../models/InsertDto';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { PdfGeneratorService } from '../../services/pdf-generator.service';
import { ArticuloDetalleModalComponent } from '../articulo-detalle-modal/articulo-detalle-modal.component';
import { ValidarIaService } from '../../services/validar-ia.service';
import { SugerenciaIA } from '../../models/SugerenciaIA';
import { CimaBackendService } from '../../services/cima-backend.service';

@Component({
  selector: 'app-almacen',
  standalone: false,
  templateUrl: './almacen.component.html',
  styleUrl: './almacen.component.css'
})
export class AlmacenComponent {

  // Lista completa que llega del backend (nunca se modifica)
  articulosOriginal: any[] = [];
  // Lista que se filtra según lo que escribe el usuario en el buscador
  articulosFiltrados: any[] = [];
  // Porción de articulosFiltrados que se muestra en la tabla (8 por página)
  paginatedArticulos: any[] = [];

  // Control de paginación
  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 1;

  // Controla qué formulario se muestra: insertar, editar, o ninguno
  operation: 'insert' | 'update' | 'none' = 'none';

  // Artículo seleccionado para editar
  selectedArticulo = { id: 0, nombre: '', categoria: '', precio: 0, cantidad: 0, codigo: '' };
  // Datos del formulario de inserción
  insertDto: InsertDto = { nombre: '', categoria: '', precio: 0, cantidad: 0 };

  isAdmin: boolean = false;
  textoBusqueda: string = '';
  respuesta: Boolean = false;

  // Control del panel de sugerencias de la IA
  showSugerenciasIA = false;
  sugerenciasIA: SugerenciaIA[] = [];
  cargandoIA = false;
  sugerenciaConfirmada = false;

  // Referencia al modal de detalle del artículo
  @ViewChild('detalleModal') detalleModal!: ArticuloDetalleModalComponent;

  // Emite al componente padre para navegar a otra sección
  @Output() irSeccion = new EventEmitter<string>();

  // Recibe datos del catálogo externo (AEMPS) para rellenar el formulario
  @Input() datoExterno: any = null;
  @Output() limpiarDatoPadre = new EventEmitter<void>();

  constructor(
    private articuloService: ArticuloService,
    private toastService: ToastService,
    private authService: AuthService,
    private translate: TranslateService,
    private pdfService: PdfGeneratorService,
    private validarIaService: ValidarIaService,
    private cimaBackendService: CimaBackendService
  ) {}

  ngOnInit() {
    // Si venimos del catálogo con un medicamento preseleccionado, rellenamos el formulario
    if (this.datoExterno) {
      this.cargarDatosExternos();
      this.limpiarDatoPadre.emit();
    }

    this.cargarDatosReales();
    this.verificarRol();
  }

  // Pide todos los artículos al backend y actualiza la tabla
  cargarDatosReales(): void {
    this.articuloService.cargarArticulos().subscribe(
      (articulos: any[]) => {
        this.articulosOriginal = articulos;
        this.aplicarFiltros();
      },
      (error) => {}
    );
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

  // Filtra la lista de artículos según el texto del buscador
  // Si no hay texto, muestra todos
  aplicarFiltros(): void {
    let resultado = this.articulosOriginal;

    if (this.textoBusqueda && this.textoBusqueda.trim() !== '') {
      const texto = this.textoBusqueda.toLowerCase();

      resultado = resultado.filter(articulo => {
        const nombre    = articulo.nombre?.toLowerCase() || '';
        const categoria = articulo.categoria?.toLowerCase() || '';
        const codigo    = articulo.codigo?.toString().toLowerCase() || '';

        return nombre.includes(texto) || categoria.includes(texto) || codigo.includes(texto);
      });
    }

    this.articulosFiltrados = resultado;
    this.currentPage = 1;
    this.calcularPaginacion();
  }

  // Borra el texto del buscador y vuelve a mostrar todos los artículos
  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.aplicarFiltros();
  }

  // Calcula cuántas páginas hay en total y carga la primera
  calcularPaginacion(): void {
    this.totalPages = Math.ceil(this.articulosFiltrados.length / this.rowsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    this.mostrarPagina(this.currentPage);
  }

  // Recorta la lista filtrada para mostrar solo los artículos de la página actual
  mostrarPagina(page: number): void {
    const inicio = (page - 1) * this.rowsPerPage;
    const fin    = inicio + this.rowsPerPage;
    this.paginatedArticulos = this.articulosFiltrados.slice(inicio, fin);
  }

  // Cambia de página si el número es válido
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.mostrarPagina(page);
    }
  }

  // Muestra un diálogo de confirmación antes de eliminar un artículo
  eliminarArticulo(id: number): void {
    Swal.fire({
      title: this.translate.instant('ALMACEN.MSG.ELIMINAR_TITULO'),
      text: this.translate.instant('ALMACEN.MSG.ELIMINAR_TEXTO'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translate.instant('ALMACEN.MSG.BTN_ELIMINAR'),
      cancelButtonText: this.translate.instant('ALMACEN.MSG.BTN_CANCELAR')
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        this.articuloService.deleteArticulo(id).subscribe({
          next: () => {
            Swal.fire(
              this.translate.instant('ALMACEN.MSG.ELIMINADO_TITULO'),
              this.translate.instant('ALMACEN.MSG.ELIMINADO_TEXTO'),
              'success'
            );
            this.cargarDatosReales();
          },
          error: (err) => {
            Swal.fire(
              this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
              this.translate.instant('ALMACEN.MSG.ELIMINAR_ERROR'),
              'error'
            );
          }
        });
      }
    });
  }

  // Controla qué formulario se muestra en pantalla
  // 'insert' = formulario nuevo, 'update' = formulario de edición, 'none' = nada
  setMode(mode: 'none' | 'insert' | 'update', articulo?: Articulo) {
    switch (mode) {
      case 'update':
        this.operation = 'update';
        this.selectedArticulo = { ...articulo! }; // copia el artículo para no modificar el original
        break;
      case 'insert':
        this.operation = 'insert';
        break;
      case 'none':
      default:
        this.operation = 'none';
        this.insertDto = { nombre: '', categoria: '', precio: 0, cantidad: 0 };
        this.sugerenciaConfirmada = false;
        break;
    }
  }

  // Envía los cambios de un artículo existente al backend
  updateArticulo() {
    if (!this.selectedArticulo) return;

    if (this.selectedArticulo.precio <= 0 || this.selectedArticulo.cantidad < 0) {
      this.toastService.showToast(
        this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
        this.translate.instant('ALMACEN.MSG.VALIDACION_NUMEROS'),
        true, 'Error'
      );
      return;
    }

    const cambios: UpdateDto = {
      cantidadVendida: 0,
      codigo:   this.selectedArticulo.codigo,
      cantidad: this.selectedArticulo.cantidad,
      precio:   this.selectedArticulo.precio
    };

    this.articuloService.updateItem(cambios).subscribe({
      next: () => {
        this.toastService.showToast(
          this.translate.instant('ALMACEN.MSG.EXITO_TITULO'),
          this.translate.instant('ALMACEN.MSG.ACTUALIZADO_EXITO'),
          false, 'Success'
        );
        this.cargarDatosReales();
        this.selectedArticulo = { id: 0, nombre: '', categoria: '', precio: 0, cantidad: 0, codigo: '' };
        this.operation = 'none';
      },
      error: () => {
        this.toastService.showToast(
          this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
          this.translate.instant('ALMACEN.MSG.ACTUALIZAR_ERROR'),
          true, 'Error'
        );
      }
    });
  }

  // Valida que los datos del formulario de inserción sean correctos antes de continuar
  validarArticulo(): Boolean {
    this.respuesta = true;

    if (this.insertDto.precio <= 0 || this.insertDto.cantidad < 0) {
      this.toastService.showToast(
        this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
        this.translate.instant('ALMACEN.MSG.VALIDACION_NUMEROS'),
        true, 'Error'
      );
      this.respuesta = false;
    } else if (this.insertDto.nombre.length < 3 || this.insertDto.categoria.length < 3) {
      this.toastService.showToast(
        this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
        this.translate.instant('ALMACEN.MSG.VALIDACION_CARACTERES'),
        true, 'Error'
      );
      this.respuesta = false;
    }

    return this.respuesta;
  }

  // Paso 1 al insertar: valida el formulario y consulta la IA para sugerir medicamentos similares
  // Si el usuario ya confirmó una sugerencia, salta directo a la inserción en BD
  insertArticulo() {
    if (!this.validarArticulo()) return;

    if (this.sugerenciaConfirmada) {
      this.sugerenciaConfirmada = false;
      this.insertarEnBD();
      return;
    }

    this.cargandoIA = true;

    this.validarIaService.validar(this.insertDto.nombre).subscribe({
      next: (respuesta) => {
        this.cargandoIA = false;
        if (!respuesta.sugerencias || respuesta.sugerencias.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: this.translate.instant('VALIDAR_IA.GENERICO_TITLE'),
            text: this.translate.instant('VALIDAR_IA.GENERICO_TEXT')
          });
          return;
        }
        this.sugerenciasIA = respuesta.sugerencias;
        this.showSugerenciasIA = true;
      },
      error: (err) => {
        this.cargandoIA = false;
        if (err.status === 409) {
          Swal.fire({ icon: 'error', title: 'Producto ya existe', text: 'Este medicamento ya está registrado en el inventario.' });
        } else if (err.status === 404) {
          Swal.fire({ icon: 'warning', title: 'No encontrado en AEMPS', text: 'Este medicamento no existe en el catálogo oficial. No se puede insertar.' });
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo validar el medicamento. Inténtalo de nuevo.' });
        }
      }
    });
  }

  // El usuario seleccionó una sugerencia de la IA — rellenamos el formulario con esos datos
  onSeleccionarSugerencia(sugerencia: SugerenciaIA) {
    this.insertDto.nombre    = sugerencia.nombre;
    this.insertDto.aempsCode = sugerencia.id;
    this.showSugerenciasIA   = false;
    this.sugerenciaConfirmada = true;

    // Consultamos el detalle en CIMA para obtener el laboratorio
    this.cimaBackendService.getByNregistro(sugerencia.id).subscribe({
      next: (detalle: any) => {
        this.insertDto.categoria = detalle.laboratorio || 'AEMPS';
      },
      error: () => {
        this.insertDto.categoria = 'AEMPS';
      }
    });
  }

  // Limpia el nombre del medicamento antes de guardarlo:
  // quita palabras genéricas (comprimidos, mg, etc.), espacios extra y recorta a 18 caracteres
  procesarNombre(nombreSucio: string): string {
    if (!nombreSucio) return '';

    let nombre = nombreSucio;

    // Palabras que no aportan información útil al nombre del medicamento
    const palabrasAEliminar = [
      'comprimidos', 'capsulas', 'recubiertos', 'pelicula', 'efg',
      'duras', 'inyectable', 'solucion', 'polvo', 'suspension', 'oral', 'sobre', 'mg', 'g'
    ];

    palabrasAEliminar.forEach(palabra => {
      const regex = new RegExp('\\b' + palabra + '\\b', 'gi');
      nombre = nombre.replace(regex, '');
    });

    // Quitamos espacios dobles y espacios al inicio/final
    nombre = nombre.replace(/\s+/g, ' ').trim();

    // Primera letra en mayúscula, el resto en minúscula
    nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();

    // Si el nombre es muy largo, cortamos en la última palabra completa antes del límite
    const limite = 18;
    if (nombre.length > limite) {
      let corte = nombre.substring(0, limite);
      const ultimoEspacio = corte.lastIndexOf(' ');
      if (ultimoEspacio > 0) corte = corte.substring(0, ultimoEspacio);
      nombre = corte;
    }

    return nombre;
  }

  // Paso 2 al insertar: limpia el nombre, comprueba que no exista ya y lo guarda en la BD
  insertarEnBD() {
    const nombreProcesado = this.procesarNombre(this.insertDto.nombre);

    if (nombreProcesado.length < 2) {
      this.toastService.showToast(
        this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
        'El nombre es demasiado corto tras limpiarlo.',
        true, 'Error'
      );
      return;
    }

    // Comprobamos que no exista ya un artículo con ese nombre exacto
    const yaExiste = this.articulosOriginal.some(articulo =>
      articulo.nombre.toLowerCase() === nombreProcesado.toLowerCase()
    );

    if (yaExiste) {
      const mensajeError = this.translate.instant('ALMACEN.MSG.ERROR_DUPLICADO', { nombre: nombreProcesado });
      this.toastService.showToast(this.translate.instant('ALMACEN.MSG.ERROR_TITULO'), mensajeError, true, 'Error');
      return;
    }

    this.insertDto.nombre = nombreProcesado;

    this.articuloService.insert_item(this.insertDto).subscribe({
      next: () => {
        this.toastService.showToast(
          this.translate.instant('ALMACEN.MSG.EXITO_TITULO'),
          this.translate.instant('ALMACEN.MSG.CREADO_EXITO'),
          false, 'Success'
        );
        this.cargarDatosReales();
        this.insertDto = { nombre: '', categoria: '', precio: 0, cantidad: 0 };
        this.setMode('none');
      },
      error: () => {
        this.toastService.showToast(
          this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
          this.translate.instant('ALMACEN.MSG.CREAR_ERROR'),
          true, 'Error'
        );
      }
    });
  }

  // Navega al catálogo externo (AEMPS) para buscar medicamentos
  irAlCatalogo() {
    this.irSeccion.emit('catalogo-externo');
  }

  // Exporta la lista completa de artículos a un PDF
  exportarPdf(): void {
    this.pdfService.generateInventoryPdf(this.articulosOriginal);
  }

  // Abre el modal de detalle de un artículo
  abrirDetalle(articulo: Articulo): void {
    this.detalleModal.abrir(articulo);
  }

  // Cuando el modal de detalle guarda cambios, actualizamos el artículo en la lista local
  onArticuloActualizado(actualizado: Articulo): void {
    const indice = this.articulosOriginal.findIndex(articulo => articulo.id === actualizado.id);
    if (indice !== -1) this.articulosOriginal[indice] = actualizado;
    this.aplicarFiltros();
  }

  // Rellena el formulario de inserción con los datos que vienen del catálogo AEMPS
  cargarDatosExternos() {
    this.operation = 'insert';
    this.insertDto = {
      nombre:    this.datoExterno.nombreCorto  || '',
      categoria: this.datoExterno.laboratorio  || '',
      precio:    0,
      cantidad:  0,
      aempsCode: this.datoExterno.registro     || null
    };
  }
}
