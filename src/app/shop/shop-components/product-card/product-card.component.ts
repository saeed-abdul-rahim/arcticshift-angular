import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { inOut } from '@animations/inOut';
import { slideInOut } from '@animations/slideInOut';
import { faHeart as faHeartR } from '@fortawesome/free-regular-svg-icons/faHeart';
import { faHeart as faHeartS } from '@fortawesome/free-solid-svg-icons/faHeart';

type Image = {
  url: string;
  title: string;
};

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  animations: [inOut, slideInOut]
})
export class ProductCardComponent implements OnInit {

  @Input() id: string;
  @Input() url: string;
  @Input() images: Image[] = [];
  @Input() heart = false;
  @Input() title: string;
  @Input() strikePrice: string;
  @Input() price: string;

  @Output() heartCallback = new EventEmitter<string>();

  hover = false;
  faHeartR = faHeartR;
  faHeartS = faHeartS;

  constructor() { }

  ngOnInit(): void {
  }

  toggleHover() {
    this.hover = !this.hover;
  }

  heartClick() {
    this.heartCallback.emit(this.id);
  }

}
