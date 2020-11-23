import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AngularOntouchModule } from 'angular-ontouch';

import { ComponentsModule } from '@components/components.module';
import { ProductCardComponent } from './product-card/product-card.component';
import { EmptyPageComponent } from './empty-page/empty-page.component';
import { RouterModule } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';



@NgModule({
  declarations: [
    ProductCardComponent,
    ProductListComponent,
    EmptyPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ComponentsModule,
    AngularOntouchModule,
    FontAwesomeModule
  ],
  exports: [
    ProductCardComponent,
    ProductListComponent,
    EmptyPageComponent
  ]
})
export class ShopComponentsModule { }
