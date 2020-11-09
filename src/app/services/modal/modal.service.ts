import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class ModalService {

  showSignInModal = new BehaviorSubject<boolean>(false);
  showSignInModal$ = this.showSignInModal.asObservable();

  constructor() { }

  setShowSignInModal(showSignInModal: boolean) {
    this.showSignInModal.next(showSignInModal);
  }

  getShowSignInModal() {
    return this.showSignInModal$;
  }

}
