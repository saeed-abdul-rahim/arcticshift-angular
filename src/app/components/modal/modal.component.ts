import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  @Input() showModal: boolean;
  @Input() size: 'small' | 'medium' | 'large';

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
    this.toggleModal();
    this.modalCallback.emit();
  }

}
