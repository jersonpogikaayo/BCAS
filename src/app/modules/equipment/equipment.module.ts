import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentComponent } from './components/equipment/equipment.component';
import { EquipmentRoutingModule } from './components/equipment-routing.module';
import { ApproveEquipmentComponent } from './components/approve-equipment/approve-equipment.component';
import { EquipmentTypesComponent } from './components/equipment-types/equipment-types.component';
import { SharedModule } from "src/app/shared/shared.module";



@NgModule({
  declarations: [
    EquipmentComponent,
    ApproveEquipmentComponent,
    EquipmentTypesComponent
  ],
  imports: [
    CommonModule,
    EquipmentRoutingModule,
    SharedModule
]
})
export class EquipmentModule { }
