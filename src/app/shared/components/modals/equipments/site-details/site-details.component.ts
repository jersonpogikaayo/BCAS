import { Component, Input, OnInit } from '@angular/core';
import { Equipment } from 'src/app/core/models/equipment/equipment.model';

@Component({
  selector: 'app-site-details',
  templateUrl: './site-details.component.html',
  styleUrls: ['./site-details.component.scss']
})
export class SiteDetailsComponent implements OnInit {

  @Input() equipment!: Equipment;
  
  constructor() { }

  ngOnInit(): void {
  }

}
