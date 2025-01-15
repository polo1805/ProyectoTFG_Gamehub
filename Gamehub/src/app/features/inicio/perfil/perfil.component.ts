import { Component, OnInit } from '@angular/core';
import { SideNavbarComponent } from '../../../services/side-navbar/side-navbar.component';
import { Request } from '../../../core/request.service';
import { KeyService } from '../../../core/keys.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../../services/loading/loading.component';
import { Perfil } from '../../../shared/perfilData';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [SideNavbarComponent, LoadingComponent, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit{
  constructor(
    private request : Request, 
    private key : KeyService  , 
    private cookieService:CookieService , 
    private router : Router , 
    private route : ActivatedRoute,
  ){}
  isLoading : boolean = true; 
  perfil !: Perfil; 
  mismoUsuario : boolean = false; 
  ngOnInit(): void {
    if (!this.cookieService.check('KEY') && this.key.USERNAME == '') {
      this.router.navigate(['/login']);
    } else {
      this.route.paramMap.subscribe(params => {
        const username = params.get('username');
        this.loadPerfil(username);
      });
    }
  }

  private loadPerfil(username: string | null): void {
    if (username === this.key.USERNAME) {
      this.mismoUsuario = true; 
    }
    this.request.getPerfil(username).subscribe({
      next: (response) => {
        console.log(response);
        if (this.key.USERNAME == '') {
          this.key.USERNAME = response.message.NOMBRE_USUARIO;
        }
        console.log(this.key);
        this.perfil = new Perfil(
          response.message.BIOGRAFIA,
          response.message.IMAGEN,
          response.message.NOMBRE,
          response.message.NOMBRE_USUARIO
        );
      },
      error: (error) => {
        console.log(error);
        if (error.error.status == 401) {
          this.router.navigate(['/login']);
        }
      },
      complete: () => {
        console.log('getPerfil completado');
        this.isLoading = false;
      }
    });
  }
}
