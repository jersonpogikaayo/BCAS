// equipment-checks.component.ts
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConditionScale, EquipmentUpdateRequest } from 'src/app/core/models/equipment-checks/equipment-checks.model';
import { JobDetail } from 'src/app/core/models/jobs/jobs.model';
import { Site } from 'src/app/core/models/site/site.model';
import { EquipmentChecksHttpService } from 'src/app/core/services/http-requests/equipment-checks-http-requests.service';
import { SiteHttpRequestsService } from 'src/app/core/services/http-requests/site-http.requests.service';
import { environment } from 'src/environments/environment';

export type SelectedString = 'Yes' | 'No';

@Component({
  selector: 'app-equipment-checks',
  templateUrl: './equipment-checks.component.html',
  styleUrls: ['./equipment-checks.component.scss']
})
export class EquipmentChecksComponent implements OnInit, OnDestroy {
  @Input() job!: JobDetail;
  @Input() equipmentCheckValue: any;
  @Input() site: Site[] = [];
  @Input() conditionScaleItems: ConditionScale[] = [];
  @Output() isNext = new EventEmitter<any>();

  checkForm!: FormGroup;
  submitted = false;
  isOffline = false;
  siteDepartment: any = [];

  // Show/hide flags
  showFields = {
    serial: false,
    asset: false,
    location: false,
    site: false,
    gmdn: false,
    ecri: false
  };

  private destroy$ = new Subject<void>();
  private baseUrl = environment.api;
  isDataRestored = false;

  constructor(
    private formBuilder: FormBuilder,
    private equipmentChecksService: EquipmentChecksHttpService,
    private siteHttpRequestsService: SiteHttpRequestsService
  ) {}

