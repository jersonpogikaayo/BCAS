import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EquipmentType } from 'src/app/core/models/equipment/equipment.model';
import { LoadingService } from 'src/app/core/services/common/loading.service';
import { EquipmentTypeHttpRequestsService } from 'src/app/core/services/http-requests/equipment-type-http-requests.service';

@Component({
  selector: 'app-ngbd-add-edit-equipment-type-modals',
  templateUrl: './ngbd-add-edit-equipment-type-modals.component.html',
  styleUrls: ['./ngbd-add-edit-equipment-type-modals.component.scss']
})
export class NgbdAddEditEquipmentTypeModalsComponent implements OnInit {
  @Input() equipmentType?: EquipmentType;
  @Input() isEditMode: boolean = false;
  equipmentTypesForm!: FormGroup;
  submitted: boolean = false;
  constructor(
    public activeModal: NgbActiveModal,
    private httpRequests: EquipmentTypeHttpRequestsService,
    private loadingService: LoadingService
  ) { }

  get equipForm() { return this.equipmentTypesForm.controls; }

  ngOnInit(): void {
    this.loadingService.show(this.isEditMode ? 'Updating equipment type...' : 'Adding equipment type...');
    this.initForm();
  }

  close() {
    this.activeModal?.close(true);
  }

  initForm() {
    this.equipmentTypesForm = new FormGroup({
      id: new FormControl(this.equipmentType?.id || null),
      name: new FormControl(this.equipmentType?.name || '', [Validators.required]),
      isArchived: new FormControl(this.equipmentType?.isArchived || false)
    });
  }

  save() {
    this.submitted = true;
    this.loadingService.show(this.isEditMode ? 'Updating equipment type...' : 'Adding equipment type...');
    if (this.equipmentTypesForm.invalid) {
      this.submitted = false
      return;
    }
    this.equipmentType = this.equipmentTypesForm.value;
    const formValue = this.equipmentTypesForm.value;

    const equipmentTypeData: EquipmentType = this.equipmentType?.id
      ? formValue // Remove id for add
      : (({ id, ...rest }) => rest)(formValue);


    const operation = this.isEditMode ?
      this.httpRequests.editEquipmentType(equipmentTypeData) :
      this.httpRequests.addEquipmentType(equipmentTypeData);

    operation.subscribe({
      next: (response) => {
        this.loadingService.hide();
        this.close();
      },
      error: (error) => {
        this.loadingService.hide();
      }
    });
  }

}
