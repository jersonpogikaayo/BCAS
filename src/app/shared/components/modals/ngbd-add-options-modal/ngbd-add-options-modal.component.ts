import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OptionModel } from 'src/app/core/models/survey/survey-section-questions.model';
import { CommonService } from 'src/app/core/services/common/common.service';

@Component({
  selector: 'app-ngbd-add-options-modal',
  templateUrl: './ngbd-add-options-modal.component.html',
  styleUrls: ['./ngbd-add-options-modal.component.scss']
})
export class NgbdAddOptionsModalComponent implements OnInit {
  optionForm!: FormGroup;
  submitted: boolean = false;

  @Input() public currentOptions: OptionModel[] = [];

  constructor(
      public activeModal: NgbActiveModal,
      private formBuilder: FormBuilder,
      private commonService: CommonService
  ) {}

  ngOnInit(): void {
    console.log(this.currentOptions);
    this.initForm();
  }

  close() {
      this.activeModal?.close();
  }

  initForm() {
    this.optionForm = this.formBuilder.group({
        failValue: [0, [Validators.required] ],
        active: [true, [Validators.required] ],
        text: ['', [Validators.required] ],
        isArchived: [false, [Validators.required]],
        displayOrder: [this.commonService.getOptionDisplayOrder(this.currentOptions), [Validators.required]],
    });
    
  }

  get cOptionForm() { return this.optionForm.controls; }

  save() {
    if(this.optionForm.invalid) {
        return;
    } else {
        this.activeModal?.close(this.optionForm.value);
    }
  }

}
