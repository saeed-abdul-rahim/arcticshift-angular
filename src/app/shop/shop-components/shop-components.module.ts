import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ProductCardComponent } from './product-card/product-card.component';
import { AngularOntouchModule } from 'angular-ontouch';



@NgModule({
  declarations: [
    ProductCardComponent,
  ],
  imports: [
    CommonModule,
    AngularOntouchModule,
    FontAwesomeModule
  ],
  exports: [
    ProductCardComponent
  ]
})
export class ShopComponentsModule { }
