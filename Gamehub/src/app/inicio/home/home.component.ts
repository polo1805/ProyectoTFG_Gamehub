import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  constructor(
    private router : Router, 
    @Inject(PLATFORM_ID) private platformID : any , 
    private cookieServide : CookieService , 
  ){}
  ngOnInit(): void {
    if(this.cookieServide.check('KEY')){
      this.router.navigate(['/login'])
    }
  }
}
