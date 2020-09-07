import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './spinner/spinner.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';
import { NotificationDropdownComponent } from './notification-dropdown/notification-dropdown.component';


@NgModule({
  declarations: [
    SpinnerComponent,
    UserDropdownComponent,
    NotificationDropdownComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SpinnerComponent,
    UserDropdownComponent,
    NotificationDropdownComponent
  ]
})
export class ComponentsModule { }
