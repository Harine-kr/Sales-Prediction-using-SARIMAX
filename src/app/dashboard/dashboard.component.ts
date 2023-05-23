import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { interval, take } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
/* The DashboardComponent class is responsible for handling file uploads, parsing CSV data, and
starting a countdown timer. */
export class DashboardComponent implements OnInit {
  private file!: File;
  private periodicity!: string;
  private periods!: number;
  csvData: string[][] = [];
  timer: number = 60;
  showTimer: boolean = false;
  countdownValue = '';


/**
 * This is a constructor function that takes in three parameters: an AuthService object, an HttpClient
 * object, and a Router object.
 * @param {AuthService} auth - AuthService is a service that handles authentication and authorization
 * in the application.
 * @param {HttpClient} http - The `http` parameter is an instance of the `HttpClient` class, which is
 * used to make HTTP requests to a server. It allows the application to communicate with a backend API
 * and retrieve data from it.
 * @param {Router} router - The `router` parameter is an instance of the Angular `Router` service,
 * which provides navigation and URL manipulation capabilities for Angular applications. It allows you
 * to navigate between different views and components in your application by changing the URL in the
 * browser's address bar. The `Router` service also provides features such
 */
  constructor(private auth: AuthService, private http: HttpClient, private router: Router) { }

  /**
   * The ngOnInit function calls the canAcces function and starts a countdown for 10 seconds.
   */
  ngOnInit(): void {
    this.auth.canAcces();
    this.startCountdown(10);
  }

  /**
   * This function starts a countdown timer for a specified duration and performs an action or submits
   * a form when the countdown reaches zero.
   * @param {number} duration - The duration parameter is a number that represents the total duration
   * of the countdown in seconds.
   */
  startCountdown(duration: number) {
    this.showTimer = true;
    const timer$ = interval(1000).pipe(take(duration));
    timer$.subscribe((count) => {
      const remainingSeconds = duration - count - 1;
      this.countdownValue = `${remainingSeconds} seconds`;
      if (remainingSeconds <= 0) {
        this.showTimer = false;
        // Perform any action or submit the form when the countdown reaches zero
      }
    });
  }


  onFileSelected(event: any): void {
    this.file = event.target.files[0];
  }

  /**
   * The onSubmit function uploads a CSV file to a server, parses the response, and navigates to a new
   * page with the parsed data and R2 value.
   */
  onSubmit(): void {
    this.showTimer = true;
    this.startTimer();

    /* `const formData = new FormData();` creates a new instance of the `FormData` object, which is
    used to construct a set of key/value pairs representing form fields and their values. */
    const formData = new FormData();
    formData.append('csvFile', this.file);
    formData.append('periodicity', this.periodicity);
    formData.append('periods', this.periods.toString());

/* This code is sending a POST request to a server at the URL 'http://127.0.0.1:5000/' with a FormData
object containing a CSV file and some additional data. It then subscribes to the response from the
server and parses the CSV data from the response using the `parseCSV` function. It also extracts the
R2 value from the response and navigates to a new page with the parsed CSV data and R2 value as
state parameters. */
    this.http.post('http://127.0.0.1:5000/', formData, { responseType: 'text' }).subscribe(
      (response) => {

        console.log('File uploaded successfully');
        let lines = response.split("\n");
        let r2 = lines.slice(0, 1).join("\n");
        console.log(r2);
        this.csvData = this.parseCSV(response)
        this.router.navigate(['/prediction'], { state: { chartData: this.csvData, R2: r2 } });

      },
      (error) => {
        console.error('File upload failed', error.message);
      }
    );
  }

  onPeriodicityChange(event: any): void {
    this.periodicity = event.target.value;
  }

  onPeriodsChange(event: any): void {
    this.periods = event.target.value;
  }
  private parseCSV(csv: string): string[][] {
    const rows: string[] = csv.split('\r\n');
    const data: string[][] = [];
    console.log(rows)
    rows.forEach(row => {
      data.push(row.split(','));
    });
    return data;
  }
  startTimer() {

    const intervalId = setInterval(() => {
      this.timer -= 1;
      if (this.timer <= 0) {

        clearInterval(intervalId);
        this.showTimer = false;
        this.timer = 60;
      }
    }, 1000);
  }
}