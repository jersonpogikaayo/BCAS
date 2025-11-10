import { Component, Input, OnInit } from '@angular/core';
import { Equipment } from 'src/app/core/models/equipment/equipment.model';

@Component({
  selector: 'app-clinical-description-history',
  templateUrl: './clinical-description-history.component.html',
  styleUrls: ['./clinical-description-history.component.scss']
})
export class ClinicalDescriptionHistoryComponent implements OnInit {

  @Input() equipment!: Equipment;
  constructor() { }

  ngOnInit(): void {
  }

}
