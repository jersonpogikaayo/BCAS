import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyEngineerRoutingModule } from './my-engineers-routing.module';
import { EngineersComponent } from './components/engineers/engineers.component';
import { SharedModule } from "src/app/shared/shared.module";
import { MyUsersTestEquipmentsComponent } from './components/my-users-test-equipments/my-users-test-equipments.component';



@NgModule({
  declarations: [
    EngineersComponent,
    MyUsersTestEquipmentsComponent
  ],
  imports: [
    CommonModule,
    MyEngineerRoutingModule,
    SharedModule
]
})
export class MyEngineersModule { }
