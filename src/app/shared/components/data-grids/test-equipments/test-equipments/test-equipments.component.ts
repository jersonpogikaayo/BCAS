import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TestEquipment, TestEquipmentDisplay } from 'src/app/core/models/test-equipments/test-equipments.model';
import { TestEquipmentService } from 'src/app/core/services/http-requests/test-equipment-requests.service';

@Component({
  selector: 'app-test-equipments',
  templateUrl: './test-equipments.component.html',
  styleUrls: ['./test-equipments.component.scss']
})
export class TestEquipmentsComponent implements OnInit, OnChanges {

  @Input() isCompleted: boolean = false;
  @Input() defaultEquipment: TestEquipment[] = [];
  @Output() equipmentSelected = new EventEmitter<TestEquipmentDisplay[]>();

  testEquipments: TestEquipmentDisplay[] = [];
  selectedEquipments: TestEquipmentDisplay[] = [];
  loading: boolean = false;
  error: string = '';
  
  constructor(
    private testEquipmentService: TestEquipmentService
  ) { }

  ngOnInit(): void {
    console.log(this.defaultEquipment)
    this.loadTestEquipments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultEquipment'] && !changes['defaultEquipment'].firstChange) {
      
      // If equipment list is already loaded, apply new default selections
      if (this.testEquipments.length > 0) {
        this.setDefaultSelections();
      }
    }
  }

  loadTestEquipments(): void {
    this.loading = true;
    this.error = '';

    this.testEquipmentService.getMyTestEquipment().subscribe({
      next: (data) => {
        this.testEquipments = data;
        this.setDefaultSelections();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load test equipments. Please try again.';
        this.loading = false;
      }
    });
  }

    /**
   * Track by function for equipment list performance
   */
  trackByEquipmentId(index: number, equipment: TestEquipmentDisplay): number {
    return equipment.id;
  }

  /**
   * Get selected equipment count
   */
  getSelectedEquipmentCount(): number {
    return this.selectedEquipments.length;
  }

  /**
   * Check if all equipments are selected
   */
  areAllEquipmentsSelected(): boolean {
    const selectableEquipments = this.testEquipments.filter(eq => !eq.isRetired);
    return selectableEquipments.length > 0 && selectableEquipments.every(eq => eq.isSelected);
  }

  /**
   * Check if some equipments are selected
   */
  areSomeEquipmentsSelected(): boolean {
    return this.selectedEquipments.length > 0 && !this.areAllEquipmentsSelected();
  }

  /**
   * Select/Deselect all equipments
   */
  selectAllEquipments(): void {
    const availableEquipments = this.testEquipments.filter(eq => 
      !eq.isRetired && !this.isEquipmentDisabled(eq)
    );
    const allSelected = availableEquipments.every(eq => eq.isSelected);
    
    availableEquipments.forEach(equipment => {
      equipment.isSelected = !allSelected;
    });
    
    if (!allSelected) {
      this.selectedEquipments = [...availableEquipments];
    } else {
      this.selectedEquipments = [];
    }
    
    // Emit selected equipments to parent
    this.equipmentSelected.emit(this.selectedEquipments);
  }

  /**
   * Clear all selections
   */
  clearAllSelections(): void {
    this.testEquipments.forEach(equipment => {
      equipment.isSelected = false;
    });
    this.selectedEquipments = [];
    this.equipmentSelected.emit(this.selectedEquipments);
  }

  /**
   * Confirm selection
   */
  confirmSelection(): void {
    console.log('Equipment selection confirmed:', this.selectedEquipments);
    // Could emit a different event for confirmation
    // this.equipmentConfirmed.emit(this.selectedEquipments);
  }

  /**
   * Retry loading equipments
   */
  retryLoad(): void {
    this.loadTestEquipments();
  }

  /**
   * Check if equipment is disabled (service required)
   */
  isEquipmentDisabled(equipment: TestEquipmentDisplay): boolean {
    // If lastServiceExpiryDate is undefined, equipment is disabled
    if (!equipment.lastServiceExpiryDate) {
      return true;
    }
    
    // If lastServiceExpiryDate is in the past, equipment is disabled
    const now = new Date();
    return equipment.lastServiceExpiryDate < now;
  }

  /**
   * Get equipment status text
   */
  getEquipmentStatus(equipment: TestEquipmentDisplay): string {
    if (equipment.isRetired) {
      return 'Retired';
    }
    
    if (this.isEquipmentDisabled(equipment)) {
      return 'Disabled - Service Required';
    }
    
    return 'Active';
  }

  /**
   * Get equipment status class
   */
  getEquipmentStatusClass(equipment: TestEquipmentDisplay): string {
    if (equipment.isRetired) {
      return 'text-warning';
    }
    
    if (this.isEquipmentDisabled(equipment)) {
      return 'text-danger fw-bold';
    }
    
    return 'text-success';
  }

  /**
   * Update toggle equipment selection to prevent selecting disabled equipment
   */
  toggleEquipmentSelection(equipment: TestEquipmentDisplay): void {
    // Don't allow selection if equipment is disabled or retired
    if (this.isEquipmentDisabled(equipment) || equipment.isRetired) {
      return;
    }
    
    equipment.isSelected = !equipment.isSelected;
    
    if (equipment.isSelected) {
      this.selectedEquipments.push(equipment);
    } else {
      const index = this.selectedEquipments.findIndex(eq => eq.id === equipment.id);
      if (index > -1) {
        this.selectedEquipments.splice(index, 1);
      }
    }
    
    // Emit selected equipments to parent
    this.equipmentSelected.emit(this.selectedEquipments);
  }

  getAvailableEquipmentCount(): number {
    return this.testEquipments.filter(eq => 
      !eq.isRetired && !this.isEquipmentDisabled(eq)
    ).length;
  }

  /**
   * Format service expiry date for display
   */
  formatServiceExpiryDate(date: Date | undefined): string {
    if (!date) return 'No service date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  private setDefaultSelections(): void {
    if (!this.defaultEquipment || this.defaultEquipment.length === 0) {
      return;
    }

    // Clear existing selections first
    this.selectedEquipments = [];

    // Get the IDs from defaultEquipment
    const defaultEquipmentIds = this.defaultEquipment.map(eq => eq.id);
    
    // Mark matching equipment as selected
    this.testEquipments.forEach(equipment => {
      if (defaultEquipmentIds.includes(equipment.id)) {
        // Only select if equipment is available (not disabled or retired)
        if (!this.isEquipmentDisabled(equipment) && !equipment.isRetired) {
          equipment.isSelected = true;
          this.selectedEquipments.push(equipment);
        } else {
          console.warn('⚠️ Cannot select disabled/retired default equipment:', equipment.id, equipment.typeName);
        }
      } else {
        equipment.isSelected = false;
      }
    });
    
    // Emit the default selections to parent
    this.equipmentSelected.emit(this.selectedEquipments);
  }

  private isDefaultEquipment(equipmentId: number): boolean {
    if (!this.defaultEquipment || this.defaultEquipment.length === 0) {
      return false;
    }
    
    return this.defaultEquipment.some(eq => eq.id === equipmentId);
  }

  getEquipmentRowClass(equipment: TestEquipmentDisplay): string {
    let classes = '';
    
    if (equipment.isSelected) {
      classes += 'table-primary ';
    }
    
    if (this.isEquipmentDisabled(equipment) || equipment.isRetired) {
      classes += 'table-light ';
    }
    
    if (this.isDefaultEquipment(equipment.id)) {
      classes += 'default-equipment ';
    }
    
    return classes.trim();
  }
}
