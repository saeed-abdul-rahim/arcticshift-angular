import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAnalyticsModule, ScreenTrackingService } from '@angular/fire/analytics';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { HttpClientModule } from '@angular/common/http';
import { TimeagoModule } from 'ngx-timeago';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '@environment';
import { AuthService } from '@services/auth/auth.service';
import { RequestService } from '@services/request/request.service';
import { PaginationService } from '@services/pagination/pagination.service';
import { ShopService } from '@services/shop/shop.service';
import { DbService } from '@services/db/db.service';
import { SeoService } from '@services/seo/seo.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    AngularFireAnalyticsModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    HttpClientModule,
    TimeagoModule.forRoot()
  ],
  providers: [
    ScreenTrackingService,
    AuthService,
    SeoService,
    RequestService,
    PaginationService,
    DbService,
    ShopService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
