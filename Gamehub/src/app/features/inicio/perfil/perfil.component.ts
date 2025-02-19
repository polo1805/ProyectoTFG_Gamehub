import { Component, OnDestroy, OnInit , AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SideNavbarComponent } from '../../../services/side-navbar/side-navbar.component';
import { Request } from '../../../core/request.service';
import { KeyService } from '../../../core/keys.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../../services/loading/loading.component';
import { Perfil } from '../../../shared/perfilData';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { FormsModule } from '@angular/forms';
import { NotificarPublicacionService } from '../../../services/notificar-publicacion.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [SideNavbarComponent, LoadingComponent, CommonModule , FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit{
  private subscription!: Subscription;
  @ViewChild('liveToast', { static: false }) liveToast!: ElementRef;  // ElementRef para el toast de éxito
  @ViewChild('liveToastError', { static: false }) liveToastError!: ElementRef; // ElementRef para el toast de error
  constructor(
    private request : Request, 
    private key : KeyService  , 
    private cookieService:CookieService , 
    private router : Router , 
    private route : ActivatedRoute,
    private publicacionService : NotificarPublicacionService,
  ){}

  isLoading : boolean = true; 
  perfil !: Perfil; 
  mismoUsuario : boolean = false;
  idUsuario : string = ''; 
  postsCargados : any[] = [];
  imagenes : any[] = [];
  imagenClick : string = '';
  comentario : string = '';
  mensajeToast : string = '';
  stateToast : string = '';
  iconToast : string = '';
  postComentar : any = {};
  ngOnInit(): void {
    if(history.state.mensajeToast){
      this.mensajeToast = history.state.mensajeToast;
      this.stateToast = history.state.estado;
      this.iconToast = history.state.icon;
      this.mostrarToast();
      setTimeout(()=>{
        window.history.replaceState({} , '' , this.router.url);
      } , 100 )
    }
    if (!this.cookieService.check('KEY') && this.key.USERNAME == '') {
      this.router.navigate(['/login']);
    } else {

      this.route.paramMap.subscribe(params => {
        const username = params.get('username');
        this.loadPerfil(username);
      });
    }

  }
  ngOnDestroy(): void {
  }
  loadPerfil(username: string | null):void {

    this.request.getPerfil(username).subscribe({
      next: (response) => {
        console.log(response);
        if (this.key.USERNAME == '') {
          this.key.USERNAME = response.message.NOMBRE_USUARIO;
        }
        if (username === this.key.USERNAME) {
          this.mismoUsuario = true; 
        }
        console.log(this.key);
        this.idUsuario= response.message.ID_USUARIO
        this.perfil = new Perfil(
          response.message.BIOGRAFIA,
          response.message.IMAGEN,
          response.message.NOMBRE,
          response.message.NOMBRE_USUARIO
        );
        this.request.getPostPerfil(this.idUsuario).subscribe({
          next:(response)=>{
            this.postsCargados = response.message;
            console.log(this.postsCargados);
            for(let i = 0 ; i < this.postsCargados.length ; i++){
              this.request.verJuego(this.postsCargados[i].id_juego).subscribe({
                next: (response)=>{
                  this.postsCargados[i]['juego'] = response.message;
                  this.postsCargados[i]['imagen'] = JSON.parse(this.postsCargados[i].imagen)
                  this.request.getLikes(this.idUsuario , this.postsCargados[i].id_publicacion).subscribe({
                    next:(response)=>{
                      this.postsCargados[i].LIKES = response.message
                      this.request.getNumeroComentarios(this.postsCargados[i].id_publicacion).subscribe({
                        next:(response)=>{
                          this.postsCargados[i].COMENTARIOS = response.message
                        }
                      })
                    }
                  })
                  this.postsCargados[i]['like'] = false
                }
              })
            }
            console.log(this.postsCargados)
          }
        })
      },
      error: (error) => {
        console.log(error);
        if (error.error.status == 401) {
          this.router.navigate(['/login']);
        }
      },
      complete: () => {
        console.log('getPerfil completado');
        this.isLoading = false;
      }
    });
  }
  clickImagen(imagen : string){
    this.imagenClick = `http://localhost/uploads/fotosPost/${imagen}`;
    
    // Abre el modal de Bootstrap
    const modalElement = document.getElementById('imagenModal');
    if (modalElement) {
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
  esArray(value : any){
    return Array.isArray(value) && value.length > 0
  }
  clickComentar(post : any){
    this.postComentar = post;
    const modalElement = document.getElementById('comentarioModal');
    if(modalElement){
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
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
        this.postComentar.COMENTARIOS.N_COMENTARIOS = this.postComentar.COMENTARIOS.N_COMENTARIOS +1
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
  clickEliminar(post : any){
    this.request.eliminarPostPerfil(post.id_publicacion).subscribe({
      next:(response)=>{
        console.log(response);
        this.postsCargados = this.postsCargados.filter(p => p.id_publicacion !== post.id_publicacion); 
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
  mostrarToast(){
    const toastLive = document.getElementById('liveToast');
    if (toastLive) {
      const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
      toastBootstrap.show();
    }
  }
}
