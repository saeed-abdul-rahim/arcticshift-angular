import { Component, OnInit } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  faBars = faBars;

  collapseShow = 'hidden';

  constructor() { }

  ngOnInit(): void {
  }

  toggleCollapseShow(classes: string) {
    this.collapseShow = classes;
  }

}
