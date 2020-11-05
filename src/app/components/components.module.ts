import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpinnerComponent } from './spinner/spinner.component';
import { ButtonComponent } from './button/button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { ModalComponent } from './modal/modal.component';
import { CounterInputComponent } from './counter-input/counter-input.component';
import { TabComponent } from './tab/tab.component';
import { AlertComponent } from './alert/alert.component';


@NgModule({
  declarations: [
    SpinnerComponent,
    ButtonComponent,
    ProgressBarComponent,
    DropdownComponent,
    ModalComponent,
    CounterInputComponent,
    TabComponent,
    AlertComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
    SpinnerComponent,
    ButtonComponent,
    ProgressBarComponent,
    DropdownComponent,
    ModalComponent,
    CounterInputComponent,
    TabComponent,
    AlertComponent
  ]
})
export class ComponentsModule { }
