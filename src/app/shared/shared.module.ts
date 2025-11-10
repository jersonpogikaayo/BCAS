import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbRatingModule, NgbTooltip, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgSelectModule } from '@ng-select/ng-select';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ArchwizardModule } from 'angular-archwizard';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { FlatpickrModule } from 'angularx-flatpickr';
import { AngularEditorModule } from '@kolkov/angular-editor';


// Modals
import { NgbdGridFilterModal } from './components/modals/grid-filter/grid-filter.modal.component';
import { NgbdColumnArrangementModal } from './components/modals/column-arrangement/column-arrangement-modal.component';
import { NgbdJobsModalComponent } from './components/modals/jobs/ngbd-jobs-modal/ngbd-jobs-modal.component';

// Pipes
import { ColumnFormatPipe } from './pipes/column-format-pipe';

// Directives
import { SanitizeHtmlDirective } from './directives/sanitize-html.directive';

// Components
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { CommonDatagridComponent } from './components/common-datagrid/common-datagrid.component';
import { EquipmentChecksComponent } from './components/jobs/equipment-checks/equipment-checks.component';
import { SectionHeaderComponent } from './components/section-header/section-header.component';
import { SurveyProcessComponent } from './components/survey-process/survey-process.component';
import { SignaturePadComponent } from './components/signature-pad/signature-pad.component';
import { TestEquipmentsComponent } from './components/data-grids/test-equipments/test-equipments/test-equipments.component';
import { JobsSummaryComponent } from './components/jobs/jobs-summary/jobs-summary.component';
import { NgbdFailJobModalComponent } from './components/modals/jobs/ngbd-fail-job-modal/ngbd-fail-job-modal.component';
import { NgbdPauseJobModalComponent } from './components/modals/jobs/ngbd-pause-job-modal/ngbd-pause-job-modal.component';
import { NgbdViewDetailsJobModalComponent } from './components/modals/jobs/ngbd-view-details-job-modal/ngbd-view-details-job-modal.component';
import { JobsHistoryComponent } from './components/jobs/jobs-history/jobs-history.component';
import { JobsDetailsComponent } from './components/jobs/jobs-details/jobs-details.component';
import { JobsAttachmentsComponent } from './components/jobs/jobs-attachments/jobs-attachments.component';
import { NgbdSignOffJobModalComponent } from './components/modals/jobs/ngbd-sign-off-job-modal/ngbd-sign-off-job-modal.component';
import { CreateJobsComponent } from './components/jobs/create-jobs/create-jobs.component';
import { JobsTypeComponent } from './components/jobs/jobs-type/jobs-type.component';
import { SurveySelectionDataGridComponent } from './components/data-grids/survey-selection-data-grid/survey-selection-data-grid.component';
import { NgbdAssignAndBookJobModalComponent } from './components/modals/jobs/ngbd-assign-and-book-job-modal/ngbd-assign-and-book-job-modal.component';
import { NgbdCannotLocateJobModalComponent } from './components/modals/jobs/ngbd-cannot-locate-job-modal/ngbd-cannot-locate-job-modal.component';
import { EquipmentsDataGridComponent } from './components/data-grids/equipments-data-grid/equipments-data-grid.component';
import { CustomersDataGridComponent } from './components/data-grids/customers-data-grid/customers-data-grid.component';
import { NgbdAddEditCustomerModalComponent } from './components/modals/ngbd-add-edit-customer-modal/ngbd-add-edit-customer-modal.component';
import { ContactsDataGridComponent } from './components/data-grids/contacts-data-grid/contacts-data-grid.component';
import { NgbdAddEditContactsModalComponent } from './components/modals/ngbd-add-edit-contacts-modal/ngbd-add-edit-contacts-modal.component';
import { SiteDataGridComponent } from './components/data-grids/site-data-grid/site-data-grid.component';
import { NgbdAddEditSitesModalComponent } from './components/modals/ngbd-add-edit-sites-modal/ngbd-add-edit-sites-modal.component';
import { DepartmentsDataGridComponent } from './components/data-grids/departments-data-grid/departments-data-grid.component';
import { NgbdAddEditDeparmentsModalComponent } from './components/modals/ngbd-add-edit-deparments-modal/ngbd-add-edit-deparments-modal.component';
import { NgbdViewEquipmentDetailsModalComponent } from './components/modals/equipments/ngbd-view-equipment-details-modal/ngbd-view-equipment-details-modal.component';
import { EquipmentDetailsComponent } from './components/modals/equipments/equipment-details/equipment-details.component';
import { SiteDetailsComponent } from './components/modals/equipments/site-details/site-details.component';
import { JobDetailsComponent } from './components/modals/equipments/job-details/job-details.component';
import { ConditionalScaleHistoryComponent } from './components/modals/equipments/conditional-scale-history/conditional-scale-history.component';
import { ClinicalDescriptionHistoryComponent } from './components/modals/equipments/clinical-description-history/clinical-description-history.component';
import { NgbdAddEditEquipmentTypeModalsComponent } from './components/modals/ngbd-add-edit-equipment-type-modals/ngbd-add-edit-equipment-type-modals.component';
import { MyUsersDataGridComponent } from './components/data-grids/my-users-data-grid/my-users-data-grid.component';
import { NgbdAddEditMyUsersModalComponent } from './components/modals/ngbd-add-edit-my-users-modal/ngbd-add-edit-my-users-modal.component';
import { MyUsersTestEquipmentsDataGridComponent } from './components/data-grids/test-equipments/my-users-test-equipments-data-grid/my-users-test-equipments-data-grid.component';
import { NgbdUpdateServiceDateModalComponent } from './components/modals/ngbd-update-service-date-modal/ngbd-update-service-date-modal.component';
import { NgbdViewCustomerChildModalComponent } from './components/modals/ngbd-view-customer-child-modal/ngbd-view-customer-child-modal.component';
import { NgbdCsvUploadModalComponent } from './components/modals/ngbd-csv-upload-modal/ngbd-csv-upload-modal.component';
import { NgbdViewJobsDataGridModalComponent } from './components/modals/jobs/ngbd-view-jobs-data-grid-modal/ngbd-view-jobs-data-grid-modal.component';
import { ExcelTemplatesDataGridComponent } from './components/data-grids/excel-templates-data-grid/excel-templates-data-grid.component';
import { NgbdAddEditExcelTemplateComponent } from './components/modals/ngbd-add-edit-excel-template/ngbd-add-edit-excel-template.component';
import { SurveyDataGridComponent } from './components/data-grids/survey-data-grid/survey-data-grid.component';
import { NgbdAddEditSurveyComponent } from './components/modals/ngbd-add-edit-survey/ngbd-add-edit-survey.component';
import { EquipmentsModelDataGridComponent } from './components/data-grids/equipments-model-data-grid/equipments-model-data-grid.component';
import { EquipmentsTypeDataGridComponent } from './components/data-grids/equipments-type-data-grid/equipments-type-data-grid.component';
import { AddSectionSurveyComponent } from './components/add-section-survey/add-section-survey.component';
import { CdkAccordionModule } from "@angular/cdk/accordion";
import { NgbdCreateSurveySectionQuestionsModalComponent } from './components/modals/ngbd-create-survey-section-questions-modal/ngbd-create-survey-section-questions-modal.component';
import { NgbdAddOptionsModalComponent } from './components/modals/ngbd-add-options-modal/ngbd-add-options-modal.component';
import { LoadingComponent } from './components/loading/loading.component';
import { NgbdImagePreviewModalComponent } from './components/modals/ngbd-image-preview-modal/ngbd-image-preview-modal.component';
import { CameraModalComponent } from './components/modals/jobs/camera-modal/camera-modal.component';
import { NgbdSketchModalComponent } from './components/modals/ngbd-sketch-modal/ngbd-sketch-modal.component';

