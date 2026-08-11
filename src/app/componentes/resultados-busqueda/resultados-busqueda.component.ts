import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PanelVentasService } from '../../services/panel-ventas.service';
import { CarritoService } from '../../services/carrito.service';
import { CarritoItem } from '../../models/CarritoItem';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-resultados-busqueda',
  standalone: false,
  templateUrl: './resultados-busqueda.component.html',
  styleUrl: './resultados-busqueda.component.css'
})
export class ResultadosBusquedaComponent implements OnInit {

  // Eventos para comunicarse con el componente padre
  @Output() volverAlPanel    = new EventEmitter<void>();
  @Output() navegarAlCarrito = new EventEmitter<string>();

  // Copia local del carrito para poder mostrar las cantidades en la tabla
  carrito: CarritoItem[] = [];

  // Paginación
  paginaActual: number = 1;
  productosPorPagina: number = 8;

  constructor(
    public panelVentasService: PanelVentasService,
    public carritoService: CarritoService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    // Carga los resultados de la búsqueda en el carrito como punto de partida
    this.carritoService.inicializarCarrito(this.panelVentasService.resultadosBusqueda);

    // Se suscribe al carrito para reflejar los cambios de cantidad en tiempo real
    this.carritoService.obtenerCarrito().subscribe(carritoActualizado => {
      this.carrito = carritoActualizado;
    });
  }

  // Devuelve cuántas unidades de un producto hay en el carrito
  obtenerCantidad(productoId: number): number {
    const elemento = this.carrito.find(item => item.articulo.id === productoId);
    return elemento ? elemento.cantidadCompra : 0;
  }

  // Comprueba si un producto ya fue añadido al carrito (para cambiar el botón)
  estaEnCarrito(productoId: number): boolean {
    return this.carritoService.estaEnCarrito(productoId);
  }

  // Añade una unidad de un producto al carrito
  agregarAlCarrito(productoId: number) {
    this.carritoService.agregarAlCarrito(productoId);
  }

  // Quita una unidad de un producto del carrito
  reducirCantidad(productoId: number) {
    this.carritoService.reducirCantidad(productoId);
  }

  // Limpia la búsqueda y vuelve al panel de ventas
  volver() {
    this.panelVentasService.limpiarBusqueda();
    this.volverAlPanel.emit();
  }

  // Navega a la sección del carrito
  irAlCarrito() {
    this.navegarAlCarrito.emit('carrito');
  }

  // Getter: devuelve solo los productos de la página actual
  get productosPaginados() {
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin    = inicio + this.productosPorPagina;
    return this.panelVentasService.resultadosBusqueda.slice(inicio, fin);
  }

  // Getter: calcula el total de páginas según los resultados
  get totalPaginas() {
    return Math.ceil(this.panelVentasService.resultadosBusqueda.length / this.productosPorPagina) || 1;
  }

  // Avanza a la página siguiente
  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  // Retrocede a la página anterior
  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }
}
