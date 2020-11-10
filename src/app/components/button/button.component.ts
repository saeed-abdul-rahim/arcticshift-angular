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
  @Input() secondary: boolean;
  @Input() loading: boolean;
  @Input() success: boolean;
  @Input() label: string;
  @Input() color = 'blue';
  @Input() dark: boolean;
  @Input() submit = false;
  @Input() large = false;

  faCheck = faCheck;

  constructor() { }

  ngOnInit(): void {
  }

  setBgColor() {
    if (this.secondary) {
      return 'bg-white';
    } else {
      const color = `bg-${this.color}-`;
      return `${color}${this.dark ? '800' : '500'} active:${color}${this.dark ? '800' : '900'} `;
    }
  }

}
