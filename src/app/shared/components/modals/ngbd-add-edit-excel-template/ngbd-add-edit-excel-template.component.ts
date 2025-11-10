import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from 'src/app/core/services/common/loading.service';

export type modalFor = 'excel_template' | 'equipment_types';
export type actionType = 'create' | 'update';


@Component({
  selector: 'app-ngbd-add-edit-excel-template',
  templateUrl: './ngbd-add-edit-excel-template.component.html',
  styleUrls: ['./ngbd-add-edit-excel-template.component.scss']
})

export class NgbdAddEditExcelTemplateComponent implements OnInit {
  @Input() public modalFor!: modalFor;
  @Input() public actionType: actionType = 'create';
  @Input() public dataToUpdate!: any;

  excelTemplateForm!: FormGroup;
  equipmentTypesForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    if(this.actionType === 'create') {
      if(this.modalFor === 'excel_template') {
        this.excelTemplateForm = this.formBuilder.group({
            title: ['', [Validators.required] ],
            file: ['', [Validators.required] ],
            fileName: ['', [Validators.required] ],
            fileExtension: ['', Validators.required],
        });
      } else if(this.modalFor === 'equipment_types') {
        this.equipmentTypesForm = this.formBuilder.group({
            name: ['', [Validators.required] ],
            isArchived: [false]
        });
      }
  } else {
      if(this.modalFor === 'excel_template') {
        this.excelTemplateForm = this.formBuilder.group({
            title: ['', [Validators.required] ],
            file: ['', [Validators.required] ],
            fileName: ['', [Validators.required] ],
            fileExtension: ['', Validators.required],
        });
      } else if(this.modalFor === 'equipment_types') {
        this.equipmentTypesForm = this.formBuilder.group({
            id: [this.dataToUpdate.id, [Validators.required] ],
            name: [this.dataToUpdate.name, [Validators.required] ],
            isArchived: [this.dataToUpdate.isArchived]
        });
      } 
    }
  }

}
