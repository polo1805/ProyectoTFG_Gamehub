import { Component } from '@angular/core';
import { SideNavbarComponent } from "../../../services/side-navbar/side-navbar.component";
import { Request } from '../../../core/request.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-buscar-usuarios',
  standalone: true,
  imports: [SideNavbarComponent , CommonModule],
  templateUrl: './buscar-usuarios.component.html',
  styleUrl: './buscar-usuarios.component.css'
})
export class BuscarUsuariosComponent {
  constructor(
    public request : Request , 
    public router : Router
  ){}
  arrayUsuarios : any [] = [];
  buscarUsuarios(event : Event){
    let input = event.target as HTMLInputElement;
    let valor = input.value;
    this.request.buscarUsuarios(valor).subscribe({
      next : (res)=>{
        console.log(res);
        this.arrayUsuarios = res.message;
      },
      error : (error)=>{
        console.log(error);
      }
    })
  }
  clickPerfil(usuario : string ){
    console.log(usuario);
    this.router.navigate(['/'+usuario]);
  }
}
