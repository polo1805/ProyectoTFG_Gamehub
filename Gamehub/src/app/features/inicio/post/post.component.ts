import { Component, OnInit } from '@angular/core';
import { SideNavbarComponent } from '../../../services/side-navbar/side-navbar.component';
import { Request } from '../../../core/request.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-post',
  standalone: true,
  imports: [SideNavbarComponent, CommonModule , FormsModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent implements OnInit {
  constructor(
    private request: Request,
    private route: ActivatedRoute , 
    private router : Router , 
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
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.idPost = params.get('id');
    })
    this.request.cargarPost(this.idPost).subscribe({
      next: (response) => {
        this.datosPost = response.message;
        console.log(this.datosPost)
        this.idUsuario = this.datosPost.id_usuario;
        this.idJuego = this.datosPost.id_juego;
        this.request.getPerfil().subscribe({
          next: (response) => {
            this.datosPost['USUARIO'] = response.message;
            console.log(this.datosPost);
            if(this.idUsuario == response.message.ID_USUARIO){
              this.mismoUsuario = true;
            }
            this.username = response.message.USERNAME
            this.request.verJuego(this.idJuego).subscribe({
              next: (response) => {
                this.datosPost['JUEGO'] = response.message;
                console.log(this.datosPost);
                if(this.idPost){
                  this.request.getLikes(this.idPost , this.idUsuario).subscribe({
                    next:(response)=>{
                      this.datosPost['LIKES'] = response.message;
                      if(this.idPost){
                        this.request.getNumeroComentarios(this.idPost).subscribe({
                          next:(response)=>{
                            this.datosPost['COMENTARIOS'] = response.message ; 
                          }
                        })
                      }
                    }
                  })
                } 
              }
            })
          }
        });
      }
    })
    this.request.cargarComentarios(this.idPost).subscribe({
      next:(response)=>{
        this.arrayComentarios = response.message;
        console.log(this.arrayComentarios);
        for(let comentario of this.arrayComentarios){
          this.request.getUsuario(comentario.ID_USUARIO).subscribe({
            next:(response)=>{
              comentario['USUARIO']= response.message;
            }
          })
        }
      }
    })


  }
  
  esArray(value: any) {
    return Array.isArray(value) && value.length > 0
  }
  clickImagen(imagen: string) {
    this.imagenClick = `http://localhost/uploads/fotosPost/${imagen}`;

    const modalElement = document.getElementById('imagenModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  clickEliminar(post : any){
    this.request.eliminarPostPerfil(post.id_publicacion).subscribe({
      next:(response)=>{
        this.router.navigate([`/${this.username}`])
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
  clickComentar(post : any){
    this.postComentar = post ; 
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
  subirComentario(){
    this.request.anadirComentario(this.idUsuario ,this.postComentar.id_publicacion , this.comentario).subscribe({
      next: (response)=>{
        console.log(response);

        const toastLive = document.getElementById('liveToast')
        if (toastLive) {
          const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
          this.mensajeToast = response.message
          toastBootstrap.show();
        }
        this.datosPost.COMENTARIOS.N_COMENTARIOS = this.datosPost.COMENTARIOS.N_COMENTARIOS +1
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
}
