import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ComponentsModule } from '@components/components.module';
import { TileComponent } from './tile/tile.component';
import { CardComponent } from './card/card.component';
import { FooterFormComponent } from './footer-form/footer-form.component';
import { UploadComponent } from './upload/upload.component';
import { NotificationDropdownComponent } from './notification-dropdown/notification-dropdown.component';


@NgModule({
  declarations: [
    TileComponent,
    CardComponent,
    FooterFormComponent,
    UploadComponent,
    NotificationDropdownComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    FontAwesomeModule
  ],
  exports: [
    TileComponent,
    CardComponent,
    FooterFormComponent,
    UploadComponent,
    NotificationDropdownComponent
  ]
})
export class AdminComponentsModule { }
