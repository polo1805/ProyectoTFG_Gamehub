import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KeyService } from '../../core/keys.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-side-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './side-navbar.component.html',
  styleUrl: './side-navbar.component.css'
})
export class SideNavbarComponent implements OnInit{
  constructor(
    public  key : KeyService , 
    public cookieService: CookieService , 
    public router: Router, 
  ){}
  
  ngOnInit(): void {
  }
  cerrarSesion(){
    this.key.cerrarSesion();
    this.cookieService.delete('KEY');
    this.router.navigate(['/login']);
  }
}
