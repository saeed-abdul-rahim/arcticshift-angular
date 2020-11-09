import { Component, OnInit } from '@angular/core';
import { slideInOut } from '@animations/slideInOut';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [slideInOut]
})
export class SidebarComponent implements OnInit {

  displayData: any;
  prevData: any[] = [];
  backLabels: string[] = [];

  data = [
    {
      id: 'hdjksa7dsa90as',
      name: 'MEN',
      subs: [
        {
          id: 'hud8a79',
          name: 'SHIRTS',
          parentId: 'hdjksa7dsa90as',
          subs: [
            { id: 'hjdksal', name: 'T-SHIRTS' },
            { id: 'hds8a98', name: 'SHIRTS' }
          ]
        },
        { id: '898dhah', name: 'PANTS',
        parentId: 'hdjksa7dsa90as' }
      ]
    },
    {
      id: 'hudia8yhusa2eq',
      name: 'WOMEN',
      subs: [
        { id: 'hud8a79', name: 'BAGS' },
        { id: '898dhah', name: 'PURSES' }
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.displayData = this.data;
  }

  toSubmenu(id: string) {
    const subData = this.displayData.find((d: any) => d.id === id);
    if (!subData || !subData.subs || subData.subs.length === 0) {
      return;
    }
    this.prevData.push(this.displayData);
    this.backLabels.unshift(subData.name);
    this.displayData = subData.subs;
  }

  toPrevMenu() {
    this.displayData = this.prevData.pop();
    this.backLabels.shift();
  }

}
