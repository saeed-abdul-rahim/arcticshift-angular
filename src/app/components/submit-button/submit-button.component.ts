import { Component, OnInit, Input } from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import { inOut } from '@animations/inOut';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.css'],
  animations: [inOut]
})
export class SubmitButtonComponent implements OnInit {

  @Input() fullWidth: boolean;
  @Input() loading: boolean;
  @Input() success: boolean;
  @Input() label: string;

  faCheckCircle = faCheckCircle;

  constructor() { }

  ngOnInit(): void {
  }

}
