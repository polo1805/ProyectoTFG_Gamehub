import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet , 
    FormsModule , 
    CommonModule , 
    ReactiveFormsModule , 
    ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css' , 
})
export class AppComponent {
  title = 'Gamehub';
}