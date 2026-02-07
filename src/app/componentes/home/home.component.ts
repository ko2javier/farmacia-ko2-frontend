import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { TokenPayload } from '../../models/TokenPayload';
import { jwtDecode } from 'jwt-decode';


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

   

  constructor(private router: Router, private cdr: ChangeDetectorRef, 
     public carritoService: CarritoService, private authService:AuthService) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      const decoded = jwtDecode<TokenPayload>(token);
      this.userRole = decoded.role;
      console.log('Rol obtenido del JWT:', this.userRole);
    }
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

