import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// for any task , build service . ng generate serve 
// dependency and injection
//services, more reusable than component
// 

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private http: HttpClient) { }

  isAuthenticated(): boolean {
    if (sessionStorage.getItem('token') !== null) {
      return true;
    }

    return false;
  }

  /**
   * The function checks if the user is authenticated and navigates to the login page if they are not.
   */
  canAcces() {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }
 /**
  * The function checks if the user is authenticated and navigates to the dashboard if they are.
  */
  canAuthenticate() {
    if (this.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * This function registers a user by sending a POST request to a Google API endpoint with the user's
   * name, email, and password.
   * @param {string} name - A string representing the name of the user registering for an account.
   * @param {string} email - The email parameter is a string that represents the email address of the
   * user who wants to register. It is used to identify the user and to send them important information
   * related to their account, such as password reset links or account verification emails.
   * @param {string} pass - "pass" is a parameter that represents the password that the user wants to
   * use for their account registration. It is a string data type.
   * @returns an HTTP POST request to the Google Identity Toolkit API endpoint for creating a new user
   * account. The request includes the user's display name, email, and password as parameters. The API
   * will respond with an ID token that can be used for authentication purposes. The function returns a
   * Promise that resolves to an object with the ID token as a string.
   */
  register(name: string, email: string, pass: string) {

    return this.http.post<{ idToken: string }>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDdkGuJ99Uhz8l_IbKE_78VNh5E7BiHfSY',
      { displayName: name, email: email, password: pass });

  }


  /**
   * The function stores a token in the session storage.
   * @param {string} token - string - a variable that holds a string value, which is the token that
   * needs to be stored in the session storage.
   */
  storeToken(token: string) {
    sessionStorage.setItem('token', token);
  }

  /**
   * This function sends a POST request to the Google Identity Toolkit API to authenticate a user's
   * email and password.
   * @param {string} email - The email address of the user trying to log in.
   * @param {string} pass - The `pass` parameter is a string representing the password entered by the
   * user during the login process.
   * @returns an HTTP POST request to the Google Identity Toolkit API endpoint for signing in with a
   * password. The request includes the user's email and password as parameters. The API will respond
   * with an ID token, which is a JSON Web Token (JWT) that can be used to authenticate the user in
   * subsequent requests. The function returns an Observable that emits the response as an object with
   * a single property
   */
  login(email: string, pass: string) {
    return this.http.post<{ idToken: string }>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDdkGuJ99Uhz8l_IbKE_78VNh5E7BiHfSY',
      { email: email, password: pass }

    );
  }

  /**
   * This function removes the 'token' item from the sessionStorage.
   */
  removeToken() {
    sessionStorage.removeItem('token');
  }

} 