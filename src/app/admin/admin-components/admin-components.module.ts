import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DragAndDropDirective } from '@directives/DragAndDrop.directive';
import { ComponentsModule } from '@components/components.module';

import { TileComponent } from './tile/tile.component';
import { CardComponent } from './card/card.component';
import { FooterFormComponent } from './footer-form/footer-form.component';
import { UploadComponent } from './upload/upload.component';
import { NotificationDropdownComponent } from './notification-dropdown/notification-dropdown.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';


@NgModule({
  declarations: [
    DragAndDropDirective,
    TileComponent,
    CardComponent,
    FooterFormComponent,
    UploadComponent,
    NotificationDropdownComponent,
    UserDropdownComponent
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
    NotificationDropdownComponent,
    UserDropdownComponent
  ]
})
export class AdminComponentsModule { }
