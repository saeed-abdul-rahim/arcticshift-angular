import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class NavbarService {

  private sidebarOpened = new BehaviorSubject<boolean>(false);
  private atScrollBottom = new BehaviorSubject<boolean>(false);

  private sidebarOpened$ = this.sidebarOpened.asObservable();
  private atScrollBottom$ = this.atScrollBottom.asObservable();

  constructor() { }

  setSidebarOpened(open: boolean) {
    this.sidebarOpened.next(open);
  }

  getSidebarOpened() {
    return this.sidebarOpened$;
  }

  setAtScrollBottom(bottom: boolean) {
    this.atScrollBottom.next(bottom);
  }

  getAtScrollBottom() {
    return this.atScrollBottom$;
  }

}
