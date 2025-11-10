import { moveItemInArray } from '@angular/cdk/drag-drop';
import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModal, NgbModalConfig, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngbd-column-arrangement',
  templateUrl: './column-arrangement-modal.component.html',
  styleUrls: ['./column-arrangement-modal.component.scss'],

})
export class NgbdColumnArrangementModal implements OnInit{

  @Input() public column: { technicalName: string, prettyName: string, selected: boolean }[] = [
    { prettyName: 'Id', technicalName: 'id', selected: false },
    { prettyName: 'Title', technicalName: 'title', selected: false },
    { prettyName: 'Asset Number', technicalName: 'assetNumber', selected: false },
    { prettyName: 'Serial Number', technicalName: 'serialNumber', selected: false },
    { prettyName: 'Due Date', technicalName: 'dueDate', selected: false },
    { prettyName: 'Site Name', technicalName: 'siteName', selected: false },
    { prettyName: 'Post Code', technicalName: 'sitePostCode', selected: false },
    { prettyName: 'Booked Date', technicalName: 'bookedDate', selected: false },
    { prettyName: 'Completion Date', technicalName: 'completionDate', selected: false },
    { prettyName: 'Next Due Date', technicalName: 'nextDueDate', selected: false },
    { prettyName: 'Job Reference', technicalName: 'jobReference', selected: false },
    { prettyName: 'Status', technicalName: 'status', selected: false },
    { prettyName: 'Job Type', technicalName: 'jobType', selected: false },
    { prettyName: 'Contact Name', technicalName: 'contactName', selected: false },
    { prettyName: 'Contact Surname', technicalName: 'contactSurname', selected: false },
    { prettyName: 'Contact Phone', technicalName: 'contactPhone', selected: false },
    { prettyName: 'Contact Email', technicalName: 'contactEmail', selected: false },
    { prettyName: 'Contact Mobile', technicalName: 'contactMobile', selected: false },
    { prettyName: 'Customer Name', technicalName: 'customer', selected: false },
    { prettyName: 'Customer Contract', technicalName: 'customerContract', selected: false },
    { prettyName: 'Equipment Model', technicalName: 'equipmentModel', selected: false },
    { prettyName: 'Equipment Type', technicalName: 'equipmentType', selected: false },
    { prettyName: 'Manufacturer', technicalName: 'manufacturerName', selected: false },
    { prettyName: 'Site Address 1', technicalName: 'siteAddressOne', selected: false },
    { prettyName: 'Site Address 2', technicalName: 'siteAddressTwo', selected: false },
    { prettyName: 'Assigned Username', technicalName: 'userName', selected: false },
  ];
    

  constructor(
    public activeModal: NgbActiveModal,
   ) { }

  ngOnInit(): void {

  }

  close() {
    this.activeModal?.close();
  }

  save() {
    this.activeModal?.close(this.column);
  }

  drop(event: any) {
    moveItemInArray(this.column, event.previousIndex, event.currentIndex);
  }




}