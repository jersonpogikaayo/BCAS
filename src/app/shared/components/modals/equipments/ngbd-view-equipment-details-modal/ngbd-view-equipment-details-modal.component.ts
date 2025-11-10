import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { Equipment } from 'src/app/core/models/equipment/equipment.model';
import { EquipmentsHttpRequestsService } from 'src/app/core/services/http-requests/equipment-http-requests.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ngbd-view-equipment-details-modal',
  templateUrl: './ngbd-view-equipment-details-modal.component.html',
  styleUrls: ['./ngbd-view-equipment-details-modal.component.scss']
})
export class NgbdViewEquipmentDetailsModalComponent implements OnInit {

  @Input() equipment!: Equipment;
  activeTab: number = 0; // Default to the first tab
  
  constructor(
    private activeModal: NgbActiveModal,
    private equipmentHttpRequest: EquipmentsHttpRequestsService
  ) { }

  ngOnInit(): void {
  }

  close() {
    // Logic to close the modal
    this.activeModal.close();
  }

  changeTab(tabIndex: number): void {
    this.activeTab = tabIndex;
  }

  private confirmAction(title: string, text: string, action: () => Observable<any>, onSuccess: () => void) {
    Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      confirmButtonColor: 'rgb(60,76,128)',
      cancelButtonText: 'No',
    }).then(result => {
      if (result.isConfirmed) {
        action().subscribe(
          () => onSuccess(),
          () => {
            Swal.fire({
              title: 'Error',
              text: 'Please contact support',
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: 'Ok',
              confirmButtonColor: 'rgb(60,76,128)',
            }).then(() => this.close());
          }
        );
      }
    });
  }

  retire() {
    this.confirmAction(
      'Warning',
      'Are you sure you wish to retire this piece of Equipment?',
      () => this.equipmentHttpRequest.retireEquipment(this.equipment.id),
      () => { this.equipment.isRetired = true; }
    );
  }

  unRetire() {
    this.confirmAction(
      'Warning',
      'Are you sure you wish to unretire this piece of Equipment?',
      () => this.equipmentHttpRequest.unRetireEquipment(this.equipment.id),
      () => { this.equipment.isRetired = false; }
    );
  }

}
