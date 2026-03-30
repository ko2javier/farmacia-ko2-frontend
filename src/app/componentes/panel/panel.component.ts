import { Component, OnInit } from '@angular/core';
import { ArticuloService } from '../../services/articulo.service';
import { PanelVentasService } from '../../services/panel-ventas.service';
import { Articulo } from '../../models/articulo';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-panel',
  standalone: false,
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent implements OnInit {

  // 🟢 1. Guardamos TODOS los productos aquí para no pedirlos siempre
  articulosOriginal: Articulo[] = [];

  // Variables del formulario
  searchNombre: string = '';
  searchCategoria: string = '';

  // Estado
  flag_search: boolean = false;
  mostrarResultados: boolean = false;

  constructor(
    private articuloService: ArticuloService,
    public panelVentasService: PanelVentasService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cambiarIdioma(idioma: string) {
    this.translate.use(idioma);
  }

  // 🟢 2. Carga inicial: Traemos TODO de la base de datos una sola vez
  cargarProductos() {
    this.articuloService.cargarArticulos().subscribe(
      (data) => {
        this.articulosOriginal = data;

        // Inicializamos el servicio vacío o con todo, según prefieras
        this.panelVentasService.setProductos(data);
      },
      (error) => { /* TODO: añadir manejo de error UI */ }
    );
  }

  // 🟢 3. EL BUSCADOR EFICIENTE (Filtrado Local)
  buscarProductos() {
    this.flag_search = true;
    this.mostrarResultados = true;

    // Empezamos con la lista completa
    let resultados = this.articulosOriginal;

    // a) Filtro por Nombre (si hay algo escrito)
    if (this.searchNombre && this.searchNombre.trim() !== '') {
      const texto = this.searchNombre.toLowerCase();
      resultados = resultados.filter(p =>
        p.nombre.toLowerCase().includes(texto)
      );
    }

    // b) Filtro por Categoría (si hay algo escrito)
    if (this.searchCategoria && this.searchCategoria.trim() !== '') {
      const cat = this.searchCategoria.toLowerCase();
      resultados = resultados.filter(p =>
        p.categoria.toLowerCase().includes(cat)
      );
    }

    // 🟢 4. Pasamos el resultado limpio al servicio para que lo pinte la tabla
    this.panelVentasService.resultadosBusqueda = resultados;
  }

  // 🟢 5. Limpiar todo
  clear() {
    this.searchNombre = '';
    this.searchCategoria = '';
    this.flag_search = false;
    this.mostrarResultados = false;

    // Reseteamos el servicio
    this.panelVentasService.limpiarBusqueda();
  }

  // Lógica para autocompletar la categoría si escribes el nombre exacto
  seleccionarProducto() {
    // Buscamos en nuestra lista local (más rápido)
    const productoEncontrado = this.articulosOriginal.find(
      prod => prod.nombre.toLowerCase() === this.searchNombre.toLowerCase()
    );

    if (productoEncontrado) {
      this.searchCategoria = productoEncontrado.categoria;
    }
  }

  // 🟢 6. Getters optimizados para los <datalist>
  // Usamos un 'Set' para sacar valores únicos de la lista en memoria al instante
  get productosUnicos(): string[] {
    // Si hay texto escrito, filtramos las sugerencias
    if (this.searchNombre) {
      const texto = this.searchNombre.toLowerCase();
      return [...new Set(this.articulosOriginal
        .filter(a => a.nombre.toLowerCase().includes(texto))
        .map(a => a.nombre))];
    }
    // Si no, devolvemos todos (o limitamos a los primeros 20 para no saturar)
    return [...new Set(this.articulosOriginal.map(a => a.nombre))].slice(0, 50);
  }

  get categoriasUnicas(): string[] {
    return [...new Set(this.articulosOriginal.map(a => a.categoria))];
  }
}
