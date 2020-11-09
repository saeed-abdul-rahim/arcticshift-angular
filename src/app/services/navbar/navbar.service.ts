import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';

@Injectable()
export class NavbarService {

  private sidebarOpened = new BehaviorSubject<boolean>(false);
  private sidebarOpened$ = this.sidebarOpened.asObservable();

  constructor() { }

  setSidebarOpened(open: boolean) {
    this.sidebarOpened.next(open);
  }

  getSidebarOpened(): Observable<boolean> {
    return this.sidebarOpened$;
  }

}
