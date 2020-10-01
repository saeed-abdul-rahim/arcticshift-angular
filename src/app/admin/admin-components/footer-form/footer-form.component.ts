import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-footer-form',
  templateUrl: './footer-form.component.html',
  styleUrls: ['./footer-form.component.css']
})
export class FooterFormComponent implements OnInit {

  @Input() loading: boolean;
  @Input() success: boolean;

  @Input() showDelete: boolean;
  @Input() loadingDelete: boolean;
  @Input() successDelete: boolean;
  @Output() deleteCallback = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  deleteFn() {
    this.deleteCallback.emit();
  }

}
