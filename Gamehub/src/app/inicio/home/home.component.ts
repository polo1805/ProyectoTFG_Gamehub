import { Component, Inject, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SideNavbarComponent } from '../../services/side-navbar/side-navbar.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SideNavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  constructor(
    private router : Router,
    private cookieService : CookieService , 
  ){}
  ngOnInit(): void {
    if(!this.cookieService.check('KEY')){
      this.router.navigate(['/login'])
      
    }
  }
}
