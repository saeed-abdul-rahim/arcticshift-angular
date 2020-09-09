import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';

import { AuthService } from '@services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { inOut } from 'app/animations/inOut';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [inOut]
})
export class LoginComponent implements OnInit {

  faCheckCircle = faCheckCircle;

  loading: boolean;
  success: boolean;
  emailDanger: boolean;
  passwordDanger: boolean;

  signInForm: FormGroup;

  currentDate = new Date();

  constructor(private formbuilder: FormBuilder, private auth: AuthService,
              private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.signInForm = this.formbuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get signInFormControls() { return this.signInForm.controls; }

  async onSubmit() {
    const { email, password } = this.signInFormControls;
    if (this.signInForm.invalid) {
      if (email.errors) {
        this.emailDanger = true;
      }
      if (password.errors) {
        this.passwordDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      await this.auth.signIn(email.value, password.value);
      await this.auth.getUser();
      const user = await this.auth.getCurrentUser();
      if (user.shopId) {
      // this.router.navigate(['dashboard'], { relativeTo: this.route });
      }
      this.success = true;
      setTimeout(() => this.success = false, 2000);
    } catch (err) {
      this.success = false;
    }
    this.loading = false;
  }

}
