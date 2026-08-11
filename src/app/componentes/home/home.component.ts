import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { TokenPayload } from '../../models/TokenPayload';
import { jwtDecode } from 'jwt-decode';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  // Sección activa que se muestra en el área principal
  currentSection: string = 'almacen';

  // Datos del usuario logado leídos del token JWT
  userRole: string = '';
  username: string = '';

  // Estado del menú lateral en móvil
  menuAbierto: boolean = false;

  // Producto que viene del catálogo externo para pre-rellenar el formulario del almacén
  productoImportadoTemp: any = null;

  // Control del modo oscuro y del panel de ayuda
  isDarkMode: boolean = false;
  showHelp: boolean = false;

  // Relaciona cada sección con su clave de ayuda contextual
  private helpSectionMap: { [key: string]: string } = {
    'almacen':          'warehouse',
    'Historial Ventas': 'sales_history',
    'panel ventas':     'sales_panel',
    'carrito':          'cart'
  };

  // Devuelve la clave de ayuda de la sección actual (null si no tiene ayuda)
  get currentHelpSection(): string | null {
    return this.helpSectionMap[this.currentSection] || null;
  }

  // Relaciona cada valor de sección con su clave de traducción para el encabezado
  sectionKeys: { [key: string]: string } = {
    'almacen':           'SIDEBAR.ALMACEN',
    'Historial Ventas':  'SIDEBAR.HISTORIAL',
    'panel ventas':      'SIDEBAR.PANEL',
    'carrito':           'SIDEBAR.CARRITO',
    'estadisticas':      'SIDEBAR.ESTADISTICAS',
    'Gestión Usuarios':  'SIDEBAR.USUARIOS',
    'ventas-canceladas': 'SIDEBAR.CANCELADAS',
    'resultados':        'SIDEBAR.RESULTADOS',
    'catalogo-externo':  'SIDEBAR.CATALOGO',
    'activity-log':      'SIDEBAR.ACTIVITY_LOG',
  };

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public carritoService: CarritoService,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Leemos el token para obtener el rol y nombre del usuario logado
    const token = this.authService.getToken();
    if (token) {
      const decoded = jwtDecode<TokenPayload>(token);
      this.userRole = decoded.role;
      this.username = decoded.sub || '';
    }

    // Restauramos el tema que el usuario tenía guardado
    const temaGuardado = localStorage.getItem('theme');
    if (temaGuardado === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark');
    }
  }

  // Alterna entre modo claro y oscuro y lo guarda en localStorage
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

  // Devuelve la clave de traducción del nombre de la sección actual
  getSectionTranslationKey(): string {
    return this.sectionKeys[this.currentSection] || 'SIDEBAR.PANEL';
  }

  // Cierra la sesión borrando el token y redirigiendo al login
  logout(): void {
    localStorage.removeItem('jwtToken');
    this.router.navigate(['/login']);
  }

  // Cambia la sección visible y cierra el panel de ayuda
  cambiarSeccion(seccion: string) {
    this.currentSection = seccion;
    this.showHelp = false;
    this.cdr.detectChanges();
  }

  // Abre o cierra el menú lateral en móvil
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  // Cierra el menú lateral
  cerrarMenu() {
    this.menuAbierto = false;
  }

  // Si el usuario reduce la ventana en móvil y estaba en activity-log, lo mandamos al almacén
  // (activity-log solo se muestra en escritorio)
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth < 768 && this.currentSection === 'activity-log') {
      this.cambiarSeccion('almacen');
    }
  }

  // Recibe un producto del catálogo externo y lo pasa al almacén para rellenar el formulario
  recibirProductoImportado(producto: any) {
    this.productoImportadoTemp = producto;
    this.cambiarSeccion('almacen');
  }
}
