import { Component, Input, OnInit, TemplateRef } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }

  toggleTabs($tabNumber: number){
    this.openTab = $tabNumber;
  }

}
