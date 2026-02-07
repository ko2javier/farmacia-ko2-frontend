import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PanelVentasService } from '../../services/panel-ventas.service';
import { CarritoService } from '../../services/carrito.service';
import { CarritoItem } from '../../models/CarritoItem';

@Component({
  selector: 'app-resultados-busqueda',
  standalone: false,
  templateUrl: './resultados-busqueda.component.html',
  styleUrl: './resultados-busqueda.component.css'
})
export class ResultadosBusquedaComponent implements OnInit {
  @Output() volverAlPanel = new EventEmitter<void>(); // ✅ Evento para volver
  @Output() navegarAlCarrito = new EventEmitter<string>(); // 🔹 Ahora acepta strings

  carrito: CarritoItem[] = []; // 🔹 Para reflejar la cantidad en la UI

  constructor(
    public panelVentasService: PanelVentasService,
    public carritoService: CarritoService
  ) {}

  ngOnInit() {
    // ✅ Inicializa el carrito con los productos obtenidos de la búsqueda
    this.carritoService.inicializarCarrito(this.panelVentasService.resultadosBusqueda);

    // 🔹 Se suscribe a los cambios en el carrito para reflejarlo en la UI
    this.carritoService.obtenerCarrito().subscribe(carrito => {
      this.carrito = carrito;
    });
  }

  /**
   * 📌 Obtiene la cantidad de un producto específico en el carrito
   */
  obtenerCantidad(productoId: number): number {
    const item = this.carrito.find(p => p.articulo.id === productoId);
    return item ? item.cantidadCompra : 0;
  }

  /**
   * 📌 Verifica si el producto ya ha sido añadido al carrito para cambiar el botón
   */
  estaEnCarrito(productoId: number): boolean {
    return this.carritoService.estaEnCarrito(productoId);
  }

  /**
   * 📌 Añade un producto al carrito
   */
  agregarAlCarrito(productoId: number) {
    this.carritoService.agregarAlCarrito(productoId);
  }

  /**
   * 📌 Reduce la cantidad de un producto en el carrito
   */
  reducirCantidad(productoId: number) {
    this.carritoService.reducirCantidad(productoId);
  }

  /**
   * 📌 Vuelve al panel de ventas y limpia la búsqueda
   */
  volver() {
    this.panelVentasService.limpiarBusqueda();
    this.volverAlPanel.emit(); // ✅ Emitimos evento para que PanelComponent oculte la tabla
  }
  irAlCarrito() {
    console.log("🔹 Emitiendo evento para ir al carrito...");
    this.navegarAlCarrito.emit('carrito');
  }
  
}
