import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';
import { ImageCropperModule } from 'ngx-image-cropper';

import { DragAndDropDirective } from '@directives/DragAndDrop.directive';
import { ComponentsModule } from '@components/components.module';

import { TileComponent } from './tile/tile.component';
import { FooterFormComponent } from './footer-form/footer-form.component';
import { UploadComponent } from './upload/upload.component';
import { NotificationDropdownComponent } from './notification-dropdown/notification-dropdown.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';
import { CatalogTabListComponent } from './catalog-tab-list/catalog-tab-list.component';
import { CatalogModalListComponent } from './catalog-modal-list/catalog-modal-list.component';
import { AlertService } from '@services/alert/alert.service';


@NgModule({
  declarations: [
    DragAndDropDirective,
    TileComponent,
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
    DragDropModule,
    MatTableModule,
    ImageCropperModule
  ],
  exports: [
    ComponentsModule,
    MatTableModule,
    TileComponent,
    FooterFormComponent,
    UploadComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
    CatalogTabListComponent,
    CatalogModalListComponent
  ],
  providers: [
    AlertService
  ]
})
export class AdminComponentsModule { }
