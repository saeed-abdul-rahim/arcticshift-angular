import { Component, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {

  open = false;
  @Input() rightAligned: boolean;
  @Input() buttonTemplate: TemplateRef<any>;
  @Input() bodyTemplate: any;

  constructor() { }

  ngOnInit(): void {
  }

  toggleDropdown($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.open = !this.open;
  }

}
