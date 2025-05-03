import { Component, OnInit } from '@angular/core';
import { SideNavbarComponent } from '../../../services/side-navbar/side-navbar.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Request } from '../../../core/request.service';
import { LoadingComponent } from "../../../services/loading/loading.component";

@Component({
  selector: 'app-buscar-juegos',
  standalone: true,
  imports: [SideNavbarComponent, CommonModule, LoadingComponent],
  templateUrl: './buscar-juegos.component.html',
  styleUrl: './buscar-juegos.component.css'
})
export class BuscarJuegosComponent implements OnInit{
  arrayJuegos : any[] = [];
  arrayGeneros : any[] = [];
  arrayFiltroGeneros : any[] = [];
  constructor(
    public request : Request , 
    public router : Router
  ){}
  cargando : boolean = false;
  ngOnInit(): void {
    this.cargarPagina();

  }
  //CARGAR PAGINA
  async cargarPagina(){
    this.cargando = true
    await this.getJuegos();
    await this.getGeneroJuegos();
  }
  /*
  * *EVENTOS INFO JUEGOS
  */
  getJuegos() : Promise<void>{
    return new Promise((resolve , reject)=>{
      this.request.buscarJuegos('').subscribe({
        next : (res)=>{
          console.log(res);
          this.arrayJuegos = res.message;
          this.cargando = false;
          resolve();
        },
        error : (response)=>{
          console.log(response);
          this.cargando = false;
          reject(response)
        }
      })
    })
  }


  getGeneroJuegos():Promise<void>{
    return new Promise((resolve , reject)=>{
      this.request.getGeneroJuegos().subscribe({
        next : (response)=>{
          console.log(response);
          this.arrayGeneros = response.message;
          resolve();
        },
        error : (response)=>{
          console.log(response);
          reject(response)
        }
      })
    })
  }
  /*
  * *EVENTOS GENEROS
  */
  filtrarPorGenero():Promise<void>{
    return new Promise((resolve , reject)=>{
      this.request.filtrarJuegosPorGenero(this.arrayFiltroGeneros).subscribe({
        next:(response)=>{
          console.log(response);
          this.arrayJuegos = response.message;
          resolve();
        },
        error:(response)=>{
          console.log(response);
          this.arrayJuegos = [];
          reject(response)
        }
      })
    })
  }
  /*
  * *EVENTOS CHANGE
  */
  buscarJuegos(event : Event){
    this.cargando = true;
    let input = event.target as HTMLInputElement;
    let valor = input.value;
    this.request.buscarJuegos(valor).subscribe({
      next : (res)=>{
        console.log(res);
        this.arrayJuegos = res.message;
        this.cargando = false ;
      },
      error : (error)=>{
        console.log(error);
        this.arrayJuegos = []
        this.cargando = false;
      }
    })
  }
  ordenarJuegos(evento : Event | null){
    if(evento == null){
      return;
    }
    let select = evento.target as HTMLSelectElement;
    let valor = select.value;
    console.log(valor)
    switch (valor) {
      case 'calificacionMenor':
        this.arrayJuegos.sort((a,b)=>{
          return parseFloat(a.calificacion_media) - parseFloat(b.calificacion_media);
        })
        break;
      case 'calificacionMayor':
        this.arrayJuegos.sort((a,b)=>{
          return parseFloat(b.calificacion_media) - parseFloat(a.calificacion_media);
        })
        break;
      case 'fecha':
        this.arrayJuegos.sort((a,b)=>{
          return new Date(b.fecha_lanzamiento).getTime() - new Date(a.fecha_lanzamiento).getTime();
        })
        break;
      case 'nombreAZ':
        this.arrayJuegos.sort((a , b )=>{
          return a.nombre_juego.localeCompare(b.nombre_juego);
          
        })
        break; 
      case 'nombreZA':
        this.arrayJuegos.sort((a , b)=>{
          return b.nombre_juego.localeCompare(a.nombre_juego);
        })
      break;
    }
    console.log(this.arrayJuegos);
  }
  /*
  * *EVENTOS CLICK
  */
  verJuego(id:string){
    this.router.navigate(['/juegos',id]);
  }
  addGenero(event : Event){

    const genero = (event.target as HTMLSelectElement).value;
    console.log('Género seleccionado:', genero);
    if(this.arrayFiltroGeneros.includes(genero)){
      this.eliminarGenero(genero);
    }else{
      if(genero == ''){
        this.arrayFiltroGeneros = [];
        this.getJuegos();
      }else{
        this.arrayFiltroGeneros.push(genero);
        this.filtrarPorGenero().then(()=>{
          console.log(this.arrayFiltroGeneros);
        }).catch((error)=>{
          console.log(error);
        })
      }

    }
    console.log(this.arrayFiltroGeneros);
  }
  eliminarGenero(genero : string){
    this.arrayFiltroGeneros = this.arrayFiltroGeneros.filter((item)=>item != genero);
    console.log(this.arrayFiltroGeneros);
    if(this.arrayFiltroGeneros.length == 0){
      this.getJuegos();
    }else{
      this.filtrarPorGenero();
    }
  }
}
