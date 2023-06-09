import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
/* The LoginComponent class initializes form data and checks if authentication is possible through the
AuthService. */
export class LoginComponent implements OnInit {
  formdata = {
    email: '',
    pass: ''
  };
  submit = false;
  loading = false;
  errorMessage = "";
  constructor(private auth: AuthService) {

  }

  ngOnInit(): void {
    this.auth.canAuthenticate();
  }

  /**
   * This function handles the submission of login credentials, logs the user in, and displays error
   * messages if necessary.
   */
  onSubmit() {
    this.loading = true;

    this.auth.login(this.formdata.email, this.formdata.pass)
      .subscribe({
        next: data => {
          this.auth.storeToken(data.idToken);
          console.log("logged user token is " + data.idToken);
          this.auth.canAuthenticate();
        },
        error: data => {
          if (data.error.error.message == "INVALID_PASSWORD" || data.error.error.message == "INVALID_EMAIL") {
            this.errorMessage = "Invalid Cridentails!";
          } else {
            this.errorMessage = "Unknown error occured when logging into this account!!"
          }
        }
      }).add(() => {
        this.loading = false;
        console.log("Login process completed");

      });

  }
}
