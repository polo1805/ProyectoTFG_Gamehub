import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SideNavbarComponent } from '../../../services/side-navbar/side-navbar.component';
import { NgClass } from '@angular/common';
import { KeyService } from '../../../core/keys.service';
import { Request } from '../../../core/request.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SideNavbarComponent , NgClass],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  constructor(
    private router : Router,
    private cookieService : CookieService , 
    private key : KeyService , 
    private request : Request
  ){}
  vistaParati : boolean = false ; 
  vistaSiguiendo : boolean = false ; 
  ngOnInit(): void {
    if(!this.cookieService.check('KEY')){
      this.router.navigate(['/login'])
    }else{
      this.vistaParati = true ;
      this.request.getPerfil().subscribe({
        next: (response) => {
          console.log(response);
          this.key.USERNAME = response.message.NOMBRE_USUARIO;
          this.key.TOKEN = this.cookieService.get('KEY'); 
          console.log(this.key);
        }
      })
    }

  }
  
  cambiarVista(vista : String){
    if(vista == 'parati'){
      this.vistaParati = true ;
      this.vistaSiguiendo = false ;
    }else if(vista == 'siguiendo'){
      this.vistaParati = false ;
      this.vistaSiguiendo = true ;
    }
  }
}
