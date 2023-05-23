import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';


@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
/* The PredictionComponent class initializes a chart with data and labels for sales prediction. */
export class PredictionComponent implements OnInit {
  public labelss: string[] = [];
  public datas: number[] = [];
  chartData: any = [];

  R2: any = [];

  /* The `constructor` initializes a private `route` property of type `ActivatedRoute`, which is used
  to access the current route's parameters, data, and query strings. */
  constructor(private route: ActivatedRoute) { }
  isLineChartVisible = true;

  toggleChart(): void {
    this.isLineChartVisible = !this.isLineChartVisible;
  }


  /* `chatdata` is an object that defines the data and labels for a chart. It has two properties:
  `labels` and `datasets`. `labels` is an array of strings that represent the labels for the x-axis
  of the chart. `datasets` is an array of objects that represent the data to be plotted on the
  chart. In this case, there is only one dataset object, which has a label of 'Sales Prediction', an
  array of numbers for the y-axis data, and some styling properties for the chart line. The
  `this.labelss` and `this.datas` properties are used to populate the `labels` and `data` properties
  of the `datasets` object, respectively. */
  chatdata = {
    labels: this.labelss,
    datasets: [{
      label: 'Sales Prediction',
      data: this.datas,
      fill: false,
      borderColor: 'rgb(0, 0, 0)',
      tension: 0.1,

    }]
  };

  /**
   * The function initializes chart data by extracting and processing data from the previous state and
   * logging it to the console.
   */
  ngOnInit(): void {
    this.chartData = history.state.chartData;
    this.chartData = this.chartData.slice(2)
    this.chartData.map((row: any) => {

      if (row.length > 1) {
        this.labelss.push(row[0] as string);
        this.datas.push(Number(row[1]) as number);
      }
      this.R2 = history.state.R2;
    });
    console.log('Chart Data:', this.chartData);
  }

}