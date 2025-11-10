import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Language support
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

export function createTranslateLoader(http: HttpClient): any {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

// Interceptors
import { AuthInterceptor } from './core/interceptors/auth-interceptor.service';

// Modules
import { SharedModule } from './shared/shared.module';
import { CacheService } from './core/services/cache/cache.service';
import { CacheInterceptor } from './core/interceptors/cache-interceptor.service';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoadingService } from './core/services/common/loading.service';



@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    SharedModule,
    NgxSpinnerModule,
    AppRoutingModule // Keep this last for routing
  ],
  providers: [
    CacheService,
    LoadingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true
    },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   // useClass: TokenInterceptorService,
    //   multi: true
    // },
    // {
    //   provide: ErrorHandler,
    //   // useClass: GlobalErrorHandlerService
    // }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }