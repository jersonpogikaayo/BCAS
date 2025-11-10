import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common/common.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { OptionModel, QuestionType } from 'src/app/core/models/survey/survey-section-questions.model';
import { SurveyHttpRequestsService } from 'src/app/core/services/http-requests/survey-http-requests.service';
import { NgbdAddOptionsModalComponent } from '../ngbd-add-options-modal/ngbd-add-options-modal.component';


export type modalFor = 'sections' | 'questions' | 'usections' | 'uquestions';
export type actionType = 'create' | 'update';
@Component({
  selector: 'app-ngbd-create-survey-section-questions-modal',
  templateUrl: './ngbd-create-survey-section-questions-modal.component.html',
  styleUrls: ['./ngbd-create-survey-section-questions-modal.component.scss']
})
export class NgbdCreateSurveySectionQuestionsModalComponent implements OnInit {
  @Input() public modalFor!: modalFor;
  @Input() public actionType: actionType = 'create';
  @Input() public dataToUpdate!: any;
  @Input() public sectionIndex!: number;


  sectionForm!: FormGroup;
  questionsForm!: FormGroup;
  questionsValidationForm!: FormGroup;
  submitted: boolean = false;
  isLoading: boolean = false;
  questionTypeData!: QuestionType[];
  options: OptionModel[] = [];

  canvasOption: any = {
      height: 100,
      width: 250
  }

  fullWidth: boolean = false;
  htmlOn: boolean = false;
  htmlDescOn: boolean = false;
  htmlContent: any;
  config: AngularEditorConfig = {
      editable: true,
      spellcheck: true,
      height: '15rem',
      minHeight: '5rem',
      placeholder: 'Enter text here...',
      translate: 'no',
      defaultParagraphSeparator: 'p',
      defaultFontName: 'Arial',
      toolbarHiddenButtons: [
        ['bold']
        ],
      customClasses: [
        {
          name: "quote",
          class: "quote",
        },
        {
          name: 'redText',
          class: 'redText'
        },
        {
          name: "titleText",
          class: "titleText",
          tag: "h1",
        },
      ]
    };

  items = [''];
  expandedIndex = 0;
  constructor(
      public activeModal: NgbActiveModal,
      private modalService: NgbModal,
      private formBuilder: FormBuilder,
      private httpRequest: SurveyHttpRequestsService,
      private cd: ChangeDetectorRef,
      private router: Router,
      private commonService: CommonService
  ) {}

  ngOnInit(): void {
      console.log(this.dataToUpdate);
      console.log(this.modalFor);
      if(this.dataToUpdate?.htmlDescription && this.dataToUpdate.htmlDescription !== '') {
          this.htmlOn = true;
      }
      this.initForm();
      this.getQuestionType();
  }

  initForm() {
      if(this.modalFor === 'sections') {
          this.sectionForm = this.formBuilder.group({
              title: ['', [Validators.required] ],
              name: ['', [Validators.required] ],
              description: ['', [Validators.required] ],
              questions: [[]],
              type: ['section', [Validators.required] ],
              htmlDescOn: [false, [Validators.required] ],
          });
      } else if(this.modalFor === 'questions') {
          this.questionsForm = this.formBuilder.group({
              description: ['', [Validators.required] ],
              options: [''],
              questionTypeId: ['', [Validators.required] ],
              isOptional: [false, [Validators.required] ],
              requiresCompletionOnFail: [false, [Validators.required] ],
              type: ['question', [Validators.required] ],
              questionValidation: [],
              failValue: [0],
              fullWidth: [false],
              htmlDescription: [''],
          });

          this.questionsValidationForm = this.formBuilder.group({
              failErrorMessage: [''],
              emptyErrorMessage: [''],
              failRegex: [''],
              isArchived: [false],
              maskErrorMessage: [''],
              maskRegex: [''],
              lowerFail: [0],
              upperFail: [0],
              maxValue: [0],
              minValue: [0],
              step: [1],
              failValue: [0],
              absoluteLowerFail:[],
              absoluteUpperFail:[],
              relativeLowerFailDays:[],
              relativeUpperFailDays:[],
              restrictDateSelection: [false],
              validateOnDateOnly: [false]
          });
      } else if(this.modalFor === 'usections') {
          this.sectionForm = this.formBuilder.group({
              title: [this.dataToUpdate.title, [Validators.required] ],
              name: [this.dataToUpdate.name, [Validators.required] ],
              description: [this.dataToUpdate.description, [Validators.required] ],
              questions: [[]],
              type: ['usections', [Validators.required] ],
              htmlDescOn: [this.dataToUpdate.htmlDescOn, [Validators.required] ],
          });
      } else if(this.modalFor === 'uquestions') {
          this.questionsForm = this.formBuilder.group({
              description: [this.dataToUpdate.description, [Validators.required] ],
              options: [this.dataToUpdate.options],
              questionTypeId: [this.dataToUpdate.questionTypeId, [Validators.required] ],
              isOptional: [this.dataToUpdate.isOptional, [Validators.required] ],
              requiresCompletionOnFail: [this.dataToUpdate.requiresCompletionOnFail, [Validators.required] ],
              type: ['question', [Validators.required] ],
              questionValidation: [this.dataToUpdate.questionValidation],
              failValue: [this.dataToUpdate.failValue],
              fullWidth: [this.dataToUpdate.fullWidth],
              htmlDescription: [this.dataToUpdate.htmlDescription],

          });

          this.questionsValidationForm = this.formBuilder.group({
              failErrorMessage: [this.dataToUpdate.failErrorMessage],
              emptyErrorMessage: [this.dataToUpdate.emptyErrorMessage],
              failRegex: [this.dataToUpdate.failRegex],
              isArchived: [this.dataToUpdate.isArchived],
              maskErrorMessage: [this.dataToUpdate.maskErrorMessage],
              maskRegex: [this.dataToUpdate.maskRegex],
              lowerFail: [this.dataToUpdate.lowerFail],
              upperFail: [this.dataToUpdate.upperFail],
              maxValue: [this.dataToUpdate.maxValue],
              minValue: [this.dataToUpdate.minValue],
              step: [this.dataToUpdate.failValue],
              failValue: [this.dataToUpdate.failValue],
              absoluteLowerFail:[this.dataToUpdate.absoluteLowerFail],
              absoluteUpperFail:[this.dataToUpdate.absoluteUpperFail],
              relativeLowerFailDays:[this.dataToUpdate.relativeLowerFailDays],
              relativeUpperFailDays:[this.dataToUpdate.relativeUpperFailDays],
              restrictDateSelection: [this.dataToUpdate.restrictDateSelection],
              validateOnDateOnly: [this.dataToUpdate.restrictDateSelection]
          });

          this.options = this.dataToUpdate.options;
      }
  }

  get cSectionForm() { return this.sectionForm.controls; }
  get cQuestionForm() { return this.questionsForm.controls; }
  get cquestionsValidationForm() { return this.questionsValidationForm.controls; }

  close() {
      this.activeModal?.close();
  }

  save() {
      this.submitted = true
      if(this.modalFor === 'sections') {
          if(this.sectionForm.invalid) {
              return;
          } else {
              this.activeModal?.close(this.sectionForm.value);
          }
      } else if(this.modalFor === 'questions') {
          if(this.questionsForm.invalid) {
              return;
          } else {
              this.questionsForm.controls['questionValidation'].setValue(this.questionsValidationForm.value);
              if(this.htmlOn) {
                  this.questionsForm.controls['htmlDescription'].setValue(this.questionsForm.controls['description'].value);
              }
              this.activeModal?.close(this.questionsForm.value);
          }
      } else if(this.modalFor === 'usections') {
          if(this.sectionForm.invalid) {
              return;
          } else {
              this.activeModal?.close(this.sectionForm.value);
          }
      } else if(this.modalFor === 'uquestions') {
          if(this.questionsForm.invalid) {
              return;
          } else {
              this.questionsForm.controls['questionValidation'].setValue(this.questionsValidationForm.value);
              if(this.htmlOn) {
                  this.questionsForm.controls['htmlDescription'].setValue(this.questionsForm.controls['description'].value);
              }
              this.activeModal?.close(this.questionsForm.value);
          }
      }
      
      
  }

  getQuestionType() {
    this.httpRequest.getQuestionType().subscribe({
      next: (data: QuestionType[]) => {
        this.questionTypeData = data;
      },
      error: (error) => {
        console.error('Error fetching question types:', error);
      }
    });
  }

  addOptions() {
      let modalRef = this.modalService.open(NgbdAddOptionsModalComponent, { centered: true, size: 'fullscreen', backdrop : 'static', keyboard : false});
      modalRef.componentInstance.currentOptions = this.options;
      modalRef.result.then((result: OptionModel) => {
          this.options.push(result);
          console.log(this.options);
          this.questionsForm.controls['options'].setValue(this.options);
      })
  }

  
  drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.options, event.previousIndex, event.currentIndex);
      this.options = this.commonService.fixOptionDisplayOrder(this.options);
      this.questionsForm.controls['options'].setValue(this.options);
  }

  toggleHtml() {
      this.htmlOn = !this.htmlOn;
  }
  
  toggleHtmlDesc() {
      this.htmlDescOn = !this.htmlDescOn;
      this.sectionForm.controls['htmlDescOn'].setValue(this.htmlDescOn);
  }

  toggleFullWidth() {
      this.fullWidth = !this.fullWidth;
      this.questionsForm.controls['fullWidth'].setValue(this.fullWidth);
  }

  deleteOption(option: any, index: any) {
      console.log(option);
      console.log(index);
      this.options.splice(index, 1);
  }

}