@NgModule({
  declarations: [
    // Directives
    SanitizeHtmlDirective,

    
    
    // Modals
    NgbdGridFilterModal,
    NgbdColumnArrangementModal,
    NgbdJobsModalComponent,
    NgbdFailJobModalComponent,
    
    // Pipes
    ColumnFormatPipe,
    NgbdJobsModalComponent,
    SectionHeaderComponent,
    SurveyProcessComponent,

    // Components
    BreadcrumbsComponent,
    CommonDatagridComponent,
    EquipmentChecksComponent,
    SignaturePadComponent,
    TestEquipmentsComponent,
    JobsSummaryComponent,
    NgbdPauseJobModalComponent,
    NgbdViewDetailsJobModalComponent,
    JobsHistoryComponent,
    JobsDetailsComponent,
    JobsAttachmentsComponent,
    NgbdSignOffJobModalComponent,
    CreateJobsComponent,
    JobsTypeComponent,
    SurveySelectionDataGridComponent,
    NgbdAssignAndBookJobModalComponent,
    NgbdCannotLocateJobModalComponent,
    EquipmentsDataGridComponent,
    CustomersDataGridComponent,
    NgbdAddEditCustomerModalComponent,
    ContactsDataGridComponent,
    NgbdAddEditContactsModalComponent,
    SiteDataGridComponent,
    NgbdAddEditSitesModalComponent,
    DepartmentsDataGridComponent,
    NgbdAddEditDeparmentsModalComponent,
    NgbdViewEquipmentDetailsModalComponent,
    EquipmentDetailsComponent,
    SiteDetailsComponent,
    JobDetailsComponent,
    ConditionalScaleHistoryComponent,
    ClinicalDescriptionHistoryComponent,
    NgbdAddEditEquipmentTypeModalsComponent,
    MyUsersDataGridComponent,
    NgbdAddEditMyUsersModalComponent,
    MyUsersTestEquipmentsDataGridComponent,
    NgbdUpdateServiceDateModalComponent,
    NgbdViewCustomerChildModalComponent,
    NgbdCsvUploadModalComponent,
    NgbdViewJobsDataGridModalComponent,
    ExcelTemplatesDataGridComponent,
    NgbdAddEditExcelTemplateComponent,
    SurveyDataGridComponent,
    NgbdAddEditSurveyComponent,
    EquipmentsModelDataGridComponent,
    EquipmentsTypeDataGridComponent,
    AddSectionSurveyComponent,
    NgbdCreateSurveySectionQuestionsModalComponent,
    NgbdAddOptionsModalComponent,
    NgbdImagePreviewModalComponent,
    CameraModalComponent,
    NgbdSketchModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    DragDropModule,
    ArchwizardModule,
    SignaturePadModule,
    NgxDropzoneModule,
    FlatpickrModule.forRoot(),
    // Bootstrap modules
    NgbPaginationModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbTooltipModule,
    NgbRatingModule,
    CdkAccordionModule,
    AngularEditorModule
],
  exports: [
    // Angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
    // Custom components
    BreadcrumbsComponent,
    SectionHeaderComponent,
    CommonDatagridComponent,
    EquipmentChecksComponent,
    SurveyProcessComponent,
    TestEquipmentsComponent,
    JobsSummaryComponent, 
    JobsHistoryComponent,
    JobsDetailsComponent,
    JobsAttachmentsComponent,
    CreateJobsComponent,
    EquipmentsDataGridComponent,
    CustomersDataGridComponent,
    MyUsersDataGridComponent,
    MyUsersTestEquipmentsDataGridComponent,
    ExcelTemplatesDataGridComponent,
    SurveyDataGridComponent,
    SiteDataGridComponent,
    AddSectionSurveyComponent,

    // Pipes
    ColumnFormatPipe,

    // Directives
    SanitizeHtmlDirective,

    // Bootstrap modules
    NgbPaginationModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbTooltipModule,
    NgbRatingModule,
  ]
})
export class SharedModule { }