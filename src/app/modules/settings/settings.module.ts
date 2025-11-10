import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { LayoutsModule } from '../layouts/layouts.module';
import { ExcelTemplatesComponent } from './components/excel-templates/excel-templates.component';
import { SurveySettingsComponent } from './components/survey-settings/survey-settings.component';
import { CdkAccordionModule } from "@angular/cdk/accordion";



@NgModule({
  declarations: [
    UserSettingsComponent,
    ExcelTemplatesComponent,
    SurveySettingsComponent,
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    FormsModule,
    RouterModule,
    SharedModule,
    LayoutsModule,
    CdkAccordionModule
  ],
  exports: [
    UserSettingsComponent,
    ExcelTemplatesComponent,
    SurveySettingsComponent,
  ]
})
export class SettingsModule { }
