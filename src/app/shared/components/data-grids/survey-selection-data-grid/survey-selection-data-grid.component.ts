import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { SurveySelectionEquipment } from 'src/app/core/models/survey/survey.model';
import { SurveyHttpRequestsService } from 'src/app/core/services/http-requests/survey-http-requests.service';
import { SurveyProcessComponent } from '../../survey-process/survey-process.component';

@Component({
  selector: 'app-survey-selection-data-grid',
  templateUrl: './survey-selection-data-grid.component.html',
  styleUrls: ['./survey-selection-data-grid.component.scss']
})
export class SurveySelectionDataGridComponent implements OnInit {

  @Input() surveys: SurveySelectionEquipment[] = [];
  @Output() equipmentsWithSurvey = new EventEmitter();
  
  sortDirection: string = '';
  sortType: string = '';


  rows: any = [];
  colspan = 7;

  selectedCheckedEquipment: any[] = [];
  selectedEquipmentSurvey!: any[];

  viewSurvey: any;
  activeModal?: NgbModalRef;
  surveyNextNotifier : Subject<boolean> = new Subject<boolean>();
  constructor(
    private modalService: NgbModal,
    private surveyHttpRequestsService: SurveyHttpRequestsService
  ) { }

  ngOnInit(): void {
    console.log('Survey Selection Data Grid Initialized', this.surveys);
    this.rows = this.processTableData(this.surveys);
    this.selectedEquipmentSurvey = this.rows;
  }

  processTableData(tableData: any) {
    for(let x = 0 ; x < tableData.length; x++) {
      tableData[x].expanded = false;
      tableData[x].selected = false;
      if(tableData[x].surveys.length !== 0) {
        for(let y = 0 ; y < tableData[x].surveys.length; y++) {
          tableData[x].surveys[y].selected = false;
        }
      }
    }
    return tableData;
  }

  toggleRow(row: any) {
    // row.expanded = true;
    row.expanded = !row.expanded;
  }

  checkLink(survey: any) {
    if (survey.equipmentId) {
      return "Linked to Equipment Id";
    }

    if (survey.equipmentModelId) {
        return "Linked to Model Id";
    }

    if (survey.equipmentTypeId) {
        return "Linked to Equipment Type Id";
    }

    return "Not linked";
  }

  checkedEquipment(event: any, equipmentIndex: any, equipment: any) {
    if(event.target.checked) {
      equipment.selected = true;
      this.selectedCheckedEquipment[equipmentIndex] = equipment;
    } else {
      this.selectedCheckedEquipment[equipmentIndex].selected = false;
      this.selectedCheckedEquipment[equipmentIndex].surveys.forEach((survey: any) => {
        survey.selected = false;
      });
    }
  }

  selectSurvey(survey: any, equipment: any, event: any, rowIndex: any, surveyIndex: any) {
    equipment.surveys.forEach((survey: any, index: number) => {
      if(index === surveyIndex) {
        if(event.target.checked) {
          survey.selected = true;
        } else {
          survey.selected = false;
        }
      } else {
        survey.selected = false;
      }
    })
    this.selectedCheckedEquipment[rowIndex] = equipment;
    this.equipmentsWithSurvey.emit(this.selectedCheckedEquipment);
  }

  autoSelect() {
    this.selectedCheckedEquipment.forEach((item, index) => {
      const priorityItem = this.compareByPriority(item);
      item.surveys.forEach((survey: any, i: number) => {
        if (survey.id === priorityItem[0].id) {
          survey.selected = true;
          survey.equipmentId = item.equipmentId;
        } else {
          survey.selected = false;
        }
      });
    });
    
    this.equipmentsWithSurvey.emit(this.selectedCheckedEquipment);
  }

  compareByPriority(equipment: any) {
    if(equipment.surveys.length != 0) {
      let surveys = equipment.surveys;
      if (!surveys || surveys.length === 0) {
          return undefined;
      }
  
      let highestPrioritySurvey: any;
  
      for (const survey of surveys) {
          if (survey.equipmentId !== undefined) {
              if (!highestPrioritySurvey || !highestPrioritySurvey.equipmentId) {
                  survey.selected = true;
                  highestPrioritySurvey = [survey];
              }
          } else if (survey.equipmentModelId !== undefined) {
              if (!highestPrioritySurvey || !highestPrioritySurvey.equipmentModelId) {
                  survey.selected = true;
                  highestPrioritySurvey = [survey];
              }
          } else if (survey.equipmentTypeId !== undefined) {
              if (!highestPrioritySurvey || !highestPrioritySurvey.equipmentTypeId) {
                  survey.selected = true;
                  highestPrioritySurvey = [survey];
              }
          } else {
              if (!highestPrioritySurvey || highestPrioritySurvey.ID < survey.id) {
                  survey.selected = true;
                  highestPrioritySurvey = [survey];
              }
          }
      }
  
      return highestPrioritySurvey;
    }
}

  processAutoSelect(equipment: any) {
    let survey = equipment.surveys;
    if(survey.length !== 0) {
      for(let x = 0 ; x < survey.length; x++) {
        if(this.checkLink(survey[x]) !== 'Not linked') {
          if(survey[x].equipmentId) {
              survey[x].selected = true;
              return survey;
          } else if(survey[x].equipmentModelId) {
              survey[x].selected = true;
              return survey;
          } else if(survey[x].equipmentTypeId) {
            survey[x].selected = true;
            return survey;
          }
        } else {

        }
      }
      return survey;
    }
  }

  findAndReplaceObjectById(array: any[], id: number, newObj: any): void {
    const index = array.findIndex(item => item.id === id);
    if (index !== -1) {
        array[index] = newObj;
    }
  }

  checkAll(event: any) {
    if(event.srcElement.checked) {
      this.rows.forEach((equipments:any, index: number) => {
        equipments.selected = true;
        this.selectedCheckedEquipment[index] = equipments;
      })
    } else {
      this.selectedCheckedEquipment = [];
    }
    this.equipmentsWithSurvey.emit(this.selectedCheckedEquipment);
  }

  isChecked(data: any) {
    return this.selectedCheckedEquipment.some((equipment: any) => equipment.equipmentId === data.equipmentId);
  }

  preview(content: any, survey: any) {
    this.surveyHttpRequestsService.getSurveyById(survey.id).subscribe(data => {
      this.viewSurvey = data;
      this.activeModal = this.modalService.open(content, { centered: true, size: 'fullscreen'});
    })
  }

  hasProceed(event: any) {
    // this.isLoading = false;
  }

  isSurveyFinished(event: any) {
    console.log(event);
    if(event) {
      this.activeModal?.close();
    }
  }

}