  ngOnInit(): void {
    this.isDataRestored = false;
    this.initForm();
    this.setupSubscriptions();
    this.loadDepartments(this.job?.equipment?.site?.id || 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Enhanced form initialization
  private initForm(): void {
    const equipment = this.job?.equipment || {};
    const checkValue = this.equipmentCheckValue || {};

    this.checkForm = this.formBuilder.group({
      // Validation fields
      serialNumber: [checkValue.serialNumber ?? true, Validators.required],
      assetNumber: [checkValue.assetNumber ?? true, Validators.required],
      location: [checkValue.location ?? true, Validators.required],
      site: [checkValue.site ?? true, Validators.required],
      gmdn: [checkValue.gmdn ?? null, Validators.required],
      ecri: [checkValue.ecri ?? null, Validators.required],

      // Data fields
      equipmentId: [checkValue.equipmentId ?? equipment.id, Validators.required],
      newAssetNumber: [checkValue.newAssetNumber ?? equipment.assetNumber, Validators.required],
      newSerialNumber: [checkValue.newSerialNumber ?? equipment.serialNumber, Validators.required],
      newDepartmentId: [checkValue.newDepartmentId ?? equipment.departmentId, Validators.required],
      newSiteId: [checkValue.newSiteId ?? equipment.site?.id, Validators.required],
      newgmdn: [checkValue.newgmdn ?? equipment.gmdn, Validators.required],
      newecri: [checkValue.newecri ?? equipment.ecri, Validators.required],
      conditionScaleId: [checkValue.conditionScaleId ?? equipment.conditionId, Validators.required]
    });

    this.initializeFieldVisibility();
  }

  refresh(): void {
    console.log('🔄 Refreshing equipment checks component');
    
    // Clear restoration flag
    this.isDataRestored = false;
    
    // Re-initialize the component
    this.ngOnInit();

  }

  refreshWithData(formData: any): void {
    console.log('🔄 Refreshing with data:', formData);
    
    // Refresh the component
    this.refresh();
    
    // Restore data after refresh
    setTimeout(() => {
      this.restoreFormData(formData);
    }, 100);
  }

  private setupSubscriptions(): void {
    // Equipment check submission
    // this.commonService.isCheckEquipSubmitted
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((isSubmitted: boolean) => {
    //     if (isSubmitted) this.submit();
    //   });

    // Online status
    // this.onlineStatusService.onlineStatus$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((isOnline: boolean) => {
    //     this.isOffline = !isOnline;
    //   });
  }

  private initializeFieldVisibility(): void {
    const equipment = this.job?.equipment || {};
    
    // Set GMDN visibility
    if (equipment.gmdn) {
      this.checkForm.patchValue({ gmdn: true });
    } else {
      this.checkForm.patchValue({ gmdn: false });
      this.showFields.gmdn = true;
    }

    // Set ECRI visibility
    if (equipment.ecri) {
      this.checkForm.patchValue({ ecri: true });
    } else {
      this.checkForm.patchValue({ ecri: false });
      this.showFields.ecri = true;
    }
  }

  private loadDepartments(siteId: number = 0): void {

    this.siteHttpRequestsService.getSiteDepartments(siteId)
      .subscribe((data: any[]) => {
        this.siteDepartment = data;
      });
  }

  get f() { 
    return this.checkForm.controls; 
  }

  checkBoxEvent(event: any, type: string, selected: SelectedString): void {
    const key = `${type}${selected}` as const;
    const equipment = this.job?.equipment || {};

    const actions: Record<string, () => void> = {
      serialNumberNo: () => this.showFields.serial = true,
      serialNumberYes: () => this.showFields.serial = false,
      assetNumberNo: () => this.showFields.asset = true,
      assetNumberYes: () => this.showFields.asset = false,
      locationYes: () => this.showFields.location = false,
      locationNo: () => this.showFields.location = true,
      siteYes: () => {
        this.showFields.site = false;
        this.checkForm.patchValue({
          newSiteId: equipment.site?.id,
          newDepartmentId: equipment.departmentId
        });
        this.loadDepartments();
      },
      siteNo: () => this.showFields.site = true,
      gmdnYes: () => {
        this.showFields.gmdn = false;
        this.checkForm.patchValue({ newgmdn: equipment.gmdn });
      },
      gmdnNo: () => this.showFields.gmdn = true,
      ecriYes: () => {
        this.showFields.ecri = false;
        this.checkForm.patchValue({ newecri: equipment.ecri });
      },
      ecriNo: () => this.showFields.ecri = true
    };

    actions[key]?.();
  }

  selectSite(event: any): void {
    this.siteDepartment = [];
    this.checkForm.patchValue({ newDepartmentId: null });
    this.loadDepartments(event.id);
  }

  submit(): void {
    this.submitted = true;
    
    if (this.checkForm.invalid) return;

    const formValue = this.checkForm.value;
    const hasChanges = this.hasEquipmentChanges();

    // If no changes needed, emit immediately
    if (!hasChanges || !this.checkForm.dirty) {
      this.isNext.emit(formValue);
      return;
    }

    // Submit equipment updates
    this.submitEquipmentUpdates(formValue);
  }

  private hasEquipmentChanges(): boolean {
    return this.showFields.serial || 
           this.showFields.asset || 
           this.showFields.location ||
           (this.checkForm.get('newgmdn')?.value || this.checkForm.get('newecri')?.value);
  }

  // Simplified submission method
  private submitEquipmentUpdates(formValue: any): void {
    const updateRequest: EquipmentUpdateRequest = {
      equipmentPayload: {
        equipmentId: formValue.equipmentId,
        newAssetNumber: formValue.newAssetNumber,
        newSerialNumber: formValue.newSerialNumber,
        newDepartmentId: formValue.newDepartmentId
      },
      clinicalPayload: {
        equipmentId: formValue.equipmentId,
        newGMDN: formValue.newgmdn,
        newECRI: formValue.newecri
      },
      conditionPayload: {
        equipmentId: formValue.equipmentId,
        newConditionScaleId: formValue.conditionScaleId
      }
    };

    // Option 1: Sequential updates (original behavior)
    this.equipmentChecksService.updateEquipmentSequential(updateRequest)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.submitted = false;
            this.isNext.emit(formValue);
          } else {
            console.error('Equipment update failed:', response.error);
          }
        },
        error: (error) => {
          console.error('Equipment update error:', error);
        }
      });

  }

  getSiteString(): string {
    const site = this.job?.equipment?.site;
    if (!site) return '';

    const parts = [
      site.name,
      site.address1,
      site.address2,
      site.countyName,
      site.postCode
    ].filter(part => part != null);

    return parts.join(', ');
  }

