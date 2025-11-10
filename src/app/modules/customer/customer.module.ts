import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersComponent } from './components/customers/customers.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { LayoutsModule } from '../layouts/layouts.module';
import { CustomerRoutingModule } from './customer-routing.module';



@NgModule({
  declarations: [
    CustomersComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    LayoutsModule,
    CustomerRoutingModule
  ],
  exports: [
    CustomersComponent,
  ]
})
export class CustomerModule { }
