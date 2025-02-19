import { Component, OnInit } from '@angular/core';
import { SideNavbarComponent } from '../../../services/side-navbar/side-navbar.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Request } from '../../../core/request.service';

@Component({
  selector: 'app-buscar-juegos',
  standalone: true,
  imports: [SideNavbarComponent , CommonModule],
  templateUrl: './buscar-juegos.component.html',
  styleUrl: './buscar-juegos.component.css'
})
export class BuscarJuegosComponent implements OnInit{
  arrayJuegos : any[] = [];
  constructor(
    public request : Request , 
    public router : Router
  ){}
  ngOnInit(): void {
    this.request.buscarJuegos('').subscribe({
      next : (res)=>{
        console.log(res);
        this.arrayJuegos = res.message;
      },
      error : (error)=>{
        console.log(error);
      }
    })
  }
  buscarJuegos(event : Event){
    let input = event.target as HTMLInputElement;
    let valor = input.value;
    this.request.buscarJuegos(valor).subscribe({
      next : (res)=>{
        console.log(res);
        this.arrayJuegos = res.message;
      },
      error : (error)=>{
        console.log(error);
      }
    })
  }
  verJuego(id:string){
    this.router.navigate(['/juegos',id]);
  }
}
