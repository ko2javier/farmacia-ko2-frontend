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
    'resultados': 'SIDEBAR.RESULTADOS' // Para cuando busques productos
  };


  constructor(private router: Router, private cdr: ChangeDetectorRef,
     public carritoService: CarritoService, private authService:AuthService,
              private translate: TranslateService) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      const decoded = jwtDecode<TokenPayload>(token);
      this.userRole = decoded.role;
      console.log('Rol obtenido del JWT:', this.userRole);
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
    localStorage.removeItem('token'); // O donde sea que guardes el token
    // Redirige al usuario a la página de login
    console.log("redirecciono a login");
    this.router.navigate(['/login']);
  }

  cambiarSeccion(seccion: string) {
    console.log(`✅ Sección cambiada a: ${seccion}`);

    this.currentSection = seccion;
    this.cdr.detectChanges();  // 🔄 Forzar actualización de la UI
  }

  debugEvent(event: any) {
    console.log("📢 Evento recibido en HomeComponent: ", event);
    this.cambiarSeccion(event);
  }




}
function jwt_decode(token: string) {
  throw new Error('Function not implemented.');
}

