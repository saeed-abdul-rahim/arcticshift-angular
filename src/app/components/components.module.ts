import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './spinner/spinner.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';
import { NotificationDropdownComponent } from './notification-dropdown/notification-dropdown.component';
import { SubmitButtonComponent } from './submit-button/submit-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@NgModule({
  declarations: [
    SpinnerComponent,
    UserDropdownComponent,
    NotificationDropdownComponent,
    SubmitButtonComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
    SpinnerComponent,
    UserDropdownComponent,
    NotificationDropdownComponent,
    SubmitButtonComponent
  ]
})
export class ComponentsModule { }
