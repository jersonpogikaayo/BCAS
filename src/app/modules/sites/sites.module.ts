import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SitesComponent } from './components/sites/sites.component';
import { SitesRoutingModule } from './sites-routing.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { LayoutsModule } from '../layouts/layouts.module';



@NgModule({
  declarations: [
    SitesComponent
  ],
  imports: [
    CommonModule,
    SitesRoutingModule,
    FormsModule,
    RouterModule,
    SharedModule,
    LayoutsModule
  ]
})
export class SitesModule { }
