import { Component, OnInit } from '@angular/core';
import { SideNavbarComponent } from '../../../services/side-navbar/side-navbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Request } from '../../../core/request.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [SideNavbarComponent , CommonModule , RouterModule],
  templateUrl: './juego.component.html',
  styleUrl: './juego.component.css'
})
export class JuegoComponent implements OnInit{
  id:string | null = null;
  juego : any = {};
  generos : string[] = [];
  insuficente : boolean = false;
  suficiente : boolean = false ; 
  sobresaliente : boolean = false;
  constructor(
    private route : ActivatedRoute , 
    private request : Request ,
  ){}
  ngOnInit(): void {
    this.route.paramMap.subscribe(params=>{
      this.id = params.get('id');
      console.log('ID:' , this.id);
      this.request.verJuego(this.id).subscribe({
        next : (res)=>{
          this.juego = res.message;
          console.log(this.juego);
          this.generos = this.juego.GENERO.split('/')
          console.log(this.generos)
        }
      })
    })
  }

}
