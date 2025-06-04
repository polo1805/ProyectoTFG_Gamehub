import { Component, OnDestroy, OnInit , AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SideNavbarComponent } from '../../../services/side-navbar/side-navbar.component';
import { Request } from '../../../core/request.service';
import { KeyService } from '../../../core/keys.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../../services/loading/loading.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [SideNavbarComponent, LoadingComponent, CommonModule , FormsModule , RouterLink],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
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
  idUsuario : string = ''; 
  postsCargados : any[] = [];
  imagenes : any[] = [];
  imagenClick : string = '';
  comentario : string = '';
  mensajeToast : string = '';
  stateToast : string = '';
  iconToast : string = '';
  postComentar : any = {};
  perfilCargado : any = {};
  usernameSolicitado : string | null = '';
  ngOnInit(): void {
    //COMPROBAMOS SI VIENE DE ALGUNA PAGINA ANTERIOR PARA ENVIAR EL MENSAJE DEL TOAST 
    if(history.state.mensajeToast){
      this.mensajeToast = history.state.mensajeToast;
      this.stateToast = history.state.estado;
      this.iconToast = history.state.icon;
      this.mostrarToast();
      setTimeout(()=>{
        window.history.replaceState({} , '' , this.router.url);
      } , 100 )
    }
    //COMPROBAMOS LA IDENTIFICACION DEL USUARIO
    if (!this.cookieService.check('KEY')) {
      this.router.navigate(['/login']);
    }else{
     

      //CADA VEZ QUE HAYA UN CAMBIO EN LA URL LO CAPTURA Y CARGA TODO EL PERFIL
      this.getUsernameURL();
      
    }
  }

  /*
  * *FUNCION PARA CARGAR TODA LA INFORMACION DE LA PAGINA
  */
  //FUNCION QUE SE ENCARGARA DE CARGAR EL PERFIL DEL USUARIO
  async cargarPerfil():Promise<void> {
    //OBTENEMOS INFO DEL USUARIO SOLICITADO
    await this.getPerfil(this.usernameSolicitado);
    //COMPROBAMOS SI EL USUARIO VISITANTE YA SIGUE AL USUARIO SOLICITADO
    await this.comprobarSeguimiento(this.idUsuario , this.perfilCargado.ID_USUARIO);
    //CARGAMOS LOS POSTS DEL USUARIO
    await this.cargarPosts();
    for(let post of this.postsCargados){
      //OBTENEMOS LA INFORMACION DEL JUEGO
      await this.getJuego(post)
      //CONVERTIMOS LA INFO EN UN ARRAY DE IMAGENES
      post['IMAGEN'] = JSON.parse(post.IMAGEN)
      //OBTIENE EL NUMERO DE LIKES DEL POST
      await this.getLikes(post);
      //OBTIENE EL NUMERO DE COMENTARIOS EN UN POST
      await this.getNumeroComentarios(post);
    }
    this.isLoading = false;
  }
  /*
  * *FUNCIONES PARA JUEGOS 
  */
  getJuego(post : any) : Promise<void>{
    return new Promise ((resolve , reject)=>{
      this.request.verJuego(post.ID_JUEGO).subscribe({
        next:(response)=>{
          post['INFO_JUEGO'] = response.message;
          resolve()
        },
        error:(response)=>{
          console.log(response);
          reject(response)
        }
      })
    })
  }
  verJuego(event : MouseEvent , idJuego: string){
    event.stopPropagation();
    console.log('VerJuego' , idJuego)
    this.router.navigate(['/juegos' , idJuego])
  }
  /*
  * *FUNCIONES PARA POSTS
  */
  //FUNCION QUE SE ENCARGA DE CARGAR LOS POSTS DEL USUARIO
  cargarPosts() : Promise<void>{
    return new Promise((resolve , reject)=>{
      this.request.getPostPerfil(this.perfilCargado.ID_USUARIO).subscribe({
        next:(response)=>{
          this.postsCargados = response.message;
          console.log('Posts cargados : ' , this.postsCargados);
          resolve();
        },
        error:(response)=>{
          console.log(response);
          resolve();
        }
      })
    })
  }


  /*
  * *FUNCIONES PARA USUARIOS
  */

  //FUNCION QUE SE ENCARGA DE OBTENER LA INFORMACION DEL USUARIO QUE USA LA APLICACION
  getPerfil(username ?: string | null):Promise<void>{
    return new Promise ((resolve , reject)=>{
      if(username){
        this.request.getPerfil(username).subscribe({
          next:(response)=>{
            console.log('Perfil solicitado : ' , response.message);
            this.perfilCargado = response.message;
            console.log('ID Cargado : ' , this.perfilCargado.ID_USUARIO , 'ID Solicitante :' , this.idUsuario)
            if(this.perfilCargado.ID_USUARIO === this.idUsuario){
              this.perfilCargado.MISMO_USUARIO = true;
            }else{
              this.perfilCargado.MISMO_USUARIO = false;
            }

            resolve()
          },
          error:(response)=>{
            reject(response)
          }
        })
      }else{
        this.request.getPerfil().subscribe({
          next:(response)=>{
            console.log('Perfil del solicitante solicitado : ' , response.message);
            this.idUsuario = response.message.ID_USUARIO;
            if(this.key.USERNAME == ''){
              this.key.USERNAME = response.message.NOMBRE_USUARIO
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


  //OBTENEMOS DE LA URL EL USERNAME SOLICITADO
  async getUsernameURL(){
    //OBTIENE EL PERFIL DEL VISITANTE
    await this.getPerfil();
    this.route.paramMap.subscribe(params => {
      this.isLoading = true
      this.usernameSolicitado = params.get('username');
      this.cargarPerfil();
    });
  }


  /*
  * *FUNCIONES PARA LIKES 
  */
  
  getLikes(post:any ) : Promise <void>{
    return new Promise((resolve , reject)=>{
      this.request.getLikes(this.idUsuario , post.ID_PUBLICACION).subscribe({
        next:(response)=>{
          post['LIKES'] = response.message;
          resolve();
        } , 
        error:(response)=>{
          console.log(response);
          reject(response)
        }
      })
    })
  }

  añadirLikes(post : any){
    this.request.anadirLike(this.idUsuario , post.ID_PUBLICACION).subscribe({
      next:(response :any )=>{
        console.log(response)
      }
    })
  }
  eliminarLikes(post : any){
    this.request.eliminarLike(this.idUsuario , post.ID_PUBLICACION).subscribe({
      next:(response :any )=>{
        console.log(response)
      }
    })
  }
  
  /* 
   * *FUNCIONES DE COMENTARIOS
  */
  getNumeroComentarios(post : any ) : Promise <void>{
    return new Promise((resolve , reject)=>{
      this.request.getNumeroComentarios(post.ID_PUBLICACION).subscribe({
        next:(response)=>{
          post['COMENTARIOS'] = response.message;
          resolve();
        },
        error:(response)=>{
          console.log(response);
          reject(response)
        }
      })
    })
  }
  añadirComentario(){
    this.request.anadirComentario(this.idUsuario ,this.postComentar.ID_PUBLICACION , this.comentario).subscribe({
      next: (response)=>{
        console.log(response);
        this.stateToast = 'success';
        this.iconToast = 'check'
        console.log(response)
        this.mensajeToast = response.info
        this.mostrarToast();
        this.postComentar.COMENTARIOS.N_COMENTARIOS = this.postComentar.COMENTARIOS.N_COMENTARIOS +1
      },
      error:(response)=>{
        this.stateToast = 'danger'
        this.iconToast = 'x';
        this.mensajeToast = response.error.message
        this.mostrarToast();
      }
    })
  }
  
  /* 
   * *FUNCIONES DE SEGUIMIENTO
  */

  //FUNCION QUE SE ENCARGA DE COMPROBAR SI EL USUARIO YA SIGUE A OTRO USUARIO
  comprobarSeguimiento(idUsuario : any , idSeguido : any) : Promise<void>{
    return new Promise ((resolve , reject )=>{
      this.request.comprobarSeguimiento(idUsuario , idSeguido).subscribe({
        next:(response)=>{
          this.perfilCargado.SIGUIENDO = response.message;
          resolve();
        },
        error:(response)=>{
          reject(response)
        }
      })
    })
  }
  //FUNCION QUE SE ENCARGA DE SEGUIR A UN USUARIO
  seguirUsuario(){
    this.request.seguirUsuario(this.idUsuario , this.perfilCargado.ID_USUARIO).subscribe({
      next:(response)=>{
        console.log(response);
        this.perfilCargado.SIGUIENDO = !this.perfilCargado.SIGUIENDO;
      }
    })
  }
  //FUNCION QUE SE ENCARGA DE ELIMINAR EL SEGUIMIENTO DE UN USUARIO
  eliminarSeguimiento(){
    this.request.eliminarSeguimiento(this.idUsuario , this.perfilCargado.ID_USUARIO).subscribe({
      next:(response)=>{
        console.log(response);
        this.perfilCargado.SIGUIENDO = !this.perfilCargado.SIGUIENDO;
      }
    })
  }

  /* 
   * *FUNCIONES DE ELIMINAR POST
  */
  //FUNCION QUE SE ENCARGA DE ELIMINAR UN POST
  eliminarPost(post : any){
    this.request.eliminarPostPerfil(post.ID_PUBLICACION).subscribe({
      next:(response)=>{
        this.stateToast = 'success';
        this.iconToast = 'check';
        this.mensajeToast = response.message
        this.postsCargados = this.postsCargados.filter(p => p.ID_PUBLICACION !== post.ID_PUBLICACION); 
        this.mostrarToast();
      },
      error:(response)=>{
        this.stateToast = 'danger'
        this.iconToast = 'x';
        this.mensajeToast = response.error.message;
        this.mostrarToast();
      }
    })
  }

  /* 
   * *FUNCIONES DE CLICKS
  */


  //FUNCION QUE LLAMA AL MODAL DE LA IMAGEN 
  clickImagen(imagen : string){
    this.imagenClick = `https://api.game-hub.me/uploads/fotosPost/${imagen}`;
    // Abre el modal de Bootstrap
    this.mostrarModal('imagenModal');
  }


 //FUNCION QUE SE LLAMA CUANDO SE HACE CLICK EN EL BOTON DE LIKE
  cambiarLike(post : any){
    post.LIKES.LIKE_USUARIO = !post.LIKES.LIKE_USUARIO
    console.log(post)
    if(post.LIKES.LIKE_USUARIO){
      post.LIKES.N_LIKES = post.LIKES.N_LIKES+1
      this.añadirLikes(post)
    }else{
      post.LIKES.N_LIKES = post.LIKES.N_LIKES-1
      this.eliminarLikes(post);
    }
  }

  //FUNCION QUE ABRE EL MODAL PARA COMENTAR 
  clickComentar(post : any){
    this.postComentar = post;
    this.mostrarModal('comentarioModal')
  }

 //FUNCION QUE SE LLAMA CUANDO SE HACE CLICK EN EL BOTON DE SUBIR COMENTARIO
  subirComentario(){
    this.añadirComentario();
  }
  //FUNCION QUE SE LLAMA CUANDO SE HACE CLICK EN ELIMINAR POST
  clickEliminar(post : any){
    this.eliminarPost(post)
  }

  //FUNCION QUE SE LLAMA CUANDO SE HACE CLICK EN UN POST
  clickPost(idPost:string){
    this.router.navigate(['post' , idPost ])
  }

  //FUNCION QUE SE LLAMA CUANDO SE HACE CLICK EN EL BOTON DE SEGUIR 
  clickSeguir(){
    if(this.perfilCargado.SIGUIENDO){
      this.eliminarSeguimiento();
    }else{
      this.seguirUsuario()
    }
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
   * *FUNCIONES DE ALERTAS  , MODALES Y OTROS 
  */ 
  //FUNCION PARA COMPROBAR QUE ES UN ARRAY Y NO ESTA VACIO
  esArray(value : any){
    return Array.isArray(value) && value.length > 0
  }
  //FUNCION QUE SE ENCARGA DE MOSTRAR EL MODAL . COMO PARAMETRO LE PASAMOS EL ID DEL HTML
  mostrarModal(idElemento : any){
    const modalElement = document.getElementById(idElemento);
    if(modalElement){
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  //FUNCION QUE SE ENCARGA DE MOSTRAR EL TOAST DE ERROR O DE EXITO
  mostrarToast(){
    const toastLive = document.getElementById('liveToast');
    if (toastLive) {
      const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
      toastBootstrap.show();
    }
  }
}
