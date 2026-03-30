import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { TokenPayload } from '../../models/TokenPayload';
import { jwtDecode } from 'jwt-decode';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  /* Defino las variables de los NgIf para mostrar un componente
  insertado o no
  */

  currentSection: string = 'almacen'; // Al iniciar, muestra 'almacen'
  userRole: string = '';
  username: string = '';
  menuAbierto: boolean = false;
  productoImportadoTemp: any = null;
  isDarkMode: boolean = false;

  // 1. DICCIONARIO DE TRADUCCIÓN
  // Relaciona: "Valor de tu variable" : "Clave del JSON"
  sectionKeys: { [key: string]: string } = {
    'almacen': 'SIDEBAR.ALMACEN',
    'Historial Ventas': 'SIDEBAR.HISTORIAL',
    'panel ventas': 'SIDEBAR.PANEL',
    'carrito': 'SIDEBAR.CARRITO',
    'estadisticas': 'SIDEBAR.ESTADISTICAS',
    'Gestión Usuarios': 'SIDEBAR.USUARIOS',
    'ventas-canceladas': 'SIDEBAR.CANCELADAS',
    'resultados': 'SIDEBAR.RESULTADOS',
    'catalogo-externo':'SIDEBAR.CATALOGO',
  };


  constructor(private router: Router, private cdr: ChangeDetectorRef,
     public carritoService: CarritoService, private authService:AuthService,
              private translate: TranslateService) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      const decoded = jwtDecode<TokenPayload>(token);
      this.userRole = decoded.role;
      this.username = decoded.sub || '';
    }

    // Restaurar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
//  2. FUNCIÓN PARA OBTENER LA CLAVE
  getSectionTranslationKey(): string {
    // Devuelve la clave correspondiente o una por defecto si falla
    return this.sectionKeys[this.currentSection] || 'SIDEBAR.PANEL';
  }
  cambiarIdioma(idioma: string) {
    this.translate.use(idioma);
  }
  logout(): void {
    // Aquí puedes eliminar el token de autenticación
    localStorage.removeItem('jwtToken'); // O donde sea que guardes el token
    // Redirige al usuario a la página de login
    this.router.navigate(['/login']);
  }

  cambiarSeccion(seccion: string) {
    this.currentSection = seccion;
    this.cdr.detectChanges();  // 🔄 Forzar actualización de la UI
  }

  debugEvent(event: any) {
    this.cambiarSeccion(event);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }
// Funcion para conectar los emitters del catalogo externo!!
  recibirProductoImportado(producto: any) {
    // Guardamos el dato en la variable temporal
    this.productoImportadoTemp = producto;

    // Cambiamos la vista: Esto destruye el catálogo y crea el Almacén de nuevo
    this.cambiarSeccion('almacen');
  }

}

function jwt_decode(token: string) {
  throw new Error('Function not implemented.');
}



