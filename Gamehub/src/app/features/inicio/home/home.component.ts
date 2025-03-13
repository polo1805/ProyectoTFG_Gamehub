import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SideNavbarComponent } from '../../../services/side-navbar/side-navbar.component';
import { CommonModule, NgClass } from '@angular/common';
import { KeyService } from '../../../core/keys.service';
import { Request } from '../../../core/request.service';
import * as bootstrap from 'bootstrap';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SideNavbarComponent , NgClass , CommonModule],
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
  idUsuario : string = '';
  vistaParati : boolean = false ; 
  vistaSiguiendo : boolean = false ; 
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
      this.cargarPostParaTi();
    }
  }
  cargarPostParaTi(){
    //Cargamos los post para el usuario 
    this.request.cargarPostParaTi().subscribe({
      next:(response)=>{
        this.postCargados = response.message;
        console.log(this.postCargados);
        for(let post of this.postCargados){
          this.request.getUsuario(post.id_usuario).subscribe({
            next:(response)=>{
              post['INFO_USUARIO'] = response.message;
              if(post.id_usuario == this.idUsuario){
                post.mismoUsuario = true;
              }else{
                post.mismoUsuario = false;
              }
              this.request.verJuego(post.id_juego).subscribe({
                next:(response)=>{
                  post['INFO_JUEGO'] = response.message;
                  this.request.getLikes(this.idUsuario , post.id_publicacion).subscribe({
                    next:(response)=>{
                      post['LIKES'] = response.message;
                      this.request.getNumeroComentarios(post.id_publicacion).subscribe({
                        next:(response)=>{
                          post['COMENTARIOS']= response.message;
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      }
    })
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
  clickComentar(post : any){
    this.postComentar = post;
    const modalElement = document.getElementById('comentarioModal');
    if(modalElement){
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  cambiarLike(post : any){
    post.LIKES.LIKE_USUARIO = !post.LIKES.LIKE_USUARIO
    console.log(post)
    if(post.LIKES.LIKE_USUARIO){
      post.LIKES.N_LIKES = post.LIKES.N_LIKES+1
      this.request.anadirLike(this.idUsuario , post.id_publicacion).subscribe({
        next:(response :any )=>{
          console.log(response)
        }
      })
    }else{
      post.LIKES.N_LIKES = post.LIKES.N_LIKES-1
      this.request.eliminarLike(this.idUsuario , post.id_publicacion).subscribe({
        next:(response :any )=>{
          console.log(response)
        }
      })
    }
  }
  clickEliminar(post : any){
    this.request.eliminarPostPerfil(post.id_publicacion).subscribe({
      next:(response)=>{
        console.log(response);
        this.postCargados = this.postCargados.filter((p: { id_publicacion: any; }) => p.id_publicacion !== post.id_publicacion); 
        const toastLive = document.getElementById('liveToast')
        if (toastLive) {
          const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
          this.mensajeToast = response.message
          toastBootstrap.show()
        }
      },
      error:(response)=>{
        const toastLive = document.getElementById('liveToastError')
        if (toastLive) {
          const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
          this.mensajeToast = response.error.message
          toastBootstrap.show();
        }
      }
    })
  }
  clickPost(idPost:string){
    this.router.navigate(['post' , idPost ])
  }
}
