import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-footer-form',
  templateUrl: './footer-form.component.html',
  styleUrls: ['./footer-form.component.css']
})
export class FooterFormComponent implements OnInit {

  @Input() loading: boolean;
  @Input() success: boolean;

  @Input() loadingDelete: boolean;
  @Input() successDelete: boolean;
  @Input() deleteFn: () => void;

  constructor() { }

  ngOnInit(): void {
  }

}
