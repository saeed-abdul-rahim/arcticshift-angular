import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent implements OnInit {

  @Input() labels: string[];
  @Input() templates: TemplateRef<any>[];
  @Input() color = 'blue';
  @Input() openTab = 0;
  @Output() openTabChange = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  toggleTabs($tabNumber: number){
    this.openTab = $tabNumber;
    this.openTabChange.emit(this.openTab);
  }

}
