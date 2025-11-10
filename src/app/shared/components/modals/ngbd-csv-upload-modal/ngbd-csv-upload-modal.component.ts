import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CsvImportResult, CustomerMappingField, MappedEntity } from 'src/app/core/models/customer/csv-customer.model';
import { PropertyMapping, PropertyMappingService, TreeNode } from 'src/app/core/services/customer-csv-property-mapping.service';
import { CustomerHttpRequestsService } from 'src/app/core/services/http-requests/customer-http-requests.service';

interface HierarchicalRecord {
  record: any;
  recordIndex: number;
  sites: HierarchicalSite[];
}

interface HierarchicalSite {
  site: any;
  siteIndex: number;
  departments: any[];
}

@Component({
  selector: 'app-ngbd-csv-upload-modal',
  templateUrl: './ngbd-csv-upload-modal.component.html',
  styleUrls: ['./ngbd-csv-upload-modal.component.scss']
})
export class NgbdCsvUploadModalComponent implements OnInit {
  
  currentStep: 'upload' | 'mapping' | 'preview' = 'upload';
  isUploading: boolean = false;
  uploadProgress: number = 0;

  isDragOver: boolean = false;
  selectedFile: File | null = null;

  treeNodes: TreeNode[] = [];

  mappingForm: FormGroup;
  showPreview = true;

  csvHeaders: any[] = [];
  propertyMappings: PropertyMapping[] = [];

  previewMode: 'tree' | 'value' = 'tree';
  expandedNodes: Set<string> = new Set();

  records: any[] = [];
  
  // New properties for hierarchical data
  hierarchicalData: HierarchicalRecord[] = [];
  currentRecordIndex: number = 0;
  currentSiteIndex: number = 0;
  currentDepartmentIndex: number = 0;
  showAllRecords: boolean = false;
  
  customerMappings: PropertyMapping[] = [];
  siteMappings: PropertyMapping[] = [];
  departmentMappings: PropertyMapping[] = [];
  equipmentMappings: PropertyMapping[] = [];

  equipmentViewMode: 'table' | 'cards' = 'table';

  parseResponse: any;
  constructor(
    public activeModal: NgbActiveModal,
    private customerService: CustomerHttpRequestsService,
    private propertyMappingService: PropertyMappingService,
    private fb: FormBuilder
  ) {
    this.mappingForm = this.fb.group({
      mappings: this.fb.array([])
    });
  }

  ngOnInit(): void { }

  close(): void {
    this.activeModal.dismiss('cancelled');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      alert('Please select a file first');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('HasHeaders', 'true');

    this.customerService.uploadCsvFileWithProgress(formData).subscribe({
      next: (event: any) => {
        if (event.status === 'uploading') {
          this.uploadProgress = event.progress;
        } 
        else if (event.status === 'complete') {
          this.uploadProgress = 100;
          this.parseResponse = event.data;
          this.processApiResponse(event.data);
          this.isUploading = false;
          this.currentStep = 'mapping';
        }
      },
      error: (error: any) => {
        this.isUploading = false;
        this.uploadProgress = 0;
        console.error('❌ Upload failed:', error);
        alert('Upload failed. Please try again.');
      }
    });
  }

  private processApiResponse(response: any): void {
    this.treeNodes = this.propertyMappingService.mapToTree(response.propertyMappings);
    this.propertyMappings = response.propertyMappings;
    this.csvHeaders = response.csvHeaders;
    this.records = response.records || [];
    
    this.processHierarchicalData();

    this.propertyMappingService.printTree(this.treeNodes);
    this.initializeForm();
  }

  private processHierarchicalData(): void {
    this.hierarchicalData = this.records.map((record, recordIndex) => {
      const sites = (record.sites || []).map((site: any, siteIndex: number) => ({
        site: site,
        siteIndex: siteIndex,
        departments: site.departments || []
      }));

      return {
        record: record,
        recordIndex: recordIndex,
        sites: sites
      };
    });
  }

  get mappingsFormArray(): FormArray {
    return this.mappingForm.get('mappings') as FormArray;
  }

  private initializeForm(): void {
    const mappingsArray = this.fb.array([]);
    
    this.propertyMappings.forEach(mapping => {
      const entityParts = mapping.entity.split('.');
      const entityName = entityParts[entityParts.length - 1];
      
      const mappingGroup = this.fb.group({
        entity: [entityName],
        property: [mapping.property],
        fullPath: [mapping.entity],
        selectedCsvHeader: [mapping.csvHeader || '']
      });
      
      mappingsArray.push(mappingGroup);
    });
    
    this.mappingForm.setControl('mappings', mappingsArray);
  }

