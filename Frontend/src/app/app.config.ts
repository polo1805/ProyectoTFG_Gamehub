import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideToastr, ToastrModule } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration() , 
    provideHttpClient(withFetch()) , 
    BrowserAnimationsModule , 
    provideToastr({
      timeOut:3000 , 
      positionClass:'toast-top-right' , 
      preventDuplicates:true
    }),
    importProvidersFrom(BrowserAnimationsModule)]

  
};
