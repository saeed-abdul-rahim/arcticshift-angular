import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IvyCarouselModule } from 'angular-responsive-carousel';

import { ShopRoutingModule } from './shop-routing.module';
import { ShopComponent } from './shop.component';
import { HomeComponent } from './home/home.component';
import { ShopComponentsModule } from './shop-components/shop-components.module';
import { NavbarComponent } from './navbar/navbar.component';


@NgModule({
  declarations: [
    ShopComponent,
    HomeComponent,
    NavbarComponent
  ],
  imports: [
    CommonModule,
    ShopRoutingModule,
    ShopComponentsModule,
    IvyCarouselModule
  ]
})
export class ShopModule { }
