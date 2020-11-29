import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
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
  @Input() buttonColor = 'gray';
  @Input() submit = true;
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() enableScroll = true;
  @Input() restrictHeight = true;

  @Input() loading: boolean;
  @Input() success: boolean;

  @Input() heading: string;
  @Input() bodyTemplate: TemplateRef<any>;

  @Output() showModalChange = new EventEmitter<boolean>();
  @Output() modalCallback = new EventEmitter<any>();

  @ViewChild('modalDiv') modal: ElementRef;

  constructor() {
  }

  ngOnInit(): void {
  }

  closeModal() {
    this.showModal = false;
    this.showModalChange.emit(this.showModal);
  }

  modalFn() {
    this.modalCallback.emit();
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
     if (this.modal && !this.modal.nativeElement.contains(event.target)) {
        this.closeModal();
     }
  }

}
