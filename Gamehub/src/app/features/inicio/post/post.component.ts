import { Component, OnInit } from '@angular/core';
import { SideNavbarComponent } from '../../../services/side-navbar/side-navbar.component';
import { Request } from '../../../core/request.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-post',
  standalone: true,
  imports: [SideNavbarComponent, CommonModule , FormsModule , RouterLink],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent implements OnInit {
  constructor(
    private request: Request,
    private route: ActivatedRoute , 
    private router : Router , 
    private location : Location 
  ) { }
  idPost: string | null = '';
  datosPost: any = {}
  idUsuario: string = '';
  idJuego: string = '';
  imagenClick: string = '';
  mismoUsuario : boolean = false ;
  username :any = ''; 
  mensajeToast : string = '';
  arrayComentarios : any[] = [];
  postComentar : any = {};
  comentario : string = '';
  stateToast : string = '';
  iconToast : string = '';
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.idPost = params.get('id');
      this.cargarPagina();
    })    
  }
  /*
  * * FUNCION PARA CARGAR LA PAGINA
  */
  async cargarPagina(){
    await this.obtenerUsuarioVisitante();
    await this.cargarPost();
    await this.getUsuarioPost(this.datosPost.id_usuario);
    this.datosPost['imagen'] = JSON.parse(this.datosPost.imagen)
    await this.getJuego(this.datosPost.id_juego)
    await this.getLikes(this.idPost)
    await this.getNumeroComentarios(this.idPost)
    await this.cargarComentarios(this.idPost);
    await this.getUsuario();
  }
  /*
  * * FUNCIONES JUEGOS
  */
  //ESTA FUNCION SE ENCARGA DE OBTENER LA INFORMACION DEL JUEGO DEL POST
  getJuego(id : any) : Promise <void>{
    return new Promise((resolve , reject)=>{
      this.request.verJuego(id).subscribe({
        next:(response)=>{
          this.datosPost['JUEGO']=  response.message;
          resolve();
        } , 
        error:(response)=>{
          reject(response);
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
  * * FUNCIONES PARA LOS POSTS
  */
  //ESTA FUNCION SE ENCARGA DE CARGAR LA INFORMACION DEL POST
  cargarPost() : Promise <void>{
    return new Promise((resolve , reject)=>{
      this.request.cargarPost(this.idPost).subscribe({
        next:(response)=>{
          this.datosPost = response.message;
          console.log('Post cargado :' , this.datosPost);
          resolve()
        },
        error:(response)=>{
          console.log(response)
          reject(response)
        }
      })
    })
  }

  /*
  * * FUNCIONES CLICKS
  */
 //FUNCION QUE SE LLAMA CUANDO SE ELIMINA UN COMENTARIO
  eliminarComentario(idComentario : string){
    this.request.eliminarComentario(idComentario).subscribe({
      next:(response)=>{
        this.arrayComentarios = this.arrayComentarios.filter((comentario) => comentario.ID_COMENTARIO !== idComentario);
        this.datosPost.COMENTARIOS.N_COMENTARIOS = this.datosPost.COMENTARIOS.N_COMENTARIOS -1;
        this.mostrarToast(true , response.message)
      },
      error:(response)=>{
        this.mostrarToast(false , response.error.message)
      }
      
    })

  }
  //ABRE UN MODAL CON LA FOTO DE LA IMAGEN
  clickImagen(imagen: string) {
    this.imagenClick = `http://localhost/uploads/fotosPost/${imagen}`;
    this.mostrarModal('imagenModal')
  }
  //FUNCION PARA ELIMINAR UN POST EN EL QUE SE HA HECHO CLICK
  clickEliminar(post : any){
    this.request.eliminarPostPerfil(post.id_publicacion).subscribe({
      next:(response)=>{
        this.router.navigate([`/${this.username}`], {
          state:{mensajeToast : 'Publicacion eliminada correctamente' , estado : 'success' , icon:'check'}
        })
      },
      error:(response)=>{
        this.router.navigate([`/${this.username}`], {
          state:{mensajeToast : 'No se ha podido eliminar la publicacion' , estado : 'success' , icon:'check'}
        })
      }
    })
  }
 //FUNCION QUE SE LE LLAMA CUANDO SE LE HACE CLICK EN COMENTAR , ASI CAPTURAMOS EL POST AL QUE SE VA A COMENTAR
  clickComentar(post : any){
    this.postComentar = post ; 
    this.mostrarModal('comentarioModal')
  }

  /*
  * * FUNCIONES LIKES 
  */
  //FUNCION QUE SE ENCARGA DE CAMBIAR EL ESTADO DEL LIKE
  cambiarLike(post : any) : Promise<void>{
    return new Promise((resolve , reject)=>{
      post.LIKES.LIKE_USUARIO = !post.LIKES.LIKE_USUARIO
      console.log(post)
      if(post.LIKES.LIKE_USUARIO){
        post.LIKES.N_LIKES = post.LIKES.N_LIKES+1
        this.request.anadirLike(this.idUsuario , post.id_publicacion).subscribe({
          next:(response :any )=>{
            console.log(response)
            resolve();
          },
          error:(response)=>{
            console.log(response);
            reject(response);
          }
        })
      }else{
        post.LIKES.N_LIKES = post.LIKES.N_LIKES-1
        this.request.eliminarLike(this.idUsuario , post.id_publicacion).subscribe({
          next:(response :any )=>{
            console.log(response)
            resolve()
          }, 
          error:(response)=>{
            console.log(response)
            reject(response)
          }
        })
      }
    })
  }
  //OBTIENE LA CANTIDAD DE LIKES DEL POST
  getLikes(id : any) : Promise<void>{
    return new Promise((resolve , reject)=>{
      this.request.getLikes(this.idUsuario , id).subscribe({
        next:(response)=>{
          this.datosPost['LIKES']= response.message;
          resolve();
        },
        error:(response)=>{
          reject(response)
        }
      })
    })
  }

  /*
  * * FUNCIONES USUARIOS
  */
 //ESTA FUNCION SE ENCARGA DE OBTENER LA INFORMACION DEL USUARIO QUE HA SUBIDO UN POST
 getUsuarioPost(id : any):Promise <void>{
  return new Promise ((resolve , reject )=>{
    this.request.getUsuario(id).subscribe({
      next:(response)=>{
        this.datosPost['USUARIO'] = response.message;
        if(this.datosPost.id_usuario === this.idUsuario){
          this.datosPost['MISMO_USUARIO'] = true;
        }else{
          this.datosPost['MISMO_USUARIO'] = false;
        }
        resolve();        
      },
      error:(response)=>{
        console.log(response);
        reject();
      }
    })
  })
 }
 //ESTA FUNCION SE ENCARGA DE OBTENER LA INFORMACION DEL USUARIO DE UN COMENTARIO RECIEN PUBLICADO
  getUsuarioComentario(id : any) : Promise<void>{
    return new Promise((resolve , reject)=>{
      this.request.getUsuario(id).subscribe({
        next:(response)=>{
          resolve(response.message)
        },
        error:(response)=>{
          console.log(response);
          reject(response);
        }
      })


      
    })
  }
  getUsuario(){
    return new Promise((resolve , reject)=>{
      for(let comentario of this.arrayComentarios){
        this.request.getUsuario(comentario.ID_USUARIO).subscribe({
          next:(response)=>{
            comentario['USUARIO'] = response.message;
            if(comentario.ID_USUARIO == this.idUsuario){
              comentario['MISMO_USUARIO'] = true;
            }else{
              comentario['MISMO_USUARIO'] = false;
            }           
          }
        })
      }
    })
  }
  //OBTIENE INFORMACION DEL USUARIO QUE VISITA LA PAGINA
  obtenerUsuarioVisitante() : Promise <void>{
    return new Promise ((resolve , reject)=>{
      this.request.getPerfil().subscribe({
        next:(response)=>{
          this.idUsuario = response.message.ID_USUARIO
          resolve()
        },
        error:(response)=>{
          console.log(response);
          reject(response)
        }
      })
    })
  }
  /* 
  * * FUNCIONES COMENTARIOS 
  */


  cargarComentarios(id : any) : Promise <void>{
    return new Promise((resolve , reject)=>{
      this.request.cargarComentarios(id ).subscribe({
        next:(response)=>{
          this.arrayComentarios = response.message;
          console.log(this.arrayComentarios)
          resolve()
        },
        error:(response)=>{
          console.log(response);
          reject(response)
        }
      })
    })
  }

  //FUNCION QUE SE ENCARGAR DE SUBIR UN COMENTARIO 
  subirComentario(){
    this.request.anadirComentario(this.idUsuario ,this.postComentar.id_publicacion , this.comentario).subscribe({
      next: async (response)=>{
        let comentarioNuevo = response.message;
        let infoUsuario = await this.getUsuarioComentario(comentarioNuevo.ID_USUARIO)
        comentarioNuevo['USUARIO'] = infoUsuario;
        if(comentarioNuevo.ID_USUARIO == this.idUsuario){
          comentarioNuevo['MISMO_USUARIO'] = true;
        }else{
          comentarioNuevo['MISMO_USUARIO'] = false;
        }
        console.log(response.message)
        this.arrayComentarios.push(response.message);
        this.datosPost.COMENTARIOS.N_COMENTARIOS = this.datosPost.COMENTARIOS.N_COMENTARIOS +1
        this.mostrarToast(true , response.info)
      },
      error:(response)=>{
        this.mostrarToast(false , response.error.error)
      }
    })
  }
  //FUNCION QUE OBTIENE EL NUMERO DE COMENTARIOS
  getNumeroComentarios(id : any):Promise <void>{
    return new Promise((resolve , reject)=>{
      this.request.getNumeroComentarios(id).subscribe({
        next:(response)=>{
          this.datosPost['COMENTARIOS'] = response.message;
          resolve();
        },
        error:(response)=>{
          reject(response)
        }
      })
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
  * * FUNCIONES TOAST Y OTROS
  */
 //EVENTO PARA MOSTRAR EL TOAST , LE PASAMOS POR PARAMETRO UN BOOLEANO Y EL MENSAJE
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
  //MUESTRA EL MODAL CON ID PASADO COMO PARAMETRO
  mostrarModal(idElemento : any){
        const modalElement = document.getElementById(idElemento);
    if(modalElement){
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  //COMPRUEBA QUE ES UN ARRAY 
  esArray(value: any) {
    return Array.isArray(value) && value.length > 0
  }
  volverAtras(){
    this.location.back();
  }
}
