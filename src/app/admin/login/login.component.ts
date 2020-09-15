import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';

import { AuthService } from '@services/auth/auth.service';
import { Router } from '@angular/router';
import { inOut } from '@animations/inOut';

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

  constructor(private formbuilder: FormBuilder, private auth: AuthService, private router: Router) {
    this.isShopUser().then(user => {
      if (user) {
        this.toDashboard();
      }
    });
  }

  ngOnInit(): void {
    this.signInForm = this.formbuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get signInFormControls() { return this.signInForm.controls; }
  get emailControl() { return this.signInForm.controls.email; }
  get passwordControl() { return this.signInForm.controls.password; }

  validForm() {
    const { email, password } = this.signInFormControls;
    if (email.errors) {
      this.emailDanger = true;
      return false;
    }
    if (password.errors) {
      this.passwordDanger = true;
      return false;
    }
    return { email, password };
  }

  async onSubmit() {
    const isValidForm = this.validForm();
    if (!isValidForm) { return; }
    const { email, password } = isValidForm;
    this.loading = true;
    try {
      await this.auth.signIn(email.value, password.value);
      const isShopUser = await this.isShopUser();
      if (isShopUser) {
        this.success = true;
        setTimeout(() => this.success = false, 2000);
        this.toDashboard();
      } else {
        this.emailDanger = true;
        this.passwordDanger = true;
      }
    } catch (err) {
      this.success = false;
      this.emailDanger = true;
      this.passwordDanger = true;
    }
    this.loading = false;
  }

  async isShopUser() {
    console.log('hi');
    this.loading = true;
    try {
      this.loading = false;
      return this.auth.isShopUser();
    } catch (_) {
      this.loading = false;
      return false;
    }
  }

  toDashboard() {
    this.router.navigateByUrl('admin');
  }

}
