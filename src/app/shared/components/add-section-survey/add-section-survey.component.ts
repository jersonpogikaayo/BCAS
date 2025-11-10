import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/common/data.service';
import Swal from 'sweetalert2';
import { NgbdCreateSurveySectionQuestionsModalComponent } from '../modals/ngbd-create-survey-section-questions-modal/ngbd-create-survey-section-questions-modal.component';

export type modalFor = 'sections' | 'questions' | 'usections' | 'uquestions';
@Component({
  selector: 'app-add-section-survey',
  templateUrl: './add-section-survey.component.html',
  styleUrls: ['./add-section-survey.component.scss']
})
export class AddSectionSurveyComponent implements OnInit {
  @Output() userSection = new EventEmitter<any>();
  @Input() public sections: any = [];
  @Input() public editable: boolean = true;

  subscription!: Subscription;
  constructor(
      private modalService: NgbModal,
      private createUpdateSection: DataService
    ) {
      console.log(this.sections);
  }

  ngOnInit() {
      this.subscription = this.createUpdateSection.data$.subscribe({
        next: (data) => {
          console.log(data);
          this.addModal(data.type, data.sectionIndex);
        }
      });
    }
  
    ngOnDestroy() {
      // It's important to unsubscribe when the component is destroyed
      this.subscription.unsubscribe();
    }
  
  dropQuestions(event: any, index: number) {
      moveItemInArray(this.sections[index].questions, event.previousIndex, event.currentIndex);
      this.emitData();
    }
  
  drop(event: any) {
      moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
      this.emitData();
  }

  addModal(modalFor: modalFor, sectionIndex: number, questionIndex?: number) {
      console.log(questionIndex);
      if(questionIndex || questionIndex === 0) console.log(this.sections[sectionIndex].questions[questionIndex]);
      let modalRef = this.modalService.open(NgbdCreateSurveySectionQuestionsModalComponent, { centered: true, size: 'fullscreen'});
      modalRef.componentInstance.modalFor = modalFor;
      if(modalFor === 'questions') {
          modalRef.componentInstance.sectionIndex = sectionIndex;
      } else if(modalFor === 'usections') {
          modalRef.componentInstance.dataToUpdate = this.sections[sectionIndex];
      } else if(modalFor === 'uquestions') {
          if(questionIndex || questionIndex === 0) {
              modalRef.componentInstance.dataToUpdate = this.sections[sectionIndex].questions[questionIndex];
              modalRef.componentInstance.questionIndex = questionIndex;
          }
      }
      modalRef.result.then((result: any) => {
          console.log(result);
          if(result && modalFor === 'sections') {
              this.sections.push(result)
              this.emitData();
          } else if(result && modalFor === 'questions') {
              let sIndex = sectionIndex;
              this.sections[sIndex].questions.push(result);
              console.log(this.sections);
              this.emitData();
          } else if(result && modalFor === 'usections') {
              this.sections[sectionIndex] = result;
              this.emitData();
          } else if(result && modalFor === 'uquestions') {
              let qIndex = questionIndex;
              if(qIndex || qIndex == 0) {
                  this.sections[sectionIndex].questions[qIndex] = result;
                  console.log(this.sections);
                  this.emitData();
              }
          }
      })
  }

  addQuestions(section: any, index: number) {
      console.log(section);
      console.log(index);
      let sectionLength = this.sections[index].questions.length;
      let dataToAdd: any = {
          title: 'Question ' + (sectionLength + 1) + ' For ' + section.title,
      }
      this.sections[index].questions.push(dataToAdd);
      console.log(this.sections);
      this.emitData();
  }

  deleteSQ(type: string, sectionIndex: number, questionIndex?: number) {
      Swal.fire({
          title: 'Warning',
          text: 'Are you sure you want to delete this ' + type + '?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          confirmButtonColor: 'rgb(60,76,128)',
        }).then((result) => {
          if(result.isConfirmed) {
              if(type === 'section') {
                  this.sections.splice(sectionIndex, 1);
                  this.emitData();
              } else if(type === 'question') {
                  this.sections[sectionIndex].questions.splice(questionIndex, 1);
                  this.emitData();
              }
          }
        })
  }

  emitData() {
      this.userSection.emit(this.sections);
  }
}
