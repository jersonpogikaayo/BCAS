import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../../layouts/layout.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { ApproveEquipmentComponent } from './approve-equipment/approve-equipment.component';
import { EquipmentTypesComponent } from './equipment-types/equipment-types.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: EquipmentComponent
      },
      {
        path: 'approve-equipment',
        component: ApproveEquipmentComponent
      },
      {
        path: 'equipment-types',
        component: EquipmentTypesComponent
      }
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EquipmentRoutingModule { }