  getMappingValue(index: number, field: string): any {
    return this.mappingsFormArray.at(index).get(field)?.value;
  }

  clearMapping(index: number): void {
    this.mappingsFormArray.at(index).get('selectedCsvHeader')?.setValue('');
  }

  resetForm(): void {
    this.mappingsFormArray.controls.forEach(control => {
      control.get('selectedCsvHeader')?.setValue('');
    });
  }

  autoMap(): void {
    this.mappingsFormArray.controls.forEach(control => {
      const property = control.get('property')?.value;
      const currentMapping = control.get('selectedCsvHeader')?.value;
      
      if (!currentMapping) {
        const matchingHeader = this.findBestMatch(property);
        if (matchingHeader) {
          control.get('selectedCsvHeader')?.setValue(matchingHeader);
        }
      }
    });
  }

  private findBestMatch(property: string): string | null {
    const propertyLower = property.toLowerCase();
    
    const directMatch = this.csvHeaders.find(header => 
      header.toLowerCase() === propertyLower ||
      header.toLowerCase().replace(/[^a-z0-9]/g, '') === propertyLower.replace(/[^a-z0-9]/g, '')
    );
    
    if (directMatch) return directMatch;
    
    const partialMatch = this.csvHeaders.find(header => 
      header.toLowerCase().includes(propertyLower) ||
      propertyLower.includes(header.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );
    
    return partialMatch || null;
  }

  getMappingSummary() {
    const total = this.mappingsFormArray.length;
    const mapped = this.mappingsFormArray.controls.filter(control => 
      control.get('selectedCsvHeader')?.value
    ).length;
    const unmapped = total - mapped;
    const percentage = total > 0 ? Math.round((mapped / total) * 100) : 0;
    
    return { total, mapped, unmapped, percentage };
  }

  getFormattedMappings(): PropertyMapping[] {
    return this.mappingsFormArray.controls
      .filter(control => control.get('selectedCsvHeader')?.value)
      .map(control => ({
        entity: control.get('fullPath')?.value,
        property: control.get('property')?.value,
        csvHeader: control.get('selectedCsvHeader')?.value
      }));
  }

  exportMappings(): void {
    const mappings = this.getFormattedMappings();
    const dataStr = JSON.stringify({ propertyMappings: mappings }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `property-mappings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  onSubmit(): void {
    if (this.mappingForm.valid) {
      const mappings = this.getFormattedMappings();
      
      this.showPreview = true;
      this.previewMode = 'tree';
      this.currentRecordIndex = 0;
      this.currentSiteIndex = 0;
      this.currentDepartmentIndex = 0;
      this.showAllRecords = false;
      
      this.currentStep = 'preview';
    }
  }

  getHierarchicalValue(entity: string, property: string, recordIndex: number, siteIndex?: number, departmentIndex?: number): any {
    property = property.toLowerCase();
    if (!this.hierarchicalData?.length || recordIndex >= this.hierarchicalData.length) {
      return '';
    }

    const hierarchicalRecord = this.hierarchicalData[recordIndex];
    const entityParts = entity.split('.');

    try {
      if (entityParts.length === 1 && entityParts[0] === 'Customer') {
          return hierarchicalRecord.record[property.toLowerCase()] || '';
      } else if (entityParts.length === 2 && entityParts[1] === 'Site') {
        if (siteIndex !== undefined && hierarchicalRecord.sites[siteIndex]) {
          return hierarchicalRecord.sites[siteIndex].site[property] || '';
        }
      } else if (entityParts.length === 3 && entityParts[2] === 'Department') {
        if (siteIndex !== undefined && departmentIndex !== undefined && 
            hierarchicalRecord.sites[siteIndex] && 
            hierarchicalRecord.sites[siteIndex].departments[departmentIndex]) {
          return hierarchicalRecord.sites[siteIndex].departments[departmentIndex][property] || '';
        }
      } else if (entityParts.length === 4 && entityParts[3] === 'Equipment') {
        if (siteIndex !== undefined && departmentIndex !== undefined && 
            hierarchicalRecord.sites[siteIndex] && 
            hierarchicalRecord.sites[siteIndex].departments[departmentIndex] &&
            hierarchicalRecord.sites[siteIndex].departments[departmentIndex].equipment) {
          return hierarchicalRecord.sites[siteIndex].departments[departmentIndex].equipment[property] || '';
        }
      }
    } catch (error) {
      console.warn('Error getting hierarchical value:', error);
    }

    return '';
  }

  getCurrentRecord(): HierarchicalRecord | null {
    if (!this.hierarchicalData?.length || this.currentRecordIndex >= this.hierarchicalData.length) {
      return null;
    }
    return this.hierarchicalData[this.currentRecordIndex];
  }

  getCurrentSite(): HierarchicalSite | null {
    const currentRecord = this.getCurrentRecord();
    if (!currentRecord || this.currentSiteIndex >= currentRecord.sites.length) {
      return null;
    }
    return currentRecord.sites[this.currentSiteIndex];
  }

  getCurrentDepartment() {
    const record = this.getCurrentRecord();
    const site = record?.sites?.[this.currentSiteIndex];
    return site?.departments?.[this.currentDepartmentIndex];
  }

  getSiteMappings() {
    return this.getFormattedMappings().filter(m => m.entity === 'Customer.Site');
  }

  getDepartmentMappings() {
    return this.getFormattedMappings().filter(m => m.entity === 'Customer.Site.Department');
  }

  getEquipmentMappings() {
    return this.getFormattedMappings().filter(m => m.entity.includes('Equipment'));
  }

  getEquipmentValue(equipment: any, property: string): string {
    const propertyMap: { [key: string]: string } = {
      'Model': 'model',
      'EquipmentType': 'equipmentType',
      'Manufacturer': 'manufacturer',
      'Department': 'department',
      'ManufacturerDate': 'manufacturerDate',
      'PPMDueDate': 'ppmDueDate',
      'LevelOfCover': 'levelOfCover',
      'LastServieDate': 'lastServiceDate',
      'AcceptanceCheckedDate': 'acceptanceCheckedDate',
      'RetiredByUsername': 'retiredByUsername',
      'RetiredDate': 'retiredDate',
      'isRetired': 'isRetired',
      'AssetNumber': 'assetNumber',
      'SerialNumber': 'serialNumber',
      'ECRI': 'ecri',
      'GMDN': 'gmdn',
    };
    
    const actualProperty = propertyMap[property] || property.toLowerCase();
    return equipment?.[actualProperty] || 'N/A';
  }

  getTotalSitesCount(): number {
    return this.hierarchicalData?.reduce((total, record) => total + (record.sites?.length || 0), 0) || 0;
  }

  getTotalDepartmentsCount(): number {
    return this.hierarchicalData?.reduce((total, record) => {
      return total + (record.sites?.reduce((siteTotal: number, site: any) => {
        return siteTotal + (site.departments?.length || 0);
      }, 0) || 0);
    }, 0) || 0;
  }

  getTotalEquipmentCount(): number {
    return this.hierarchicalData?.reduce((total, record) => {
      return total + (record.sites?.reduce((siteTotal: number, site: any) => {
        return siteTotal + (site.departments?.reduce((deptTotal: number, dept: any) => {
          return deptTotal + (dept.equipment?.length || 0);
        }, 0) || 0);
      }, 0) || 0);
    }, 0) || 0;
  }

  getSiteEquipmentCount(site: any): number {
    return site.departments?.reduce((total: number, dept: any) => total + (dept.equipment?.length || 0), 0) || 0;
  }

  nextDepartment() {
    const currentSite = this.getCurrentSite();
    if (currentSite?.departments && this.currentDepartmentIndex < currentSite.departments.length - 1) {
      this.currentDepartmentIndex++;
    }
  }

  previousDepartment() {
    if (this.currentDepartmentIndex > 0) {
      this.currentDepartmentIndex--;
    }
  }

  nextRecord(): void {
    if (this.currentRecordIndex < this.hierarchicalData.length - 1) {
      this.currentRecordIndex++;
      this.currentSiteIndex = 0; // Reset site index
    }
  }

  previousRecord(): void {
    if (this.currentRecordIndex > 0) {
      this.currentRecordIndex--;
      this.currentSiteIndex = 0; // Reset site index
    }
  }

  nextSite(): void {
    const currentRecord = this.getCurrentRecord();
    if (currentRecord && this.currentSiteIndex < currentRecord.sites.length - 1) {
      this.currentSiteIndex++;
    }
  }

  previousSite(): void {
    if (this.currentSiteIndex > 0) {
      this.currentSiteIndex--;
    }
  }

  getEntityName(entityPath: string): string {
    const parts = entityPath.split('.');
    return parts[parts.length - 1];
  }

  getEntityHierarchy(entityPath: string): string {
    const parts = entityPath.split('.');
    if (parts.length <= 1) return 'Root';
    return parts.slice(0, -1).join(' → ');
  }

  getRecordValue(csvHeader: string, recordIndex: number): string {
    if (!this.records?.length || recordIndex >= this.records.length || !csvHeader) {
      return '';
    }
    
    const record = this.records[recordIndex];
    
    if (csvHeader in record) {
      return record[csvHeader] ?? '';
    }
    
    const key = Object.keys(record).find(
      k => k.toLowerCase().trim() === csvHeader.toLowerCase().trim()
    );
    
    return key ? (record[key] ?? '') : '';
  }

  getPreviewTreeData(): TreeNode[] {
    const mappedMappings = this.getFormattedMappings();
    
    const entityMap = new Map<string, TreeNode>();
    
    mappedMappings.forEach(mapping => {
      const entityPath = mapping.entity;
      
      if (!entityMap.has(entityPath)) {
        const pathParts = entityPath.split('.');
        const entityName = pathParts[pathParts.length - 1];
        
        entityMap.set(entityPath, {
          name: entityName,
          fullPath: entityPath,
          properties: [],
          children: []
        });
      }
      
      entityMap.get(entityPath)!.properties.push({
        property: mapping.property,
        csvHeader: mapping.csvHeader
      });
    });
    
    const rootNodes: TreeNode[] = [];
    const sortedEntities = Array.from(entityMap.keys()).sort((a, b) => {
      return a.split('.').length - b.split('.').length;
    });
    
    sortedEntities.forEach(entityPath => {
      const node = entityMap.get(entityPath)!;
      const pathParts = entityPath.split('.');
      
      if (pathParts.length === 1) {
        rootNodes.push(node);
      } else {
        const parentPath = pathParts.slice(0, -1).join('.');
        const parentNode = entityMap.get(parentPath);
        
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          rootNodes.push(node);
        }
      }
    });
    
    this.sortTreeNodesRecursive(rootNodes);
    
    rootNodes.forEach(node => {
      this.expandedNodes.add(node.fullPath);
    });
    
    return rootNodes;
  }

  private sortTreeNodesRecursive(nodes: TreeNode[]): void {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(node => {
      if (node.children.length > 0) {
        this.sortTreeNodesRecursive(node.children);
      }
    });
  }

  toggleNode(nodePath: string): void {
    if (this.expandedNodes.has(nodePath)) {
      this.expandedNodes.delete(nodePath);
    } else {
      this.expandedNodes.add(nodePath);
    }
  }

  isNodeExpanded(nodePath: string): boolean {
    return this.expandedNodes.has(nodePath);
  }

  getNodePropertyCount(node: TreeNode): number {
    let count = node.properties.length;
    if (node.children) {
      node.children.forEach(child => {
        count += this.getNodePropertyCount(child);
      });
    }
    return count;
  }

  exportTableData(): void {
    const mappings = this.getFormattedMappings();
    const csvContent = [
      ['Entity Path', 'Property', 'CSV Header'],
      ...mappings.map(m => [m.entity, m.property, m.csvHeader])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mapping-preview-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  async copyToClipboard(): Promise<void> {
    const mappings = this.getFormattedMappings();
    const textData = mappings.map(m => 
      `${m.entity} → ${m.property} → ${m.csvHeader}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(textData);
      alert('Mapping data copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard. Please try again.');
    }
  }

  getPropertySampleValues(csvHeader: string): string[] {
    if (!this.records?.length || !csvHeader) return [];
    return this.records.slice(0, 3).map(record => {
      if (csvHeader in record) return record[csvHeader];
      const key = Object.keys(record).find(k => k.toLowerCase().trim() === csvHeader.toLowerCase().trim());
      return key ? record[key] : '';
    });
  }

  addCustomer() {
    console.log(this.parseResponse);
    this.customerService.saveCustomer(this.parseResponse).subscribe({
      next: (response) => {
        console.log('Customer added successfully:', response);
      },
      error: (error) => {
        console.error('Error adding customer:', error);
      }
    });
  }

}

