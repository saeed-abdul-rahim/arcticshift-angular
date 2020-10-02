import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  @Output() modalChange = new EventEmitter<boolean>();
  @Input() showModal: boolean;
  @Input() size: 'small' | 'medium' | 'large';
  @Input() heading: string;
  @Input() bodyTemplate: TemplateRef<any>;

  constructor() { }

  ngOnInit(): void {
  }

  toggleModal() {
    this.showModal = !this.showModal;
    this.modalChange.emit(this.showModal);
  }

}
