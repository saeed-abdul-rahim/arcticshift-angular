import { Component, OnInit } from '@angular/core';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons/faFileAlt';
import { faChartLine } from '@fortawesome/free-solid-svg-icons/faChartLine';
import { AdminService } from '@services/admin/admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  faChartLine = faChartLine;
  faFileAlt = faFileAlt;

  constructor(private admin: AdminService) { }

  ngOnInit(): void {
    const today = new Date();
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    const dayBeforeYesterday = new Date(new Date().setDate(new Date().getDate() - 2));
    today.setUTCHours(0, 0, 0, 0);
    yesterday.setUTCHours(0, 0, 0, 0);
    dayBeforeYesterday.setUTCHours(0, 0, 0, 0);
    const todayId = today.getTime().toString();
    const yesterdayId = yesterday.getTime().toString();
    const dayBeforeYesterdayId = dayBeforeYesterday.getTime().toString();
    this.admin.getAnalyticsOrderDayWise([todayId, yesterdayId, dayBeforeYesterdayId]).subscribe(data => console.log(data));
  }

}
