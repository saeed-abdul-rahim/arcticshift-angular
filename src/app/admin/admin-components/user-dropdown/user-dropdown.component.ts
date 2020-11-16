import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ADMIN, LOGIN } from '@constants/routes';
import { faUser } from '@fortawesome/free-regular-svg-icons/faUser';
import { AlertService } from '@services/alert/alert.service';
import { AuthService } from '@services/auth/auth.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.css']
})
export class UserDropdownComponent implements OnInit {

  faUser = faUser;
  loginRoute = `/${ADMIN}/${LOGIN}`;

  constructor(private auth: AuthService, private router: Router, private alert: AlertService) { }

  ngOnInit(): void {
  }

  async signOut() {
    try {
      await this.auth.signOut();
      this.router.navigateByUrl(this.loginRoute);
    } catch (err) {
      this.alert.alert({ message: err.message });
    }
  }

}
