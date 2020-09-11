import { Component, OnInit, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  @Input() heading: string;
  @Input() actions: TemplateRef<any>;
  @Input() body: TemplateRef<any>;

  constructor() { }

  ngOnInit(): void {
  }

}
