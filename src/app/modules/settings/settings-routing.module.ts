import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../layouts/layout.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { ExcelTemplatesComponent } from './components/excel-templates/excel-templates.component';
import { SurveySettingsComponent } from './components/survey-settings/survey-settings.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'user-settings',
        component: UserSettingsComponent
      },
      {
        path: 'excel-templates',
        component: ExcelTemplatesComponent
      },
      {
        path: 'survey-settings',
        component: SurveySettingsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
