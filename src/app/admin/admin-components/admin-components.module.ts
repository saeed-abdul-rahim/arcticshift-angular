import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DragAndDropDirective } from '@directives/DragAndDrop.directive';
import { ComponentsModule } from '@components/components.module';

import { TileComponent } from './tile/tile.component';
import { CardComponent } from './card/card.component';
import { FooterFormComponent } from './footer-form/footer-form.component';
import { UploadComponent } from './upload/upload.component';
import { NotificationDropdownComponent } from './notification-dropdown/notification-dropdown.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';
import { CatalogTabListComponent } from './catalog-tab-list/catalog-tab-list.component';
import { CatalogModalListComponent } from './catalog-modal-list/catalog-modal-list.component';


@NgModule({
  declarations: [
    DragAndDropDirective,
    TileComponent,
    CardComponent,
    FooterFormComponent,
    UploadComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
    CatalogTabListComponent,
    CatalogModalListComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    MatTableModule
  ],
  exports: [
    ComponentsModule,
    MatTableModule,
    FontAwesomeModule,
    TileComponent,
    CardComponent,
    FooterFormComponent,
    UploadComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
    CatalogTabListComponent,
    CatalogModalListComponent
  ]
})
export class AdminComponentsModule { }
