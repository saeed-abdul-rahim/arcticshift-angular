import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TimeagoModule } from 'ngx-timeago';
import { ClickOutsideModule } from 'ng-click-outside';

import { SpinnerComponent } from './spinner/spinner.component';
import { ButtonComponent } from './button/button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { ModalComponent } from './modal/modal.component';
import { CounterInputComponent } from './counter-input/counter-input.component';
import { TabComponent } from './tab/tab.component';
import { AlertComponent } from './alert/alert.component';
import { CardComponent } from './card/card.component';


@NgModule({
  declarations: [
    SpinnerComponent,
    ButtonComponent,
    ProgressBarComponent,
    DropdownComponent,
    ModalComponent,
    CounterInputComponent,
    TabComponent,
    AlertComponent,
    CardComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    ClickOutsideModule,
    NgSelectModule,
    TimeagoModule,
    FontAwesomeModule,
    SpinnerComponent,
    ButtonComponent,
    ProgressBarComponent,
    DropdownComponent,
    ModalComponent,
    CounterInputComponent,
    TabComponent,
    AlertComponent,
    CardComponent,
  ]
})
export class ComponentsModule { }
