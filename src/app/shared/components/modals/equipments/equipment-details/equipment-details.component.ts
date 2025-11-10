import { Component, Input, OnInit } from '@angular/core';
import { Equipment } from 'src/app/core/models/equipment/equipment.model';

@Component({
  selector: 'app-equipment-details',
  templateUrl: './equipment-details.component.html',
  styleUrls: ['./equipment-details.component.scss']
})
export class EquipmentDetailsComponent implements OnInit {

  @Input() equipment!: Equipment;
  isRetired: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

}
