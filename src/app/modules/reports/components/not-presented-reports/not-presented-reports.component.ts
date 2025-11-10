import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { Customer } from 'src/app/core/models/customer/customer.model';
import { ReportsHttpRequestsService } from 'src/app/core/services/http-requests/reports-http-requests.service';

@Component({
  selector: 'app-not-presented-reports',
  templateUrl: './not-presented-reports.component.html',
  styleUrls: ['./not-presented-reports.component.scss']
})
export class NotPresentedReportsComponent implements OnInit {

  customer: Customer[] = [];
  selectedCustomerId: number = 0;
  dateRange: any = { 
    startDate: moment(), 
    endDate: moment() 
  };
  ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    '3 Months': [moment().subtract(2, 'months').startOf('month'), moment().subtract(0, 'months').endOf('month')],
    '6 Months': [moment().subtract(5, 'months').startOf('month'), moment().subtract(0, 'months').endOf('month')],
    '9 Months': [moment().subtract(8, 'months').startOf('month'), moment().subtract(0, 'months').endOf('month')],
    '12 Months': [moment().subtract(11, 'months').startOf('month'), moment().subtract(0, 'months').endOf('month')],
  }
  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];
  isInvalidDate = (m: moment.Moment) =>  {
    return this.invalidDates.some(d => d.isSame(m, 'day') )
  }

  isLoading: boolean = false;
  isLoadingExcel: boolean = false;
  isLoadingPDF: boolean = false;
  submitted: boolean = false;

  opReportData: any;

  constructor(
    private httpRequest: ReportsHttpRequestsService,
    
  ) { }

  ngOnInit(): void {
    this.getCustomer();
  }

  getCustomer() {
    this.httpRequest.getCustomer().subscribe((data: Customer[]) => {
      this.customer = data;
    })
  }

  search() {
    this.submitted = true;
    this.isLoading = true;
    let startDate = this.dateRange.startDate;
    let endDate = this.dateRange.endDate;
    this.getOperationalReport(this.selectedCustomerId, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
  }

  getOperationalReport(selectedCustomerId: number, startDate: any, endDate: any) {
    this.httpRequest.getNotPresentedReport(selectedCustomerId, startDate, endDate).subscribe((data: any) => {
      this.opReportData = data;
        this.isLoading = false;
    })
  }

  

}
