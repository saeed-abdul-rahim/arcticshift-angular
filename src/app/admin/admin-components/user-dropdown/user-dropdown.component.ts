import { Component, OnInit } from '@angular/core';
import { faUser } from '@fortawesome/free-regular-svg-icons/faUser';
import { AuthService } from '@services/auth/auth.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.css']
})
export class UserDropdownComponent implements OnInit {

  faUser = faUser;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  signOut() {
    console.log('hi');
    this.authService.signOut();
  }

}
