import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../layouts/layout.component';
import { EngineersComponent } from './components/engineers/engineers.component';
import { MyUsersTestEquipmentsComponent } from './components/my-users-test-equipments/my-users-test-equipments.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'engineers',
        component: EngineersComponent
      },
      {
        path: 'test-equipments',
        component: MyUsersTestEquipmentsComponent
      }
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyEngineerRoutingModule { }
