import {Component, EventEmitter, Output, Input} from '@angular/core';
import { ArticuloService } from '../../services/articulo.service';
import { Articulo } from '../../models/articulo';
import Swal from 'sweetalert2';
import { ToastService } from '../../services/toast.service';
import { UpdateDto } from '../../models/UpdateDTO';
import { InsertDto } from '../../models/InsertDto';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-almacen',
  standalone: false,
  templateUrl: './almacen.component.html',
  styleUrl: './almacen.component.css'
})
export class AlmacenComponent {
  articulos: Articulo[] = [];
  respuesta: Boolean = false;

  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 1;
  //paginatedArticulos: Articulo[] = [];
  operation: 'insert' | 'update' | 'none' = 'none';
  // --- VARIABLES DE DATOS ---
  articulosOriginal: any[] = [];   // Copia de seguridad de la Base de Datos
  articulosFiltrados: any[] = [];  // Lista donde aplicamos el buscador
  paginatedArticulos: any[] = [];  // Lista recortada (8 items) que se ve en la tabla

  selectedArticulo = { id: 0, nombre: '', categoria: '', precio: 0, cantidad: 0, codigo: '' };
  insertDto: InsertDto = { nombre: '', categoria: '', precio: 0, cantidad: 0 };

  isAdmin: boolean = false;
  textoBusqueda: string = '';

  // 2. Crear el "Emisor" para hablar con el Home
  @Output() irSeccion = new EventEmitter<string>();

  // Variable para recibir el "papelito" con datos del Catálogo
  @Input() datoExterno: any = null;
  @Output() limpiarDatoPadre = new EventEmitter<void>();

  constructor(
    private articuloService: ArticuloService,
    private toastService: ToastService,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    // Si traemos un medicamento importado, preparamos el formulario
    if (this.datoExterno) {
      this.cargarDatosExternos(); // <--- Función nueva que crearemos abajo
      // 2. Avisamos al padre que ya lo cargamos
       this.limpiarDatoPadre.emit();
    }

    // Lo que ya tenías (sigue funcionando igual)
    this.cargarDatosReales();
    this.checkRole();
  }

  cambiarIdioma(idioma: string) {
    this.translate.use(idioma);
  }

  cargarDatosReales(): void {
    this.articuloService.cargarArticulos().subscribe(
      (data: any[]) => { // Aseguramos que data es un array
        console.log("✅ Datos cargados:", data);

        // 1. Guardamos la copia original y la filtrada (al inicio son iguales)
        this.articulosOriginal = data;

        // 2. Si hay texto en el buscador, reaplicamos el filtro, si no, mostramos todo
        this.aplicarFiltros();
      },
      (error) => {
        console.error("❌ Error al cargar artículos:", error);
      }
    );
  }

  cargarArticulos() {
    this.articuloService.cargarArticulos().subscribe(
      (data) => {
        this.articulos = data;
        this.totalPages = Math.ceil(this.articulos.length / this.rowsPerPage);
        if (this.totalPages === 0) this.totalPages = 1;
        this.displayTable(1);
      },
      (error) => {
        console.error('Error al obtener artículos', error);
      }
    );
  }

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

  // --- LÓGICA DEL BUSCADOR ---
  aplicarFiltros(): void {
    let temporal = this.articulosOriginal;

    // Si hay texto escrito, filtramos
    if (this.textoBusqueda && this.textoBusqueda.trim() !== '') {
      const texto = this.textoBusqueda.toLowerCase();

      temporal = temporal.filter(item => {
        // Usamos ?. para evitar errores si algún campo viene vacío (null)
        const nombre = item.nombre?.toLowerCase() || '';
        const categoria = item.categoria?.toLowerCase() || '';
        const codigo = item.codigo?.toString().toLowerCase() || '';

        return nombre.includes(texto) || categoria.includes(texto) || codigo.includes(texto);
      });
    }

    // Actualizamos la lista filtrada
    this.articulosFiltrados = temporal;

    // Volvemos a la página 1 y recalculamos la tabla visual
    this.currentPage = 1;
    this.calcularPaginacion();
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.aplicarFiltros(); // Esto restaurará la lista original
  }

  // --- LÓGICA DE PAGINACIÓN ---
  calcularPaginacion(): void {
    this.totalPages = Math.ceil(this.articulosFiltrados.length / this.rowsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;

    this.displayTable(this.currentPage);
  }

  displayTable(page: number): void {
    const start = (page - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;

    // Cortamos de la lista FILTRADA, no de la original
    this.paginatedArticulos = this.articulosFiltrados.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.displayTable(page);
    }
  }


  // Metodo para eliminar articulo (TRADUCIDO)
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.articuloService.deleteArticulo(id).subscribe({
          next: () => {
            Swal.fire(
              this.translate.instant('ALMACEN.MSG.ELIMINADO_TITULO'),
              this.translate.instant('ALMACEN.MSG.ELIMINADO_TEXTO'),
              'success'
            );
            //this.cargarArticulos();
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

  setMode(mode: 'none' | 'insert' | 'update', articulo?: Articulo){
    switch(mode){
      case 'update':
        this.operation = 'update';
        this.selectedArticulo = { ...articulo! };
        break;
      case 'insert':
        this.operation = 'insert';
        break;
      case 'none':
        this.operation = 'none';
        this.insertDto = { nombre: '',  categoria: '', precio: 0,  cantidad: 0 };
        break;
      default:
        this.operation = 'none';
        this.insertDto = { nombre: '',  categoria: '', precio: 0,  cantidad: 0 };
        break;
    }
  }

  // UPDATE (TRADUCIDO)
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

    const updates: UpdateDto = {
      cantidadVendida:0,
      codigo: this.selectedArticulo.codigo,
      cantidad: this.selectedArticulo.cantidad,
      precio: this.selectedArticulo.precio
    };

    this.articuloService.updateItem(updates).subscribe({
      next: (articuloActualizado) => {
        console.log('Artículo actualizado con éxito:', articuloActualizado);
        this.toastService.showToast(
          this.translate.instant('ALMACEN.MSG.EXITO_TITULO'),
          this.translate.instant('ALMACEN.MSG.ACTUALIZADO_EXITO'),
          false, 'Success'
        );

        //this.cargarArticulos();
        this.cargarDatosReales();
        this.selectedArticulo = { id: 0, nombre: '', categoria: '', precio: 0, cantidad: 0, codigo: '' };
        this.operation = 'none';
      },
      error: (err) => {
        console.error('Error al actualizar artículo:', err);
        this.toastService.showToast(
          this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
          this.translate.instant('ALMACEN.MSG.ACTUALIZAR_ERROR'),
          true, 'Error'
        );
      }
    });
  }

  // Validaciones (TRADUCIDO)
  chequear_art():Boolean{
    this.respuesta = true;

    if (this.insertDto.precio <= 0 || this.insertDto.cantidad < 0) {
      this.toastService.showToast(
        this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
        this.translate.instant('ALMACEN.MSG.VALIDACION_NUMEROS'),
        true, 'Error'
      );
      this.respuesta=false;

    } else if( this.insertDto.nombre.length<3 || this.insertDto.categoria.length<3){
      this.toastService.showToast(
        this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
        this.translate.instant('ALMACEN.MSG.VALIDACION_CARACTERES'),
        true, 'Error'
      );
      this.respuesta=false;
    }

    return this.respuesta;
  }

  // INSERTAR (TRADUCIDO)
  // --- FUNCIÓN AUXILIAR: LIMPIEZA Y RECORTE (15 CARACTERES) ---
  procesarNombre(nombreSucio: string): string {
    if (!nombreSucio) return '';

    let nombre = nombreSucio;

    // 1. Limpieza de palabras basura (Igual que antes)
    const palabrasProhibidas = [
      'comprimidos', 'capsulas', 'recubiertos', 'pelicula', 'efg',
      'duras', 'inyectable', 'solucion', 'polvo', 'suspension', 'oral', 'sobre',
      'mg', 'g' // Añadí mg y g para limpiar más
    ];

    palabrasProhibidas.forEach(palabra => {
      const regex = new RegExp('\\b' + palabra + '\\b', 'gi');
      nombre = nombre.replace(regex, '');
    });

    // 2. Limpieza de espacios
    nombre = nombre.replace(/\s+/g, ' ').trim();

    // 3. CAPITALIZAR (Primera mayúscula)
    nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();

    // --- AQUÍ ESTÁ LA MAGIA DEL CORTE INTELIGENTE ---
    const limite = 18; // Damos un poco más de aire (15 a veces es muy poco)

    if (nombre.length > limite) {
      // Cortamos a lo bruto en el límite
      let corte = nombre.substring(0, limite);

      // Buscamos dónde está el último espacio en ese corte
      const ultimoEspacio = corte.lastIndexOf(' ');

      // Si hay un espacio, cortamos ahí para no dejar "Roxitromicina s"
      // Si NO hay espacio (es una palabra gigante), ni modo, cortamos en el límite.
      if (ultimoEspacio > 0) {
        corte = corte.substring(0, ultimoEspacio);
      }

      nombre = corte;
    }

    return nombre;
  }

  // --- INSERTAR ARTÍCULO BLINDADO ---
  insertArticulo() {
    // 1. Validaciones básicas (precio, cantidad, largos mínimos)
    if (!this.chequear_art()) {
      return;
    }

    // 2. PROCESADO DEL NOMBRE (Limpieza y Corte a 15 chars)
    // Esto modifica el insertDto antes de enviarlo
    const nombreProcesado = this.procesarNombre(this.insertDto.nombre);

    // Si después de limpiar se queda vacío (ej: solo puso "comprimidos"), paramos
    if (nombreProcesado.length < 2) {
      this.toastService.showToast(
        this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
        'El nombre es demasiado corto tras limpiarlo.',
        true, 'Error'
      );
      return;
    }

    // 3. VERIFICACIÓN DE DUPLICADOS
    // Buscamos en la lista original si ya existe ese nombre exacto
    const existe = this.articulosOriginal.some(item =>
      item.nombre.toLowerCase() === nombreProcesado.toLowerCase()
    );

    if (existe) {
      // Obtenemos el mensaje traducido e inyectamos el nombre procesado
      const mensajeError = this.translate.instant(
        'ALMACEN.MSG.ERROR_DUPLICADO',
        { nombre: nombreProcesado } // <--- Aquí pasamos la variable al JSON
      );

      this.toastService.showToast(
        this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
        mensajeError, // <--- Usamos el mensaje traducido
        true, 'Error'
      );
      return;
    }

    // 4. Asignamos el nombre limpio al DTO final
    this.insertDto.nombre = nombreProcesado;

    // 5. Llamada a la API (Solo si pasó todo lo anterior)
    this.articuloService.insert_item(this.insertDto).subscribe({
      next: (articuloCreado) => {
        console.log('Artículo creado:', articuloCreado);
        this.toastService.showToast(
          this.translate.instant('ALMACEN.MSG.EXITO_TITULO'),
          this.translate.instant('ALMACEN.MSG.CREADO_EXITO'),
          false, 'Success'
        );

        this.cargarDatosReales();

        // Limpieza total del formulario y modo
        this.insertDto = { nombre: '', categoria: '', precio: 0, cantidad: 0 };
        this.setMode('none');
      },
      error: (err) => {
        console.error('Error al crear artículo:', err);
        this.toastService.showToast(
          this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
          this.translate.instant('ALMACEN.MSG.CREAR_ERROR'),
          true, 'Error'
        );
      }
    });
  }


  // 3. Funcion del ir al catalogo!!
  irAlCatalogo() {
    // Le dice al padre: "Por favor, carga el componente 'catalogo-externo'"
    this.irSeccion.emit('catalogo-externo');
  }

  // Función para rellenar el formulario con datos de la AEMPS
  cargarDatosExternos() {
    console.log("📥 Importando dato externo:", this.datoExterno);

    // 1. Cambiamos el modo a 'insert' para que se vea el formulario
    this.operation = 'insert';

    // 2. Rellenamos tu objeto insertDto con los datos que vienen de fuera
    this.insertDto = {
      nombre: this.datoExterno.nombreCorto || '',   // El nombre limpio
      categoria: this.datoExterno.laboratorio || '', // El laboratorio como categoría
      precio: 0,    // El precio lo pone el usuario
      cantidad: 0   // La cantidad la pone el usuario
    };

    // Opcional: Si tuvieras campo 'codigo' en el insertDto, lo pondrías aquí también
    // this.insertDto.codigo = this.datoExterno.registro;
  }
}
