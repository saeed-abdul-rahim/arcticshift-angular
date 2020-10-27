import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
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


@NgModule({
  declarations: [
    DragAndDropDirective,
    TileComponent,
    CardComponent,
    FooterFormComponent,
    UploadComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
    CatalogTabListComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    MatTableModule,
    MatPaginatorModule,
    FontAwesomeModule
  ],
  exports: [
    TileComponent,
    CardComponent,
    FooterFormComponent,
    UploadComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
    CatalogTabListComponent
  ]
})
export class AdminComponentsModule { }
