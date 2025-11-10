import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TestEquipment } from 'src/app/core/models/test-equipments/test-equipments.model';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';
import { MyUsersHttpRequestsService } from 'src/app/core/services/http-requests/my-users-http-requests.service';
import { RaiseJobsHttpRequestsService } from 'src/app/core/services/http-requests/raise-jobs-http-requests.service';

@Component({
  selector: 'app-ngbd-update-service-date-modal',
  templateUrl: './ngbd-update-service-date-modal.component.html',
  styleUrls: ['./ngbd-update-service-date-modal.component.scss']
})
export class NgbdUpdateServiceDateModalComponent implements OnInit {
  @Input() testEquipment!: TestEquipment
  testEquipmentForm!: FormGroup;
  submitted: boolean = false;
  jobFrequency: any[] = [];
  constructor(
    public activeModal: NgbActiveModal,
    private raiseJobsHttpRequests: RaiseJobsHttpRequestsService,
    private myUsersHttpRequests: MyUsersHttpRequestsService,
    private fb: FormBuilder
  ) { }

  get testEquipmentF() { return this.testEquipmentForm.controls; }

  ngOnInit(): void {
    this.initForm();
    this.getJobFrequency();
    console.log(this.testEquipment)
  }

  initForm() {
    this.testEquipmentForm = this.fb.group({
      testEquipmentId: [this.testEquipment.testEquipmentId, Validators.required],
      serviceDate: ['', Validators.required],
      lifespan: ['',  Validators.required]
    });
  }

  close() {
    this.activeModal?.close(true);
  }

  getJobFrequency() {
    this.raiseJobsHttpRequests.getJobFrequency().subscribe((data: any) => {
        this.jobFrequency = data;
    })
  }

  save() {
    console.log(this.testEquipmentForm.invalid);
    this.submitted = true;
    if(this.testEquipmentForm.invalid) {
      return;
    } else {
      const date = new Date(this.testEquipmentForm.controls['serviceDate'].value);
      const formattedDate = date.toISOString();
      this.myUsersHttpRequests.updateServiceDate({
        testEquipmentId: this.testEquipmentForm.controls['testEquipmentId'].value,
        serviceDate: formattedDate,
        lifeSpanInDays: this.testEquipmentForm.controls['lifespan'].value
      }).subscribe({
        next: (response) => {
          this.close();
        },
        error: (error) => {
          console.log(error)
        }
      })
    }
  }

}
