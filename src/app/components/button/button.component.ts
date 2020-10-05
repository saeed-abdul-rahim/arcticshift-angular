import { Component, OnInit, Input } from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { inOut } from '@animations/inOut';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
  animations: [inOut]
})
export class ButtonComponent implements OnInit {

  @Input() fullWidth: boolean;
  @Input() loading: boolean;
  @Input() success: boolean;
  @Input() label: string;
  @Input() color = 'blue';
  @Input() dark: boolean;
  @Input() submit = false;

  faCheck = faCheck;

  constructor() { }

  ngOnInit(): void {
  }

}
