import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SideNavbarComponent } from '../../../services/side-navbar/side-navbar.component';
import { CommonModule, NgClass } from '@angular/common';
import { KeyService } from '../../../core/keys.service';
import { Request } from '../../../core/request.service';
import * as bootstrap from 'bootstrap';
import { LoadingComponent } from '../../../services/loading/loading.component';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SideNavbarComponent, NgClass, CommonModule, LoadingComponent , RouterLink , FormsModule],
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
  cargando : boolean = true;
  imagenClick : string = '';
  stateToast : string = ''
  iconToast : string = ''
  idUsuario : string = '';
  vistaParati : boolean = false ; 
  vistaSiguiendo : boolean = false ;
  comentario : string = ''; 
  postCargados : any = [];
  postComentar : any = '';
  mensajeToast : string = '';
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
          this.idUsuario = response.message.ID_USUARIO;
          console.log(this.key);
        }
      })
      this.cargarPagina()
    }
  }
  async cargarPagina(){
    if(this.vistaParati){
      await this.cargarPostParaTi();
    }else if(this.vistaSiguiendo){
      await this.cargarPostSiguiendo();
    }
    await this.getUsuarioPost();
    for(let post of this.postCargados){
      post['IMAGEN'] = JSON.parse(post.IMAGEN)
    }
    await this.getJuegoPost();
    await this.getLikesPost();
    await this.getComentariosPost();
    console.log(this.cargando)
    this.cargando = false;
  }
  cambiarVista(vista : String){
    if(vista == 'parati'){
      this.vistaParati = true ;
      this.vistaSiguiendo = false ;
      this.cargarPagina();
    }else if(vista == 'siguiendo'){
      this.vistaParati = false ;
      this.vistaSiguiendo = true ;
      this.cargarPagina();
    }
  }
  /*
  * *EVENTOS COMENTARIOS
  */
  //OBTIENE EL NUMERO DE COMENTARIOS DE UN POST
  getComentariosPost():Promise <void>{
    return new Promise((resolve , reject)=>{
      for(let post of this.postCargados){
        this.request.getNumeroComentarios(post.ID_PUBLICACION).subscribe({
          next:(response)=>{
            post['COMENTARIOS']= response.message;
            resolve();
          },
          error:(response)=>{
            console.log(response);
            reject(response)
          }
        })
      }
    })
  }
  /*
  * *EVENTOS JUEGOS
  */
  //OBTIENE LA INFORMACION DEL JUEGO DEL POST
  getJuegoPost() : Promise <void> {
    return new Promise((resolve , reject)=>{
      for(let post of this.postCargados){
        this.request.verJuego(post.ID_JUEGO).subscribe({
          next:(response)=>{
            post['INFO_JUEGO'] = response.message 
            resolve();
          },
          error:(response)=>{
            console.log(response);
            reject(response)
          }
          
        })
      }
    })
  }

  verJuego(event : MouseEvent , idJuego: string){
    event.stopPropagation();
    console.log('VerJuego' , idJuego)
    this.router.navigate(['/juegos' , idJuego])
  }

  /*
  * *EVENTOS USUARIOS
  */
  getUsuarioPost(): Promise<void>{
    return new Promise((resolve , reject)=>{
      for(let post of this.postCargados){
        this.request.getUsuario(post.ID_USUARIO).subscribe({
          next:(response)=>{
            post['INFO_USUARIO'] = response.message;
            if(post.ID_USUARIO == this.idUsuario){
              post.mismoUsuario = true;
            }else{
              post.mismoUsuario = false;
            }
            resolve()
          },
          error:(response)=>{
            reject(response)
          }
        })
      }
    })
  }
  /*
  * *EVENTOS POST  
  */
  cargarPostParaTi(): Promise<void>{
    return new Promise((resolve , reject)=>{
      this.request.cargarPostParaTi().subscribe({
        next:(response)=>{
          this.postCargados = response.message;
          console.log(this.postCargados);
          resolve()
        },
        error:(response)=>{
          console.log(response);
          reject(response)
        }
      })
    })  
  }
  cargarPostSiguiendo(): Promise<void>{
    return new Promise((resolve , reject)=>{
      this.request.cargarPostsSiguiendo(this.idUsuario).subscribe({
        next:(response)=>{
          this.postCargados = response.message;
          console.log(this.postCargados);
          resolve();
        },
        error:(response)=>{
          this.postCargados = [];
          console.log(response);
          reject(response);
        }
      })
    })
  }
  /*
  * *EVENTOS LIKE 
  */
  //METODO QUE OBTIENE LOS LIKES DE UN POST
  getLikesPost(): Promise<void>{
    return new Promise((resolve , reject)=>{
      for(let post of this.postCargados){
        this.request.getLikes(this.idUsuario , post.ID_PUBLICACION).subscribe({
          next:(response)=>{
            post['LIKES']= response.message;
            resolve();
          },
          error:(response)=>{
            console.log(response);
            reject(response)
          }
        })
      }
    })
  }
  //METODO PARA CAMBIAR EL LIKE
  cambiarLike(post : any){
    post.LIKES.LIKE_USUARIO = !post.LIKES.LIKE_USUARIO
    console.log(post)
    if(post.LIKES.LIKE_USUARIO){
      post.LIKES.N_LIKES = post.LIKES.N_LIKES+1
      this.añadirLike(this.idUsuario , post.ID_PUBLICACION);
    }else{
      post.LIKES.N_LIKES = post.LIKES.N_LIKES-1
      this.eliminarLike(this.idUsuario , post.ID_PUBLICACION);
    }
  }
  //METODO PARA AÑADIR LIKE
  añadirLike(idUsuario : string , idPublicacion : string){
    this.request.anadirLike(idUsuario , idPublicacion).subscribe({
      next:(response :any )=>{
        console.log(response)
      }
    })
  }
  //METODO PARA ELIMINAR LIKE
  eliminarLike(idUsuario : string , idPublicacion : string){
    this.request.eliminarLike(idUsuario , idPublicacion).subscribe({
      next:(response :any )=>{
        console.log(response)
      },
      error:(response:any)=>{
        console.log(response);
      }
    });
  }
  /*
  * * EVENTOS CLICK
  */
  //ABRE UN MODAL CON LA FOTO DE LA IMAGEN
  clickImagen(imagen: string) {
    this.imagenClick = `https://api.game-hub.me/uploads/fotosPost/${imagen}`;
    this.mostrarModal('imagenModal')
  }

  //EVENTO PARA CUANDO SE HACE CLICK
  clickPost(idPost:string){
    this.router.navigate(['post' , idPost ])
  }
  //EVENTO PARA CUANDO SE HACE CLICK EN ELIMINAR POST
  clickEliminar(post : any){
    this.request.eliminarPostPerfil(post.ID_PUBLICACION).subscribe({
      next:(response)=>{
        console.log(response);
        this.postCargados = this.postCargados.filter((p: { ID_PUBLICACION: any; }) => p.ID_PUBLICACION !== post.ID_PUBLICACION); 
        this.mostrarToast(true , response.message)
      },
      error:(response)=>{
        this.mostrarToast(false , response.message);
      }
    })
  }
  //EVENTO PARA CUANDO SE HACE CLICK EN EL BOTON DE COMENTAR
  clickComentar(post : any){
    this.postComentar = post;
    this.mostrarModal('comentarioModal')
  }
  subirComentario(){
    this.request.anadirComentario(this.idUsuario ,this.postComentar.ID_PUBLICACION , this.comentario).subscribe({
      next: async (response)=>{
        console.log(response.message)
        this.mostrarToast(true , response.info)
      },
      error:(response)=>{
        this.mostrarToast(false , response.error.error)
      }
    })
  }
  /*
  * *METODOS FORMATEO FECHA
  */
  //METODO PARA FORMATEAR LA FECHA
  formatearFecha(fechaPublicacion : string){
    const fecha = new Date(fechaPublicacion);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    if(segundos < 60){
      return `${segundos} s`;
    }else if(minutos < 60){
      return `${minutos} min`;
    }else if( horas < 24){
      return `${horas} h`;
    }else if(dias < 7){
      return `${dias} d`;
    }else{
      return fecha.toLocaleDateString('es-ES' , {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      })
    }
  }
  /*
  * *EVENTOS TOAST MODALES Y OTROS
  */
  //METODO PARA MOSTRAR EL TOAST
  mostrarToast(success : boolean , mensaje:string ){
    if(success){
      this.stateToast = 'success'
      this.iconToast = 'check'
      this.mensajeToast = mensaje;
    }else{
      this.stateToast = 'danger'
      this.iconToast = 'x';
      this.mensajeToast = mensaje;
    }
    const toastLive = document.getElementById('liveToast');
    if (toastLive) {
      const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
      toastBootstrap.show();
    }
  }
  //METODO PARA MOSTRAR EL MODAL
  mostrarModal(idModal : string){
    const modalElement = document.getElementById(idModal);
    if(modalElement){
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  //COMPRUEBA QUE ES UN ARRAY 
  esArray(value: any) {
    console.log(Array.isArray(value));
    return Array.isArray(value) && value.length > 0
  }
}
