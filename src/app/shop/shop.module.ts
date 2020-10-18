import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IvyCarouselModule } from 'angular-responsive-carousel';

import { ComponentsModule } from '@components/components.module';

import { ShopRoutingModule } from './shop-routing.module';
import { ShopComponent } from './shop.component';
import { HomeComponent } from './home/home.component';
import { ShopComponentsModule } from './shop-components/shop-components.module';
import { NavbarComponent } from './navbar/navbar.component';
import { ProductListComponent } from './product-list/product-list.component';
import { AuthService } from '@services/auth/auth.service';
import { FilterProductComponent } from './filter-product/filter-product.component';
import { ProductService } from '@services/product/product.service';


@NgModule({
  declarations: [
    ShopComponent,
    HomeComponent,
    NavbarComponent,
    ProductListComponent,
    FilterProductComponent
  ],
  imports: [
    CommonModule,
    ShopRoutingModule,
    ComponentsModule,
    ShopComponentsModule,
    FontAwesomeModule,
    IvyCarouselModule
  ],
  providers: [
    AuthService,
    ProductService
  ]
})
export class ShopModule { }
