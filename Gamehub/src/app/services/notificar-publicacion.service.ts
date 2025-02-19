import { Injectable } from '@angular/core';
import { Subject} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NotificarPublicacionService {
  private publicacionRealizada = new Subject<boolean>();
  publicacionRealizada$  = this.publicacionRealizada.asObservable();
  notificarPublicacion(resultado : boolean){
    this.publicacionRealizada.next(true);
  }
  constructor() { }
}
