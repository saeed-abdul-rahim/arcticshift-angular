import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './spinner/spinner.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';
import { NotificationDropdownComponent } from './notification-dropdown/notification-dropdown.component';
import { ButtonComponent } from './button/button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';


@NgModule({
  declarations: [
    SpinnerComponent,
    UserDropdownComponent,
    NotificationDropdownComponent,
    ButtonComponent,
    ProgressBarComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
    SpinnerComponent,
    UserDropdownComponent,
    NotificationDropdownComponent,
    ButtonComponent,
    ProgressBarComponent
  ]
})
export class ComponentsModule { }
