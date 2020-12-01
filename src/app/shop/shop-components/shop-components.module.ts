import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentsModule } from '@components/components.module';
import { ProductCardComponent } from './product-card/product-card.component';
import { EmptyPageComponent } from './empty-page/empty-page.component';
import { RouterModule } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { CartTotalComponent } from './cart-total/cart-total.component';
import { FilterProductComponent } from './filter-product/filter-product.component';



@NgModule({
  declarations: [
    ProductCardComponent,
    ProductListComponent,
    FilterProductComponent,
    CartTotalComponent,
    EmptyPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ComponentsModule
  ],
  exports: [
    ComponentsModule,
    ProductCardComponent,
    ProductListComponent,
    FilterProductComponent,
    CartTotalComponent,
    EmptyPageComponent
  ]
})
export class ShopComponentsModule { }
