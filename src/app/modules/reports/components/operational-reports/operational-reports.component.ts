import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Customer } from 'src/app/core/models/customer/customer.model';
import { ReportsHttpRequestsService } from 'src/app/core/services/http-requests/reports-http-requests.service';
import { NgbdViewJobsDataGridModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-view-jobs-data-grid-modal/ngbd-view-jobs-data-grid-modal.component';

@Component({
  selector: 'app-operational-reports',
  templateUrl: './operational-reports.component.html',
  styleUrls: ['./operational-reports.component.scss']
})
export class OperationalReportsComponent implements OnInit {

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
  submitted: boolean = false;

  jsonData!: any;
  uniqueMonthYears!: string[];
  newJobsData: any = [];
  acceptedJobsData: any = [];
  assignedJobsData: any = [];
  actionedJobsData: any = [];
  rejectedJobsData: any = [];
  bookedJobsData: any = [];
  confirmedJobsData: any = [];
  progressJobsData: any = [];
  incompleteJobsData: any = [];
  failJobsData: any = [];
  pendingReviewJobsData: any = [];
  completeJobsData: any = [];
  repairJobsData: any = [];
  cancelJobsData: any = [];
  totalJobsData: any = [];
  constructor(
    private httpRequest: ReportsHttpRequestsService,
    private modalService: NgbModal,
    
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
    this.isLoading = true;
    let startDate = this.dateRange.startDate;
    let endDate = this.dateRange.endDate;
    this.getOperationalReport(this.selectedCustomerId, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
  }

   getOperationalReport(selectedCustomerId: number, startDate: any, endDate: any) {
    this.httpRequest.getOperationalReport(selectedCustomerId, startDate, endDate).subscribe((data: any) => {
      this.jsonData = data;
      this.uniqueMonthYears = this.getUniqueMonthYear(this.jsonData.monthlyJobData);
      for(let x = 0 ; x < this.uniqueMonthYears.length; x++) {
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'New');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Accepted');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Assigned');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Actioned');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Rejected');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Booked');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Confirmed');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Progress');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Incomplete');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Fail');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Pending Review');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Complete');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Repair');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Cancelled');
        this.getRowData(this.uniqueMonthYears[x], this.jsonData.monthlyJobData, 'Total');
      }
      this.submitted = true;
      this.isLoading = false;
    })
  }

  getUniqueMonthYear(data: any[]): string[] {
    const uniqueMonthYear: Set<string> = new Set<string>();

    for (const item of data) {
      uniqueMonthYear.add(item.monthYear);
    }

    return Array.from(uniqueMonthYear);
  }

  getRowData(uniqueMonthYears: string, data: any, type: string) {
    let columnName = 'value_' + uniqueMonthYears;
    if(data.length != 0) {
      for(let x = 0 ; x < data.length; x ++) {
        if((data[x].monthYear == uniqueMonthYears) && type === 'Total') {
          this.totalJobsData.push({
            label: data[x].statusTypeName,
            [columnName]: data[x].jobTotal
          })
        } else if((data[x].monthYear == uniqueMonthYears && data[x].statusTypeName === type) && type !== 'Total') {
          for(let y = 0 ; y < data[x].jobStatusData.length ; y++) {
            if(type === 'New') {
              this.newJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Accepted') {
              this.acceptedJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Assigned') {
              this.assignedJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Actioned') {
              this.actionedJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Rejected') {
              this.rejectedJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Booked') {
              this.bookedJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Confirmed') {
              this.confirmedJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Progress') {
              this.progressJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Incomplete') {
              this.incompleteJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Fail') {
              this.failJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Pending Review') {
              this.pendingReviewJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Complete') {
              this.completeJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Repair') {
              this.repairJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            } else if(type === 'Cancelled') {
              this.cancelJobsData.push({
                label: data[x].jobStatusData[y].jobStatusNiceName,
                jobStatusId: data[x].jobStatusData[y].jobStatusId,
                [columnName]: data[x].jobStatusData[y].jobTotal
              })
            }
          }
        }
      }
    }
  }

  combineLabelsWithValues(data: any[]): any[] {
    const combinedData: any = [];
  
    data.forEach(item => {
      const existingItem = combinedData.find((combinedItem: any) => combinedItem.label === item.label);
  
      if (existingItem) {
        Object.keys(item).forEach(key => {
          if (key.startsWith('value_')) {
            const year = key.split('_')[1];
            existingItem[key] = item[key];
          }
        });
      } else {
        const newItem: any = {
          label: item.label,
          jobStatusId: item.jobStatusId
        };
  
        Object.keys(item).forEach(key => {
          if (key.startsWith('value_')) {
            newItem[key] = item[key];
          }
        });
  
        combinedData.push(newItem);
      }
    });
  
    return combinedData;
  }

  openJobsModal(monthYear: any, jobStatusId: number = 0) {

    const date = moment(monthYear);
    const startDate = date.clone().startOf('month'); // First day of the month
    const endDate = date.clone().endOf('month'); 
   
    const modalRef = this.modalService.open(NgbdViewJobsDataGridModalComponent, {
      centered: false,
      size: 'fullscreen',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.parameter = {
      StartDueDate: startDate.format('YYYY-MM-DD'),
      EndDueDate: endDate.format('YYYY-MM-DD'),
      jobStatusType: jobStatusId,
      CustomerId: this.selectedCustomerId,
    };

    modalRef.result.then((result) => {
      if (result) {  }
    });
  }

}
