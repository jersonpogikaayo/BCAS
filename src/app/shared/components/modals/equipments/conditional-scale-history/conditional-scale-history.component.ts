import { Component, Input, OnInit } from '@angular/core';
import { Equipment } from 'src/app/core/models/equipment/equipment.model';

@Component({
  selector: 'app-conditional-scale-history',
  templateUrl: './conditional-scale-history.component.html',
  styleUrls: ['./conditional-scale-history.component.scss']
})
export class ConditionalScaleHistoryComponent implements OnInit {

  @Input() equipment!: Equipment;
  constructor() { }

  ngOnInit(): void {
  }

}
