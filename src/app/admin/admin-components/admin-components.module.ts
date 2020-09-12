import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileComponent } from './tile/tile.component';
import { CardComponent } from './card/card.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ComponentsModule } from '@components/components.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FooterFormComponent } from './footer-form/footer-form.component';



@NgModule({
  declarations: [
    TileComponent,
    CardComponent,
    NavbarComponent,
    SidebarComponent,
    FooterFormComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    FontAwesomeModule
  ],
  exports: [
    TileComponent,
    CardComponent,
    NavbarComponent,
    SidebarComponent,
    FooterFormComponent
  ]
})
export class AdminComponentsModule { }
