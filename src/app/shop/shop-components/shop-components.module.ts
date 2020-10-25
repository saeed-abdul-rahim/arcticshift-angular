import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AngularOntouchModule } from 'angular-ontouch';

import { ComponentsModule } from '@components/components.module';
import { ProductCardComponent } from './product-card/product-card.component';
import { EmptyPageComponent } from './empty-page/empty-page.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ProductCardComponent,
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
    EmptyPageComponent
  ]
})
export class ShopComponentsModule { }
