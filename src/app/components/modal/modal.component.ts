import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { inOut, inOut5 } from '@animations/inOut';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  animations: [inOut, inOut5]
})
export class ModalComponent implements OnInit {

  @Input() showModal: boolean;
  @Input() size: 'small' | 'medium' | 'large';
  @Input() buttonLabel = 'Save';
  @Input() buttonColor = 'blue';
  @Input() submit = true;

  @Input() loading: boolean;
  @Input() success: boolean;

  @Input() heading: string;
  @Input() bodyTemplate: TemplateRef<any>;

  @Output() showModalChange = new EventEmitter<boolean>();
  @Output() modalCallback = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  toggleModal() {
    this.showModal = !this.showModal;
    this.showModalChange.emit(this.showModal);
  }

  modalFn() {
    this.modalCallback.emit();
  }

}
