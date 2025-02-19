import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { KeyService } from '../../../core/keys.service';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css'
})

export class HomeAdminComponent {
  constructor(
    private key: KeyService,
    private cookieService: CookieService,
    private router: Router
  ){}
  cerrarSesion(){
    this.key.cerrarSesion();
    this.cookieService.delete('KEY');
    this.router.navigate(['/login']);
  }
}
