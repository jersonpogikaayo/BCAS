import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Department, Equipment, Manufacturer, Model, Site } from 'src/app/core/models/equipment/equipment.model';
import { RaiseJobsHttpRequestsService } from 'src/app/core/services/http-requests/raise-jobs-http-requests.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-raise-job',
  templateUrl: './raise-job.component.html',
  styleUrls: ['./raise-job.component.scss']
})
export class RaiseJobComponent implements OnInit {
  @ViewChild('createJobModalTemplate') createJobModalTemplate!: TemplateRef<any>;
  selectedEquipmentForJob: any = null;
  
  isLoading: boolean = false;
  showCreateJob: boolean = false
  assetSerialNumber: string = '';

  showEquipment: boolean = false;
  selectedEquipment: Equipment[] = [];
  allSite: Site[] = [];
  allDepartment: Department[] = [];
  allManufacturer: Manufacturer[] = [];
  allModel: Model[] = [];
  jobFrequency: any[] = [];

  showEquipmentForm: boolean = false;

  submitted: boolean = false;
  equipmentForm!: FormGroup;
  jobDetailsForm!: FormGroup;

  activeModal?: NgbModalRef;
  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private raiseJobsHttpRequestsService: RaiseJobsHttpRequestsService,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getAllSite();
    this.getAllManufacturer();
    this.getJobFrequency();
  }
  
  initForm() {
    this.equipmentForm = this.formBuilder.group({
        site: ['', [Validators.required] ],
        department: ['', [Validators.required] ],
        manufacturer: ['', [Validators.required] ],
        model: ['', [Validators.required] ],
        assetNumber: ['', [Validators.required] ],
        serialNumber: ['', [Validators.required] ],
    });

    this.jobDetailsForm = this.formBuilder.group({
      Title: ['', Validators.required],
      SpecialRequirements: [''],
      DueDate: ['', Validators.required],
      Reference: [''],
      Recurring: [true],
      jobLifespan: [365, Validators.required],
      NextDueDate: ['']
    });
  }

  get f() { return this.equipmentForm.controls; }

  get jobDetailsFormControl() { return this.jobDetailsForm.controls; }

  getAllSite() {
    this.raiseJobsHttpRequestsService.getALlSite().subscribe((data: any) => {
      this.allSite = data;
    })
  }

  getAllManufacturer() {
    this.raiseJobsHttpRequestsService.getAllManufacturer().subscribe((data: any) => {
      this.allManufacturer = data;
    })
  }

  getJobFrequency() {
    this.raiseJobsHttpRequestsService.getJobFrequency().subscribe((data: any) => {
        this.jobFrequency = data;
    })
  }


  search() {
    if (!this.assetSerialNumber.trim()) {
      console.warn('Please enter a serial number or asset number');
      return;
    }

    this.isLoading = true;
    this.showEquipment = false; // Hide previous results
    
    this.raiseJobsHttpRequestsService.locateEquipment(this.assetSerialNumber).subscribe({
      next: (response: Equipment[]) => {
        this.selectedEquipment = response || [];
        this.isLoading = false;
        this.showEquipment = true;
        if(this.selectedEquipment.length === 0) {
          Swal.fire({
              title: 'Unable to locate equipment in the database.',
              text: 'Would you like to continue and add a new piece of equipment?',
              icon: 'warning',
              showCancelButton: true,
              cancelButtonText: 'No',
              confirmButtonText: 'Yes',
              confirmButtonColor: 'rgb(60,76,128)',
            }).then((result) => {
              if(result.isConfirmed) {
                  this.showEquipmentForm = true;
              } else {

              }
          });
        }
      },
      error: (error: any) => {
        console.error('Error fetching equipment:', error);
        this.selectedEquipment = []; // Clear previous results
        this.isLoading = false;
        this.showEquipment = true; // Still show the "no results" message
      }
    });
  }

  selectEquipment(equipment: any) {
    if (this.selectedEquipment.some(item => item.id === equipment.id)) {
      this.selectedEquipment = this.selectedEquipment.filter(item => item.id !== equipment.id);
    } else {
      this.selectedEquipment.push(equipment);
    }

    this.openCreateJobModal(this.selectedEquipment[0]); // Open job creation modal with the first selected equipment
  }

  clearSearch(): void {
    this.assetSerialNumber = '';
    this.selectedEquipment = [];
    this.showEquipment = false;
  }

  // Add this method for creating jobs
  createJobForEquipment(equipment: Equipment): void {
    this.showCreateJob = true;
    // Store the equipment for job creation
  }

  selectSite(event: any) {
    this.getDepartmentBySite(event.id);
  }

  selectManufacturer(event: any) {
    this.getModelByManufacturer(event.id);
  }

  getModelByManufacturer(manufacturerId: number) {
    this.raiseJobsHttpRequestsService.getModelByManufacturer(manufacturerId).subscribe((data: any) => {
      this.allModel = data;
    })
  }

  getDepartmentBySite(siteId: number) {
    this.raiseJobsHttpRequestsService.getDepartmentBySite(siteId).subscribe((data: any) => {
      this.allDepartment = data;
    });
  }

  addEquipment(): void {
    this.submitted = true;
    
    if (this.equipmentForm.invalid) {
      return;
    }

    const formValue = this.equipmentForm.value;
    const payload: any = {
      modelId: formValue.model.id,
      equipmentTypeId: formValue.model.equipmentTypeId,
      manufacturerId: formValue.manufacturer,
      siteId: formValue.site,
      assetNumber: formValue.assetNumber,
      serialNumber: formValue.serialNumber,
      departmentId: formValue.department
    };

    this.raiseJobsHttpRequestsService.addEquipment(payload).subscribe({
      next: (response: any) => {
        this.showSuccessDialog(response);
      },
      error: (error: Error) => {
        console.error('Error adding equipment:', error);
        this.showErrorDialog();
      }
    });
  }

  private showSuccessDialog(equipmentData: any): void {
    Swal.fire({
      title: 'Success!',
      html: 'The new equipment has been added. Do you want to create a job for it?',
      icon: 'success',
      showCancelButton: true,
      cancelButtonText: 'No',
      confirmButtonText: 'Yes',
      confirmButtonColor: 'rgb(60,76,128)',
    }).then((result) => {
      if (result.isConfirmed) {
        this.proceedToJobCreation(equipmentData);
      } else {
        this.resetForm();
      }
    });
  }

  private showErrorDialog(): void {
    Swal.fire({
      title: 'Error!',
      text: 'Failed to add equipment. Please try again.',
      icon: 'error',
      confirmButtonColor: 'rgb(60,76,128)',
    });
  }

  private proceedToJobCreation(equipmentData: any): void {
    this.showCreateJob = false; // Show job creation form
    this.showEquipmentForm = false;
    this.selectedEquipment = [equipmentData]; // Store as array for consistency
    this.clearSearch(); // Clear search form
    this.openCreateJobModal(equipmentData);
  }

  private resetForm(): void {
    this.equipmentForm.reset();
    this.submitted = false;
    this.showEquipmentForm = false;
    this.clearSearch();
  }

  openCreateJobModal(equipment: any): void {
    this.selectedEquipmentForJob = [equipment];
    
    // Open the modal using the template reference
    this.activeModal = this.modalService.open(this.createJobModalTemplate, { 
      centered: true, 
      size: 'fullscreen'
    });
  }

  createJobFinished(event: boolean): void {
    if (event) {
      this.activeModal?.close();
      this.resetForm();
      Swal.fire({
        title: 'Job Created Successfully',
        text: 'Your job has been created successfully.',
        icon: 'success',
        confirmButtonColor: 'rgb(60,76,128)',
      });
    } else {
      Swal.fire({
        title: 'Job Creation Failed',
        text: 'There was an error creating the job. Please try again.',
        icon: 'error',
        confirmButtonColor: 'rgb(60,76,128)',
      });
    }
  }

}