  getDepartmentById(departmentId: number): any {
    return this.siteDepartment.find((dep: any) => dep.id === departmentId);
  }

  // Public method to get form data
  getFormData() {
    return {
      formValue: this.checkForm.value,
      isValid: this.checkForm.valid,
      formErrors: this.getFormErrors()
    };
  }

  // Public method to validate form
  validateForm(): boolean {
    this.submitted = true;
    return this.checkForm.valid;
  }

  // Public method to get form errors
  getFormErrors() {
    const errors: any = {};
    Object.keys(this.checkForm.controls).forEach(key => {
      const control = this.checkForm.get(key);
      if (control && !control.valid && control.touched) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  // Public method to mark all fields as touched (for validation display)
  markAllFieldsAsTouched() {
    this.submitted = true;
    this.checkForm.markAllAsTouched();
  }

  // Method to restore form data
  restoreFormData(formData: any): void {
    if (!formData) {
      console.log('⚠️ No form data to restore');
      return;
    }

    if (this.isDataRestored) {
      console.log('⚠️ Data already restored, skipping');
      return;
    }

    if (!this.checkForm) {
      console.error('❌ Form not initialized, cannot restore data');
      return;
    }

    console.log('🔄 Starting form data restoration:', formData);
    
    try {
      // First, patch the form with saved data
      this.checkForm.patchValue(formData, { emitEvent: false });
      console.log('✅ Form values patched');
      
      // Then restore the show fields state
      this.restoreShowFieldsState(formData);
      console.log('✅ Show fields state restored');
      
      // Mark as restored to prevent multiple restorations
      this.isDataRestored = true;
      
      // Force change detection if needed
      // this.cdr.detectChanges();
      
      console.log('✅ Form data restoration completed successfully');
    } catch (error) {
      console.error('❌ Error restoring form data:', error);
      this.isDataRestored = false; // Reset flag on error
    }
  }

  // Enhanced method to restore the showFields state
  private restoreShowFieldsState(formData: any): void {
    console.log('🔄 Restoring show fields state with data:', formData);
    
    // Reset all show fields first
    this.showFields = {
      serial: false,
      asset: false,
      location: false,
      site: false,
      gmdn: false,
      ecri: false
    };

    // Restore serial number field visibility
    if (formData.serialNumber === false) {
      this.showFields.serial = true;
      console.log('✅ Serial field shown');
    }
    
    // Restore asset number field visibility
    if (formData.assetNumber === false) {
      this.showFields.asset = true;
      console.log('✅ Asset field shown');
    }
    
    // Restore location fields visibility
    if (formData.location === false) {
      this.showFields.location = true;
      console.log('✅ Location fields shown');
    }
    
    // Restore site field visibility
    if (formData.site === false) {
      this.showFields.site = true;
      console.log('✅ Site field shown');
    }
    
    // Restore GMDN field visibility
    if (formData.gmdn === false || !this.job?.equipment?.gmdn) {
      this.showFields.gmdn = true;
      console.log('✅ GMDN field shown');
    }
    
    // Restore ECRI field visibility
    if (formData.ecri === false || !this.job?.equipment?.ecri) {
      this.showFields.ecri = true;
      console.log('✅ ECRI field shown');
    }

    // If location is wrong and site selection was made, load departments
    if (formData.newSiteId && formData.newSiteId !== this.job?.equipment?.site?.id) {
      console.log('🔄 Loading departments for site:', formData.newSiteId);
      const selectedSite = this.site.find(s => s.id === formData.newSiteId);
      if (selectedSite) {
        this.selectSite(selectedSite);
      }
    }
  }

  // Method to clear the restoration flag (call this when component resets)
  clearRestorationFlag(): void {
    this.isDataRestored = false;
    console.log('🧹 Restoration flag cleared');
  }

  // Debug method to check form state
  debugFormState(): void {
    console.log('🔍 Current form state:', {
      formValue: this.checkForm.value,
      showFields: this.showFields,
      isDataRestored: this.isDataRestored,
      formValid: this.checkForm.valid
    });
  }
}