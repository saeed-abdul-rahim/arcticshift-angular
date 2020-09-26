import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ComponentsModule } from '@components/components.module';
import { TileComponent } from './tile/tile.component';
import { CardComponent } from './card/card.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterFormComponent } from './footer-form/footer-form.component';


@NgModule({
  declarations: [
    TileComponent,
    CardComponent,
    NavbarComponent,
    FooterFormComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    FontAwesomeModule,
    
  ],
  exports: [
    TileComponent,
    CardComponent,
    NavbarComponent,
    FooterFormComponent
  ]
})
export class AdminComponentsModule { }
